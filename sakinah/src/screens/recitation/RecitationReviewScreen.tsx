import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  I18nManager,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius, shadows } from '@/theme/spacing';
import Text from '@/components/typography/Text';
import Heading from '@/components/typography/Heading';
import {
  AudioPlayerWithTimeline,
  FindingCard,
  FilterBar,
  ReportSummary,
  ReferenceAudioPlayer,
} from '@/components/recitation';
import {
  RecitationMatch,
  Finding,
  FilterOptions,
  RecitationReviewData,
} from '@/types';
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
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RecitationReviewData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [referenceAudioUrl, setReferenceAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'All',
    severity: null,
    sortBy: 'timestamp',
    searchQuery: '',
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch recitation review data
        const reviewData =
          await recitationService.getRecitationReviewData(recitationMatchId);
        setData(reviewData);

        // Fetch audio URL
        const url = await recitationService.getAudioUrl(audioFileId);
        setAudioUrl(url);

        // Fetch reference audio if available
        try {
          const refUrl = await recitationService.getReferenceAudioUrl(
            reviewData.recitationMatch.surah_number
          );
          setReferenceAudioUrl(refUrl);
        } catch (err) {
          // Reference audio optional, ignore error
          console.log('Reference audio not available');
        }

        setLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setLoading(false);
      }
    };

    if (recitationMatchId && audioFileId) {
      loadData();
    }
  }, [recitationMatchId, audioFileId]);

  // Filter findings
  const filteredFindings = useCallback((): Finding[] => {
    if (!data) return [];

    let results = [...data.findings];

    // Filter by type
    if (filters.type !== 'All') {
      results = results.filter((f) => f.error_type === filters.type);
    }

    // Filter by severity
    if (filters.severity) {
      results = results.filter((f) => f.severity === filters.severity);
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          f.arabic_word.includes(query) ||
          f.transliteration.toLowerCase().includes(query) ||
          f.description_en.toLowerCase().includes(query) ||
          f.description_ar.includes(query)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'severity':
        results.sort((a, b) => {
          const severityOrder = { Error: 0, Probable: 1, Inconclusive: 2 };
          return (
            (severityOrder[a.severity] || 999) -
            (severityOrder[b.severity] || 999)
          );
        });
        break;
      case 'confidence':
        results.sort((a, b) => b.confidence - a.confidence);
        break;
      case 'type':
        results.sort((a, b) => a.error_type.localeCompare(b.error_type));
        break;
      case 'timestamp':
      default:
        results.sort((a, b) => a.start_time - b.start_time);
        break;
    }

    return results;
  }, [data, filters]);

  const handleFilterChange = (key: keyof FilterOptions, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out my Quranic recitation analysis: ${data?.recitationMatch.surah_name_en} - Overall Accuracy: ${(data?.recitationMatch.overall_accuracy || 0 * 100).toFixed(1)}%`,
        title: 'My Recitation Analysis',
        url: audioUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [data, audioUrl]);

  const handleExport = useCallback(async () => {
    try {
      const json = await recitationService.exportReport(
        recitationMatchId,
        'json'
      );
      console.log('Export successful:', json);
      // In a real app, you'd save this to a file
    } catch (error) {
      console.error('Error exporting:', error);
    }
  }, [recitationMatchId]);

  const handlePlayOriginal = useCallback(() => {
    // This would trigger playing the user's audio at the finding time
    console.log('Playing original audio');
  }, []);

  const handlePlayReference = useCallback(() => {
    // This would trigger playing the reference audio at the finding time
    console.log('Playing reference audio');
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.main} />
        <Text
          style={[
            typography.styles.body2,
            { color: colors.semantic.text.secondary, marginTop: spacing[4] },
          ]}
        >
          Loading recitation analysis...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Heading level={3} style={{ color: colors.status.error }}>
          Error Loading Data
        </Heading>
        <Text
          style={[
            typography.styles.body2,
            { color: colors.semantic.text.secondary, marginTop: spacing[4] },
          ]}
        >
          {error || 'Failed to load recitation data'}
        </Text>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Go Back</Text>
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
            {/* Header */}
            <View
              style={[
                styles.header,
                {
                  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              {onBack && (
                <Pressable onPress={onBack} style={styles.backButton}>
                  <Text style={styles.backButtonText}>
                    {I18nManager.isRTL ? '→' : '←'}
                  </Text>
                </Pressable>
              )}
              <View style={styles.headerContent}>
                <Heading level={2}>
                  {data.recitationMatch.surah_name_en}
                </Heading>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.tertiary },
                  ]}
                >
                  Verse {data.verses[0]?.number || 1} - Analysis Review
                </Text>
              </View>
            </View>

            {/* Results Overview */}
            <View style={styles.overviewContainer}>
              <View style={styles.overviewCard}>
                <Text
                  style={[
                    typography.styles.h4,
                    { color: colors.accent.main },
                  ]}
                >
                  {(data.recitationMatch.overall_accuracy * 100).toFixed(1)}%
                </Text>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  Accuracy
                </Text>
              </View>

              <View style={styles.overviewCard}>
                <Text
                  style={[
                    typography.styles.h4,
                    { color: colors.semantic.text.primary },
                  ]}
                >
                  {data.recitationMatch.total_words}
                </Text>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  Words
                </Text>
              </View>

              <View style={styles.overviewCard}>
                <Text
                  style={[
                    typography.styles.h4,
                    { color: colors.gold.main },
                  ]}
                >
                  {data.findings.length}
                </Text>
                <Text
                  style={[
                    typography.styles.caption,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  Issues Found
                </Text>
              </View>
            </View>

            {/* Audio Player */}
            <AudioPlayerWithTimeline
              audioUrl={audioUrl}
              duration={data.verses.reduce((max, v) => Math.max(max, v.end_time), 0)}
              verses={data.verses}
              findings={data.findings}
              onPlayPause={setIsPlaying}
              onSeek={setCurrentTime}
              onMarkerPress={setSelectedFinding}
            />

            {/* Reference Audio Comparison */}
            {referenceAudioUrl && (
              <ReferenceAudioPlayer
                referenceAudioUrl={referenceAudioUrl}
                userAudioUrl={audioUrl}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                verse={data.verses[0]}
              />
            )}

            {/* Filter Bar */}
            <FilterBar
              activeType={filters.type}
              activeSeverity={filters.severity}
              sortBy={filters.sortBy}
              onTypeChange={(type) => handleFilterChange('type', type)}
              onSeverityChange={(severity) =>
                handleFilterChange('severity', severity)
              }
              onSortChange={(sort) => handleFilterChange('sortBy', sort)}
              onSearch={(query) => handleFilterChange('searchQuery', query)}
              findingsCount={findings.length}
            />

            {/* No Results */}
            {findings.length === 0 && (
              <View style={styles.emptyState}>
                <Text
                  style={[
                    typography.styles.h6,
                    { color: colors.semantic.text.secondary },
                  ]}
                >
                  No findings match your filters
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <FindingCard
            finding={item}
            isSelected={selectedFinding?.id === item.id}
            index={index}
            onPress={() => setSelectedFinding(item)}
            onPlayOriginal={handlePlayOriginal}
            onPlayReference={handlePlayReference}
          />
        )}
        ListFooterComponent={
          <ReportSummary
            recitationData={data.recitationMatch}
            findings={data.findings}
            onShare={handleShare}
            onExport={handleExport}
          />
        }
        scrollEnabled
        nestedScrollEnabled
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingHorizontal: spacing[4],
    backgroundColor: colors.semantic.background.primary,
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    alignItems: 'center',
    gap: spacing[3],
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    width: spacing[10],
    height: spacing[10],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.md,
  },
  backButtonText: {
    ...typography.styles.h4,
    color: colors.semantic.text.primary,
  },
  overviewContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: spacing[4],
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    ...shadows.md,
  },
  emptyState: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[6],
  },
});

export default RecitationReviewScreen;
