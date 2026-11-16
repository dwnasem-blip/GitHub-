import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSolutionStore } from '@store/solutionStore';
import { useQuizStore } from '@store/quizStore';
import { createClaudeService } from '@services/claudeService';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || '';

export default function SolutionGenerationScreen() {
  const router = useRouter();
  const { currentProblem, setSolution, addSolutionToHistory, isSolutionGenerating, setSolutionGenerating } = useSolutionStore();
  const { setCurrentQuiz, setQuizGenerating } = useQuizStore();
  const [currentSolution, setCurrentSolution] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentProblem) {
      generateSolution();
    }
  }, [currentProblem]);

  const generateSolution = async () => {
    if (!currentProblem) return;

    setSolutionGenerating(true);
    try {
      const claudeService = createClaudeService(CLAUDE_API_KEY);
      const solution = await claudeService.generateSolution({
        problemText: currentProblem.extractedText,
        subject: currentProblem.subject,
        userTier: 'free',
      });

      setCurrentSolution(solution);
      setSolution(solution);
      addSolutionToHistory(solution);
    } catch (err: any) {
      setError(err.message || 'فشل في توليد الحل');
      Alert.alert('خطأ', 'فشل في توليد الحل. تأكد من مفتاح Claude API.');
    } finally {
      setSolutionGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!currentSolution) return;

    setQuizGenerating(true);
    try {
      const claudeService = createClaudeService(CLAUDE_API_KEY);
      const quizQuestions = await claudeService.generateQuizQuestions(
        currentSolution,
        10
      );

      // Create quiz object
      const quiz = {
        id: `quiz_${Date.now()}`,
        solutionId: currentSolution.id,
        title: `اختبر فهمك: ${currentProblem?.extractedText.substring(0, 30)}...`,
        questionCount: quizQuestions.length,
        difficulty: 'medium' as const,
        estimatedTimeMinutes: 15,
        questions: quizQuestions.map((q: any, i: number) => ({
          id: `q_${i}`,
          questionNumber: i + 1,
          type: 'multiple_choice' as const,
          strategy: i < 3 ? 'recall' : i < 7 ? 'application' : 'analysis',
          difficulty: i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard',
          questionText: q.question || q.questionText,
          options: q.options,
          correctAnswerId: q.correctAnswer || q.correctId,
          explanation: q.explanation,
        })),
        createdAt: new Date().toISOString(),
      };

      setCurrentQuiz(quiz);
      router.push('/(app)/quiz-session');
    } catch (err: any) {
      Alert.alert('خطأ', 'فشل في توليد الاختبار');
    } finally {
      setQuizGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!currentSolution) return;
    try {
      await Share.share({
        message: `${currentSolution.finalAnswer}\n\n${currentSolution.steps.map((s: any) => `${s.stepNumber}. ${s.title}: ${s.explanation}`).join('\n')}`,
        title: 'الحل',
      });
    } catch (err) {
      Alert.alert('خطأ', 'فشل في مشاركة الحل');
    }
  };

  if (!currentProblem) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>لا توجد مشكلة محددة</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/(app)/ocr-camera')}
        >
          <Text style={styles.buttonText}>⬅️ العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSolutionGenerating || !currentSolution) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>⏳ جاري توليد الحل...</Text>
        <Text style={styles.hint}>
          هذا قد يستغرق بضع ثوان
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={generateSolution}
        >
          <Text style={styles.buttonText}>🔄 حاول مجدداً</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✅ الحل خطوة بخطوة</Text>

      <View style={styles.problemSection}>
        <Text style={styles.sectionTitle}>📌 السؤال:</Text>
        <Text style={styles.problemText}>{currentProblem.extractedText}</Text>
      </View>

      <View style={styles.stepsSection}>
        <Text style={styles.sectionTitle}>📝 الخطوات:</Text>
        {currentSolution.steps.map((step: any, index: number) => (
          <View key={index} style={styles.stepCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
              <Text style={styles.stepExplanation}>{step.explanation}</Text>
              {step.keyConceptsText && (
                <View style={styles.conceptsBox}>
                  <Text style={styles.conceptsLabel}>المفاهيم الأساسية:</Text>
                  <Text style={styles.conceptsText}>
                    {step.keyConceptsText}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.answerSection}>
        <Text style={styles.sectionTitle}>✨ الإجابة النهائية:</Text>
        <View style={styles.answerBox}>
          <Text style={styles.answerText}>{currentSolution.finalAnswer}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>⏱️ الوقت المتوقع:</Text>
        <Text style={styles.infoValue}>
          {currentSolution.estimatedTimeMinutes} دقيقة
        </Text>
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleGenerateQuiz}
        >
          <Text style={styles.buttonText}>📝 اختبر نفسك</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleShare}
        >
          <Text style={styles.buttonText}>📤 شارك الحل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(app)/ocr-camera')}
        >
          <Text style={styles.buttonText}>📸 مشكلة جديدة</Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  problemSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  problemText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  stepsSection: {
    marginBottom: 16,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  stepNumber: {
    backgroundColor: '#3b82f6',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    padding: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  stepExplanation: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  conceptsBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  conceptsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  conceptsText: {
    fontSize: 13,
    color: '#1e3a8a',
  },
  answerSection: {
    marginBottom: 16,
  },
  answerBox: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
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
  loadingText: {
    fontSize: 16,
    color: '#374151',
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
});
