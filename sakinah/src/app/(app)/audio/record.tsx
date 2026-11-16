import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RecordScreen } from '@/screens/audio/RecordScreen';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function RecordPage() {
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

  const handleRecordSuccess = () => {
    // Navigate back or to list screen
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content} edges={['bottom', 'left', 'right']}>
        <RecordScreen projectId={projectId} onRecordSuccess={handleRecordSuccess} />
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
