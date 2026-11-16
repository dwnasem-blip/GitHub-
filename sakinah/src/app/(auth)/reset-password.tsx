import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthContextProvider } from '@/context/AuthContext';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';

export default function ResetPasswordPage() {
  const { token } = useLocalSearchParams();

  const handleResetSuccess = () => {
    // Reset was successful
  };

  const handleNavigateToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <AuthContextProvider>
      <ResetPasswordScreen
        token={typeof token === 'string' ? token : ''}
        onResetSuccess={handleResetSuccess}
        onNavigateToLogin={handleNavigateToLogin}
      />
    </AuthContextProvider>
  );
}
