import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UploadScreen } from '@/screens/audio/UploadScreen';
import { ThemedView } from '@/components/themed-view';

export default function UploadPage() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();

  if (!projectId) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
          <View style={styles.error}>
            <Text>Project ID is required</Text>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const handleUploadSuccess = () => {
    // Navigate back or to list screen
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <UploadScreen projectId={projectId} onUploadSuccess={handleUploadSuccess} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
