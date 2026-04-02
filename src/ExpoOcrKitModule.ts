import { NativeModule, requireNativeModule } from 'expo';

import { ExpoOcrKitModuleEvents, OcrResult } from './ExpoOcrKit.types';

declare class ExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  recognizeText(uri: string): Promise<OcrResult>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoOcrKitModule>('ExpoOcrKit');
