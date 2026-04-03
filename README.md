# Expo OCR Kit

On-device text recognition for Expo and React Native.

`expo-ocr-kit` is a native OCR module built with the Expo Modules API. It uses ML Kit on Android and Vision on iOS, and exposes a single typed API for both platforms.


![demo](https://github.com/user-attachments/assets/31b172d2-0ba2-4b0b-9ff3-ec6193f2b214)


![demo2](https://github.com/user-attachments/assets/28389387-0377-46a4-bc88-13cb06f43caf)
![demo3](https://github.com/user-attachments/assets/36617a1a-62a2-484c-a73a-08dab35962c3)

## Why this package

- Built with the Expo Modules API
- Works in Expo development builds, prebuild workflows, EAS Build, and bare React Native
- Uses platform OCR engines directly instead of a generic wrapper
- Returns normalized cross-platform bounding boxes
- Includes a minimal Expo config plugin for camera permission setup
- Downsamples large images before OCR to reduce memory pressure

## Installation

```bash
npm install expo-ocr-kit
```

## Usage

```ts
import { recognizeText, type OcrResult } from 'expo-ocr-kit';

const result: OcrResult = await recognizeText(uri);
```

`uri` should be a local image URI.

## API

```ts
type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type OcrBlock = {
  text: string;
  boundingBox: OcrBoundingBox;
};

type OcrResult = {
  text: string;
  blocks: OcrBlock[];
};
```

Bounding boxes are returned in image-space coordinates with a top-left origin on both platforms.

## Expo support

This package contains native code.

- Supported: Expo development builds
- Supported: `expo prebuild`
- Supported: EAS Build
- Supported: bare React Native
- Not supported: Expo Go

Typical Expo workflow:

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

## Camera support

The OCR API is image-based. Camera capture should stay in your app layer or use a helper package such as `expo-image-picker`.

If your Expo app captures images with the camera, add the bundled config plugin:

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

The plugin adds:

- iOS: `NSCameraUsageDescription`
- Android: `android.permission.CAMERA`

Runtime permission requests are still your responsibility.

## What makes it different

Most OCR packages in this space fall into one of three buckets:

- older React Native wrappers with dated native integrations
- platform-specific text recognition packages
- Vision Camera frame-processor plugins focused on real-time OCR

`expo-ocr-kit` is aimed at a different use case:

- Expo-first native module architecture
- batch OCR on local images
- clean JS API for both Expo and bare React Native apps
- native implementation details kept behind a small, typed surface

If you need real-time OCR from camera frames, a Vision Camera plugin is the right tool. If you need a production-friendly OCR module for captured images, scanned documents, screenshots, and imported files, this package is the better fit.

## Implementation notes

- Android uses ML Kit with URI loading, EXIF-aware rotation handling, and image downsampling.
- iOS uses Vision with `CGImageSource` thumbnail decoding and coordinate normalization.
- Large images are processed on reduced-size native buffers, but bounding boxes are scaled back to the original image space before they are returned.

## Design direction

The core API stays intentionally generic:

```ts
recognizeText(uri: string): Promise<OcrResult>
```

Receipt parsing, invoice extraction, field detection, and domain-specific post-processing belong above OCR rather than inside the low-level recognition API.

## Notes for contributors

- Native iOS builds can be sensitive to filesystem paths with spaces. A path without spaces is recommended when working on the example app locally.
- If you change native Kotlin or Swift code, rebuild the app. Metro reload is only enough for JavaScript changes.
