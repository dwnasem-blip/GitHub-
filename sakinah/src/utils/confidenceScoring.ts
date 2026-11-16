/**
 * Confidence Scoring for Recitation Analysis
 * Determines severity levels and confidence thresholds
 */

import { ConfidenceResult } from '../types';

/**
 * Confidence threshold levels (from spec)
 */
export const CONFIDENCE_THRESHOLDS = {
  CONFIRMED_ERROR: 0.9, // > 90% confidence
  PROBABLE_ISSUE: 0.7, // 70-90% confidence
  INCONCLUSIVE: 0.5, // 50-70% confidence
  NOT_DETECTED: 0.5, // < 50% confidence
};

/**
 * Calculate confidence for missing word error
 */
export function calculateMissingWordConfidence(
  timingGap: number, // Time gap where word is expected
  surroundingWordConfidences: number[]
): ConfidenceResult {
  const reasons: string[] = [];

  // If significant time gap exists between words
  const gapThreshold = 0.3; // 300ms minimum gap to suggest missing word
  let confidence = 0;

  if (timingGap > gapThreshold) {
    confidence += 0.6;
    reasons.push(`Significant timing gap detected (${(timingGap * 1000).toFixed(0)}ms)`);
  }

  // Check confidence of surrounding words
  if (surroundingWordConfidences.length > 0) {
    const avgSurroundingConfidence = surroundingWordConfidences.reduce((a, b) => a + b, 0) /
      surroundingWordConfidences.length;

    if (avgSurroundingConfidence > 0.8) {
      confidence += 0.3;
      reasons.push(`High confidence in surrounding words (${(avgSurroundingConfidence * 100).toFixed(1)}%)`);
    } else if (avgSurroundingConfidence > 0.6) {
      confidence += 0.1;
      reasons.push(`Medium confidence in surrounding words`);
    }
  } else {
    confidence += 0.2;
    reasons.push('Context limited');
  }

  // Normalize to 0-1
  confidence = Math.min(confidence, 1);

  const severity = determineSeverity(confidence);

  return {
    confidence,
    severity,
    reasons,
  };
}

/**
 * Calculate confidence for extra word error
 */
export function calculateExtraWordConfidence(
  detectedWordDuration: number,
  expectedWordAverageDuration: number,
  surroundingMatches: number
): ConfidenceResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Extra words are usually shorter than expected words
  const durationRatio = detectedWordDuration / expectedWordAverageDuration;

  if (durationRatio < 0.5) {
    confidence += 0.4;
    reasons.push(`Detected word is notably shorter than expected (${(durationRatio * 100).toFixed(0)}% of average)`);
  } else if (durationRatio < 0.8) {
    confidence += 0.2;
    reasons.push('Detected word is shorter than average');
  }

  // Check surrounding matches
  if (surroundingMatches >= 2) {
    confidence += 0.4;
    reasons.push(`Strong match confidence in surrounding words (${surroundingMatches} matches)`);
  } else if (surroundingMatches === 1) {
    confidence += 0.2;
    reasons.push('Some match confidence in context');
  } else {
    confidence += 0.1;
    reasons.push('Limited surrounding context');
  }

  // Normalize
  confidence = Math.min(confidence, 1);

  const severity = determineSeverity(confidence);

  return {
    confidence,
    severity,
    reasons,
  };
}

/**
 * Calculate confidence for wrong word (substitution) error
 */
export function calculateWrongWordConfidence(
  phoneticDistance: number, // 0-1, where 0 is identical
  contextConfidence: number,
  expectedWordFrequency: 'common' | 'moderate' | 'rare'
): ConfidenceResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Inverse of phonetic distance
  if (phoneticDistance < 0.3) {
    confidence += 0.3;
    reasons.push(`Phonetic features are significantly different from expected (distance: ${(phoneticDistance * 100).toFixed(0)}%)`);
  } else if (phoneticDistance < 0.6) {
    confidence += 0.2;
    reasons.push('Phonetic features show some variation from expected');
  } else {
    confidence += 0.05;
    reasons.push('Phonetic features are similar to expected');
  }

  // Context confidence
  if (contextConfidence > 0.8) {
    confidence += 0.4;
    reasons.push('High confidence in surrounding context');
  } else if (contextConfidence > 0.6) {
    confidence += 0.2;
    reasons.push('Medium confidence in surrounding context');
  } else {
    confidence += 0.1;
    reasons.push('Low confidence in surrounding context');
  }

  // Word frequency
  if (expectedWordFrequency === 'rare') {
    confidence += 0.2;
    reasons.push('Expected word is less common, increasing substitution likelihood');
  } else if (expectedWordFrequency === 'moderate') {
    confidence += 0.1;
  }

  // Normalize
  confidence = Math.min(confidence, 1);

  const severity = determineSeverity(confidence);

  return {
    confidence,
    severity,
    reasons,
  };
}

/**
 * Calculate confidence for pronunciation error
 */
export function calculatePronunciationErrorConfidence(
  phoneticSimilarity: number, // 0-1, where 1 is perfect match
  energyDeviation: number, // How much energy deviates from expected
  durationDeviation: number, // How much duration deviates from expected (0-1)
  voiceCharacteristics: 'match' | 'different'
): ConfidenceResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Inverse phonetic similarity
  const phoneticError = 1 - phoneticSimilarity;

  if (phoneticError > 0.3) {
    confidence += 0.4;
    reasons.push(`Phonetic mismatch detected (${(phoneticError * 100).toFixed(0)}% difference)`);
  } else if (phoneticError > 0.15) {
    confidence += 0.2;
    reasons.push('Minor phonetic variation detected');
  } else {
    confidence += 0.05;
  }

  // Energy analysis
  if (energyDeviation > 0.5) {
    confidence += 0.2;
    reasons.push(`Energy levels deviate significantly (${(energyDeviation * 100).toFixed(0)}%)`);
  } else if (energyDeviation > 0.2) {
    confidence += 0.1;
    reasons.push('Energy levels show some variation');
  }

  // Duration analysis
  if (durationDeviation > 0.4) {
    confidence += 0.1;
    reasons.push(`Duration differs from expected (${(durationDeviation * 100).toFixed(0)}%)`);
  }

  // Voice characteristics
  if (voiceCharacteristics === 'different') {
    confidence += 0.1;
    reasons.push('Voice characteristics differ from expected');
  }

  // Normalize
  confidence = Math.min(confidence, 1);

  const severity = determineSeverity(confidence);

  return {
    confidence,
    severity,
    reasons,
  };
}

/**
 * Calculate confidence for Tajweed rule violation
 */
export function calculateTajweedErrorConfidence(
  ruleViolationScore: number, // 0-1, where 1 is clear violation
  referenceSimilarity: number, // How similar to reference pronunciation
  isDefinitiveRule: boolean
): ConfidenceResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Rule violation clarity
  if (ruleViolationScore > 0.7) {
    confidence += 0.4;
    reasons.push(`Clear Tajweed rule violation detected (score: ${(ruleViolationScore * 100).toFixed(0)}%)`);
  } else if (ruleViolationScore > 0.4) {
    confidence += 0.2;
    reasons.push('Possible Tajweed rule issue detected');
  } else {
    confidence += 0.1;
    reasons.push('Minor Tajweed variation');
  }

  // Reference comparison
  if (referenceSimilarity < 0.6) {
    confidence += 0.3;
    reasons.push(`Differs significantly from reference (${(referenceSimilarity * 100).toFixed(0)}% similar)`);
  } else if (referenceSimilarity < 0.8) {
    confidence += 0.1;
    reasons.push('Differs somewhat from reference');
  } else {
    confidence += 0.05;
  }

  // Rule definitiveness
  if (!isDefinitiveRule) {
    confidence -= 0.2;
    reasons.push('Rule requires human verification');
  } else {
    confidence += 0.1;
    reasons.push('Rule is well-established');
  }

  // Normalize
  confidence = Math.max(Math.min(confidence, 1), 0);

  const severity = determineSeverity(confidence);

  // For non-definitive rules, always flag as inconclusive or probable
  if (!isDefinitiveRule && severity === 'error' && confidence < 0.95) {
    return {
      confidence,
      severity: 'inconclusive',
      reasons,
    };
  }

  return {
    confidence,
    severity,
    reasons,
  };
}

/**
 * Determine severity level based on confidence
 */
export function determineSeverity(confidence: number): 'error' | 'probable' | 'inconclusive' {
  if (confidence > CONFIDENCE_THRESHOLDS.CONFIRMED_ERROR) {
    return 'error';
  } else if (confidence > CONFIDENCE_THRESHOLDS.PROBABLE_ISSUE) {
    return 'probable';
  } else if (confidence > CONFIDENCE_THRESHOLDS.INCONCLUSIVE) {
    return 'inconclusive';
  } else {
    return 'inconclusive'; // Not detected - but we still report as inconclusive if we're analyzing
  }
}

/**
 * Calculate overall recitation confidence
 */
export function calculateOverallConfidence(
  individualConfidences: number[],
  accuracyPercentage: number,
  missingWordsCount: number,
  extraWordsCount: number,
  wrongWordsCount: number,
  totalWords: number
): number {
  if (individualConfidences.length === 0) {
    return 0;
  }

  // Average individual finding confidence
  const avgFindingConfidence = individualConfidences.reduce((a, b) => a + b, 0) /
    individualConfidences.length;

  // Accuracy-based confidence
  const accuracyConfidence = accuracyPercentage / 100;

  // Error penalty
  const totalErrors = missingWordsCount + extraWordsCount + wrongWordsCount;
  const errorPenalty = Math.max(0, 1 - (totalErrors / totalWords) * 0.5);

  // Weight the components
  const overall = (avgFindingConfidence * 0.3) +
    (accuracyConfidence * 0.5) +
    (errorPenalty * 0.2);

  return Math.max(0, Math.min(1, overall));
}

/**
 * Flag cases that need human review
 */
export interface HumanReviewFlag {
  type: string;
  description: string;
  confidence: number;
  details: Record<string, unknown>;
}

/**
 * Identify cases requiring human verification
 */
export function flagInconclusiveCases(
  findings: Array<{
    type: string;
    confidence: number;
    severity: string;
    expected?: string;
    detected?: string;
    tajweed_rule?: { is_definitive?: boolean };
  }>
): HumanReviewFlag[] {
  const flags: HumanReviewFlag[] = [];

  for (const finding of findings) {
    // Flag inconclusive findings
    if (finding.severity === 'inconclusive') {
      flags.push({
        type: 'inconclusive_finding',
        description: `${finding.type} requires human verification`,
        confidence: finding.confidence,
        details: {
          finding_type: finding.type,
          expected: finding.expected,
          detected: finding.detected,
        },
      });
    }

    // Flag non-definitive Tajweed rules
    if (finding.type.includes('tajweed') &&
        finding.tajweed_rule &&
        !finding.tajweed_rule.is_definitive) {
      flags.push({
        type: 'non_definitive_tajweed',
        description: 'Tajweed rule violation requires Qari verification',
        confidence: finding.confidence,
        details: {
          rule_name: finding.expected,
        },
      });
    }

    // Flag edge cases with moderate confidence
    if (finding.confidence > 0.5 && finding.confidence < 0.7) {
      flags.push({
        type: 'edge_case',
        description: `Potential ${finding.type} with moderate confidence`,
        confidence: finding.confidence,
        details: {
          recommendation: 'Manual review recommended',
        },
      });
    }
  }

  return flags;
}

/**
 * Adjust confidence based on reference audio comparison
 */
export function adjustConfidenceWithReference(
  originalConfidence: number,
  referenceMatchScore: number, // 0-1, how similar to reference
  referenceCertainty: number // 0-1, how certain the reference match is
): number {
  // If reference match is poor, reduce confidence
  if (referenceMatchScore < 0.5) {
    return originalConfidence * 0.5; // Reduce by 50%
  } else if (referenceMatchScore < 0.7) {
    return originalConfidence * 0.75; // Reduce by 25%
  }

  // If reference match is good, it confirms the finding
  if (referenceMatchScore > 0.85 && referenceCertainty > 0.8) {
    return Math.min(originalConfidence + 0.1, 1); // Boost by up to 10%
  }

  return originalConfidence;
}

/**
 * Calculate finding severity with all factors considered
 */
export interface SeverityAssessment {
  severity: 'error' | 'probable' | 'inconclusive';
  confidence: number;
  recommendation: string;
}

/**
 * Comprehensive severity assessment
 */
export function assessFindingSeverity(
  confidence: number,
  errorType: string,
  contextFactors: {
    isCommonError: boolean;
    hasStrongContext: boolean;
    isNearWordBoundary: boolean;
  }
): SeverityAssessment {
  let adjustedConfidence = confidence;
  let recommendation = '';

  // Context adjustment
  if (contextFactors.hasStrongContext) {
    adjustedConfidence = Math.min(adjustedConfidence + 0.1, 1);
  }

  if (contextFactors.isNearWordBoundary) {
    adjustedConfidence = Math.max(adjustedConfidence - 0.15, 0);
    recommendation = 'Word boundary detection may be uncertain';
  }

  if (contextFactors.isCommonError) {
    adjustedConfidence = Math.min(adjustedConfidence + 0.05, 1);
    recommendation = 'This is a common pronunciation error';
  }

  const severity = determineSeverity(adjustedConfidence);

  if (severity === 'inconclusive' && !recommendation) {
    recommendation = 'Manual review recommended for accurate assessment';
  } else if (severity === 'probable' && !recommendation) {
    recommendation = 'Consider comparing with reference audio';
  }

  return {
    severity,
    confidence: adjustedConfidence,
    recommendation,
  };
}
