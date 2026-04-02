package expo.modules.ocrkit

import android.graphics.Rect
import android.net.Uri
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
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class ExpoOcrKitModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoOcrKit")

    AsyncFunction("scanReceipt") Coroutine { uri: String ->
      scanReceipt(uri)
    }

    View(ExpoOcrKitView::class) {
      Prop("url") { view: ExpoOcrKitView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      Events("onLoad")
    }
  }

  private suspend fun scanReceipt(uri: String): Map<String, Any> {
    val normalizedUri = uri.trim()
    require(normalizedUri.isNotEmpty()) {
      "Image URI must not be empty."
    }

    val context = requireNotNull(appContext.reactContext) {
      "React context is unavailable."
    }

    val imageUri = Uri.parse(normalizedUri)
    val inputImage = withContext(Dispatchers.IO) {
      InputImage.fromFilePath(context, imageUri)
    }

    val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    return try {
      val result = recognizer.process(inputImage).await()
      mapRecognitionResult(result)
    } finally {
      recognizer.close()
    }
  }

  private fun mapRecognitionResult(result: Text): Map<String, Any> {
    return mapOf(
      "text" to result.text,
      "blocks" to result.textBlocks.map { block ->
        mapOf(
          "text" to block.text,
          "boundingBox" to rectToMap(block.boundingBox)
        )
      }
    )
  }

  private fun rectToMap(rect: Rect?): Map<String, Int> {
    if (rect == null) {
      return mapOf(
        "x" to 0,
        "y" to 0,
        "width" to 0,
        "height" to 0
      )
    }

    return mapOf(
      "x" to rect.left,
      "y" to rect.top,
      "width" to rect.width(),
      "height" to rect.height()
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
