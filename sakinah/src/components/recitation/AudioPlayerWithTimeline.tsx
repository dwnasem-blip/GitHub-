import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { Finding, VerseMatch } from '@/types';

interface AudioPlayerWithTimelineProps {
  audioUrl: string;
  duration: number;
  verses: VerseMatch[];
  findings: Finding[];
  onPlayPause: (isPlaying: boolean) => void;
  onSeek: (time: number) => void;
  onMarkerPress: (finding: Finding) => void;
}

export const AudioPlayerWithTimeline: React.FC<AudioPlayerWithTimelineProps> = ({
  audioUrl,
  duration,
  verses,
  findings,
  onPlayPause,
  onSeek,
  onMarkerPress,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    onPlayPause(newState);
  };

  return (
    <View style={styles.container}>
      <View style={styles.playerHeader}>
        <Pressable
          onPress={togglePlayPause}
          style={styles.playButton}
        >
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Text style={styles.duration}>Audio: {duration.toFixed(0)}s</Text>
      </View>

      <View style={styles.timeline}>
        {verses.map((v, i) => (
          <View key={i} style={styles.marker} />
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendMarker} />
          <Text style={styles.legendText}>Verses</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[6],
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
    backgroundColor: colors.accent.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    fontSize: 16,
    color: colors.semantic.text.primary,
  },
  duration: {
    marginLeft: spacing[4],
    color: colors.semantic.text.secondary,
  },
  timeline: {
    height: spacing[8],
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    marginVertical: spacing[4],
    flexDirection: 'row',
  },
  marker: {
    width: 2,
    height: '100%',
    backgroundColor: colors.accent.main,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  legendMarker: {
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
    backgroundColor: colors.accent.main,
  },
  legendText: {
    fontSize: 12,
    color: colors.semantic.text.secondary,
  },
});

export default AudioPlayerWithTimeline;
