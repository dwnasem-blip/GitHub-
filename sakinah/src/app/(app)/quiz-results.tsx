import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuizStore } from '@store/quizStore';

export default function QuizResultsScreen() {
  const router = useRouter();
  const { currentAttempt, getSessionScore } = useQuizStore();
  const score = getSessionScore();

  if (!currentAttempt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>لا توجد نتائج</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.goBack()}
        >
          <Text style={styles.buttonText}>⬅️ العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const correctCount = currentAttempt.responses.filter(
    (r) => r.isCorrect
  ).length;
  const totalQuestions = currentAttempt.totalQuestions;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `لقد حصلت على ${score}% في الاختبار! 🎉\n${correctCount} من ${totalQuestions} إجابات صحيحة.`,
        title: 'نتائجي في الاختبار',
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  const getResultMessage = () => {
    if (accuracy >= 90) return '🏆 ممتاز جداً!';
    if (accuracy >= 80) return '🎉 ممتاز!';
    if (accuracy >= 70) return '👍 جيد!';
    if (accuracy >= 60) return '📚 يحتاج مراجعة';
    return '🔄 حاول مرة أخرى';
  };

  const getResultColor = () => {
    if (accuracy >= 80) return '#10b981';
    if (accuracy >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>نتائجك</Text>
      </View>

      {/* Score Circle */}
      <View style={styles.scoreCircle}>
        <Text
          style={[styles.scoreText, { color: getResultColor() }]}
        >
          {score}%
        </Text>
        <Text style={styles.scoreLabel}>النسبة المئوية</Text>
      </View>

      {/* Result Message */}
      <Text
        style={[styles.resultMessage, { color: getResultColor() }]}
      >
        {getResultMessage()}
      </Text>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{correctCount}/{totalQuestions}</Text>
          <Text style={styles.statLabel}>إجابات صحيحة</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{accuracy}%</Text>
          <Text style={styles.statLabel}>دقة الأداء</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(currentAttempt.timeSpentSeconds / 60)}m
          </Text>
          <Text style={styles.statLabel}>الوقت المستغرق</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round(currentAttempt.timeSpentSeconds / currentAttempt.totalQuestions)}s
          </Text>
          <Text style={styles.statLabel}>متوسط الوقت للسؤال</Text>
        </View>
      </View>

      {/* Performance Details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>📊 تفاصيل الأداء</Text>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>الأسئلة الصحيحة:</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${accuracy}%`,
                  backgroundColor: '#10b981',
                },
              ]}
            />
          </View>
          <Text style={styles.detailValue}>{correctCount} أسئلة ✓</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>الأسئلة الخاطئة:</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${100 - accuracy}%`,
                  backgroundColor: '#ef4444',
                },
              ]}
            />
          </View>
          <Text style={styles.detailValue}>
            {totalQuestions - correctCount} أسئلة ✗
          </Text>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationSection}>
        <Text style={styles.sectionTitle}>💡 التوصيات</Text>
        {accuracy >= 80 ? (
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>
              🎯 أداء ممتاز! انتقل إلى موضوع جديد أو حاول مشاكل أصعب.
            </Text>
          </View>
        ) : accuracy >= 60 ? (
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>
              📚 راجع الحل مرة أخرى وحاول مجموعة أسئلة جديدة.
            </Text>
          </View>
        ) : (
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>
              🔄 ادرس المفاهيم الأساسية وحاول الاختبار مرة أخرى.
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/(app)/ocr-camera')}
        >
          <Text style={styles.buttonText}>📸 مشكلة جديدة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>📤 شارك النتائج</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(app)/')}
        >
          <Text style={styles.buttonText}>🏠 الصفحة الرئيسية</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  scoreCircle: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreText: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  resultMessage: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  recommendationSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
