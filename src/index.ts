import ExpoOcrKitModule from './ExpoOcrKitModule';

import type { OcrResult } from './ExpoOcrKit.types';

export async function recognizeText(uri: string): Promise<OcrResult> {
  return ExpoOcrKitModule.recognizeText(uri);
}

export { ExpoOcrKitModule };
export default ExpoOcrKitModule;
export { default as ExpoOcrKitView } from './ExpoOcrKitView';
export * from './ExpoOcrKit.types';
