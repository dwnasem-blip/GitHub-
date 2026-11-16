import { supabase } from "@/config/supabase";
import { User, Profile } from "@/types/index";

export class AuthService {
  async signUp(email: string, password: string, fullName: string): Promise<User> {
    this.validateEmail(email);
    this.validatePassword(password);
    this.validateFullName(fullName);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, language: "ar" } },
    });

    if (error || !data.user) throw new Error(error?.message || "Sign up failed");
    await this.createUserProfile(data.user.id, fullName, "ar");
    
    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: fullName,
      language: "ar",
      created_at: data.user.created_at || new Date().toISOString(),
    };
  }

  async login(email: string, password: string): Promise<User> {
    this.validateEmail(email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message || "Login failed");
    const user = await this.getCurrentUser();
    if (!user) throw new Error("Failed to fetch user profile");
    return user;
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message || "Logout failed");
  }

  async resetPassword(email: string): Promise<void> {
    this.validateEmail(email);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`,
    });
    if (error) throw new Error(error.message || "Failed to send reset email");
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email || "",
      full_name: profile?.full_name || authUser.user_metadata?.full_name || "",
      avatar_url: profile?.avatar_url,
      language: profile?.language || "ar",
      created_at: authUser.created_at || new Date().toISOString(),
    };
  }

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("No authenticated user");

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", authUser.id)
      .select()
      .single();

    if (error || !updatedProfile) throw error || new Error("Failed to update profile");
    return updatedProfile;
  }

  async updatePassword(newPassword: string): Promise<void> {
    this.validatePassword(newPassword);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message || "Failed to update password");
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    this.validatePassword(newPassword);
    const { error } = await supabase.auth.verifyOtp({ token_hash: token, type: "recovery" });
    if (error) throw new Error(error.message || "Invalid or expired reset token");
    await this.updatePassword(newPassword);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    this.validateEmail(email);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) throw new Error(error.message || "Failed to resend verification email");
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) throw new Error("Invalid email address");
  }

  private validatePassword(password: string): void {
    if (!password || password.length < 8) throw new Error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) throw new Error("Password must contain an uppercase letter");
    if (!/[a-z]/.test(password)) throw new Error("Password must contain a lowercase letter");
    if (!/[0-9]/.test(password)) throw new Error("Password must contain a number");
  }

  private validateFullName(fullName: string): void {
    if (!fullName || fullName.trim().length < 2) throw new Error("Full name must be at least 2 characters");
    if (fullName.length > 100) throw new Error("Full name must not exceed 100 characters");
  }

  private async createUserProfile(userId: string, fullName: string, language: "ar" | "en"): Promise<void> {
    try {
      await supabase.from("profiles").insert({
        user_id: userId,
        full_name: fullName,
        language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  }

  static calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return Math.min(strength, 4);
  }
}

export const authService = new AuthService();
