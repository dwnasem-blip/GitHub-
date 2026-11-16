import { supabase } from '@/config/supabase';
import { TajweedRule } from '@/types';

// Cache for rules to avoid repeated database queries
let rulesCache: TajweedRule[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION: number = 1000 * 60 * 60; // 1 hour

/**
 * Tajweed Rules Service - Manages Quranic Tajweed rules database
 * Provides access to authentic Tajweed rules from reliable sources
 */
export const tajweedRulesService = {
  /**
   * Get all Tajweed rules with caching
   */
  async getTajweedRules(): Promise<TajweedRule[]> {
    // Return cached rules if still valid
    if (
      rulesCache &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    ) {
      return rulesCache;
    }

    const { data, error } = await supabase
      .from('tajweed_rules')
      .select('*')
      .order('category', { ascending: true })
      .order('name_ar', { ascending: true });

    if (error) {
      console.error('Error fetching Tajweed rules:', error);
      // Return default rules if database query fails
      return this.getDefaultTajweedRules();
    }

    if (!data || data.length === 0) {
      // Initialize default rules if table is empty
      return tajweedRulesService.initializeDefaultRules();
    }

    // Cache the rules
    rulesCache = data;
    cacheTimestamp = Date.now();

    return data;
  },

  /**
   * Get Tajweed rules by category
   */
  async getTajweedRulesByCategory(category: string): Promise<TajweedRule[]> {
    const allRules = await tajweedRulesService.getTajweedRules();
    return allRules.filter((rule) => rule.category === category);
  },

  /**
   * Get a specific Tajweed rule by ID
   */
  async getTajweedRule(id: string): Promise<TajweedRule | null> {
    const { data, error } = await supabase
      .from('tajweed_rules')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Tajweed rule:', error);
    }

    return data || null;
  },

  /**
   * Get Tajweed rule by Arabic name
   */
  async getTajweedRuleByName(nameAr: string): Promise<TajweedRule | null> {
    const { data, error } = await supabase
      .from('tajweed_rules')
      .select('*')
      .eq('name_ar', nameAr)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Tajweed rule by name:', error);
    }

    return data || null;
  },

  /**
   * Get definitive rules only (those not needing human review)
   */
  async getDefinitiveRules(): Promise<TajweedRule[]> {
    const allRules = await this.getTajweedRules();
    return allRules.filter((rule) => rule.is_definitive);
  },

  /**
   * Get rules requiring human review
   */
  async getReviewableRules(): Promise<TajweedRule[]> {
    const allRules = await this.getTajweedRules();
    return allRules.filter((rule) => !rule.is_definitive);
  },

  /**
   * Clear the cache manually
   */
  clearCache(): void {
    this.rulesCache = null;
    this.cacheTimestamp = 0;
  },

  /**
   * Get default Tajweed rules (from reliable Islamic sources)
   * These are used as fallback if database is unavailable
   */
  private getDefaultTajweedRules(): TajweedRule[] {
    return [
      // Elongation Rules
      {
        id: 'tajweed_01',
        name_ar: 'المد',
        name_en: 'Elongation / Mead',
        rule_description:
          'The prolongation of sound when encountering specific vowels and consonants',
        is_definitive: true,
        category: 'elongation',
      },
      {
        id: 'tajweed_02',
        name_ar: 'المد الطبيعي',
        name_en: 'Natural Elongation',
        rule_description:
          'The natural prolongation that occurs with specific vowels (alef, ya, waw)',
        is_definitive: true,
        category: 'elongation',
      },
      {
        id: 'tajweed_03',
        name_ar: 'المد الزائد',
        name_en: 'Extra Elongation',
        rule_description: 'Elongation beyond the natural prolongation',
        is_definitive: true,
        category: 'elongation',
      },

      // Nasalization Rules
      {
        id: 'tajweed_04',
        name_ar: 'الغنة',
        name_en: 'Nasalization / Ghunna',
        rule_description:
          'The nasal sound that accompanies the letters noon and meem',
        is_definitive: true,
        category: 'nasalization',
      },
      {
        id: 'tajweed_05',
        name_ar: 'غنة المضاعف',
        name_en: 'Doubled Nasalization',
        rule_description: 'Nasalization when letters are doubled',
        is_definitive: true,
        category: 'nasalization',
      },

      // Assimilation Rules
      {
        id: 'tajweed_06',
        name_ar: 'الإدغام',
        name_en: 'Assimilation',
        rule_description:
          'Combining two adjacent consonants by merging them into one sound',
        is_definitive: true,
        category: 'assimilation',
      },
      {
        id: 'tajweed_07',
        name_ar: 'الإدغام الكامل',
        name_en: 'Complete Assimilation',
        rule_description:
          'Completely merging two identical sounds into one',
        is_definitive: true,
        category: 'assimilation',
      },
      {
        id: 'tajweed_08',
        name_ar: 'الإدغام الناقص',
        name_en: 'Incomplete Assimilation',
        rule_description:
          'Combining consonants while maintaining some distinction',
        is_definitive: true,
        category: 'assimilation',
      },

      // Concealment Rules
      {
        id: 'tajweed_09',
        name_ar: 'الإخفاء',
        name_en: 'Concealment',
        rule_description:
          'Placing the noon or meem between clear articulation and nasalization',
        is_definitive: true,
        category: 'concealment',
      },

      // Manifestation Rules
      {
        id: 'tajweed_10',
        name_ar: 'الإظهار',
        name_en: 'Manifestation',
        rule_description:
          'Clear articulation of a letter without nasalization',
        is_definitive: true,
        category: 'manifestation',
      },

      // Vibration Rules
      {
        id: 'tajweed_11',
        name_ar: 'التكرير',
        name_en: 'Vibration / Trill',
        rule_description:
          'The subtle vibration that occurs when pronouncing the letter Ra',
        is_definitive: true,
        category: 'vibration',
      },

      // Letter-specific Rules
      {
        id: 'tajweed_12',
        name_ar: 'القلقلة',
        name_en: 'Plosion',
        rule_description:
          'A subtle sound produced at the end of certain letters',
        is_definitive: true,
        category: 'articulation',
      },
      {
        id: 'tajweed_13',
        name_ar: 'السكت',
        name_en: 'Stop',
        rule_description: 'A brief pause without cutting off the sound',
        is_definitive: true,
        category: 'articulation',
      },

      // Hamza Rules
      {
        id: 'tajweed_14',
        name_ar: 'الهمزة',
        name_en: 'Glottal Stop',
        rule_description:
          'The glottal stop represented by the Hamza symbol',
        is_definitive: true,
        category: 'articulation',
      },

      // Human review required
      {
        id: 'tajweed_15',
        name_ar: 'الوقف',
        name_en: 'Stopping',
        rule_description:
          'Rules for stopping at certain points in recitation',
        is_definitive: false,
        category: 'pausing',
      },
      {
        id: 'tajweed_16',
        name_ar: 'الابتداء',
        name_en: 'Beginning',
        rule_description:
          'Rules for starting recitation at certain points',
        is_definitive: false,
        category: 'pausing',
      },
    ];
  },

  /**
   * Initialize default rules in the database if table is empty
   */
  private async initializeDefaultRules(): Promise<TajweedRule[]> {
    const defaultRules = this.getDefaultTajweedRules();

    try {
      const { error } = await supabase
        .from('tajweed_rules')
        .insert(defaultRules);

      if (error) {
        console.error('Error initializing default Tajweed rules:', error);
        // Return default rules even if insertion fails
        return defaultRules;
      }

      // Cache the newly initialized rules
      this.rulesCache = defaultRules;
      this.cacheTimestamp = Date.now();

      return defaultRules;
    } catch (error) {
      console.error('Exception initializing Tajweed rules:', error);
      return defaultRules;
    }
  },

  /**
   * Get Tajweed categories
   */
  async getTajweedCategories(): Promise<string[]> {
    const rules = await this.getTajweedRules();
    const categories = new Set(rules.map((rule) => rule.category));
    return Array.from(categories).sort();
  },

  /**
   * Search Tajweed rules by keyword
   */
  async searchTajweedRules(query: string): Promise<TajweedRule[]> {
    const allRules = await this.getTajweedRules();
    const lowerQuery = query.toLowerCase();

    return allRules.filter(
      (rule) =>
        rule.name_ar.includes(query) ||
        rule.name_en.toLowerCase().includes(lowerQuery) ||
        rule.rule_description.toLowerCase().includes(lowerQuery)
    );
  },
};
