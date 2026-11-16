import React from 'react';
import { router } from 'expo-router';
import { AuthContextProvider } from '@/context/AuthContext';
import { SignUpScreen } from '@/screens/auth/SignUpScreen';

export default function SignUpPage() {
  const handleSignUpSuccess = () => {
    // After sign up, redirect to login
    router.replace('/(auth)/login');
  };

  const handleNavigateToLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <AuthContextProvider>
      <SignUpScreen
        onSignUpSuccess={handleSignUpSuccess}
        onNavigateToLogin={handleNavigateToLogin}
      />
    </AuthContextProvider>
  );
}
