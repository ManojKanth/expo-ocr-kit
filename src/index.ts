import ExpoOcrKitModule from './ExpoOcrKitModule';

import type { OcrResult } from './ExpoOcrKit.types';

export async function scanReceipt(uri: string): Promise<OcrResult> {
  return ExpoOcrKitModule.scanReceipt(uri);
}

export { ExpoOcrKitModule };
export default ExpoOcrKitModule;
export { default as ExpoOcrKitView } from './ExpoOcrKitView';
export * from './ExpoOcrKit.types';
