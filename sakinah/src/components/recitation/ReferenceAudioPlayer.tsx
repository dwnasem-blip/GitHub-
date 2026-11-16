import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  I18nManager,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius, shadows } from '@/theme/spacing';
import Text from '@/components/typography/Text';
import { VerseMatch } from '@/types';

interface ReferenceAudioPlayerProps {
  referenceAudioUrl?: string;
  userAudioUrl: string;
  currentTime: number;
  onTimeChange: (time: number) => void;
  verse?: VerseMatch;
}

export const ReferenceAudioPlayer: React.FC<ReferenceAudioPlayerProps> = ({
  referenceAudioUrl,
  userAudioUrl,
  currentTime,
  onTimeChange,
  verse,
}) => {
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [referenceSound, setReferenceSound] = useState<Audio.Sound | null>(null);
  const [referenceDuration, setReferenceDuration] = useState(0);
  const [referenceTime, setReferenceTime] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize reference audio
  useEffect(() => {
    const initReferenceAudio = async () => {
      try {
        if (referenceAudioUrl) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: referenceAudioUrl },
            { shouldPlay: false }
          );
          soundRef.current = newSound;
          setReferenceSound(newSound);

          // Get duration
          const status = await newSound.getStatusAsync();
          if (status.isLoaded) {
            setReferenceDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
          }
        }
      } catch (error) {
        console.error('Error loading reference audio:', error);
      }
    };

    if (referenceAudioUrl) {
      initReferenceAudio();
    }

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [referenceAudioUrl]);

  const handlePlayReference = useCallback(async () => {
    if (!referenceSound) return;

    try {
      if (isPlayingReference) {
        await referenceSound.pauseAsync();
        setIsPlayingReference(false);
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      } else {
        await referenceSound.playAsync();
        setIsPlayingReference(true);

        // Update current time periodically
        updateIntervalRef.current = setInterval(async () => {
          const status = await referenceSound.getStatusAsync();
          if (status.isLoaded) {
            setReferenceTime(status.positionMillis / 1000);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error playing reference audio:', error);
    }
  }, [referenceSound, isPlayingReference]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!referenceAudioUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={[typography.styles.body2, styles.emptyText]}>
            Reference audio not available for comparison
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Verse Display (if provided) */}
      {verse && (
        <View style={styles.verseDisplay}>
          <Text
            style={[
              typography.styles.body1,
              {
                color: colors.semantic.text.primary,
                textAlign: I18nManager.isRTL ? 'right' : 'left',
              },
            ]}
          >
            {verse.arabic_text}
          </Text>
          {verse.english_translation && (
            <Text
              style={[
                typography.styles.caption,
                {
                  color: colors.semantic.text.secondary,
                  marginTop: spacing[2],
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                },
              ]}
            >
              {verse.english_translation}
            </Text>
          )}
        </View>
      )}

      {/* Comparison Container */}
      <View style={styles.comparisonContainer}>
        {/* Reference Audio Section */}
        <View style={styles.audioSection}>
          <Text
            style={[
              typography.styles.subtitle2,
              { color: colors.accent.main, marginBottom: spacing[2] },
            ]}
          >
            Reference Audio
          </Text>

          <View style={styles.playerBox}>
            <Pressable
              style={styles.playButton}
              onPress={handlePlayReference}
              disabled={!referenceSound}
            >
              <Text style={{ fontSize: 20 }}>
                {isPlayingReference ? '⏸' : '▶'}
              </Text>
            </Pressable>

            <View style={styles.timeContainer}>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                {formatTime(referenceTime)} / {formatTime(referenceDuration)}
              </Text>
            </View>
          </View>
        </View>

        {/* User Audio Section */}
        <View style={styles.audioSection}>
          <Text
            style={[
              typography.styles.subtitle2,
              { color: colors.gold.main, marginBottom: spacing[2] },
            ]}
          >
            Your Audio
          </Text>

          <View style={styles.playerBox}>
            <View style={styles.playerInfo}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                Current Position: {formatTime(currentTime)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Comparison Tips */}
      <View style={styles.tipsContainer}>
        <Text
          style={[
            typography.styles.caption,
            { color: colors.semantic.text.tertiary },
            { marginBottom: spacing[2] },
          ]}
        >
          💡 Tip: Play both audios to compare pronunciation and timing
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.semantic.border.light,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginVertical: spacing[6],
    ...shadows.md,
  },
  emptyState: {
    paddingVertical: spacing[6],
    alignItems: 'center',
  },
  emptyText: {
    color: colors.semantic.text.secondary,
  },
  verseDisplay: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
  },
  comparisonContainer: {
    gap: spacing[4],
  },
  audioSection: {
    gap: spacing[2],
  },
  playerBox: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  playButton: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: radius.full,
    backgroundColor: colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flex: 1,
  },
  playerInfo: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: 'rgba(45, 139, 86, 0.1)',
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginTop: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
  },
});

export default ReferenceAudioPlayer;
