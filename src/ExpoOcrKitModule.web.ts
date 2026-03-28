import { registerWebModule, NativeModule } from 'expo';

import { ExpoOcrKitModuleEvents } from './ExpoOcrKit.types';

class ExpoOcrKitModule extends NativeModule<ExpoOcrKitModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoOcrKitModule, 'ExpoOcrKitModule');
