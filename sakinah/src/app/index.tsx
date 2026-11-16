import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎓 تطبيق التعليم الذكي</Text>
        <Text style={styles.subtitle}>استخرج السؤال، احصل على الحل، اختبر نفسك</Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>✨ الميزات الرئيسية:</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📸</Text>
          <Text style={styles.featureName}>استخراج الأسئلة</Text>
          <Text style={styles.featureDesc}>
            صوّر السؤال واستخرج النص تلقائياً باستخدام الذكاء الاصطناعي
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤖</Text>
          <Text style={styles.featureName}>حلول ذكية</Text>
          <Text style={styles.featureDesc}>
            احصل على حل خطوة بخطوة مع شرح تفصيلي لكل خطوة
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📝</Text>
          <Text style={styles.featureName}>اختبارات ذكية</Text>
          <Text style={styles.featureDesc}>
            اختبر فهمك من خلال أسئلة متنوعة ومتدرجة المستوى
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📊</Text>
          <Text style={styles.featureName}>متابعة التقدم</Text>
          <Text style={styles.featureDesc}>
            تابع تقدمك وشاهد إحصائياتك التعليمية
          </Text>
        </View>
      </View>

      {/* Quick Start */}
      <View style={styles.quickStartSection}>
        <Text style={styles.sectionTitle}>🚀 ابدأ الآن:</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/(app)/ocr-camera')}
        >
          <Text style={styles.buttonText}>📸 التقط صورة سؤال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(app)/')}
        >
          <Text style={styles.buttonText}>📊 عرض التقدم</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>📈 إحصائيات:</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>مشاكل محلولة</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>اختبارات مكتملة</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>ساعات تعلم</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>∞</Text>
            <Text style={styles.statLabel}>دقة المتوسط</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ معلومات:</Text>
        <Text style={styles.infoText}>
          هذا التطبيق يستخدم تقنية الذكاء الاصطناعي (Claude API) لتحليل الأسئلة والمساعدة في فهم الحلول.
        </Text>
        <Text style={styles.versionText}>الإصدار: 1.0.0 (MVP)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  featuresSection: {
    padding: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  quickStartSection: {
    paddingHorizontal: 16,
    marginVertical: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#10b981',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#3b82f6',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#3730a3',
  },
});
