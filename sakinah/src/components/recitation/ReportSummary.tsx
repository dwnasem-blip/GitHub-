import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
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

  const errorCount = findings.filter((f) => f.severity === 'Error').length;
  const probableCount = findings.filter((f) => f.severity === 'Probable').length;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.header}>
        <Text style={styles.title}>Final Report</Text>
        <Text style={styles.arrow}>{expanded ? '▼' : '▶'}</Text>
      </Pressable>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.accuracyCard}>
            <Text style={styles.accuracyValue}>
              {(recitationData.overall_accuracy * 100).toFixed(1)}%
            </Text>
            <Text style={styles.accuracyLabel}>Accuracy</Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{recitationData.total_words}</Text>
              <Text style={styles.metricLabel}>Total Words</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{recitationData.correct_words}</Text>
              <Text style={styles.metricLabel}>Correct</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, { color: colors.gold.main }]}>
                {errorCount}
              </Text>
              <Text style={styles.metricLabel}>Errors</Text>
            </View>
          </View>

          <View style={styles.severityBreakdown}>
            <Text style={styles.sectionTitle}>Findings Breakdown</Text>
            <View style={styles.severityItem}>
              <View style={[styles.dot, { backgroundColor: colors.gold.main }]} />
              <Text style={styles.severityText}>Errors: {errorCount}</Text>
            </View>
            <View style={styles.severityItem}>
              <View style={[styles.dot, { backgroundColor: colors.status.warning }]} />
              <Text style={styles.severityText}>Probable: {probableCount}</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            {onShare && (
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onShare}>
                <Text style={styles.btnText}>📤 Share</Text>
              </Pressable>
            )}
            {onExport && (
              <Pressable style={[styles.btn, styles.btnSecondary]} onPress={onExport}>
                <Text style={styles.btnText}>💾 Export</Text>
              </Pressable>
            )}
          </View>
        </View>
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
    marginTop: spacing[6],
    marginBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.semantic.text.primary,
  },
  arrow: {
    color: colors.semantic.text.secondary,
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    gap: spacing[4],
  },
  accuracyCard: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.lg,
    padding: spacing[4],
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.accent.main,
  },
  accuracyLabel: {
    color: colors.semantic.text.secondary,
    marginTop: spacing[2],
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  metric: {
    flex: 1,
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    padding: spacing[3],
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.semantic.text.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.semantic.text.secondary,
    marginTop: spacing[1],
  },
  severityBreakdown: {
    backgroundColor: colors.semantic.background.tertiary,
    borderRadius: radius.md,
    padding: spacing[3],
    gap: spacing[2],
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.semantic.text.primary,
    marginBottom: spacing[2],
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: spacing[3],
    height: spacing[3],
    borderRadius: radius.full,
  },
  severityText: {
    color: colors.semantic.text.secondary,
    fontSize: 13,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  btn: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.accent.main,
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

export default ReportSummary;
