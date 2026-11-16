import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/appStore';
import { useAudioRecord } from '@/hooks/useAudioRecord';
import { audioService, AudioService } from '@/services/audioService';

interface RecordScreenProps {
  projectId: string;
  onRecordSuccess?: () => void;
}

export const RecordScreen: React.FC<RecordScreenProps> = ({ projectId, onRecordSuccess }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useAppStore((state) => state.isRTL);
  const { recordingState, duration, error, recordedFile, recordingUri, startRecording, stopRecording, pauseRecording, resumeRecording, uploadRecording, reset, clearError } = useAudioRecord();

  useEffect(() => {
    return () => { audioService.cleanup(); };
  }, []);

  const handleStartRecording = useCallback(async () => {
    clearError();
    const success = await startRecording();
    if (!success) Alert.alert(t('error', 'Error'), 'Failed to start');
  }, [startRecording, clearError, t]);

  const handleStopRecording = useCallback(async () => { await stopRecording(); }, [stopRecording]);
  const handlePauseRecording = useCallback(async () => { await pauseRecording(); }, [pauseRecording]);
  const handleResumeRecording = useCallback(async () => { await resumeRecording(); }, [resumeRecording]);

  const handleUploadRecording = useCallback(async () => {
    if (recordingState !== 'stopped') { Alert.alert(t('error', 'Error'), t('audio.stopRecordingFirst')); return; }
    if (!recordingUri) { Alert.alert(t('error', 'Error'), t('audio.noRecording')); return; }
    const result = await uploadRecording(recordingUri, projectId);
    if (result) { Alert.alert(t('success', 'Success'), t('audio.uploadSuccess')); reset(); onRecordSuccess?.(); }
  }, [recordingState, recordingUri, uploadRecording, projectId, reset, onRecordSuccess, t]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingLeft: isRTL ? Spacing.three : 0, paddingRight: isRTL ? 0 : Spacing.three }]}>
          <ThemedText type="title" style={styles.title}>{t('audio.record')}</ThemedText>
          {error && <View style={[styles.errorContainer]}><ThemedText type="small" style={{ color: '#f44336' }}>{error}</ThemedText></View>}
          <View style={[styles.stateIndicator]}><ThemedText type="small" themeColor="textSecondary">{t(`audio.recordingState.${recordingState}`)}</ThemedText><ThemedText type="default" style={styles.duration}>{AudioService.formatDuration(duration)}</ThemedText></View>
          <View style={styles.controlsContainer}>
            {recordingState === 'idle' && (<Pressable style={[styles.recordButton, { backgroundColor: '#f44336' }]} onPress={handleStartRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.startRecording')}</ThemedText></Pressable>)}
            {recordingState === 'recording' && (<><Pressable style={[styles.controlButton, { backgroundColor: '#FF9800' }]} onPress={handlePauseRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.pause')}</ThemedText></Pressable><Pressable style={[styles.controlButton, { backgroundColor: '#f44336' }]} onPress={handleStopRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.stop')}</ThemedText></Pressable></>)}
            {recordingState === 'paused' && (<><Pressable style={[styles.controlButton, { backgroundColor: '#4CAF50' }]} onPress={handleResumeRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.resume')}</ThemedText></Pressable><Pressable style={[styles.controlButton, { backgroundColor: '#f44336' }]} onPress={handleStopRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.stop')}</ThemedText></Pressable></>)}
            {recordingState === 'stopped' && (<><Pressable style={[styles.recordButton, { backgroundColor: '#f44336' }]} onPress={handleStartRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.recordAgain')}</ThemedText></Pressable><Pressable style={[styles.recordButton, { backgroundColor: '#3c87f7' }]} onPress={handleUploadRecording}><ThemedText type="default" style={{ color: '#fff' }}>{t('audio.upload')}</ThemedText></Pressable></>)}
          </View>
          {recordedFile && (<View style={[styles.successContainer]}><ThemedText type="small" style={{ color: '#4CAF50' }}>✓ {t('audio.uploadSuccess')}</ThemedText><ThemedText type="small" style={styles.fileDetails}>{recordedFile.file_name}</ThemedText><ThemedText type="small" style={styles.fileDetails}>{AudioService.formatFileSize(recordedFile.size)} • {AudioService.formatDuration(recordedFile.duration)}</ThemedText></View>)}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { flex: 1, padding: Spacing.three },
  title: { marginBottom: Spacing.four, textAlign: 'center' },
  stateIndicator: { padding: Spacing.three, borderRadius: 8, marginBottom: Spacing.three, alignItems: 'center' },
  duration: { marginTop: Spacing.two, fontSize: 32, fontWeight: '700' },
  controlsContainer: { marginBottom: Spacing.four },
  recordButton: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, borderRadius: 8, marginBottom: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  controlButton: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.three, borderRadius: 8, marginBottom: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  errorContainer: { padding: Spacing.three, borderRadius: 8, marginBottom: Spacing.three },
  successContainer: { padding: Spacing.three, borderRadius: 8, marginBottom: Spacing.three },
  fileDetails: { marginTop: Spacing.one, color: '#666' },
});
