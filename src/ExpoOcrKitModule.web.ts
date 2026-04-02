import { registerWebModule, NativeModule } from 'expo';

import { ExpoOcrKitModuleEvents, OcrResult } from './ExpoOcrKit.types';

class ExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  async recognizeText(_uri: string): Promise<OcrResult> {
    throw new Error('ExpoOcrKit.recognizeText is only available on Android and iOS native builds.');
  }
}

export default registerWebModule(ExpoOcrKitModule, 'ExpoOcrKitModule');
