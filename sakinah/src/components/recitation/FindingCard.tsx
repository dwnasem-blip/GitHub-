import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  I18nManager,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius, shadows } from '@/theme/spacing';
import Text from '@/components/typography/Text';
import { Finding, Severity } from '@/types';

interface FindingCardProps {
  finding: Finding;
  isSelected: boolean;
  index: number;
  onPress: () => void;
  onPlayOriginal: () => void;
  onPlayReference: () => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  isSelected,
  index,
  onPress,
  onPlayOriginal,
  onPlayReference,
}) => {
  const [expanded, setExpanded] = useState(isSelected);
  const expandAnimation = useSharedValue(isSelected ? 1 : 0);

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    expandAnimation.value = withTiming(newExpanded ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    });
    onPress();
  };

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + expandAnimation.value * 0.5,
  }));

  const getSeverityColor = (severity: Severity): string => {
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

  const getSeverityBgColor = (severity: Severity): string => {
    switch (severity) {
      case 'Error':
        return 'rgba(196, 169, 101, 0.15)';
      case 'Probable':
        return 'rgba(243, 156, 18, 0.15)';
      case 'Inconclusive':
        return 'rgba(107, 114, 128, 0.15)';
      default:
        return colors.semantic.background.tertiary;
    }
  };

  const getErrorTypeIcon = (type: string): string => {
    switch (type) {
      case 'Makhraj':
        return '📍';
      case 'Tajweed':
        return '🎯';
      case 'Timing':
        return '⏱';
      case 'Pronunciation':
        return '🗣';
      default:
        return '⚠';
    }
  };

  return (
    <Pressable onPress={toggleExpand} style={styles.container}>
      <Animated.View
        style={[
          styles.cardWrapper,
          expandedStyle,
          {
            borderColor: getSeverityColor(finding.severity),
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.errorTypeBadge,
                { backgroundColor: getSeverityBgColor(finding.severity) },
              ]}
            >
              <Text style={styles.badgeIcon}>
                {getErrorTypeIcon(finding.error_type)}
              </Text>
              <Text style={styles.badgeText}>{finding.error_type}</Text>
            </View>

            <View style={styles.wordContainer}>
              <Text
                style={[
                  typography.styles.h6,
                  { color: colors.semantic.text.primary },
                ]}
                numberOfLines={1}
              >
                {finding.arabic_word}
              </Text>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                {finding.transliteration}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.severityBadge,
              {
                backgroundColor: getSeverityColor(finding.severity),
              },
            ]}
          >
            <Text style={styles.severityText}>
              {finding.severity.charAt(0)}
            </Text>
          </View>
        </View>

        {/* Expected vs Detected */}
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <Text
              style={[
                typography.styles.caption,
                { color: colors.semantic.text.tertiary },
              ]}
            >
              Expected:
            </Text>
            <Text style={[typography.styles.body2, styles.correctWord]}>
              {finding.expected_pronunciation}
            </Text>
          </View>

          <View style={styles.comparisonItem}>
            <Text
              style={[
                typography.styles.caption,
                { color: colors.semantic.text.tertiary },
              ]}
            >
              Detected:
            </Text>
            <Text style={[typography.styles.body2, styles.detectedWord]}>
              {finding.detected_pronunciation}
            </Text>
          </View>
        </View>

        {/* Confidence Score */}
        <View style={styles.confidenceContainer}>
          <Text
            style={[
              typography.styles.caption,
              { color: colors.semantic.text.tertiary },
            ]}
          >
            Confidence:
          </Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${finding.confidence * 100}%`,
                  backgroundColor:
                    finding.confidence > 0.8
                      ? colors.status.success
                      : finding.confidence > 0.6
                      ? colors.status.warning
                      : colors.status.error,
                },
              ]}
            />
          </View>
          <Text style={[typography.styles.caption, styles.confidenceText]}>
            {(finding.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        {/* Description (Expanded) */}
        {expanded && (
          <>
            <View style={styles.divider} />

            <View style={styles.descriptionSection}>
              <Text
                style={[
                  typography.styles.subtitle2,
                  { color: colors.semantic.text.primary },
                ]}
              >
                Description
              </Text>

              {/* Arabic Description */}
              <View style={styles.descriptionItem}>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.tertiary },
                  ]}
                >
                  Arabic:
                </Text>
                <Text
                  style={[
                    typography.styles.body2,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  {finding.description_ar}
                </Text>
              </View>

              {/* English Description */}
              <View style={styles.descriptionItem}>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.tertiary },
                  ]}
                >
                  English:
                </Text>
                <Text
                  style={[
                    typography.styles.body2,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  {finding.description_en}
                </Text>
              </View>
            </View>

            {/* Tajweed Info (if applicable) */}
            {finding.tajweed_rule && (
              <>
                <View style={styles.divider} />
                <View style={styles.tajweedSection}>
                  <Text
                    style={[
                      typography.styles.subtitle2,
                      { color: colors.semantic.text.primary },
                    ]}
                  >
                    Tajweed Rule
                  </Text>
                  <Text
                    style={[
                      typography.styles.body2,
                      { color: colors.accent.light },
                    ]}
                  >
                    {finding.tajweed_rule.name}
                  </Text>
                  <Text
                    style={[
                      typography.styles.caption,
                      { color: colors.semantic.text.secondary },
                      { marginTop: spacing[1] },
                    ]}
                  >
                    {finding.tajweed_rule.description}
                  </Text>
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={onPlayOriginal}
              >
                <Text style={styles.buttonText}>▶ User Audio</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={onPlayReference}
              >
                <Text style={styles.buttonText}>▶ Reference</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Collapsed indicator */}
        {!expanded && (
          <View style={styles.expandIndicator}>
            <Text style={{ color: colors.semantic.text.tertiary }}>↓</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  cardWrapper: {
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    ...shadows.md,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  headerLeft: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  errorTypeBadge: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.md,
    gap: spacing[1],
  },
  badgeIcon: {
    fontSize: typography.fontSize.lg,
  },
  badgeText: {
    ...typography.styles.caption,
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
  wordContainer: {
    flex: 1,
  },
  severityBadge: {
    width: spacing[8],
    height: spacing[8],
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  severityText: {
    ...typography.styles.h6,
    color: colors.semantic.text.primary,
    fontWeight: 'bold',
  },
  comparisonContainer: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  comparisonItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  correctWord: {
    color: colors.status.success,
    fontWeight: '600',
  },
  detectedWord: {
    color: colors.gold.main,
    fontWeight: '600',
  },
  confidenceContainer: {
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  confidenceBar: {
    height: spacing[2],
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  confidenceText: {
    color: colors.semantic.text.secondary,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.semantic.border.light,
    marginVertical: spacing[4],
  },
  descriptionSection: {
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  descriptionItem: {
    gap: spacing[2],
  },
  tajweedSection: {
    backgroundColor: colors.semantic.background.tertiary,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[4],
    gap: spacing[2],
  },
  actionButtons: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    gap: spacing[3],
  },
  button: {
    flex: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent.main,
  },
  secondaryButton: {
    backgroundColor: colors.semantic.background.tertiary,
    borderWidth: 1,
    borderColor: colors.semantic.border.main,
  },
  buttonText: {
    ...typography.styles.button,
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
  expandIndicator: {
    marginTop: spacing[2],
    alignItems: 'center',
  },
});

export default FindingCard;
