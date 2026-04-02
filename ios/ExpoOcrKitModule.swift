import ExpoModulesCore
import ImageIO
import UIKit
import Vision

public class ExpoOcrKitModule: Module {
  private let maxImageDimension = 2000

  public func definition() -> ModuleDefinition {
    Name("ExpoOcrKit")

    AsyncFunction("recognizeText") { (uri: String) throws -> [String: Any] in
      try self.recognizeText(uri: uri)
    }

    View(ExpoOcrKitView.self) {
      Prop("url") { (view: ExpoOcrKitView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }

  private func recognizeText(uri: String) throws -> [String: Any] {
    let trimmedUri = uri.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmedUri.isEmpty else {
      throw OcrError.invalidUri("Image URI must not be empty.")
    }

    let imageURL = try resolveImageURL(from: trimmedUri)
    let imageSource = try loadImageSource(from: imageURL)
    let cgImage = try loadDownsampledCGImage(from: imageSource, url: imageURL)
    let imageOrientation = cgImageOrientation(from: imageSource)
    let imageSize = resolvedImageSize(from: imageSource, orientation: imageOrientation, fallbackImage: cgImage)

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true

    let handler = VNImageRequestHandler(cgImage: cgImage, orientation: imageOrientation, options: [:])
    try handler.perform([request])

    let observations = (request.results as? [VNRecognizedTextObservation] ?? [])
      .sorted(by: compareObservations)

    let blocks: [[String: Any]] = observations.compactMap { observation in
      guard let candidate = observation.topCandidates(1).first else {
        return nil
      }

      return [
        "text": candidate.string,
        "boundingBox": boundingBoxMap(for: observation.boundingBox, imageSize: imageSize)
      ]
    }

    let fullText = blocks
      .compactMap { $0["text"] as? String }
      .joined(separator: "\n")

    return [
      "text": fullText,
      "blocks": blocks
    ]
  }

  private func resolveImageURL(from uri: String) throws -> URL {
    if let url = URL(string: uri), url.scheme != nil {
      return url
    }

    let fileURL = URL(fileURLWithPath: uri)
    guard FileManager.default.fileExists(atPath: fileURL.path) else {
      throw OcrError.invalidUri("Unable to resolve image URL from URI: \(uri)")
    }
    return fileURL
  }

  private func loadImageSource(from url: URL) throws -> CGImageSource {
    guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, nil) else {
      throw OcrError.unreadableImage("Failed to create an image source for URL: \(url.absoluteString)")
    }
    return imageSource
  }

  private func loadCGImage(from imageSource: CGImageSource, url: URL) throws -> CGImage {
    guard let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
      throw OcrError.unreadableImage("Failed to decode image data at URL: \(url.absoluteString)")
    }
    return cgImage
  }

  private func loadDownsampledCGImage(from imageSource: CGImageSource, url: URL) throws -> CGImage {
    let options: CFDictionary = [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceCreateThumbnailWithTransform: true,
      kCGImageSourceShouldCacheImmediately: false,
      kCGImageSourceThumbnailMaxPixelSize: maxImageDimension
    ] as CFDictionary

    guard let cgImage = CGImageSourceCreateThumbnailAtIndex(imageSource, 0, options) else {
      return try loadCGImage(from: imageSource, url: url)
    }

    return cgImage
  }

  private func cgImageOrientation(from imageSource: CGImageSource) -> CGImagePropertyOrientation {
    guard
      let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [CFString: Any],
      let orientationValue = properties[kCGImagePropertyOrientation] as? UInt32,
      let orientation = CGImagePropertyOrientation(rawValue: orientationValue)
    else {
      return .up
    }

    return orientation
  }

  private func resolvedImageSize(from imageSource: CGImageSource, orientation: CGImagePropertyOrientation, fallbackImage: CGImage) -> CGSize {
    guard
      let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [CFString: Any],
      let pixelWidth = properties[kCGImagePropertyPixelWidth] as? CGFloat,
      let pixelHeight = properties[kCGImagePropertyPixelHeight] as? CGFloat
    else {
      return CGSize(width: fallbackImage.width, height: fallbackImage.height)
    }

    switch orientation {
    case .left, .leftMirrored, .right, .rightMirrored:
      return CGSize(width: pixelHeight, height: pixelWidth)
    default:
      return CGSize(width: pixelWidth, height: pixelHeight)
    }
  }

  private func compareObservations(_ lhs: VNRecognizedTextObservation, _ rhs: VNRecognizedTextObservation) -> Bool {
    let rowTolerance: CGFloat = 0.02
    let verticalDelta = abs(lhs.boundingBox.midY - rhs.boundingBox.midY)

    if verticalDelta <= rowTolerance {
      return lhs.boundingBox.minX < rhs.boundingBox.minX
    }

    return lhs.boundingBox.maxY > rhs.boundingBox.maxY
  }

  private func boundingBoxMap(for boundingBox: CGRect, imageSize: CGSize) -> [String: Double] {
    let x = boundingBox.origin.x * imageSize.width
    let y = (1 - boundingBox.origin.y - boundingBox.height) * imageSize.height
    let width = boundingBox.width * imageSize.width
    let height = boundingBox.height * imageSize.height

    return [
      "x": x,
      "y": y,
      "width": width,
      "height": height
    ]
  }
}

private enum OcrError: LocalizedError {
  case invalidUri(String)
  case unreadableImage(String)

  var errorDescription: String? {
    switch self {
    case .invalidUri(let message), .unreadableImage(let message):
      return message
    }
  }
}
