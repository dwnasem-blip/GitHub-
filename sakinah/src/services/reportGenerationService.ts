import { RecitationFinding, ReviewReport } from '@/types';

/**
 * Report Generation Service - Generates comprehensive recitation analysis reports
 * Provides statistics, recommendations, and performance metrics
 */
export const reportGenerationService = {
  /**
   * Generate a comprehensive report from analysis findings
   */
  generateReport(params: {
    findings: RecitationFinding[];
    total_words: number;
    surah_number: number;
    surah_name_ar: string;
    language: 'ar' | 'en';
  }): ReviewReport {
    const {
      findings,
      total_words,
      surah_number,
      surah_name_ar,
      language,
    } = params;

    // Calculate statistics
    const stats = this.calculateStatistics(findings, total_words);

    // Generate summary
    const summary =
      language === 'ar'
        ? this.generateArabicSummary(stats, surah_name_ar)
        : this.generateEnglishSummary(stats, surah_name_ar);

    // Generate recommendations
    const recommendations =
      language === 'ar'
        ? this.generateArabicRecommendations(findings, stats)
        : this.generateEnglishRecommendations(findings, stats);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      findings,
      total_words
    );

    // Count errors by type and Tajweed rule
    const byType = this.countByType(findings);
    const byTajweedRule = this.countByTajweedRule(findings);

    return {
      summary_ar: language === 'ar' ? summary : '',
      summary_en: language === 'en' ? summary : '',
      total_words,
      words_with_issues: stats.words_with_issues,
      accuracy_percentage: stats.accuracy_percentage,
      errors: {
        confirmed: stats.confirmed_errors,
        probable: stats.probable_errors,
        inconclusive: stats.inconclusive_errors,
      },
      by_type: byType,
      by_tajweed_rule: byTajweedRule,
      recommendations_ar: language === 'ar' ? recommendations : [],
      recommendations_en: language === 'en' ? recommendations : [],
      performance_metrics: performanceMetrics,
      generated_at: new Date().toISOString(),
    };
  },

  /**
   * Calculate statistics from findings
   */
  calculateStatistics(
    findings: RecitationFinding[],
    totalWords: number
  ) {
    const confirmed_errors = findings.filter(
      (f) => f.severity === 'error'
    ).length;
    const probable_errors = findings.filter(
      (f) => f.severity === 'probable'
    ).length;
    const inconclusive_errors = findings.filter(
      (f) => f.severity === 'inconclusive'
    ).length;

    const words_with_issues = findings.length;
    const accuracy_percentage =
      totalWords > 0 ? ((totalWords - words_with_issues) / totalWords) * 100 : 100;

    return {
      confirmed_errors,
      probable_errors,
      inconclusive_errors,
      words_with_issues,
      accuracy_percentage: Math.round(accuracy_percentage * 100) / 100,
    };
  },

  /**
   * Generate Arabic summary
   */
  generateArabicSummary(
    stats: {
      confirmed_errors: number;
      probable_errors: number;
      inconclusive_errors: number;
      words_with_issues: number;
      accuracy_percentage: number;
    },
    surahName: string
  ): string {
    const accuracy = Math.round(stats.accuracy_percentage);

    if (accuracy === 100) {
      return `تلاوة ممتازة للسورة ${surahName}! تم تحليل جميع الكلمات بشكل صحيح بدون أخطاء.`;
    }

    if (accuracy >= 95) {
      return `تلاوة جيدة جداً للسورة ${surahName} بدقة ${accuracy}%. هناك بعض النقاط البسيطة التي يمكن تحسينها.`;
    }

    if (accuracy >= 85) {
      return `تلاوة جيدة للسورة ${surahName} بدقة ${accuracy}%. استمر في التدريب والممارسة المنتظمة.`;
    }

    if (accuracy >= 70) {
      return `تلاوة مقبولة للسورة ${surahName} بدقة ${accuracy}%. يتطلب المزيد من الممارسة والتركيز على القواعد.`;
    }

    return `تلاوة تحتاج لتحسين للسورة ${surahName} بدقة ${accuracy}%. يُنصح بالممارسة المكثفة والاستماع للتسجيلات المرجعية.`;
  },

  /**
   * Generate English summary
   */
  generateEnglishSummary(
    stats: {
      confirmed_errors: number;
      probable_errors: number;
      inconclusive_errors: number;
      words_with_issues: number;
      accuracy_percentage: number;
    },
    surahName: string
  ): string {
    const accuracy = Math.round(stats.accuracy_percentage);

    if (accuracy === 100) {
      return `Excellent recitation of Surah ${surahName}! All words were analyzed and pronounced correctly.`;
    }

    if (accuracy >= 95) {
      return `Very good recitation of Surah ${surahName} with ${accuracy}% accuracy. There are some minor points to improve.`;
    }

    if (accuracy >= 85) {
      return `Good recitation of Surah ${surahName} with ${accuracy}% accuracy. Continue with consistent practice.`;
    }

    if (accuracy >= 70) {
      return `Fair recitation of Surah ${surahName} with ${accuracy}% accuracy. More practice and focus on the rules are needed.`;
    }

    return `Recitation of Surah ${surahName} needs improvement with ${accuracy}% accuracy. Intensive practice and listening to reference recordings is recommended.`;
  },

  /**
   * Generate Arabic recommendations
   */
  generateArabicRecommendations(
    findings: RecitationFinding[],
    stats: {
      confirmed_errors: number;
      probable_errors: number;
      inconclusive_errors: number;
      words_with_issues: number;
      accuracy_percentage: number;
    }
  ): string[] {
    const recommendations: string[] = [];

    // Find most common error types
    const errorTypeCounts = this.countByType(findings);
    const topErrors = Object.entries(errorTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    // Add recommendations based on error types
    if (topErrors.includes('pronunciation')) {
      recommendations.push(
        'استمع بانتباه للتسجيلات المرجعية لتحسين نطق الحروف'
      );
      recommendations.push('ركز على المخارج الصحيحة للحروف');
    }

    if (topErrors.includes('elongation')) {
      recommendations.push('تدرب على أطوال المد الصحيحة');
      recommendations.push('اسمع للتسجيلات للتعرف على أنماط المد');
    }

    if (topErrors.includes('tajweed')) {
      recommendations.push('راجع قواعد التجويد الخاصة بهذه السورة');
      recommendations.push('تدرب على التطبيق الصحيح للقواعد');
    }

    if (topErrors.includes('missing_word') || topErrors.includes('extra_word')) {
      recommendations.push('انتبه لعدم حذف أو إضافة كلمات من القرآن');
      recommendations.push('اقرأ ببطء وتركيز على كل كلمة');
    }

    // Add accuracy-based recommendations
    if (stats.accuracy_percentage < 80) {
      recommendations.push('من المهم الممارسة المنتظمة والمكثفة');
      recommendations.push('استشر معلماً مختصاً لتصحيح الأخطاء');
    }

    // General recommendations
    if (recommendations.length < 3) {
      recommendations.push('استمع للقرآن الكريم بانتظام');
      recommendations.push('مارس التلاوة يومياً');
    }

    return recommendations.slice(0, 5);
  },

  /**
   * Generate English recommendations
   */
  generateEnglishRecommendations(
    findings: RecitationFinding[],
    stats: {
      confirmed_errors: number;
      probable_errors: number;
      inconclusive_errors: number;
      words_with_issues: number;
      accuracy_percentage: number;
    }
  ): string[] {
    const recommendations: string[] = [];

    // Find most common error types
    const errorTypeCounts = this.countByType(findings);
    const topErrors = Object.entries(errorTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([type]) => type);

    // Add recommendations based on error types
    if (topErrors.includes('pronunciation')) {
      recommendations.push('Listen carefully to reference recordings to improve letter pronunciation');
      recommendations.push('Focus on the correct articulation points of letters');
    }

    if (topErrors.includes('elongation')) {
      recommendations.push('Practice the correct elongation lengths');
      recommendations.push('Listen to recordings to understand elongation patterns');
    }

    if (topErrors.includes('tajweed')) {
      recommendations.push('Review the Tajweed rules applicable to this Surah');
      recommendations.push('Practice applying the rules correctly');
    }

    if (topErrors.includes('missing_word') || topErrors.includes('extra_word')) {
      recommendations.push('Be careful not to skip or add words from the Quran');
      recommendations.push('Read slowly and carefully, focusing on each word');
    }

    // Add accuracy-based recommendations
    if (stats.accuracy_percentage < 80) {
      recommendations.push('Regular and intensive practice is essential');
      recommendations.push('Consider consulting a qualified teacher for guidance');
    }

    // General recommendations
    if (recommendations.length < 3) {
      recommendations.push('Listen to the Quran regularly');
      recommendations.push('Practice recitation daily');
    }

    return recommendations.slice(0, 5);
  },

  /**
   * Count findings by type
   */
  countByType(findings: RecitationFinding[]): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const finding of findings) {
      counts[finding.type] = (counts[finding.type] || 0) + 1;
    }

    return counts;
  },

  /**
   * Count findings by Tajweed rule
   */
  countByTajweedRule(
    findings: RecitationFinding[]
  ): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const finding of findings) {
      if (finding.tajweed_rule) {
        const ruleName = finding.tajweed_rule.name_ar;
        counts[ruleName] = (counts[ruleName] || 0) + 1;
      }
    }

    return counts;
  },

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(
    findings: RecitationFinding[],
    totalWords: number
  ) {
    // Calculate clarity (based on pronunciation and articulation issues)
    const pronunciationIssues = findings.filter(
      (f) =>
        f.type === 'pronunciation' && f.severity === 'error'
    ).length;
    const clarity = Math.max(
      0,
      100 - (pronunciationIssues / (totalWords || 1)) * 100
    );

    // Calculate accuracy (based on word matching)
    const wordIssues = findings.filter(
      (f) =>
        f.type === 'missing_word' ||
        f.type === 'extra_word' ||
        f.type === 'wrong_word'
    ).length;
    const accuracy = Math.max(
      0,
      100 - (wordIssues / (totalWords || 1)) * 100
    );

    // Calculate Tajweed application (based on Tajweed issues)
    const tajweedIssues = findings.filter(
      (f) => f.type === 'tajweed'
    ).length;
    const tajweedApplication = Math.max(
      0,
      100 - (tajweedIssues / (totalWords || 1)) * 100
    );

    return {
      clarity: Math.round(clarity * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      tajweed_application: Math.round(tajweedApplication * 100) / 100,
    };
  },

  /**
   * Generate a text summary of key findings
   */
  generateFindingsSummary(
    findings: RecitationFinding[],
    language: 'ar' | 'en'
  ): string {
    if (findings.length === 0) {
      return language === 'ar'
        ? 'لم يتم العثور على أخطاء'
        : 'No errors found';
    }

    const errors = findings.filter((f) => f.severity === 'error');
    const probable = findings.filter((f) => f.severity === 'probable');
    const inconclusive = findings.filter((f) => f.severity === 'inconclusive');

    if (language === 'ar') {
      const parts: string[] = [];
      if (errors.length > 0) parts.push(`${errors.length} أخطاء مؤكدة`);
      if (probable.length > 0) parts.push(`${probable.length} أخطاء محتملة`);
      if (inconclusive.length > 0)
        parts.push(`${inconclusive.length} مشاكل غير محسومة`);
      return parts.join('، ');
    }

    const parts: string[] = [];
    if (errors.length > 0) parts.push(`${errors.length} confirmed error${errors.length !== 1 ? 's' : ''}`);
    if (probable.length > 0) parts.push(`${probable.length} probable issue${probable.length !== 1 ? 's' : ''}`);
    if (inconclusive.length > 0)
      parts.push(
        `${inconclusive.length} inconclusive ${
          inconclusive.length !== 1 ? 'findings' : 'finding'
        }`
      );
    return parts.join(', ');
  },

  /**
   * Export report as JSON
   */
  exportReportAsJSON(report: ReviewReport): string {
    return JSON.stringify(report, null, 2);
  },

  /**
   * Export report as CSV (for spreadsheet applications)
   */
  exportReportAsCSV(
    findings: RecitationFinding[],
    report: ReviewReport
  ): string {
    const headers = [
      'Verse',
      'Word',
      'Type',
      'Severity',
      'Confidence',
      'Expected',
      'Detected',
      'Suggestions',
    ];

    const rows = findings.map((f) => [
      f.verse_number,
      f.word_arabic,
      f.type,
      f.severity,
      f.confidence.toFixed(2),
      f.expected,
      f.detected,
      f.suggestions.join('; '),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  },
};
