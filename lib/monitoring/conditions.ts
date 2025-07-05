import {
  ScrapedData,
  PriceData,
  MetricData,
  PerformanceData,
  SEOData,
} from "./scraper";

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "exists"
  | "not_exists"
  | "changed"
  | "not_changed"
  | "increased"
  | "decreased"
  | "percentage_increase"
  | "percentage_decrease"
  | "regex_match"
  | "regex_not_match";

export type ConditionField =
  | "title"
  | "text"
  | "html"
  | "status_code"
  | "response_time"
  | "price"
  | "specific_price"
  | "metric"
  | "specific_metric"
  | "performance_load_time"
  | "performance_fcp"
  | "performance_lcp"
  | "performance_cls"
  | "performance_fid"
  | "seo_title"
  | "seo_description"
  | "seo_h1_count"
  | "seo_image_alt_ratio"
  | "custom_selector"
  | "element_count"
  | "element_text"
  | "element_attribute"
  | "social_followers"
  | "social_engagement";

export interface Condition {
  id: string;
  field: ConditionField;
  operator: ConditionOperator;
  value: any;
  selector?: string; // For custom selectors or specific elements
  attribute?: string; // For element attributes
  metricName?: string; // For specific metrics
  priceSelector?: string; // For specific price elements
  socialPlatform?: "facebook" | "twitter" | "instagram" | "youtube";
  socialMetric?: "followers" | "likes" | "shares" | "comments" | "engagement";
  threshold?: number; // For percentage changes
  caseSensitive?: boolean; // For text comparisons
  regex?: string; // For regex operations
}

export interface ConditionGroup {
  id: string;
  operator: "AND" | "OR";
  conditions: (Condition | ConditionGroup)[];
}

export interface EvaluationResult {
  passed: boolean;
  message: string;
  actualValue?: any;
  expectedValue?: any;
  conditionId: string;
  field: ConditionField;
  operator: ConditionOperator;
  details?: any;
}

export interface GroupEvaluationResult {
  passed: boolean;
  message: string;
  results: (EvaluationResult | GroupEvaluationResult)[];
  groupId: string;
  operator: "AND" | "OR";
}

export interface ConditionEvaluationContext {
  currentData: ScrapedData;
  previousData?: ScrapedData;
  historicalData?: ScrapedData[];
  monitorId: string;
  url: string;
  timestamp: Date;
}

export class ConditionEvaluator {
  constructor(private context: ConditionEvaluationContext) {}

  evaluateCondition(condition: Condition): EvaluationResult {
    try {
      const actualValue = this.extractValue(condition);
      const passed = this.compareValues(condition, actualValue);

      return {
        passed,
        message: this.generateMessage(condition, actualValue, passed),
        actualValue,
        expectedValue: condition.value,
        conditionId: condition.id,
        field: condition.field,
        operator: condition.operator,
        details: this.getEvaluationDetails(condition, actualValue),
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error evaluating condition: ${error instanceof Error ? error.message : "Unknown error"}`,
        conditionId: condition.id,
        field: condition.field,
        operator: condition.operator,
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  evaluateConditionGroup(group: ConditionGroup): GroupEvaluationResult {
    const results: (EvaluationResult | GroupEvaluationResult)[] = [];

    for (const item of group.conditions) {
      if (
        ("operator" in item && item.operator === "AND") ||
        item.operator === "OR"
      ) {
        // It's a nested group
        results.push(this.evaluateConditionGroup(item as ConditionGroup));
      } else {
        // It's a condition
        results.push(this.evaluateCondition(item as Condition));
      }
    }

    const passed = this.calculateGroupResult(group.operator, results);

    return {
      passed,
      message: this.generateGroupMessage(group, results, passed),
      results,
      groupId: group.id,
      operator: group.operator,
    };
  }

  private extractValue(condition: Condition): any {
    const { currentData, previousData } = this.context;

    switch (condition.field) {
      case "title":
        return currentData.title || "";

      case "text":
        return currentData.text || "";

      case "html":
        return currentData.html || "";

      case "status_code":
        return currentData.statusCode || 0;

      case "response_time":
        return this.context.timestamp.getTime() - (previousData ? 0 : 1000); // Simplified

      case "price":
        return this.extractPriceValue(condition);

      case "specific_price":
        return this.extractSpecificPriceValue(condition);

      case "metric":
        return this.extractMetricValue(condition);

      case "specific_metric":
        return this.extractSpecificMetricValue(condition);

      case "performance_load_time":
        return currentData.performance?.loadTime || 0;

      case "performance_fcp":
        return currentData.performance?.firstContentfulPaint || 0;

      case "performance_lcp":
        return currentData.performance?.largestContentfulPaint || 0;

      case "performance_cls":
        return currentData.performance?.cumulativeLayoutShift || 0;

      case "performance_fid":
        return currentData.performance?.firstInputDelay || 0;

      case "seo_title":
        return currentData.seo?.title || "";

      case "seo_description":
        return currentData.seo?.metaDescription || "";

      case "seo_h1_count":
        return currentData.seo?.h1Tags?.length || 0;

      case "seo_image_alt_ratio":
        const seo = currentData.seo;
        return seo
          ? (seo.imageAltTags / Math.max(seo.totalImages, 1)) * 100
          : 0;

      case "custom_selector":
        return this.extractCustomSelectorValue(condition);

      case "element_count":
        return this.extractElementCount(condition);

      case "element_text":
        return this.extractElementText(condition);

      case "element_attribute":
        return this.extractElementAttribute(condition);

      case "social_followers":
        return this.extractSocialFollowers(condition);

      case "social_engagement":
        return this.extractSocialEngagement(condition);

      default:
        throw new Error(`Unknown condition field: ${condition.field}`);
    }
  }

  private extractPriceValue(condition: Condition): number {
    const prices = this.context.currentData.prices || [];
    if (prices.length === 0) return 0;

    // Return the first price if no specific selector is provided
    if (!condition.selector) {
      return prices[0].price;
    }

    // Find price by selector
    const price = prices.find((p) => p.selector === condition.selector);
    return price?.price || 0;
  }

  private extractSpecificPriceValue(condition: Condition): number {
    const prices = this.context.currentData.prices || [];
    const price = prices.find((p) => p.selector === condition.priceSelector);
    return price?.price || 0;
  }

  private extractMetricValue(condition: Condition): number | string {
    const metrics = this.context.currentData.metrics || [];
    if (metrics.length === 0) return 0;

    const metric = metrics.find((m) => m.name === condition.metricName);
    return metric?.value || 0;
  }

  private extractSpecificMetricValue(condition: Condition): number | string {
    const metrics = this.context.currentData.metrics || [];
    const metric = metrics.find((m) => m.name === condition.metricName);
    return metric?.value || 0;
  }

  private extractCustomSelectorValue(condition: Condition): string {
    // This would need to be implemented with actual DOM parsing
    // For now, return empty string
    return "";
  }

  private extractElementCount(condition: Condition): number {
    // This would need to be implemented with actual DOM parsing
    // For now, return 0
    return 0;
  }

  private extractElementText(condition: Condition): string {
    // This would need to be implemented with actual DOM parsing
    // For now, return empty string
    return "";
  }

  private extractElementAttribute(condition: Condition): string {
    // This would need to be implemented with actual DOM parsing
    // For now, return empty string
    return "";
  }

  private extractSocialFollowers(condition: Condition): number {
    const socialData = this.context.currentData.socialMedia;
    if (!socialData || !condition.socialPlatform) return 0;

    const platform = socialData[condition.socialPlatform];
    if (!platform) return 0;

    // Type-safe access based on platform type
    switch (condition.socialPlatform) {
      case "facebook":
        return 0; // Facebook doesn't have a followers field in our interface
      case "twitter":
        return "followers" in platform ? platform.followers || 0 : 0;
      case "instagram":
        return "followers" in platform ? platform.followers || 0 : 0;
      case "youtube":
        return "subscribers" in platform ? platform.subscribers || 0 : 0;
      default:
        return 0;
    }
  }

  private extractSocialEngagement(condition: Condition): number {
    const socialData = this.context.currentData.socialMedia;
    if (!socialData || !condition.socialPlatform) return 0;

    const platform = socialData[condition.socialPlatform];
    if (!platform) return 0;

    // Type-safe access based on platform type
    switch (condition.socialPlatform) {
      case "facebook":
        // Facebook might have likes, shares, or comments
        if ("likes" in platform) return platform.likes || 0;
        if ("shares" in platform) return platform.shares || 0;
        if ("comments" in platform) return platform.comments || 0;
        return 0;
      case "twitter":
        return "engagement" in platform ? platform.engagement || 0 : 0;
      case "instagram":
        return "engagement" in platform ? platform.engagement || 0 : 0;
      case "youtube":
        return "views" in platform ? platform.views || 0 : 0;
      default:
        return 0;
    }
  }

  private compareValues(condition: Condition, actualValue: any): boolean {
    const { operator, value, threshold, caseSensitive, regex } = condition;

    switch (operator) {
      case "equals":
        return this.isEqual(actualValue, value, caseSensitive);

      case "not_equals":
        return !this.isEqual(actualValue, value, caseSensitive);

      case "greater_than":
        return this.toNumber(actualValue) > this.toNumber(value);

      case "less_than":
        return this.toNumber(actualValue) < this.toNumber(value);

      case "greater_than_or_equal":
        return this.toNumber(actualValue) >= this.toNumber(value);

      case "less_than_or_equal":
        return this.toNumber(actualValue) <= this.toNumber(value);

      case "contains":
        return this.toString(actualValue, caseSensitive).includes(
          this.toString(value, caseSensitive),
        );

      case "not_contains":
        return !this.toString(actualValue, caseSensitive).includes(
          this.toString(value, caseSensitive),
        );

      case "starts_with":
        return this.toString(actualValue, caseSensitive).startsWith(
          this.toString(value, caseSensitive),
        );

      case "ends_with":
        return this.toString(actualValue, caseSensitive).endsWith(
          this.toString(value, caseSensitive),
        );

      case "exists":
        return (
          actualValue !== null &&
          actualValue !== undefined &&
          actualValue !== ""
        );

      case "not_exists":
        return (
          actualValue === null ||
          actualValue === undefined ||
          actualValue === ""
        );

      case "changed":
        return this.hasChanged(condition, actualValue);

      case "not_changed":
        return !this.hasChanged(condition, actualValue);

      case "increased":
        return this.hasIncreased(condition, actualValue);

      case "decreased":
        return this.hasDecreased(condition, actualValue);

      case "percentage_increase":
        return this.hasPercentageIncrease(
          condition,
          actualValue,
          threshold || 0,
        );

      case "percentage_decrease":
        return this.hasPercentageDecrease(
          condition,
          actualValue,
          threshold || 0,
        );

      case "regex_match":
        return regex
          ? new RegExp(regex, caseSensitive ? "g" : "gi").test(
              this.toString(actualValue, caseSensitive),
            )
          : false;

      case "regex_not_match":
        return regex
          ? !new RegExp(regex, caseSensitive ? "g" : "gi").test(
              this.toString(actualValue, caseSensitive),
            )
          : true;

      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private isEqual(
    actualValue: any,
    expectedValue: any,
    caseSensitive = false,
  ): boolean {
    if (typeof actualValue === "string" && typeof expectedValue === "string") {
      return caseSensitive
        ? actualValue === expectedValue
        : actualValue.toLowerCase() === expectedValue.toLowerCase();
    }
    return actualValue === expectedValue;
  }

  private toNumber(value: any): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = parseFloat(value.replace(/[^\d.-]/g, ""));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  private toString(value: any, caseSensitive = false): string {
    const str = String(value || "");
    return caseSensitive ? str : str.toLowerCase();
  }

  private hasChanged(condition: Condition, actualValue: any): boolean {
    if (!this.context.previousData) return false;

    const previousValue = this.extractValueFromData(
      condition,
      this.context.previousData,
    );
    return !this.isEqual(actualValue, previousValue);
  }

  private hasIncreased(condition: Condition, actualValue: any): boolean {
    if (!this.context.previousData) return false;

    const previousValue = this.extractValueFromData(
      condition,
      this.context.previousData,
    );
    return this.toNumber(actualValue) > this.toNumber(previousValue);
  }

  private hasDecreased(condition: Condition, actualValue: any): boolean {
    if (!this.context.previousData) return false;

    const previousValue = this.extractValueFromData(
      condition,
      this.context.previousData,
    );
    return this.toNumber(actualValue) < this.toNumber(previousValue);
  }

  private hasPercentageIncrease(
    condition: Condition,
    actualValue: any,
    threshold: number,
  ): boolean {
    if (!this.context.previousData) return false;

    const previousValue = this.extractValueFromData(
      condition,
      this.context.previousData,
    );
    const currentNum = this.toNumber(actualValue);
    const previousNum = this.toNumber(previousValue);

    if (previousNum === 0) return currentNum > 0;

    const percentageChange =
      ((currentNum - previousNum) / Math.abs(previousNum)) * 100;
    return percentageChange >= threshold;
  }

  private hasPercentageDecrease(
    condition: Condition,
    actualValue: any,
    threshold: number,
  ): boolean {
    if (!this.context.previousData) return false;

    const previousValue = this.extractValueFromData(
      condition,
      this.context.previousData,
    );
    const currentNum = this.toNumber(actualValue);
    const previousNum = this.toNumber(previousValue);

    if (previousNum === 0) return false;

    const percentageChange =
      ((previousNum - currentNum) / Math.abs(previousNum)) * 100;
    return percentageChange >= threshold;
  }

  private extractValueFromData(condition: Condition, data: ScrapedData): any {
    // Create a temporary context to extract value from historical data
    const tempContext = { ...this.context, currentData: data };
    const tempEvaluator = new ConditionEvaluator(tempContext);
    return tempEvaluator.extractValue(condition);
  }

  private calculateGroupResult(
    operator: "AND" | "OR",
    results: (EvaluationResult | GroupEvaluationResult)[],
  ): boolean {
    if (results.length === 0) return false;

    if (operator === "AND") {
      return results.every((result) => result.passed);
    } else {
      return results.some((result) => result.passed);
    }
  }

  private generateMessage(
    condition: Condition,
    actualValue: any,
    passed: boolean,
  ): string {
    const { field, operator, value } = condition;

    const fieldName = this.getFieldDisplayName(field);
    const operatorName = this.getOperatorDisplayName(operator);

    if (passed) {
      return `✓ ${fieldName} ${operatorName} expected value`;
    } else {
      return `✗ ${fieldName} ${operatorName} expected value (actual: ${actualValue}, expected: ${value})`;
    }
  }

  private generateGroupMessage(
    group: ConditionGroup,
    results: (EvaluationResult | GroupEvaluationResult)[],
    passed: boolean,
  ): string {
    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;

    if (passed) {
      return `✓ Condition group passed (${passedCount}/${totalCount} conditions met with ${group.operator} logic)`;
    } else {
      return `✗ Condition group failed (${passedCount}/${totalCount} conditions met with ${group.operator} logic)`;
    }
  }

  private getFieldDisplayName(field: ConditionField): string {
    const fieldNames: Record<ConditionField, string> = {
      title: "Page Title",
      text: "Page Text",
      html: "HTML Content",
      status_code: "Status Code",
      response_time: "Response Time",
      price: "Price",
      specific_price: "Specific Price",
      metric: "Metric",
      specific_metric: "Specific Metric",
      performance_load_time: "Load Time",
      performance_fcp: "First Contentful Paint",
      performance_lcp: "Largest Contentful Paint",
      performance_cls: "Cumulative Layout Shift",
      performance_fid: "First Input Delay",
      seo_title: "SEO Title",
      seo_description: "SEO Description",
      seo_h1_count: "H1 Tag Count",
      seo_image_alt_ratio: "Image Alt Text Ratio",
      custom_selector: "Custom Element",
      element_count: "Element Count",
      element_text: "Element Text",
      element_attribute: "Element Attribute",
      social_followers: "Social Followers",
      social_engagement: "Social Engagement",
    };

    return fieldNames[field] || field;
  }

  private getOperatorDisplayName(operator: ConditionOperator): string {
    const operatorNames: Record<ConditionOperator, string> = {
      equals: "equals",
      not_equals: "does not equal",
      greater_than: "is greater than",
      less_than: "is less than",
      greater_than_or_equal: "is greater than or equal to",
      less_than_or_equal: "is less than or equal to",
      contains: "contains",
      not_contains: "does not contain",
      starts_with: "starts with",
      ends_with: "ends with",
      exists: "exists",
      not_exists: "does not exist",
      changed: "has changed",
      not_changed: "has not changed",
      increased: "has increased",
      decreased: "has decreased",
      percentage_increase: "increased by percentage",
      percentage_decrease: "decreased by percentage",
      regex_match: "matches regex",
      regex_not_match: "does not match regex",
    };

    return operatorNames[operator] || operator;
  }

  private getEvaluationDetails(condition: Condition, actualValue: any): any {
    return {
      field: condition.field,
      operator: condition.operator,
      expectedValue: condition.value,
      actualValue,
      selector: condition.selector,
      metricName: condition.metricName,
      threshold: condition.threshold,
      timestamp: this.context.timestamp,
    };
  }

  // Static utility methods
  static evaluateConditions(
    conditions: Condition[],
    context: ConditionEvaluationContext,
  ): EvaluationResult[] {
    const evaluator = new ConditionEvaluator(context);
    return conditions.map((condition) =>
      evaluator.evaluateCondition(condition),
    );
  }

  static evaluateConditionGroups(
    groups: ConditionGroup[],
    context: ConditionEvaluationContext,
  ): GroupEvaluationResult[] {
    const evaluator = new ConditionEvaluator(context);
    return groups.map((group) => evaluator.evaluateConditionGroup(group));
  }
}

// Predefined condition templates for common use cases
export const ConditionTemplates = {
  // Price monitoring
  priceIncrease: (priceSelector: string, threshold: number): Condition => ({
    id: "price_increase",
    field: "specific_price",
    operator: "percentage_increase",
    value: 0,
    priceSelector,
    threshold,
  }),

  priceDecrease: (priceSelector: string, threshold: number): Condition => ({
    id: "price_decrease",
    field: "specific_price",
    operator: "percentage_decrease",
    value: 0,
    priceSelector,
    threshold,
  }),

  priceAbove: (priceSelector: string, maxPrice: number): Condition => ({
    id: "price_above",
    field: "specific_price",
    operator: "greater_than",
    value: maxPrice,
    priceSelector,
  }),

  priceBelow: (priceSelector: string, minPrice: number): Condition => ({
    id: "price_below",
    field: "specific_price",
    operator: "less_than",
    value: minPrice,
    priceSelector,
  }),

  // Performance monitoring
  slowLoadTime: (maxLoadTime: number): Condition => ({
    id: "slow_load_time",
    field: "performance_load_time",
    operator: "greater_than",
    value: maxLoadTime,
  }),

  poorFCP: (maxFCP: number): Condition => ({
    id: "poor_fcp",
    field: "performance_fcp",
    operator: "greater_than",
    value: maxFCP,
  }),

  // Content monitoring
  contentChanged: (selector: string): Condition => ({
    id: "content_changed",
    field: "element_text",
    operator: "changed",
    value: null,
    selector,
  }),

  titleContains: (keyword: string): Condition => ({
    id: "title_contains",
    field: "title",
    operator: "contains",
    value: keyword,
    caseSensitive: false,
  }),

  // SEO monitoring
  seoTitleTooLong: (maxLength: number): Condition => ({
    id: "seo_title_too_long",
    field: "seo_title",
    operator: "greater_than",
    value: maxLength,
  }),

  missingH1: (): Condition => ({
    id: "missing_h1",
    field: "seo_h1_count",
    operator: "equals",
    value: 0,
  }),

  // Campaign monitoring
  cpmIncrease: (metricName: string, threshold: number): Condition => ({
    id: "cpm_increase",
    field: "specific_metric",
    operator: "percentage_increase",
    value: 0,
    metricName,
    threshold,
  }),

  // Social media monitoring
  followersDecrease: (
    platform: "facebook" | "twitter" | "instagram" | "youtube",
    threshold: number,
  ): Condition => ({
    id: "followers_decrease",
    field: "social_followers",
    operator: "percentage_decrease",
    value: 0,
    socialPlatform: platform,
    threshold,
  }),
};

export default ConditionEvaluator;
