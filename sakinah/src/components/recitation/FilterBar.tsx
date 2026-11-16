import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  I18nManager,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing, radius, shadows } from '@/theme/spacing';
import Text from '@/components/typography/Text';
import { FindingType, Severity, SortOption } from '@/types';

interface FilterBarProps {
  activeType: FindingType;
  activeSeverity: Severity | null;
  sortBy: SortOption;
  onTypeChange: (type: FindingType) => void;
  onSeverityChange: (severity: Severity | null) => void;
  onSortChange: (option: SortOption) => void;
  onSearch: (query: string) => void;
  findingsCount?: number;
}

const FINDING_TYPES: FindingType[] = [
  'All',
  'Makhraj',
  'Tajweed',
  'Timing',
  'Pronunciation',
];

const SEVERITIES: (Severity | null)[] = [null, 'Error', 'Probable', 'Inconclusive'];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'By Timestamp', value: 'timestamp' },
  { label: 'By Severity', value: 'severity' },
  { label: 'By Confidence', value: 'confidence' },
  { label: 'By Type', value: 'type' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeType,
  activeSeverity,
  sortBy,
  onTypeChange,
  onSeverityChange,
  onSortChange,
  onSearch,
  findingsCount = 0,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);

  const getSeverityLabel = (severity: Severity | null): string => {
    if (!severity) return 'All Severities';
    switch (severity) {
      case 'Error':
        return '🔴 Errors';
      case 'Probable':
        return '🟡 Probable';
      case 'Inconclusive':
        return '⚪ Inconclusive';
      default:
        return 'All';
    }
  };

  const getSeverityColor = (
    severity: Severity | null,
    isActive: boolean
  ): string => {
    if (!isActive) return colors.semantic.background.tertiary;

    switch (severity) {
      case 'Error':
        return colors.gold.main;
      case 'Probable':
        return colors.status.warning;
      case 'Inconclusive':
        return colors.neutral[600];
      default:
        return colors.accent.main;
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      {/* Type Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
        scrollEnabled
      >
        {FINDING_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => onTypeChange(type)}
            style={[
              styles.chip,
              activeType === type && styles.chipActive,
              activeType === type && {
                backgroundColor: colors.accent.main,
              },
            ]}
          >
            <Text
              style={[
                typography.styles.caption,
                {
                  color:
                    activeType === type
                      ? colors.semantic.text.primary
                      : colors.semantic.text.secondary,
                  fontWeight: activeType === type ? '600' : '400',
                },
              ]}
            >
              {type}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter Controls Row */}
      <View
        style={[
          styles.controlsRow,
          { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        {/* Severity Dropdown */}
        <View style={styles.filterButton}>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: colors.semantic.background.tertiary,
              },
            ]}
            onPress={() => {
              // Show severity modal/dropdown
            }}
          >
            <Text
              style={[
                typography.styles.caption,
                { color: colors.semantic.text.secondary },
              ]}
              numberOfLines={1}
            >
              {getSeverityLabel(activeSeverity)}
            </Text>
            <Text style={{ color: colors.semantic.text.secondary }}>⚙</Text>
          </Pressable>

          {/* Severity Options */}
          <View style={styles.dropdownContent}>
            {SEVERITIES.map((severity) => (
              <Pressable
                key={severity || 'all'}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      severity === activeSeverity
                        ? 'rgba(45, 139, 86, 0.2)'
                        : 'transparent',
                  },
                ]}
                onPress={() => onSeverityChange(severity)}
              >
                <Text
                  style={[
                    typography.styles.body2,
                    {
                      color:
                        severity === activeSeverity
                          ? colors.accent.main
                          : colors.semantic.text.secondary,
                      fontWeight: severity === activeSeverity ? '600' : '400',
                    },
                  ]}
                >
                  {getSeverityLabel(severity)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sort Dropdown */}
        <Pressable
          style={[
            styles.button,
            {
              backgroundColor: colors.semantic.background.tertiary,
            },
          ]}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <Text
            style={[
              typography.styles.caption,
              { color: colors.semantic.text.secondary },
            ]}
          >
            {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Sort'}
          </Text>
          <Text style={{ color: colors.semantic.text.secondary }}>⬇</Text>
        </Pressable>
      </View>

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text
          style={[
            typography.styles.caption,
            { color: colors.semantic.text.tertiary },
          ]}
        >
          {findingsCount} {findingsCount === 1 ? 'finding' : 'findings'} found
        </Text>
      </View>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <Text
              style={[
                typography.styles.h6,
                { color: colors.semantic.text.primary, marginBottom: spacing[3] },
              ]}
            >
              Sort by
            </Text>

            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  sortBy === option.value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onSortChange(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    typography.styles.body2,
                    {
                      color:
                        sortBy === option.value
                          ? colors.accent.main
                          : colors.semantic.text.primary,
                      fontWeight: sortBy === option.value ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && (
                  <Text style={{ color: colors.accent.main }}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  chipContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: spacing[2],
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.semantic.background.tertiary,
    borderWidth: 1,
    borderColor: colors.semantic.border.light,
  },
  chipActive: {
    borderColor: colors.accent.main,
  },
  controlsRow: {
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  filterButton: {
    flex: 1,
    position: 'relative',
  },
  button: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: spacing[10],
  },
  dropdownContent: {
    position: 'absolute',
    top: spacing[12],
    left: 0,
    right: 0,
    backgroundColor: colors.semantic.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.border.light,
    overflow: 'hidden',
    zIndex: 1000,
    ...shadows.lg,
  },
  option: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.border.light,
  },
  resultsRow: {
    paddingHorizontal: spacing[2],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.semantic.background.secondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[8],
  },
  modalOption: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.semantic.border.light,
  },
  modalOptionActive: {
    backgroundColor: colors.semantic.background.tertiary,
  },
});

export default FilterBar;
