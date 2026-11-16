import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, FlatList } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
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

const TYPES: FindingType[] = ['All', 'Makhraj', 'Tajweed', 'Timing', 'Pronunciation'];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeType,
  sortBy,
  onTypeChange,
  onSortChange,
  findingsCount = 0,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={TYPES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onTypeChange(item)}
            style={[
              styles.chip,
              activeType === item && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                activeType === item && styles.chipActiveText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.chipContainer}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.results}>
        <Text style={styles.resultsText}>
          {findingsCount} findings found
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[6],
  },
  chipContainer: {
    gap: spacing[2],
    paddingHorizontal: spacing[2],
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
    backgroundColor: colors.accent.main,
    borderColor: colors.accent.main,
  },
  chipText: {
    fontSize: 12,
    color: colors.semantic.text.secondary,
  },
  chipActiveText: {
    color: colors.semantic.text.primary,
    fontWeight: '600',
  },
  results: {
    paddingHorizontal: spacing[2],
  },
  resultsText: {
    fontSize: 12,
    color: colors.semantic.text.tertiary,
  },
});

export default FilterBar;
