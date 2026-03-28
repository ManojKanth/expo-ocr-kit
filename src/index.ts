// Reexport the native module. On web, it will be resolved to ExpoOcrKitModule.web.ts
// and on native platforms to ExpoOcrKitModule.ts
export { default } from './ExpoOcrKitModule';
export { default as ExpoOcrKitView } from './ExpoOcrKitView';
export * from  './ExpoOcrKit.types';
