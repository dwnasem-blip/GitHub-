import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useProjects } from '@/hooks/useProjects';
import { useAppStore } from '@/store/appStore';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';

export const ProjectsListScreen = () => {
  const { t } = useTranslation();
  const {
    projects,
    isLoading,
    error,
    deleteProject,
    refreshProjects,
  } = useProjects();
  const { isRTL } = useAppStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  I18nManager.forceRTL(isRTL);

  const handleCreateProject = useCallback(() => {
    router.push('/projects/new');
  }, []);

  const handleProjectPress = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, []);

  const handleDeleteProject = useCallback(
    (projectId: string, projectTitle: string) => {
      Alert.alert(
        t('projects.deleteConfirm'),
        `${t('projects.deleteMsg')} "${projectTitle}"?`,
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                setDeleting(projectId);
                await deleteProject(projectId);
              } catch (err) {
                Alert.alert(t('common.error'), t('projects.deleteError'));
              } finally {
                setDeleting(null);
              }
            },
          },
        ]
      );
    },
    [deleteProject, t]
  );

  const handleEditProject = useCallback((projectId: string) => {
    router.push(`/projects/${projectId}`);
  }, []);

  if (isLoading && projects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
          <ThemedText style={styles.headerTitle}>{t('projects.title')}</ThemedText>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProject}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.createButtonText}>
              {t('projects.create')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshProjects}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.refreshButtonText}>
            {t('common.refresh')}
          </ThemedText>
        </TouchableOpacity>

        {/* Projects List */}
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
              <View key={project.id} style={styles.projectItem}>
                <TouchableOpacity
                  style={styles.projectCardContainer}
                  onPress={() => handleProjectPress(project.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.projectCard}>
                    <View style={styles.projectCardHeader}>
                      <ThemedText style={styles.projectTitle} numberOfLines={1}>
                        {project.title}
                      </ThemedText>
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
                    </View>

                    <ThemedText style={styles.projectDescription} numberOfLines={2}>
                      {project.description || t('projects.noDescription')}
                    </ThemedText>

                    <View style={[styles.projectFooter, isRTL && styles.projectFooterRTL]}>
                      <ThemedText style={styles.dateText}>
                        {new Date(project.created_at).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Action Buttons */}
                <View style={[styles.actionButtons, isRTL && styles.actionButtonsRTL]}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditProject(project.id)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {t('projects.edit')}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteProject(project.id, project.title)}
                    disabled={deleting === project.id}
                    activeOpacity={0.7}
                  >
                    {deleting === project.id ? (
                      <ActivityIndicator size="small" color="#ff3b30" />
                    ) : (
                      <ThemedText style={styles.deleteButtonText}>
                        {t('projects.delete')}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 16,
    marginTop: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
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
  refreshButton: {
    backgroundColor: '#5856d6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  projectsList: {
    gap: 12,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectCardContainer: {
    marginBottom: 8,
  },
  projectCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
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
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  projectDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  projectFooterRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonsRTL: {
    flexDirection: 'row-reverse',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
