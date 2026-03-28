import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoOcrKitViewProps } from './ExpoOcrKit.types';

const NativeView: React.ComponentType<ExpoOcrKitViewProps> =
  requireNativeView('ExpoOcrKit');

export default function ExpoOcrKitView(props: ExpoOcrKitViewProps) {
  return <NativeView {...props} />;
}
