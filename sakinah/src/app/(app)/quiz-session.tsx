import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuizStore } from '@store/quizStore';

export default function QuizSessionScreen() {
  const router = useRouter();
  const {
    currentQuiz,
    currentQuestionIndex,
    nextQuestion,
    previousQuestion,
    answerQuestion,
    submitQuiz,
    currentAttempt,
    getSessionAccuracy,
  } = useQuizStore();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestionIndex]);

  if (!currentQuiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>لا يوجد اختبار</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.goBack()}
        >
          <Text style={styles.buttonText}>⬅️ العودة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = currentQuiz.questions[currentQuestionIndex];
  const progress = currentQuestionIndex + 1;
  const total = currentQuiz.questionCount;

  const handleSelectAnswer = (optionId: string) => {
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      Alert.alert('تنبيه', 'الرجاء اختيار إجابة');
      return;
    }

    const spent = Math.round((Date.now() - startTime) / 1000);
    answerQuestion(question.id, selectedAnswer, spent);
    setSelectedAnswer(null);

    if (currentQuestionIndex < total - 1) {
      nextQuestion();
    } else {
      // Last question - show results
      submitQuiz();
      router.push('/(app)/quiz-results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
      setSelectedAnswer(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          السؤال {progress} من {total}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(progress / total) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionType}>
            {question.strategy === 'recall'
              ? '📚 تذكر'
              : question.strategy === 'application'
              ? '🔧 تطبيق'
              : '🧠 تحليل'}
          </Text>
          <Text style={styles.questionDifficulty}>
            {question.difficulty === 'easy'
              ? '⭐ سهل'
              : question.difficulty === 'medium'
              ? '⭐⭐ متوسط'
              : '⭐⭐⭐ صعب'}
          </Text>
        </View>
        <Text style={styles.questionText}>{question.questionText}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsLabel}>اختر الإجابة الصحيحة:</Text>
        {question.options?.map((option: any) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedAnswer === option.id && styles.optionButtonSelected,
            ]}
            onPress={() => handleSelectAnswer(option.id)}
          >
            <View
              style={[
                styles.optionCircle,
                selectedAnswer === option.id &&
                  styles.optionCircleSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  selectedAnswer === option.id &&
                    styles.optionLabelSelected,
                ]}
              >
                {option.id}
              </Text>
            </View>
            <Text
              style={[
                styles.optionText,
                selectedAnswer === option.id && styles.optionTextSelected,
              ]}
            >
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.button,
            currentQuestionIndex === 0 && styles.buttonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.buttonText}>⬅️ السابق</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmitAnswer}
        >
          <Text style={styles.buttonText}>
            {currentQuestionIndex === total - 1 ? '✓ إنهاء' : 'التالي ➡️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time and Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          ⏱️ الوقت المتبقي: {currentQuiz.estimatedTimeMinutes} دقيقة
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
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
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  questionDifficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#1f2937',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#10b981',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
