import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  I18nManager,
  Dimensions,
  FlatList,
} from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius, shadows } from '@/theme/spacing';
import Text from '@/components/typography/Text';
import { Finding, VerseMatch } from '@/types';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface AudioPlayerWithTimelineProps {
  audioUrl: string;
  duration: number;
  verses: VerseMatch[];
  findings: Finding[];
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
  onMarkerPress: (finding: Finding) => void;
}

export const AudioPlayerWithTimeline: React.FC<
  AudioPlayerWithTimelineProps
> = ({
  audioUrl,
  duration,
  verses,
  findings,
  onPlayPause,
  onSeek,
  onMarkerPress,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const playButtonRotation = useSharedValue(0);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        setLoading(true);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false, progressUpdateIntervalMillis: 100 }
        );
        soundRef.current = newSound;
        setSound(newSound);
        setLoading(false);
      } catch (error) {
        console.error('Error loading audio:', error);
        setLoading(false);
      }
    };

    if (audioUrl) {
      initAudio();
    }

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [audioUrl]);

  // Handle playback status updates
  const handlePlayPause = useCallback(async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        onPlayPause(false);
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        onPlayPause(true);

        // Update current time periodically
        updateIntervalRef.current = setInterval(async () => {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);
          }
        }, 100);
      }

      // Animate play button
      playButtonRotation.value = withTiming(isPlaying ? 0 : 1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [sound, isPlaying, onPlayPause]);

  // Handle seek
  const handleSeek = useCallback(
    async (time: number) => {
      if (!sound) return;
      try {
        await sound.setPositionAsync(time * 1000);
        setCurrentTime(time);
        onSeek(time);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    },
    [sound, onSeek]
  );

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${playButtonRotation.value * 180}deg` }],
  }));

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate marker positions on timeline
  const getMarkerPosition = (time: number): number => {
    if (duration === 0) return 0;
    return (time / duration) * (Dimensions.get('window').width - spacing[8]);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Error':
        return colors.gold.main;
      case 'Probable':
        return colors.status.warning;
      case 'Inconclusive':
        return colors.neutral[600];
      default:
        return colors.neutral[500];
    }
  };

  return (
    <View style={styles.container}>
      {/* Play/Pause Button and Time Display */}
      <View style={styles.playerHeader}>
        <Pressable
          onPress={handlePlayPause}
          disabled={loading}
          style={[styles.playButton, loading && styles.playButtonDisabled]}
        >
          <Animated.View style={playAnimatedStyle}>
            <Text
              style={[typography.styles.h3, { color: colors.accent.main }]}
            >
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </Animated.View>
        </Pressable>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeLabel}>/</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {/* Background track */}
        <View style={styles.trackBackground} />

        {/* Verse markers */}
        {verses.map((verse, index) => (
          <View
            key={`verse-${index}`}
            style={[
              styles.verseMarker,
              {
                left: getMarkerPosition(verse.start_time),
              },
            ]}
          />
        ))}

        {/* Finding markers */}
        {findings.map((finding, index) => (
          <Pressable
            key={`finding-${index}`}
            onPress={() => onMarkerPress(finding)}
            style={[
              styles.findingMarker,
              {
                left: getMarkerPosition(finding.start_time),
                borderColor: getSeverityColor(finding.severity),
              },
            ]}
          />
        ))}

        {/* Seek track */}
        <Pressable
          onPress={(event) => {
            const { locationX } = event.nativeEvent;
            const position = locationX / (Dimensions.get('window').width - spacing[8]);
            const newTime = position * duration;
            handleSeek(newTime);
          }}
          style={styles.trackClickable}
        />

        {/* Progress indicator */}
        <View
          style={[
            styles.progress,
            {
              width: `${(currentTime / duration) * 100}%`,
            },
          ]}
        />

        {/* Current position indicator */}
        <View
          style={[
            styles.currentIndicator,
            {
              left: getMarkerPosition(currentTime),
            },
          ]}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: colors.accent.main }]} />
          <Text style={styles.legendText}>Verse</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { borderColor: colors.gold.main, borderWidth: 2 }]} />
          <Text style={styles.legendText}>Error</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { borderColor: colors.status.warning, borderWidth: 2 }]} />
          <Text style={styles.legendText}>Probable</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    marginBottom: spacing[6],
    ...shadows.md,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  playButton: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: radius.full,
    backgroundColor: colors.semantic.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[4],
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timeText: {
    ...typography.styles.body2,
    color: colors.semantic.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    color: colors.semantic.text.tertiary,
    marginHorizontal: spacing[2],
  },
  timelineContainer: {
    position: 'relative',
    height: spacing[12],
    marginVertical: spacing[4],
  },
  trackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: spacing[1],
    top: '50%',
    marginTop: -spacing[1] / 2,
    backgroundColor: colors.semantic.border.light,
    borderRadius: radius.full,
  },
  verseMarker: {
    position: 'absolute',
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.accent.main,
    top: '50%',
    marginLeft: -spacing[1],
    marginTop: -spacing[1],
  },
  findingMarker: {
    position: 'absolute',
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
    borderWidth: 2,
    top: '50%',
    marginLeft: -spacing[1.5],
    marginTop: -spacing[1.5],
  },
  trackClickable: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: spacing[12],
    top: 0,
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: spacing[1],
    marginTop: -spacing[1] / 2,
    backgroundColor: colors.accent.main,
    borderRadius: radius.full,
  },
  currentIndicator: {
    position: 'absolute',
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
    backgroundColor: colors.accent.main,
    top: '50%',
    marginLeft: -spacing[1.5],
    marginTop: -spacing[1.5],
  },
  legend: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'flex-start',
    gap: spacing[6],
  },
  legendItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  legendMarker: {
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
  },
  legendText: {
    ...typography.styles.caption,
    color: colors.semantic.text.tertiary,
  },
});

export default AudioPlayerWithTimeline;
