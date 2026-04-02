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

## Example app

The example in [`example/App.tsx`](/Users/manojkanth/Desktop/Projects/mine/npm packages/Expo-ocr-kit/expo-ocr-kit/example/App.tsx) is a minimal native-build demo:

- enter a local `file://` image URI
- run `scanReceipt`
- inspect the text and bounding boxes returned from native
