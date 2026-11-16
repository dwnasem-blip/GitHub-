import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useAppStore } from '@/store/appStore';
import ThemedText from '@/components/themed-text';
import ThemedView from '@/components/themed-view';
import { UpdateProfileInput } from '@/services/databaseService';

export const ProfileScreen = () => {
  const { t } = useTranslation();
  const { profile, isLoading, error, updateProfile, clearError } = useProfile();
  const { isRTL, language, setLanguage } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
  });

  I18nManager.forceRTL(isRTL);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio,
        language: language as 'ar' | 'en',
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, language, updateProfile]);

  const handleCancel = useCallback(() => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
    clearError();
  }, [profile, clearError]);

  const handleLanguageToggle = useCallback(() => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  if (isLoading) {
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
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>{t('profile.myProfile')}</ThemedText>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.editButtonText}>{t('common.edit')}</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <ThemedText style={styles.avatarText}>
                {profile?.full_name?.charAt(0).toUpperCase() || '?'}
              </ThemedText>
            </View>
          </View>

          {/* Profile Info */}
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>{t('auth.fullName')}</ThemedText>
                <TextInput
                  style={[styles.input, isRTL && styles.inputRTL]}
                  placeholder={t('auth.fullName')}
                  value={formData.full_name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, full_name: text })
                  }
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>{t('profile.bio')}</ThemedText>
                <TextInput
                  style={[styles.bioInput, isRTL && styles.inputRTL]}
                  placeholder={t('profile.bioPlaceholder')}
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bio: text })
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
                  activeOpacity={0.7}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <ThemedText style={styles.buttonText}>
                      {t('common.save')}
                    </ThemedText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    {t('common.cancel')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayInfo}>
              <ThemedText style={styles.displayName}>
                {profile?.full_name || t('profile.noName')}
              </ThemedText>
              <ThemedText style={styles.displayBio}>
                {profile?.bio || t('profile.noBio')}
              </ThemedText>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>{t('profile.email')}</ThemedText>
                  <ThemedText style={styles.infoValue}>{profile?.id}</ThemedText>
                </View>
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>{t('profile.language')}</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {language === 'ar' ? 'العربية' : 'English'}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <ThemedText style={styles.sectionTitle}>{t('settings.title')}</ThemedText>

          {/* Language Toggle */}
          <TouchableOpacity
            style={[styles.settingItem, isRTL && styles.settingItemRTL]}
            onPress={handleLanguageToggle}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.settingLabel}>{t('settings.language')}</ThemedText>
            <View style={styles.languageToggle}>
              <ThemedText style={styles.languageText}>
                {language === 'ar' ? 'عربي' : 'EN'}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <ThemedText style={styles.accountInfoTitle}>
            {t('profile.accountInfo')}
          </ThemedText>
          <ThemedText style={styles.accountInfoText}>
            {t('profile.joinedDate')}:{' '}
            {profile?.id
              ? new Date(profile.id).toLocaleDateString()
              : 'N/A'}
          </ThemedText>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButtonText: {
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
  profileCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  editForm: {
    width: '100%',
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
  bioInput: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    textAlignVertical: 'top',
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
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  displayInfo: {
    alignItems: 'center',
    gap: 12,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
  },
  displayBio: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  infoGrid: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  infoItem: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingItemRTL: {
    flexDirection: 'row-reverse',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageToggle: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountInfo: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  accountInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  accountInfoText: {
    fontSize: 13,
    opacity: 0.7,
  },
});
