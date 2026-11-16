import React from 'react';
import { StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RecitationReviewScreen } from '@/screens/recitation/RecitationReviewScreen';
import { colors } from '@/theme/colors';

export default function RecitationReviewPage() {
  const router = useRouter();
  const { projectId, audioFileId, recitationMatchId } = useLocalSearchParams<{
    projectId: string;
    audioFileId: string;
    recitationMatchId: string;
  }>();

  return (
    <RecitationReviewScreen
      projectId={projectId || ''}
      audioFileId={audioFileId || ''}
      recitationMatchId={recitationMatchId || ''}
      onBack={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.semantic.background.primary,
  },
});
