import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSolutionStore } from '@store/solutionStore';
import { createOCRService } from '@services/ocrService';

const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '';

export default function OCRCameraScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(0);

  const { setProblem, setOCRProcessing, setOCRError } = useSolutionStore();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📸 صرح بالوصول للكاميرا</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>السماح بالكاميرا</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      setIsProcessing(true);
      setOCRProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      setSelectedImage(photo.uri);
      await processImage(photo.uri);
    } catch (error) {
      setOCRError('خطأ في التقاط الصورة');
      Alert.alert('خطأ', 'فشل التقاط الصورة');
    } finally {
      setIsProcessing(false);
      setOCRProcessing(false);
    }
  };

  const pickImage = async () => {
    try {
      setIsProcessing(true);
      setOCRProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      setOCRError('خطأ في اختيار الصورة');
      Alert.alert('خطأ', 'فشل اختيار الصورة');
    } finally {
      setIsProcessing(false);
      setOCRProcessing(false);
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      if (!GOOGLE_VISION_API_KEY) {
        throw new Error('Google Vision API key not configured');
      }

      const ocrService = createOCRService(GOOGLE_VISION_API_KEY);
      const result = await ocrService.extractText(imageUri);

      setExtractedText(result.fullText);
      setOcrConfidence(result.confidence);

      if (result.confidence < 0.7) {
        Alert.alert(
          'تحذير',
          `دقة استخراج النص منخفضة (${(result.confidence * 100).toFixed(0)}%). يرجى التأكد من صحة النص.`
        );
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOCRError('فشل استخراج النص');
      Alert.alert('خطأ', 'فشل في معالجة الصورة');
    }
  };

  const handleGenerateSolution = async () => {
    if (!extractedText.trim()) {
      Alert.alert('تنبيه', 'الرجاء استخراج النص أولاً');
      return;
    }

    // Store problem and navigate to solution
    setProblem({
      id: `problem_${Date.now()}`,
      userId: 'current_user',
      imageUrl: selectedImage || '',
      extractedText: extractedText.trim(),
      subject: 'general',
      ocrConfidence: ocrConfidence,
      createdAt: new Date().toISOString(),
      isVerified: false,
    });

    // Navigate to solution generation screen
    router.push('/(app)/solution-generation');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📸 استخرج السؤال</Text>

      {!selectedImage ? (
        <View style={styles.cameraSection}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.cameraButtons}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
              >
                <Text style={styles.flipButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>
          </CameraView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.captureButton]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? '⏳ جاري...' : '📸 التقط صورة'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={pickImage}
              disabled={isProcessing}
            >
              <Text style={styles.buttonText}>📁 اختر من المعرض</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.resultSection}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.confidenceBar}>
            <Text style={styles.confidenceLabel}>
              دقة الاستخراج: {(ocrConfidence * 100).toFixed(0)}%
            </Text>
            <View
              style={[
                styles.confidenceIndicator,
                {
                  backgroundColor:
                    ocrConfidence > 0.8
                      ? '#10b981'
                      : ocrConfidence > 0.6
                      ? '#f59e0b'
                      : '#ef4444',
                  width: `${ocrConfidence * 100}%`,
                },
              ]}
            />
          </View>

          {isProcessing ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : (
            <>
              <Text style={styles.extractedLabel}>النص المستخرج:</Text>
              <View style={styles.textBox}>
                <Text
                  style={styles.extractedText}
                  selectable
                >
                  {extractedText || 'لم يتم استخراج نص'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  // Allow user to edit extracted text
                  Alert.prompt(
                    'تعديل النص',
                    'عدّل النص المستخرج:',
                    (text) => {
                      if (text) setExtractedText(text);
                    },
                    'plain-text',
                    extractedText
                  );
                }}
              >
                <Text style={styles.buttonText}>✏️ تعديل النص</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.generateButton]}
                onPress={handleGenerateSolution}
              >
                <Text style={styles.buttonText}>🤖 اشرح الحل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setSelectedImage(null);
                  setExtractedText('');
                }}
              >
                <Text style={styles.buttonText}>🔄 صورة جديدة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  cameraSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  cameraButtons: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  flipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  flipButtonText: {
    fontSize: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  resultSection: {
    marginHorizontal: 16,
    gap: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  confidenceBar: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  confidenceIndicator: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  extractedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  textBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  extractedText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#3b82f6',
    flex: 2,
  },
  generateButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  editButton: {
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
