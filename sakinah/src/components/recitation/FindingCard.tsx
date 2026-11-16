import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';
import { Finding } from '@/types';

interface FindingCardProps {
  finding: Finding;
  isSelected: boolean;
  onPress: () => void;
  onPlayOriginal: () => void;
  onPlayReference: () => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  isSelected,
  onPress,
  onPlayOriginal,
  onPlayReference,
}) => {
  const [expanded, setExpanded] = useState(isSelected);

  const toggleExpand = () => {
    setExpanded(!expanded);
    onPress();
  };

  const getSeverityColor = () => {
    switch (finding.severity) {
      case 'Error':
        return colors.gold.main;
      case 'Probable':
        return colors.status.warning;
      default:
        return colors.neutral[600];
    }
  };

  return (
    <Pressable onPress={toggleExpand}>
      <View style={[styles.card, { borderColor: getSeverityColor() }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.arabicWord}>{finding.arabic_word}</Text>
            <Text style={styles.transliteration}>{finding.transliteration}</Text>
          </View>
          <Text style={styles.errorType}>{finding.error_type}</Text>
        </View>

        {expanded && (
          <View style={styles.details}>
            <Text style={styles.expected}>Expected: {finding.expected_pronunciation}</Text>
            <Text style={styles.detected}>Detected: {finding.detected_pronunciation}</Text>
            <Text style={styles.confidence}>Confidence: {(finding.confidence * 100).toFixed(0)}%</Text>
            <Text style={styles.description}>{finding.description_en}</Text>

            <View style={styles.buttons}>
              <Pressable style={styles.btn} onPress={onPlayOriginal}>
                <Text style={styles.btnText}>▶ User</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onPlayReference}>
                <Text style={styles.btnText}>▶ Reference</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arabicWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.semantic.text.primary,
  },
  transliteration: {
    fontSize: 12,
    color: colors.semantic.text.secondary,
    marginTop: spacing[1],
  },
  errorType: {
    fontSize: 14,
    color: colors.semantic.text.secondary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
  },
  details: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  expected: {
    color: colors.status.success,
    fontSize: 14,
  },
  detected: {
    color: colors.gold.main,
    fontSize: 14,
  },
  confidence: {
    color: colors.semantic.text.secondary,
    fontSize: 12,
  },
  description: {
    color: colors.semantic.text.secondary,
    fontSize: 13,
    marginTop: spacing[2],
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  btn: {
    flex: 1,
    backgroundColor: colors.accent.main,
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSecondary: {
    backgroundColor: colors.semantic.background.tertiary,
    borderWidth: 1,
    borderColor: colors.semantic.border.main,
  },
  btnText: {
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
});

export default FindingCard;
