import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/appStore';
import { storageService } from '@/services/storageService';
import { audioService, AudioService } from '@/services/audioService';
import { AudioFile } from '@/types/index';

export default function AudioListPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRTL = useAppStore((state) => state.isRTL);
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadAudioFiles();
  }, [projectId]);

  const loadAudioFiles = async () => {
    if (!projectId) {
      setError('Project ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const files = await storageService.getProjectAudioFiles(projectId);
      setAudioFiles(files);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading audio files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (audioFile: AudioFile) => {
    try {
      if (playingId === audioFile.id) {
        // Stop playing if already playing
        await audioService.stopAudio();
        setPlayingId(null);
      } else {
        // Play the audio
        const success = await audioService.playAudio(audioFile.file_url);
        if (success) {
          setPlayingId(audioFile.id);
        } else {
          Alert.alert(t('error', 'Error'), t('audio.playError', 'Failed to play audio'));
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error playing audio';
      Alert.alert(t('error', 'Error'), errorMessage);
    }
  };

  const handleDeleteAudio = async (audioFile: AudioFile) => {
    Alert.alert(
      t('audio.deleteConfirm', 'Delete Audio'),
      t('audio.deleteMessage', 'Are you sure you want to delete this audio file?'),
      [
        {
          text: t('cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop playing if this file is playing
              if (playingId === audioFile.id) {
                await audioService.stopAudio();
                setPlayingId(null);
              }

              // Delete from storage and database
              const storageDeleted = await storageService.deleteAudio(
                audioFile.id,
                audioFile.project_id,
                audioFile.user_id
              );
              const metadataDeleted = await storageService.deleteAudioMetadata(
                audioFile.id
              );

              if (storageDeleted && metadataDeleted) {
                setAudioFiles((files) =>
                  files.filter((f) => f.id !== audioFile.id)
                );
                Alert.alert(t('success', 'Success'), t('audio.deleteSuccess'));
              } else {
                Alert.alert(t('error', 'Error'), t('audio.deleteError'));
              }
            } catch (err) {
              const errorMessage =
                err instanceof Error ? err.message : 'Error deleting audio';
              Alert.alert(t('error', 'Error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderAudioItem = ({ item }: { item: AudioFile }) => {
    const isPlaying = playingId === item.id;

    return (
      <View
        style={[
          styles.audioItem,
          {
            backgroundColor: theme.backgroundElement,
            borderLeftColor: isPlaying ? '#3c87f7' : 'transparent',
          },
        ]}
      >
        <View style={styles.audioInfo}>
          <ThemedText type="default" numberOfLines={1}>
            {item.file_name}
          </ThemedText>
          <View style={styles.audioMeta}>
            <ThemedText type="small" themeColor="textSecondary">
              {AudioService.formatDuration(item.duration)} • {AudioService.formatFileSize(item.size)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.createdAt}>
              {new Date(item.created_at).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.audioActions}>
          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: isPlaying ? '#FF9800' : '#3c87f7',
              },
            ]}
            onPress={() => handlePlayAudio(item)}
          >
            <ThemedText type="small" style={{ color: '#fff' }}>
              {isPlaying ? t('audio.stop', 'Stop') : t('audio.play', 'Play')}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              {
                backgroundColor: '#f44336',
              },
            ]}
            onPress={() => handleDeleteAudio(item)}
          >
            <ThemedText type="small" style={{ color: '#fff' }}>
              {t('delete', 'Delete')}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={theme.text} size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText type="default" style={{ color: '#f44336' }}>
            {error}
          </ThemedText>
          <Pressable style={styles.retryButton} onPress={loadAudioFiles}>
            <ThemedText type="small" style={{ color: '#3c87f7' }}>
              {t('retry', 'Retry')}
            </ThemedText>
          </Pressable>
        </View>
      );
    }

    if (audioFiles.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText type="default" themeColor="textSecondary">
            {t('audio.noFiles', 'No audio files yet')}
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={audioFiles}
        renderItem={renderAudioItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    );
  };

  if (!projectId) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
          <View style={styles.centerContainer}>
            <ThemedText type="default">Project ID is required</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.innerContent, { paddingLeft: isRTL ? Spacing.three : 0, paddingRight: isRTL ? 0 : Spacing.three }]}>
            <ThemedText type="title" style={styles.title}>
              {t('audio.list', 'Audio Files')}
            </ThemedText>

            {renderContent()}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  innerContent: {
    padding: Spacing.three,
    paddingRight: Spacing.three,
  },
  title: {
    marginBottom: Spacing.three,
    textAlign: 'center',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  listContent: {
    paddingVertical: Spacing.one,
  },
  audioItem: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.two,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  audioInfo: {
    flex: 1,
    marginRight: Spacing.three,
  },
  audioMeta: {
    marginTop: Spacing.one,
  },
  createdAt: {
    marginTop: Spacing.half,
  },
  audioActions: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  actionButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 6,
  },
});
