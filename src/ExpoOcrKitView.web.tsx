import * as React from 'react';

import { ExpoOcrKitViewProps } from './ExpoOcrKit.types';

export default function ExpoOcrKitView(props: ExpoOcrKitViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
