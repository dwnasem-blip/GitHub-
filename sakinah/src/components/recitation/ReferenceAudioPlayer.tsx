import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
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
  verse,
}) => {
  if (!referenceAudioUrl) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Reference audio not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {verse && (
        <View style={styles.verseDisplay}>
          <Text style={styles.arabicText}>{verse.arabic_text}</Text>
          {verse.english_translation && (
            <Text style={styles.englishText}>{verse.english_translation}</Text>
          )}
        </View>
      )}

      <View style={styles.audioSection}>
        <Text style={styles.sectionTitle}>Reference Audio</Text>
        <Pressable style={styles.playButton}>
          <Text style={styles.playText}>▶ Play Reference</Text>
        </Pressable>
      </View>

      <View style={styles.tip}>
        <Text style={styles.tipText}>💡 Compare with user audio to verify accuracy</Text>
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
    padding: spacing[4],
    marginVertical: spacing[6],
  },
  emptyText: {
    textAlign: 'center',
    color: colors.semantic.text.secondary,
    paddingVertical: spacing[4],
  },
  verseDisplay: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
  },
  arabicText: {
    fontSize: 16,
    color: colors.semantic.text.primary,
    textAlign: 'right',
    marginBottom: spacing[2],
  },
  englishText: {
    fontSize: 12,
    color: colors.semantic.text.secondary,
  },
  audioSection: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.main,
    marginBottom: spacing[2],
  },
  playButton: {
    backgroundColor: colors.accent.main,
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  playText: {
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
  tip: {
    backgroundColor: 'rgba(45, 139, 86, 0.1)',
    padding: spacing[3],
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
  },
  tipText: {
    fontSize: 12,
    color: colors.semantic.text.secondary,
  },
});

export default ReferenceAudioPlayer;
