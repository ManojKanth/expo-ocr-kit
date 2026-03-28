import { NativeModule, requireNativeModule } from 'expo';

import { ExpoOcrKitModuleEvents } from './ExpoOcrKit.types';

declare class ExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoOcrKitModule>('ExpoOcrKit');
