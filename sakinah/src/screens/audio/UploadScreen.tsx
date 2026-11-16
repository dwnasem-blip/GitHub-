import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/appStore';
import { useAudioUpload } from '@/hooks/useAudioUpload';
import { audioService } from '@/services/audioService';

interface UploadScreenProps {
  projectId: string;
  onUploadSuccess?: () => void;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  projectId,
  onUploadSuccess,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useAppStore((state) => state.isRTL);
  const { isValidating, isUploading, progress, error, uploadedFile, validateFile, uploadFile, clearError } =
    useAudioUpload();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFileUri, setSelectedFileUri] = useState<string | null>(null);

  const handleSelectFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;

      // Validate file
      const validationResult = await validateFile(fileUri);

      if (validationResult.valid) {
        setSelectedFileUri(fileUri);
        setSelectedFileName(fileName);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('audio.uploadError');
      Alert.alert(t('error', 'Error'), errorMessage);
    }
  }, [validateFile, t]);

  const handleUpload = useCallback(async () => {
    if (!selectedFileUri || !selectedFileName) {
      Alert.alert(
        t('error', 'Error'),
        t('audio.selectFile', 'Please select a file first')
      );
      return;
    }

    const result = await uploadFile(selectedFileUri, selectedFileName, projectId);
    if (result) {
      Alert.alert(t('success', 'Success'), t('audio.uploadSuccess'));
      setSelectedFileUri(null);
      setSelectedFileName(null);
      onUploadSuccess?.();
    }
  }, [
    selectedFileUri,
    selectedFileName,
    projectId,
    uploadFile,
    t,
    onUploadSuccess,
  ]);

  const renderFileInfo = () => {
    if (!selectedFileUri) return null;

    return (
      <View style={[styles.fileInfoContainer, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small">{t('audio.selectedFile', 'Selected File')}</ThemedText>
        <ThemedText type="default" style={styles.fileName}>
          {selectedFileName}
        </ThemedText>
      </View>
    );
  };

  const renderProgressBar = () => {
    if (isUploading && progress > 0) {
      return (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: '#4CAF50',
              },
            ]}
          />
          <ThemedText type="small" style={styles.progressText}>
            {progress}%
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  const renderError = () => {
    if (error) {
      return (
        <View style={[styles.errorContainer, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" style={{ color: '#f44336' }}>
            {error}
          </ThemedText>
          <Pressable onPress={clearError} style={styles.errorDismiss}>
            <ThemedText type="small" style={{ color: '#3c87f7' }}>
              {t('dismiss', 'Dismiss')}
            </ThemedText>
          </Pressable>
        </View>
      );
    }
    return null;
  };

  const renderSuccessMessage = () => {
    if (uploadedFile) {
      return (
        <View style={[styles.successContainer, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" style={{ color: '#4CAF50' }}>
            ✓ {t('audio.uploadSuccess')}
          </ThemedText>
          <ThemedText type="small" style={styles.fileDetails}>
            {uploadedFile.file_name}
          </ThemedText>
          <ThemedText type="small" style={styles.fileDetails}>
            {audioService.formatFileSize(uploadedFile.size)} • {audioService.formatDuration(uploadedFile.duration)}
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  const renderSupportedFormats = () => {
    return (
      <View style={styles.infoContainer}>
        <ThemedText type="small" themeColor="textSecondary">
          {t('audio.supportedFormats')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.maxSize}>
          {t('audio.maxFileSize')}
        </ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingLeft: isRTL ? Spacing.three : 0, paddingRight: isRTL ? 0 : Spacing.three }]}>
          <ThemedText type="title" style={styles.title}>
            {t('audio.upload')}
          </ThemedText>

          {renderError()}
          {renderProgressBar()}
          {renderSuccessMessage()}
          {renderFileInfo()}

          <Pressable
            style={[
              styles.selectButton,
              {
                backgroundColor: theme.backgroundElement,
                opacity: isUploading ? 0.5 : 1,
              },
            ]}
            onPress={handleSelectFile}
            disabled={isUploading || isValidating}
          >
            {isValidating ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <ThemedText type="default">
                {selectedFileUri
                  ? t('audio.changeFile', 'Change File')
                  : t('audio.selectFile')}
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            style={[
              styles.uploadButton,
              {
                backgroundColor: selectedFileUri ? '#3c87f7' : theme.backgroundSelected,
                opacity: !selectedFileUri || isUploading ? 0.5 : 1,
              },
            ]}
            onPress={handleUpload}
            disabled={!selectedFileUri || isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText
                type="default"
                style={{
                  color: selectedFileUri ? '#fff' : theme.textSecondary,
                }}
              >
                {isUploading ? t('audio.uploading') : t('audio.upload')}
              </ThemedText>
            )}
          </Pressable>

          {renderSupportedFormats()}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.three,
    paddingRight: Spacing.three,
  },
  title: {
    marginBottom: Spacing.four,
    textAlign: 'center',
  },
  selectButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfoContainer: {
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
  },
  fileName: {
    marginTop: Spacing.one,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: Spacing.three,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
  },
  progressText: {
    fontWeight: '600',
    color: '#fff',
    zIndex: 1,
  },
  errorContainer: {
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorDismiss: {
    paddingLeft: Spacing.two,
  },
  successContainer: {
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
  },
  fileDetails: {
    marginTop: Spacing.one,
    color: '#666',
  },
  infoContainer: {
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  maxSize: {
    marginTop: Spacing.one,
  },
});
