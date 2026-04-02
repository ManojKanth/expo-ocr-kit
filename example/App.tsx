import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { recognizeText, type OcrResult } from 'expo-ocr-kit';
import {
  Alert,
  Button,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function App() {
  const [imageUri, setImageUri] = useState('');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const previewBlocks = result?.blocks.slice(0, 4) ?? [];
  const characterCount = result?.text.trim().length ?? 0;

  async function runOcr(uri: string) {
    const trimmedUri = uri.trim();

    if (!trimmedUri) {
      Alert.alert('Image required', 'Capture or choose an image before running OCR.');
      return;
    }

    try {
      setIsScanning(true);
      const nextResult = await recognizeText(trimmedUri);
      setResult(nextResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OCR error';
      Alert.alert('OCR failed', message);
    } finally {
      setIsScanning(false);
    }
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Camera permission required', 'Grant camera access to capture an image for OCR.');
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
      Alert.alert('Photo permission required', 'Grant photo library access to choose an image for OCR.');
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
        <Text style={styles.eyebrow}>Expo Modules OCR Demo</Text>
        <Text style={styles.header}>Expo OCR Kit</Text>
        <Text style={styles.description}>
          Native OCR powered by ML Kit on Android and Vision on iOS.
        </Text>

        <Group name="Capture">
          <View style={styles.actions}>
            <Button disabled={isScanning} onPress={handleTakePhoto} title="Take Photo" />
            <Button disabled={isScanning} onPress={handleChooseImage} title="Choose Image" />
          </View>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewTitle}>No image selected</Text>
              <Text style={styles.caption}>Choose an image or capture a fresh one to start the demo.</Text>
            </View>
          )}
        </Group>

        <Group name="Result">
          <View style={styles.metrics}>
            <MetricCard label="Blocks" value={String(result?.blocks.length ?? 0)} />
            <MetricCard label="Characters" value={String(characterCount)} />
          </View>

          <Text style={styles.sectionLabel}>Recognized text</Text>
          <View style={styles.textPanel}>
            <Text style={styles.resultText}>
              {result?.text || 'OCR output will appear here after you capture or choose an image.'}
            </Text>
          </View>

          <Text style={styles.sectionLabel}>Top text blocks</Text>
          {previewBlocks.length > 0 ? (
            previewBlocks.map((block, index) => (
              <View key={`${block.text}-${index}`} style={styles.block}>
                <Text style={styles.blockIndex}>Block {index + 1}</Text>
                <Text style={styles.blockText}>{block.text}</Text>
                <Text style={styles.caption}>{formatBox(block.boundingBox)}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No OCR result yet</Text>
              <Text style={styles.caption}>Once recognition completes, the first few text blocks will show here.</Text>
            </View>
          )}
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

function MetricCard(props: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{props.value}</Text>
      <Text style={styles.metricLabel}>{props.label}</Text>
    </View>
  );
}

function formatBox(box: OcrResult['blocks'][number]['boundingBox']) {
  return `x ${box.x.toFixed(0)}  y ${box.y.toFixed(0)}  w ${box.width.toFixed(0)}  h ${box.height.toFixed(0)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7edf4',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  groupHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0f172a',
  },
  group: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569',
  },
  actions: {
    gap: 12,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#dbe4ee',
  },
  previewPlaceholder: {
    height: 220,
    borderRadius: 16,
    backgroundColor: '#dbe4ee',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  textPanel: {
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultText: {
    minHeight: 96,
    fontSize: 14,
    lineHeight: 22,
    color: '#111827',
  },
  block: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  blockIndex: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  blockText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#0f172a',
  },
  emptyState: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
});
