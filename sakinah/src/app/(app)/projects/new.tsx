import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  I18nManager,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useProjects } from '@/hooks/useProjects';
import { useAppStore } from '@/store/appStore';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';

export default function NewProjectScreen() {
  const { t } = useTranslation();
  const { createProject, isLoading, error, clearError } = useProjects();
  const { isRTL } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  I18nManager.forceRTL(isRTL);

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      return;
    }

    try {
      setIsSaving(true);
      clearError();
      const project = await createProject({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.title.trim().length > 0;

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
          <ThemedText style={styles.headerTitle}>{t('projects.create')}</ThemedText>
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
          {/* Form */}
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>{t('projects.title')}</ThemedText>
              <TextInput
                style={[styles.input, isRTL && styles.inputRTL]}
                placeholder={t('projects.titlePlaceholder')}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholderTextColor="#999"
                editable={!isSaving}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>{t('projects.description')}</ThemedText>
              <TextInput
                style={[styles.descriptionInput, isRTL && styles.inputRTL]}
                placeholder={t('projects.descriptionPlaceholder')}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                editable={!isSaving}
              />
            </View>

            {/* Info Text */}
            <View style={styles.infoBox}>
              <ThemedText style={styles.infoText}>
                {t('projects.createInfo')}
              </ThemedText>
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.createButton, !isFormValid && styles.disabledButton]}
                onPress={handleCreate}
                disabled={!isFormValid || isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.buttonText}>{t('projects.create')}</ThemedText>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.buttonText}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    gap: 12,
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
  form: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 20,
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
    minHeight: 120,
  },
  infoBox: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#34c759',
  },
  cancelButton: {
    backgroundColor: '#5856d6',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
