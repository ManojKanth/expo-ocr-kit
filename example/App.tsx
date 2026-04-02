import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { scanReceipt, type OcrResult } from 'expo-ocr-kit';
import {
  Alert,
  Button,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function App() {
  const [imageUri, setImageUri] = useState('');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  async function runOcr(uri: string) {
    const trimmedUri = uri.trim();

    if (!trimmedUri) {
      Alert.alert('Image URI required', 'Enter a local file URI before running OCR.');
      return;
    }

    try {
      setIsScanning(true);
      const nextResult = await scanReceipt(trimmedUri);
      setResult(nextResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OCR error';
      Alert.alert('OCR failed', message);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleScan() {
    await runOcr(imageUri);
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera permission required', 'Grant camera access to capture a receipt image.');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
      return;
    }

    const nextUri = pickerResult.assets[0].uri;
    setImageUri(nextUri);
    await runOcr(nextUri);
  }

  async function handleChooseImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Photo permission required', 'Grant photo library access to choose a receipt image.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
      return;
    }

    const nextUri = pickerResult.assets[0].uri;
    setImageUri(nextUri);
    await runOcr(nextUri);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Expo OCR Kit</Text>
        <Text style={styles.description}>
          This example must run in a native build. Expo Go cannot load custom OCR modules.
        </Text>

        <Group name="1. Build a native app">
          <Text style={styles.body}>Run `npx expo prebuild` once, then `npx expo run:ios` or `npx expo run:android`.</Text>
          <Text style={styles.caption}>Current platform: {Platform.OS}</Text>
        </Group>

        <Group name="2. Capture or choose a receipt">
          <View style={styles.actions}>
            <Button disabled={isScanning} onPress={handleTakePhoto} title="Take Photo" />
            <Button disabled={isScanning} onPress={handleChooseImage} title="Choose Image" />
          </View>
          <Text style={styles.caption}>
            Camera capture needs the bundled `expo-ocr-kit` config plugin. Choosing an image also needs the `expo-image-picker` plugin for photo-library permissions.
          </Text>
        </Group>

        <Group name="3. Provide or inspect the image URI">
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setImageUri}
            placeholder="file:///path/to/receipt.jpg"
            style={styles.input}
            value={imageUri}
          />
          <Button disabled={isScanning} onPress={handleScan} title={isScanning ? 'Scanning...' : 'Run OCR'} />
          <Text style={styles.caption}>{imageUri || 'No image selected yet.'}</Text>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
        </Group>

        <Group name="4. Inspect the OCR result">
          <Text style={styles.body}>Full text</Text>
          <Text style={styles.resultText}>{result?.text || 'No OCR result yet.'}</Text>
          <Text style={styles.body}>Blocks detected: {result?.blocks.length ?? 0}</Text>
          {result?.blocks.slice(0, 5).map((block, index) => (
            <View key={`${block.text}-${index}`} style={styles.block}>
              <Text style={styles.blockText}>{block.text}</Text>
              <Text style={styles.caption}>
                x={block.boundingBox.x.toFixed(1)} y={block.boundingBox.y.toFixed(1)} w={block.boundingBox.width.toFixed(1)} h={block.boundingBox.height.toFixed(1)}
              </Text>
            </View>
          ))}
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 32,
    fontWeight: '700',
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  group: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0f172a',
  },
  caption: {
    fontSize: 13,
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  resultText: {
    minHeight: 72,
    fontSize: 14,
    lineHeight: 21,
    color: '#111827',
  },
  block: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#cbd5e1',
    gap: 4,
  },
  blockText: {
    fontSize: 14,
    color: '#0f172a',
  },
  actions: {
    gap: 12,
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
});
