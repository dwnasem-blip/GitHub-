import React from 'react';
import { router } from 'expo-router';
import { AuthContextProvider } from '@/context/AuthContext';
import { LoginScreen } from '@/screens/auth/LoginScreen';

export default function LoginPage() {
  const handleLoginSuccess = () => {
    router.replace('/(app)');
  };

  const handleNavigateToSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  const handleNavigateToForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <AuthContextProvider>
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onNavigateToSignUp={handleNavigateToSignUp}
        onNavigateToForgotPassword={handleNavigateToForgotPassword}
      />
    </AuthContextProvider>
  );
}
