import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  I18nManager,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import { useProjects } from '@/hooks/useProjects';
import { useAppStore } from '@/store/appStore';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';

export default function ProjectDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProject, updateProject, isLoading, error, clearError } = useProjects();
  const { isRTL } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  I18nManager.forceRTL(isRTL);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    if (!id) return;
    try {
      const data = await getProject(id);
      setProject(data);
      setFormData({
        title: data.title,
        description: data.description || '',
      });
    } catch (err) {
      console.error('Error loading project:', err);
    }
  };

  const handleSave = async () => {
    if (!id || !project) return;
    try {
      setIsSaving(true);
      await updateProject(id, {
        title: formData.title,
        description: formData.description,
      });
      setIsEditing(false);
      await loadProject();
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: project?.title || '',
      description: project?.description || '',
    });
    setIsEditing(false);
  };

  if (isLoading || !project) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backButton}>←</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>{t('projects.title')}</ThemedText>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <ThemedText style={styles.editButton}>{t('common.edit')}</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Content */}
          <View style={styles.content}>
            {isEditing ? (
              <View style={styles.editForm}>
                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>{t('projects.title')}</ThemedText>
                  <TextInput
                    style={[styles.input, isRTL && styles.inputRTL]}
                    placeholder={t('projects.title')}
                    value={formData.title}
                    onChangeText={(text) =>
                      setFormData({ ...formData, title: text })
                    }
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.formGroup}>
                  <ThemedText style={styles.label}>{t('projects.description')}</ThemedText>
                  <TextInput
                    style={[styles.descriptionInput, isRTL && styles.inputRTL]}
                    placeholder={t('projects.description')}
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData({ ...formData, description: text })
                    }
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <ThemedText style={styles.buttonText}>{t('common.save')}</ThemedText>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={isSaving}
                  >
                    <ThemedText style={styles.buttonText}>{t('common.cancel')}</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.displayInfo}>
                <View style={styles.infoCard}>
                  <ThemedText style={styles.infoLabel}>{t('projects.title')}</ThemedText>
                  <ThemedText style={styles.infoValue}>{project.title}</ThemedText>
                </View>

                <View style={styles.infoCard}>
                  <ThemedText style={styles.infoLabel}>
                    {t('projects.description')}
                  </ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {project.description || t('projects.noDescription')}
                  </ThemedText>
                </View>

                <View style={styles.infoCard}>
                  <ThemedText style={styles.infoLabel}>{t('projects.status')}</ThemedText>
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

                <View style={styles.infoCard}>
                  <ThemedText style={styles.infoLabel}>{t('projects.created')}</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </ThemedText>
                </View>

                <View style={styles.infoCard}>
                  <ThemedText style={styles.infoLabel}>{t('projects.updated')}</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {new Date(project.updated_at).toLocaleDateString()}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    color: '#007AFF',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#ff3b30',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
  },
  inputRTL: {
    textAlign: 'right',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#34c759',
  },
  cancelButton: {
    backgroundColor: '#5856d6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  displayInfo: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
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
});
