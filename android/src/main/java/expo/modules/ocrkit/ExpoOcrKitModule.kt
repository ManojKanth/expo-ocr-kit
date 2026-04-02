package expo.modules.ocrkit

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Rect
import android.net.Uri
import androidx.exifinterface.media.ExifInterface
import com.google.android.gms.tasks.Task
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.net.URL
import kotlin.math.max
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class ExpoOcrKitModule : Module() {
  private data class PreparedImage(
    val image: InputImage,
    val scaleFactor: Int
  )

  companion object {
    private const val MAX_IMAGE_DIMENSION = 2000
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoOcrKit")

    AsyncFunction("recognizeText") Coroutine { uri: String ->
      recognizeText(uri)
    }

    View(ExpoOcrKitView::class) {
      Prop("url") { view: ExpoOcrKitView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }

  private suspend fun recognizeText(uri: String): Map<String, Any> {
    val normalizedUri = uri.trim()
    require(normalizedUri.isNotEmpty()) {
      "Image URI must not be empty."
    }

    val context = requireNotNull(appContext.reactContext) {
      "React context is unavailable."
    }

    val imageUri = Uri.parse(normalizedUri)
    val preparedImage = withContext(Dispatchers.IO) { createInputImage(context.contentResolver, imageUri) }

    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    return try {
      val result = recognizer.process(preparedImage.image).await()
      mapRecognitionResult(result, preparedImage.scaleFactor)
    } finally {
      recognizer.close()
    }
  }

  private fun mapRecognitionResult(result: Text, scaleFactor: Int): Map<String, Any> {
    return mapOf(
      "text" to result.text,
      "blocks" to result.textBlocks.map { block ->
        mapOf(
          "text" to block.text,
          "boundingBox" to rectToMap(block.boundingBox, scaleFactor)
        )
      }
    )
  }

  private fun createInputImage(contentResolver: android.content.ContentResolver, imageUri: Uri): PreparedImage {
    val decodedBitmap = decodeScaledBitmap(contentResolver, imageUri)

    return if (decodedBitmap != null) {
      PreparedImage(
        image = InputImage.fromBitmap(decodedBitmap.bitmap, resolveRotationDegrees(contentResolver, imageUri)),
        scaleFactor = decodedBitmap.sampleSize
      )
    } else {
      PreparedImage(
        image = InputImage.fromFilePath(requireNotNull(appContext.reactContext), imageUri),
        scaleFactor = 1
      )
    }
  }

  private data class DecodedBitmap(
    val bitmap: Bitmap,
    val sampleSize: Int
  )

  private fun decodeScaledBitmap(contentResolver: android.content.ContentResolver, imageUri: Uri): DecodedBitmap? {
    val bounds = BitmapFactory.Options().apply {
      inJustDecodeBounds = true
    }

    contentResolver.openInputStream(imageUri)?.use { stream ->
      BitmapFactory.decodeStream(stream, null, bounds)
    } ?: return null

    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
      return null
    }

    val sampleSize = calculateInSampleSize(bounds.outWidth, bounds.outHeight)
    val decodeOptions = BitmapFactory.Options().apply {
      inSampleSize = sampleSize
      inPreferredConfig = Bitmap.Config.ARGB_8888
    }

    val bitmap = contentResolver.openInputStream(imageUri)?.use { stream ->
      BitmapFactory.decodeStream(stream, null, decodeOptions)
    } ?: return null

    return DecodedBitmap(bitmap = bitmap, sampleSize = sampleSize)
  }

  private fun calculateInSampleSize(width: Int, height: Int): Int {
    var sampleSize = 1
    var currentWidth = width
    var currentHeight = height

    while (max(currentWidth, currentHeight) > MAX_IMAGE_DIMENSION) {
      currentWidth /= 2
      currentHeight /= 2
      sampleSize *= 2
    }

    return sampleSize
  }

  private fun resolveRotationDegrees(contentResolver: android.content.ContentResolver, imageUri: Uri): Int {
    return contentResolver.openInputStream(imageUri)?.use { stream ->
      when (ExifInterface(stream).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
        ExifInterface.ORIENTATION_ROTATE_90 -> 90
        ExifInterface.ORIENTATION_ROTATE_180 -> 180
        ExifInterface.ORIENTATION_ROTATE_270 -> 270
        else -> 0
      }
    } ?: 0
  }

  private fun rectToMap(rect: Rect?, scaleFactor: Int): Map<String, Int> {
    if (rect == null) {
      return mapOf(
        "x" to 0,
        "y" to 0,
        "width" to 0,
        "height" to 0
      )
    }

    return mapOf(
      "x" to rect.left * scaleFactor,
      "y" to rect.top * scaleFactor,
      "width" to rect.width() * scaleFactor,
      "height" to rect.height() * scaleFactor
    )
  }

  private suspend fun <T> Task<T>.await(): T = suspendCancellableCoroutine { continuation ->
    addOnSuccessListener { result ->
      continuation.resume(result)
    }
    addOnFailureListener { exception ->
      continuation.resumeWithException(exception)
    }
    addOnCanceledListener {
      continuation.cancel()
    }
  }
}
