import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import {
  AudioPlayerWithTimeline,
  FindingCard,
  FilterBar,
  ReportSummary,
  ReferenceAudioPlayer,
} from '@/components/recitation';
import { RecitationMatch, Finding, FilterOptions } from '@/types';
import { recitationService } from '@/services/recitationService';

interface RecitationReviewScreenProps {
  projectId: string;
  audioFileId: string;
  recitationMatchId: string;
  onBack?: () => void;
}

export const RecitationReviewScreen: React.FC<RecitationReviewScreenProps> = ({
  projectId,
  audioFileId,
  recitationMatchId,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ recitationMatch: RecitationMatch; findings: Finding[] } | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'All',
    severity: null,
    sortBy: 'timestamp',
    searchQuery: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const reviewData = await recitationService.getRecitationReviewData(recitationMatchId);
        setData({
          recitationMatch: reviewData.recitationMatch,
          findings: reviewData.findings,
        });
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [recitationMatchId]);

  const filteredFindings = useCallback(() => {
    if (!data) return [];
    let results = [...data.findings];
    
    if (filters.type !== 'All') {
      results = results.filter((f) => f.error_type === filters.type);
    }
    if (filters.severity) {
      results = results.filter((f) => f.severity === filters.severity);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          f.arabic_word.includes(q) ||
          f.transliteration.toLowerCase().includes(q)
      );
    }
    
    return results.sort((a, b) =>
      filters.sortBy === 'timestamp'
        ? a.start_time - b.start_time
        : filters.sortBy === 'confidence'
        ? b.confidence - a.confidence
        : 0
    );
  }, [data, filters]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.main} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading data</Text>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  const findings = filteredFindings();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={findings}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {onBack && (
                <Pressable onPress={onBack} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>←</Text>
                </Pressable>
              )}
              <View style={styles.headerContent}>
                <Text style={styles.title}>{data.recitationMatch.surah_name_en}</Text>
                <Text style={styles.subtitle}>Recitation Analysis</Text>
              </View>
            </View>

            <View style={styles.overview}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>
                  {(data.recitationMatch.overall_accuracy * 100).toFixed(1)}%
                </Text>
                <Text style={styles.overviewLabel}>Accuracy</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>{data.recitationMatch.total_words}</Text>
                <Text style={styles.overviewLabel}>Words</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewValue}>{findings.length}</Text>
                <Text style={styles.overviewLabel}>Issues</Text>
              </View>
            </View>

            <AudioPlayerWithTimeline
              audioUrl=""
              duration={120}
              verses={[]}
              findings={findings}
              onPlayPause={() => {}}
              onSeek={() => {}}
              onMarkerPress={() => {}}
            />

            <FilterBar
              activeType={filters.type}
              activeSeverity={filters.severity}
              sortBy={filters.sortBy}
              onTypeChange={(type) => setFilters({ ...filters, type })}
              onSeverityChange={(severity) => setFilters({ ...filters, severity })}
              onSortChange={(sort) => setFilters({ ...filters, sortBy: sort })}
              onSearch={(query) => setFilters({ ...filters, searchQuery: query })}
              findingsCount={findings.length}
            />

            {findings.length === 0 && (
              <Text style={styles.noResults}>No findings match filters</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <FindingCard
            finding={item}
            isSelected={false}
            onPress={() => {}}
            onPlayOriginal={() => {}}
            onPlayReference={() => {}}
          />
        )}
        ListFooterComponent={
          <ReportSummary
            recitationData={data.recitationMatch}
            findings={data.findings}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.primary,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
  },
  backBtn: {
    width: spacing[10],
    height: spacing[10],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.md,
  },
  backBtnText: {
    fontSize: 18,
    color: colors.semantic.text.primary,
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    marginTop: spacing[4],
    padding: spacing[3],
  },
  backButtonText: {
    color: colors.accent.main,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.semantic.text.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.semantic.text.tertiary,
    marginTop: spacing[1],
  },
  overview: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    padding: spacing[3],
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent.main,
  },
  overviewLabel: {
    fontSize: 11,
    color: colors.semantic.text.secondary,
    marginTop: spacing[1],
  },
  noResults: {
    textAlign: 'center',
    color: colors.semantic.text.secondary,
    paddingVertical: spacing[6],
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

export default RecitationReviewScreen;
