import type { StyleProp, ViewStyle } from 'react-native';

export type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OcrBlock = {
  text: string;
  boundingBox: OcrBoundingBox;
};

export type OcrResult = {
  text: string;
  blocks: OcrBlock[];
};

export type OnLoadEventPayload = {
  url: string;
};

export type ExpoOcrKitModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type ExpoOcrKitViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};
