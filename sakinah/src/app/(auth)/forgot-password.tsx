import React from 'react';
import { router } from 'expo-router';
import { AuthContextProvider } from '@/context/AuthContext';
import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';

export default function ForgotPasswordPage() {
  const handleResetRequestSuccess = () => {
    // Reset was successful
  };

  const handleNavigateToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <AuthContextProvider>
      <ForgotPasswordScreen
        onResetRequestSuccess={handleResetRequestSuccess}
        onNavigateToLogin={handleNavigateToLogin}
      />
    </AuthContextProvider>
  );
}
