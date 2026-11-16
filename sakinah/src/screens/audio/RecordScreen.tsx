import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/appStore';
import { useAudioRecord } from '@/hooks/useAudioRecord';
import { audioService } from '@/services/audioService';

interface RecordScreenProps {
  projectId: string;
  onRecordSuccess?: () => void;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({
  projectId,
  onRecordSuccess,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useAppStore((state) => state.isRTL);
  const {
    recordingState,
    duration,
    error,
    recordedFile,
    isUploading,
    uploadProgress,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    uploadRecording,
    reset,
    clearError,
  } = useAudioRecord();

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      audioService.cleanup();
    };
  }, []);

  const handleStartRecording = useCallback(async () => {
    clearError();
    const success = await startRecording();
    if (!success && error) {
      Alert.alert(t('error', 'Error'), error);
    }
  }, [startRecording, clearError, error, t]);

  const handleStopRecording = useCallback(async () => {
    await stopRecording();
  }, [stopRecording]);

  const handlePauseRecording = useCallback(async () => {
    await pauseRecording();
  }, [pauseRecording]);

  const handleResumeRecording = useCallback(async () => {
    await resumeRecording();
  }, [resumeRecording]);

  const handleUploadRecording = useCallback(async () => {
    if (recordingState !== 'stopped') {
      Alert.alert(
        t('error', 'Error'),
        t('audio.stopRecordingFirst', 'Please stop the recording first')
      );
      return;
    }

    // Get the recorded file URI from the audioService
    // This is a workaround since we need the actual recording file path
    const recordingUri = (audioService as any).recording?.getURI();
    if (!recordingUri) {
      Alert.alert(t('error', 'Error'), t('audio.noRecording', 'No recording found'));
      return;
    }

    const result = await uploadRecording(recordingUri, projectId);
    if (result) {
      Alert.alert(t('success', 'Success'), t('audio.uploadSuccess'));
      reset();
      onRecordSuccess?.();
    }
  }, [recordingState, uploadRecording, projectId, reset, onRecordSuccess, t]);

  const renderRecordingState = () => {
    return (
      <View style={[styles.stateIndicator, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="small" themeColor="textSecondary">
          {t(`audio.recordingState.${recordingState}`)}
        </ThemedText>
        <ThemedText type="default" style={styles.duration}>
          {audioService.formatDuration(duration)}
        </ThemedText>
      </View>
    );
  };

  const renderRecordingControls = () => {
    const isActive = recordingState === 'recording' || recordingState === 'paused';

    return (
      <View style={styles.controlsContainer}>
        {recordingState === 'idle' && (
          <Pressable
            style={[styles.recordButton, { backgroundColor: '#f44336' }]}
            onPress={handleStartRecording}
          >
            <ThemedText type="default" style={{ color: '#fff' }}>
              {t('audio.startRecording', 'Start Recording')}
            </ThemedText>
          </Pressable>
        )}

        {recordingState === 'recording' && (
          <>
            <Pressable
              style={[styles.controlButton, { backgroundColor: '#FF9800' }]}
              onPress={handlePauseRecording}
            >
              <ThemedText type="default" style={{ color: '#fff' }}>
                {t('audio.pause', 'Pause')}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.controlButton, { backgroundColor: '#f44336' }]}
              onPress={handleStopRecording}
            >
              <ThemedText type="default" style={{ color: '#fff' }}>
                {t('audio.stop', 'Stop')}
              </ThemedText>
            </Pressable>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Pressable
              style={[styles.controlButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleResumeRecording}
            >
              <ThemedText type="default" style={{ color: '#fff' }}>
                {t('audio.resume', 'Resume')}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.controlButton, { backgroundColor: '#f44336' }]}
              onPress={handleStopRecording}
            >
              <ThemedText type="default" style={{ color: '#fff' }}>
                {t('audio.stop', 'Stop')}
              </ThemedText>
            </Pressable>
          </>
        )}

        {recordingState === 'stopped' && (
          <>
            <Pressable
              style={[styles.recordButton, { backgroundColor: '#f44336' }]}
              onPress={handleStartRecording}
            >
              <ThemedText type="default" style={{ color: '#fff' }}>
                {t('audio.recordAgain', 'Record Again')}
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.recordButton,
                {
                  backgroundColor: isUploading ? theme.backgroundSelected : '#3c87f7',
                  opacity: isUploading ? 0.5 : 1,
                },
              ]}
              onPress={handleUploadRecording}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText type="default" style={{ color: '#fff' }}>
                  {t('audio.upload')}
                </ThemedText>
              )}
            </Pressable>
          </>
        )}
      </View>
    );
  };

  const renderUploadProgress = () => {
    if (isUploading && uploadProgress > 0) {
      return (
        <View style={styles.uploadProgressContainer}>
          <View
            style={[
              styles.uploadProgressBar,
              {
                width: `${uploadProgress}%`,
                backgroundColor: '#3c87f7',
              },
            ]}
          />
          <ThemedText type="small" style={styles.uploadProgressText}>
            {uploadProgress}%
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
    if (recordedFile) {
      return (
        <View style={[styles.successContainer, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" style={{ color: '#4CAF50' }}>
            ✓ {t('audio.uploadSuccess')}
          </ThemedText>
          <ThemedText type="small" style={styles.fileDetails}>
            {recordedFile.file_name}
          </ThemedText>
          <ThemedText type="small" style={styles.fileDetails}>
            {audioService.formatFileSize(recordedFile.size)} • {audioService.formatDuration(recordedFile.duration)}
          </ThemedText>
        </View>
      );
    }
    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingLeft: isRTL ? Spacing.three : 0, paddingRight: isRTL ? 0 : Spacing.three }]}>
          <ThemedText type="title" style={styles.title}>
            {t('audio.record')}
          </ThemedText>

          {renderError()}
          {renderRecordingState()}
          {renderRecordingControls()}
          {renderUploadProgress()}
          {renderSuccessMessage()}

          <View style={styles.infoContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              {t('audio.recordingInfo', 'Press start to begin recording. The microphone will capture your voice.')}
            </ThemedText>
          </View>
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
  stateIndicator: {
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.three,
    alignItems: 'center',
  },
  duration: {
    marginTop: Spacing.two,
    fontSize: 32,
    fontWeight: '700',
  },
  controlsContainer: {
    marginBottom: Spacing.four,
  },
  recordButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadProgressContainer: {
    marginBottom: Spacing.three,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
  },
  uploadProgressText: {
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
});
