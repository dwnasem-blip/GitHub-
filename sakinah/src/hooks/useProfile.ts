import { useCallback, useEffect, useState } from 'react';
import { Profile } from '@/types';
import { profileService } from '@/services/profileService';
import { UpdateProfileInput } from '@/services/databaseService';

interface UseProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileInput) => Promise<Profile>;
  uploadAvatar: (file: File) => Promise<string>;
  clearError: () => void;
}

/**
 * Custom hook for managing user profile
 * Provides profile operations and state management
 */
export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load profile on mount
  useEffect(() => {
    if (!isInitialized) {
      refreshProfile();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfileHandler = useCallback(
    async (data: UpdateProfileInput): Promise<Profile> => {
      try {
        setError(null);
        const updated = await profileService.updateProfile(data);
        setProfile(updated);
        return updated;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const uploadAvatarHandler = useCallback(async (file: File): Promise<string> => {
    try {
      setError(null);
      const avatarUrl = await profileService.uploadAvatar(file);
      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar_url: avatarUrl });
      }
      return avatarUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(errorMessage);
      throw err;
    }
  }, [profile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    isLoading,
    error,
    refreshProfile,
    updateProfile: updateProfileHandler,
    uploadAvatar: uploadAvatarHandler,
    clearError,
  };
};
