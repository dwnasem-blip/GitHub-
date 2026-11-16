import { supabase } from '@/config/supabase';
import { User, Profile } from '@/types/index';

export interface AuthService {
  signUp(email: string, password: string, fullName: string): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<Profile>): Promise<Profile>;
  updatePassword(newPassword: string): Promise<void>;
  confirmPasswordReset(token: string, newPassword: string): Promise<void>;
  resendVerificationEmail(email: string): Promise<void>;
}

class AuthServiceImpl implements AuthService {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName: string): Promise<User> {
    try {
      // Validate inputs
      this.validateEmail(email);
      this.validatePassword(password);
      this.validateFullName(fullName);

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            language: 'ar',
          },
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to sign up');
      }

      if (!data.user) {
        throw new Error('Sign up failed: No user returned');
      }

      // Create user profile
      const profile = await this.createUserProfile(data.user.id, fullName, 'ar');

      return {
        id: data.user.id,
        email: data.user.email || '',
        full_name: fullName,
        language: 'ar',
        created_at: data.user.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Validate inputs
      this.validateEmail(email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Failed to login');
      }

      if (!data.user) {
        throw new Error('Login failed: No user returned');
      }

      // Fetch full user profile
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('Failed to fetch user profile after login');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message || 'Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<void> {
    try {
      this.validateEmail(email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return null;
      }

      // Fetch user profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      return {
        id: authUser.id,
        email: authUser.email || '',
        full_name: profile?.full_name || authUser.user_metadata?.full_name || '',
        avatar_url: profile?.avatar_url,
        language: profile?.language || authUser.user_metadata?.language || 'ar',
        created_at: authUser.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error('No authenticated user');
      }

      const updateData = {
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        bio: data.bio,
        language: data.language,
      };

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', authUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!updatedProfile) {
        throw new Error('Failed to update profile');
      }

      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Update password for authenticated user
   */
  async updatePassword(newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);

      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (error) {
        throw new Error(error.message || 'Invalid or expired reset token');
      }

      // Update password after verification
      await this.updatePassword(newPassword);
    } catch (error) {
      console.error('Confirm password reset error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    try {
      this.validateEmail(email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw new Error(error.message || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification email error:', error);
      throw error;
    }
  }

  /**
   * Validation methods
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Invalid email address');
    }
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
  }

  private validateFullName(fullName: string): void {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }

    if (fullName.length > 100) {
      throw new Error('Full name must not exceed 100 characters');
    }
  }

  /**
   * Create user profile in database
   */
  private async createUserProfile(
    userId: string,
    fullName: string,
    language: 'ar' | 'en'
  ): Promise<void> {
    try {
      const { error } = await supabase.from('profiles').insert({
        user_id: userId,
        full_name: fullName,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating user profile:', error);
        // Don't throw here - profile can be created later
      }
    } catch (error) {
      console.error('Create user profile error:', error);
      // Don't throw - proceed anyway
    }
  }

  /**
   * Calculate password strength (1-4)
   */
  static calculatePasswordStrength(password: string): number {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety check
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasUppercase && hasLowercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;

    return Math.min(strength, 4);
  }
}

export const authService = new AuthServiceImpl();
