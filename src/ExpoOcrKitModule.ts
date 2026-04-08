import { NativeModule, requireOptionalNativeModule } from 'expo';

import { ExpoOcrKitModuleEvents, OcrResult } from './ExpoOcrKit.types';

declare class ExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  recognizeText(uri: string): Promise<OcrResult>;
}

const nativeModule = requireOptionalNativeModule<ExpoOcrKitModule>('ExpoOcrKit');

class UnavailableExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  recognizeText(): Promise<OcrResult> {
    throw new Error(
      "Native module 'ExpoOcrKit' is not available. Rebuild your app after installing expo-ocr-kit, and use a development build or bare React Native instead of Expo Go."
    );
  }
}

export default nativeModule ?? new UnavailableExpoOcrKitModule();
