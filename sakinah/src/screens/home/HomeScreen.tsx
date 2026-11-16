import React, { useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useProjects } from '@/hooks/useProjects';
import { useAppStore } from '@/store/appStore';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const HomeScreen = () => {
  const { t } = useTranslation();
  const { projects, isLoading, error } = useProjects();
  const { isRTL } = useAppStore();

  const handleCreateProject = useCallback(() => {
    router.push('/projects/new');
  }, []);

  const handleProjectPress = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, []);

  I18nManager.forceRTL(isRTL);

  if (isLoading && projects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>
          {t('common.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <ThemedText style={styles.welcomeText}>
            {t('home.welcome')}
          </ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProject}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.createButtonText}>
              {t('home.createNew')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Projects List */}
        <View style={styles.projectsSection}>
          <ThemedText style={styles.sectionTitle}>
            {t('home.recentProjects')}
          </ThemedText>

          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                {t('home.noProjects')}
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                {t('home.startCreating')}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.projectsList}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => handleProjectPress(project.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.projectCardContent}>
                    <ThemedText style={styles.projectTitle} numberOfLines={1}>
                      {project.title}
                    </ThemedText>
                    <ThemedText style={styles.projectDescription} numberOfLines={2}>
                      {project.description || t('projects.noDescription')}
                    </ThemedText>
                    <View style={[styles.projectMeta, isRTL && styles.projectMetaRTL]}>
                      <View
                        style={[
                          styles.statusBadge,
                          styles[`status${project.status as 'draft' | 'processing' | 'completed' | 'failed'}`],
                        ]}
                      >
                        <ThemedText style={styles.statusText}>
                          {t(`projects.${project.status}`)}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.dateText}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  projectsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  projectCardContent: {
    gap: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  projectDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  projectMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  projectMetaRTL: {
    flexDirection: 'row-reverse',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusdraft: {
    backgroundColor: '#5856d6',
  },
  statusprocessing: {
    backgroundColor: '#ff9500',
  },
  statuscompleted: {
    backgroundColor: '#34c759',
  },
  statusfailed: {
    backgroundColor: '#ff3b30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
});
