import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UploadScreen } from '@/screens/audio/UploadScreen';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function UploadPage() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  if (!projectId) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
          <View style={styles.error}>
            <ThemedText>Project ID is required</ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <UploadScreen projectId={projectId} onUploadSuccess={() => router.back()} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
