# Expo OCR Kit

On-device OCR module for Expo and React Native using ML Kit on Android and Vision on iOS.

## JavaScript API

```ts
import { scanReceipt, type OcrResult } from 'expo-ocr-kit';

const result: OcrResult = await scanReceipt(uri);
```

`scanReceipt` accepts a local image URI and returns:

```ts
type OcrResult = {
  text: string;
  blocks: Array<{
    text: string;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
};
```

## Performance notes

The native OCR implementations downsample very large images before recognition to reduce memory pressure and OCR latency on large receipt photos.

- Android downsamples before creating `InputImage`
- iOS uses `CGImageSource` thumbnail decoding before running Vision
- bounding boxes are scaled back to the original image coordinate space before they are returned to JavaScript

## Expo integration

This package contains native code, so it does not work in Expo Go.

Use a native build instead:

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

Why this flow is required:

- `npx expo prebuild` generates the app's native Android and iOS projects and autolinks this Expo module.
- `npx expo run:android` compiles the Kotlin module and installs a build that includes ML Kit.
- `npx expo run:ios` compiles the Swift module and installs a build that includes Vision-based OCR.

If you change native Kotlin or Swift code, rebuild the native app. A Metro reload is only enough for JavaScript changes.

## Config plugin

If you use this library for OCR only from an existing image URI, no config plugin is required.

If you also add camera capture through this library, use the bundled config plugin so the consuming Expo app gets the required native camera permission setup during prebuild or EAS Build.

```json
{
  "expo": {
    "plugins": [
      [
        "expo-ocr-kit",
        {
          "cameraPermission": "Allow this app to capture receipts for OCR."
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

## Example app

The example in [`example/App.tsx`](/Users/manojkanth/Desktop/Projects/mine/npm packages/Expo-ocr-kit/expo-ocr-kit/example/App.tsx) is a minimal native-build demo:

- capture a receipt with the camera
- choose an existing receipt image from the photo library
- enter a local `file://` image URI manually
- run `scanReceipt`
- inspect the text and bounding boxes returned from native

The example app uses:

- this package's config plugin for camera permission setup
- `expo-image-picker` for the camera and photo-library UI at runtime
