import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  I18nManager,
  Share,
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
import { RecitationMatch, Finding } from '@/types';

interface ReportSummaryProps {
  recitationData: RecitationMatch;
  findings: Finding[];
  onShare?: () => void;
  onExport?: () => void;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({
  recitationData,
  findings,
  onShare,
  onExport,
}) => {
  const [expanded, setExpanded] = useState(false);
  const expandAnimation = useSharedValue(0);

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    expandAnimation.value = withTiming(newExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  };

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: expandAnimation.value === 0 ? 200 : 2000,
    opacity: 0.8 + expandAnimation.value * 0.2,
  }));

  // Calculate statistics
  const errorCount = findings.filter((f) => f.severity === 'Error').length;
  const probableCount = findings.filter((f) => f.severity === 'Probable').length;
  const inconclusiveCount = findings.filter(
    (f) => f.severity === 'Inconclusive'
  ).length;

  const errorTypeBreakdown = findings.reduce(
    (acc, finding) => {
      const type = finding.error_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topErrors = Object.entries(errorTypeBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const getAccuracyLevel = (accuracy: number): string => {
    if (accuracy >= 95) return 'Excellent';
    if (accuracy >= 85) return 'Good';
    if (accuracy >= 75) return 'Fair';
    return 'Needs Practice';
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 95) return colors.status.success;
    if (accuracy >= 85) return colors.accent.main;
    if (accuracy >= 75) return colors.status.warning;
    return colors.status.error;
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <Pressable
        onPress={toggleExpand}
        style={[styles.header, { justifyContent: I18nManager.isRTL ? 'flex-end' : 'flex-start' }]}
      >
        <View style={styles.headerContent}>
          <Text style={[typography.styles.h4, styles.title]}>Final Report</Text>
          <Text
            style={[
              typography.styles.caption,
              { color: colors.semantic.text.tertiary },
            ]}
          >
            {expanded ? 'Tap to collapse' : 'Tap to view details'}
          </Text>
        </View>
        <Text
          style={[
            typography.styles.h4,
            { color: colors.semantic.text.secondary },
          ]}
        >
          {expanded ? '▼' : '▶'}
        </Text>
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <Animated.View style={[styles.content, expandedStyle]}>
          {/* Overall Accuracy Card */}
          <View style={styles.accuracyCard}>
            <View
              style={[
                styles.accuracyCircle,
                {
                  backgroundColor: getAccuracyColor(
                    recitationData.overall_accuracy * 100
                  ),
                },
              ]}
            >
              <Text style={styles.accuracyValue}>
                {(recitationData.overall_accuracy * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.accuracyInfo}>
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                Overall Accuracy
              </Text>
              <Text
                style={[
                  typography.styles.h6,
                  {
                    color: getAccuracyColor(recitationData.overall_accuracy * 100),
                  },
                ]}
              >
                {getAccuracyLevel(recitationData.overall_accuracy * 100)}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <View
            style={[
              styles.metricsGrid,
              { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            <View style={styles.metricCard}>
              <Text
                style={[
                  typography.styles.h3,
                  { color: colors.accent.main },
                ]}
              >
                {recitationData.total_words}
              </Text>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                Total Words
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text
                style={[
                  typography.styles.h3,
                  { color: colors.status.success },
                ]}
              >
                {recitationData.correct_words}
              </Text>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                Correct
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text
                style={[
                  typography.styles.h3,
                  { color: colors.gold.main },
                ]}
              >
                {recitationData.total_words - recitationData.correct_words}
              </Text>
              <Text
                style={[
                  typography.styles.caption,
                  { color: colors.semantic.text.secondary },
                ]}
              >
                Issues
              </Text>
            </View>
          </View>

          {/* Finding Severity Breakdown */}
          <View style={styles.severitySection}>
            <Text
              style={[
                typography.styles.h6,
                { color: colors.semantic.text.primary, marginBottom: spacing[3] },
              ]}
            >
              Findings by Severity
            </Text>

            <View style={styles.severityItem}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: colors.gold.main },
                ]}
              />
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                  { flex: 1 },
                ]}
              >
                Errors
              </Text>
              <Text
                style={[
                  typography.styles.h6,
                  { color: colors.gold.main },
                ]}
              >
                {errorCount}
              </Text>
            </View>

            <View style={styles.severityItem}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: colors.status.warning },
                ]}
              />
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                  { flex: 1 },
                ]}
              >
                Probable Issues
              </Text>
              <Text
                style={[
                  typography.styles.h6,
                  { color: colors.status.warning },
                ]}
              >
                {probableCount}
              </Text>
            </View>

            <View style={styles.severityItem}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: colors.neutral[600] },
                ]}
              />
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                  { flex: 1 },
                ]}
              >
                Inconclusive
              </Text>
              <Text
                style={[
                  typography.styles.h6,
                  { color: colors.neutral[600] },
                ]}
              >
                {inconclusiveCount}
              </Text>
            </View>
          </View>

          {/* Top Issues */}
          {topErrors.length > 0 && (
            <View style={styles.issuesSection}>
              <Text
                style={[
                  typography.styles.h6,
                  { color: colors.semantic.text.primary, marginBottom: spacing[3] },
                ]}
              >
                Most Common Issues
              </Text>

              {topErrors.map(([errorType, count], index) => (
                <View key={index} style={styles.issueItem}>
                  <Text
                    style={[
                      typography.styles.body2,
                      { color: colors.semantic.text.secondary },
                    ]}
                  >
                    {index + 1}. {errorType}
                  </Text>
                  <View style={styles.issueCount}>
                    <Text
                      style={[
                        typography.styles.caption,
                        { color: colors.accent.light },
                      ]}
                    >
                      {count} {count === 1 ? 'finding' : 'findings'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.recommendationsSection}>
            <Text
              style={[
                typography.styles.h6,
                { color: colors.semantic.text.primary, marginBottom: spacing[3] },
              ]}
            >
              Recommendations
            </Text>

            <View style={styles.recommendation}>
              <Text style={{ color: colors.accent.main }}>💡</Text>
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                  { flex: 1 },
                ]}
              >
                Focus on the most common issues first for maximum improvement
              </Text>
            </View>

            {errorCount > 0 && (
              <View style={styles.recommendation}>
                <Text style={{ color: colors.gold.main }}>⚠</Text>
                <Text
                  style={[
                    typography.styles.body2,
                    { color: colors.semantic.text.secondary },
                    { flex: 1 },
                  ]}
                >
                  {errorCount} critical errors found. Practice the corrected
                  pronunciation
                </Text>
              </View>
            )}

            <View style={styles.recommendation}>
              <Text style={{ color: colors.status.success }}>✓</Text>
              <Text
                style={[
                  typography.styles.body2,
                  { color: colors.semantic.text.secondary },
                  { flex: 1 },
                ]}
              >
                Your Tajweed is improving! Keep practicing
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View
            style={[
              styles.actionButtons,
              { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
            ]}
          >
            {onShare && (
              <Pressable style={[styles.button, styles.shareButton]} onPress={onShare}>
                <Text style={[typography.styles.button, styles.buttonText]}>
                  📤 Share
                </Text>
              </Pressable>
            )}
            {onExport && (
              <Pressable style={[styles.button, styles.exportButton]} onPress={onExport}>
                <Text style={[typography.styles.button, styles.buttonText]}>
                  💾 Export
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.semantic.border.light,
    overflow: 'hidden',
    marginTop: spacing[6],
    marginBottom: spacing[6],
    ...shadows.md,
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: colors.semantic.text.primary,
    marginBottom: spacing[1],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[4],
  },
  accuracyCard: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[4],
  },
  accuracyCircle: {
    width: spacing[14],
    height: spacing[14],
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyValue: {
    ...typography.styles.h2,
    color: colors.semantic.text.primary,
    fontWeight: 'bold',
  },
  accuracyInfo: {
    flex: 1,
  },
  metricsGrid: {
    gap: spacing[3],
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  severitySection: {
    gap: spacing[2],
  },
  severityItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    gap: spacing[2],
  },
  severityDot: {
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
  },
  issuesSection: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  issueItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[2],
  },
  issueCount: {
    backgroundColor: colors.semantic.background.secondary,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.md,
  },
  recommendationsSection: {
    gap: spacing[2],
  },
  recommendation: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.main,
  },
  actionButtons: {
    gap: spacing[3],
  },
  button: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: colors.accent.main,
  },
  exportButton: {
    backgroundColor: colors.semantic.background.tertiary,
    borderWidth: 1,
    borderColor: colors.semantic.border.main,
  },
  buttonText: {
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
});

export default ReportSummary;
