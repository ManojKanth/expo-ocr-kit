# Expo OCR Kit

Production-grade on-device OCR for Expo and React Native.

`expo-ocr-kit` gives you a small, typed JavaScript API backed by real native OCR engines:

- Android: Google ML Kit Text Recognition
- iOS: Apple Vision `VNRecognizeTextRequest`

It is designed for teams who want native OCR quality without giving up the Expo Modules API, modern Expo workflows, or bare React Native compatibility.

## Why this package

- Built with the Expo Modules API, not legacy bridge boilerplate
- Works in Expo development builds, prebuild workflows, EAS Build, and bare React Native
- Uses first-party platform OCR engines instead of a one-size-fits-all wrapper
- Returns a normalized cross-platform result shape
- Downsamples very large images before OCR to reduce memory pressure and latency
- Keeps capture flow separate from OCR so you can use camera, gallery, file system, or remote downloads

## Install

```bash
npm install expo-ocr-kit
```

If you want camera capture in your app flow, install an image acquisition package too. The example app uses `expo-image-picker`.

## Quick start

```ts
import { recognizeText, type OcrResult } from 'expo-ocr-kit';

const result: OcrResult = await recognizeText(uri);
```

`uri` should be a local image URI such as `file:///...` or another platform-supported local image reference.

## Result shape

```ts
export type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OcrBlock = {
  text: string;
  boundingBox: OcrBoundingBox;
};

export type OcrResult = {
  text: string;
  blocks: OcrBlock[];
};
```

The package normalizes platform differences so both Android and iOS return:

- top-left based coordinates
- image-space bounding boxes
- the same object structure in JavaScript

## Expo support

This package contains native code.

That means:

- it does **not** work in Expo Go
- it **does** work in Expo development builds
- it **does** work with `expo prebuild`
- it **does** work with EAS Build
- it **does** work in bare React Native

### Local Expo workflow

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

### Why Expo Go does not work

Expo Go only includes the native modules that ship inside the Expo Go app binary. Since `expo-ocr-kit` adds custom Kotlin and Swift code, your app needs its own native build that includes this module.

## Camera support

`expo-ocr-kit` focuses on OCR, not camera UI.

That separation is intentional:

- camera capture belongs in your app's JS layer
- OCR belongs in the native module

This makes the package reusable for:

- receipt photos
- gallery images
- scanned documents
- screenshots
- downloaded files
- any other image source your app supports

### Config plugin

If you use this package only for OCR on an existing image URI, no config plugin is required.

If your app also captures images with the camera, use the bundled config plugin so the native app gets camera permission setup during prebuild or EAS Build.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ocr-kit",
        {
          "cameraPermission": "Allow this app to capture images for OCR."
        }
      ]
    ]
  }
}
```

What the plugin does:

- iOS: sets `NSCameraUsageDescription`
- Android: adds `android.permission.CAMERA`

The plugin only configures the native app. You still need to request camera permission at runtime before opening the camera.

## Example: camera + OCR

The example app in this repo uses `expo-image-picker` for capture/selection and then sends the resulting image URI into `recognizeText`.

Typical app flow:

1. Request camera or photo-library permission
2. Capture or choose an image
3. Get the local URI
4. Call `recognizeText(uri)`
5. Render text and bounding boxes

## How it works

High-level architecture:

`TypeScript`
→ `requireNativeModule('ExpoOcrKit')`
→ Expo Module
→ Kotlin / Swift native implementation
→ ML Kit / Vision OCR
→ normalized result back to JavaScript

### Android

- Uses Google ML Kit Text Recognition
- Accepts a URI and creates `InputImage`
- Reads EXIF orientation
- Downsamples large images before OCR
- Scales bounding boxes back to the original image coordinate space

### iOS

- Uses Apple Vision `VNRecognizeTextRequest`
- Loads the image through `CGImageSource`
- Downsamples large images before OCR
- Converts Vision's normalized bottom-left coordinates into top-left image coordinates
- Returns bounding boxes in original image space

## Performance notes

The native implementations intentionally downsample very large images before recognition.

This helps with:

- lower memory pressure on large photos
- faster OCR on oversized inputs
- better runtime stability on lower-memory devices

Bounding boxes are scaled back to the original image coordinate space before they are returned to JavaScript, so your overlay logic does not need to know whether native downsampling happened.

## API design direction

The core OCR API is intentionally generic:

```ts
recognizeText(uri: string): Promise<OcrResult>
```

That keeps the package useful for more than one use case. Receipt parsing, invoice extraction, field detection, or domain-specific post-processing should be built as layers above OCR rather than baked into the low-level recognition API.

## Repository goals

This package is being built to be:

- easy to understand for Expo developers learning native modules
- practical enough for real production use
- small and focused at the public API level
- explicit about the native tradeoffs under the hood

If that matches what you need, a star on GitHub helps a lot.
