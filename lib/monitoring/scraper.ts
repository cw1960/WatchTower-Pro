import puppeteer, { Browser, Page } from 'puppeteer';
import { MonitorType } from '@prisma/client';

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedData;
  error?: string;
  responseTime: number;
  timestamp: Date;
}

export interface ScrapedData {
  html?: string;
  text?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain: string }>;
  title?: string;
  description?: string;
  keywords?: string[];
  images?: string[];
  links?: string[];
  prices?: PriceData[];
  metrics?: MetricData[];
  performance?: PerformanceData;
  seo?: SEOData;
  accessibility?: AccessibilityData;
  socialMedia?: SocialMediaData;
}

export interface PriceData {
  element: string;
  price: number;
  currency: string;
  selector: string;
  text: string;
}

export interface MetricData {
  name: string;
  value: number | string;
  unit?: string;
  selector: string;
  element: string;
}

export interface PerformanceData {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  resourcesCount: number;
  totalSize: number;
}

export interface SEOData {
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  imageAltTags: number;
  totalImages: number;
  internalLinks: number;
  externalLinks: number;
  canonicalUrl?: string;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  structuredData: any[];
}

export interface AccessibilityData {
  score: number;
  issues: Array<{
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    selector?: string;
  }>;
}

export interface SocialMediaData {
  facebook?: {
    likes?: number;
    shares?: number;
    comments?: number;
  };
  twitter?: {
    followers?: number;
    tweets?: number;
    engagement?: number;
  };
  instagram?: {
    followers?: number;
    posts?: number;
    engagement?: number;
  };
  youtube?: {
    subscribers?: number;
    views?: number;
    videos?: number;
  };
}

export interface ScrapeOptions {
  url: string;
  timeout?: number;
  waitForSelector?: string;
  waitForTimeout?: number;
  screenshot?: boolean;
  fullPageScreenshot?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain: string }>;
  proxy?: string;
  javascript?: boolean;
  extractPrices?: boolean;
  priceSelectors?: string[];
  extractMetrics?: boolean;
  metricSelectors?: Array<{ name: string; selector: string; type: 'text' | 'number' }>;
  extractPerformance?: boolean;
  extractSEO?: boolean;
  extractAccessibility?: boolean;
  extractSocialMedia?: boolean;
  customSelectors?: Record<string, string>;
  actions?: Array<{
    type: 'click' | 'type' | 'select' | 'wait' | 'scroll';
    selector?: string;
    value?: string;
    delay?: number;
  }>;
}

class WebScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const startTime = Date.now();
    
    try {
      await this.initBrowser();
      
      if (!this.browser) {
        throw new Error('Failed to initialize browser');
      }

      this.page = await this.browser.newPage();
      
      // Set user agent
      if (options.userAgent) {
        await this.page.setUserAgent(options.userAgent);
      }

      // Set viewport
      if (options.viewport) {
        await this.page.setViewport(options.viewport);
      }

      // Set headers
      if (options.headers) {
        await this.page.setExtraHTTPHeaders(options.headers);
      }

      // Set cookies
      if (options.cookies) {
        await this.page.setCookie(...options.cookies);
      }

      // Enable/disable JavaScript
      if (options.javascript === false) {
        await this.page.setJavaScriptEnabled(false);
      }

      // Navigate to URL
      const response = await this.page.goto(options.url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });

      if (!response) {
        throw new Error('Failed to load page');
      }

      // Wait for specific selector if provided
      if (options.waitForSelector) {
        await this.page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 30000
        });
      }

      // Wait for additional timeout if specified
      if (options.waitForTimeout) {
        await new Promise(resolve => setTimeout(resolve, options.waitForTimeout));
      }

      // Perform custom actions
      if (options.actions) {
        for (const action of options.actions) {
          await this.performAction(action);
        }
      }

      // Extract data
      const data = await this.extractData(options);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data,
        responseTime,
        timestamp: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        timestamp: new Date()
      };
    } finally {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
    }
  }

  private async performAction(action: ScrapeOptions['actions'][0]): Promise<void> {
    if (!this.page) return;

    switch (action.type) {
      case 'click':
        if (action.selector) {
          await this.page.click(action.selector);
          if (action.delay) {
            await this.page.waitForTimeout(action.delay);
          }
        }
        break;
      case 'type':
        if (action.selector && action.value) {
          await this.page.type(action.selector, action.value);
          if (action.delay) {
            await this.page.waitForTimeout(action.delay);
          }
        }
        break;
      case 'select':
        if (action.selector && action.value) {
          await this.page.select(action.selector, action.value);
          if (action.delay) {
            await this.page.waitForTimeout(action.delay);
          }
        }
        break;
      case 'wait':
        if (action.selector) {
          await this.page.waitForSelector(action.selector);
        } else if (action.delay) {
          await this.page.waitForTimeout(action.delay);
        }
        break;
      case 'scroll':
        await this.page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        if (action.delay) {
          await this.page.waitForTimeout(action.delay);
        }
        break;
    }
  }

  private async extractData(options: ScrapeOptions): Promise<ScrapedData> {
    if (!this.page) throw new Error('Page not initialized');

    const data: ScrapedData = {};

    // Basic page data
    data.html = await this.page.content();
    data.text = await this.page.evaluate(() => document.body.innerText);
    data.title = await this.page.title();
    data.statusCode = this.page.url() ? 200 : 404; // Simplified status code

    // Headers
    const response = await this.page.goto(this.page.url());
    if (response) {
      data.headers = response.headers();
    }

    // Cookies
    const cookies = await this.page.cookies();
    data.cookies = cookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain
    }));

    // Extract prices if requested
    if (options.extractPrices) {
      data.prices = await this.extractPrices(options.priceSelectors);
    }

    // Extract metrics if requested
    if (options.extractMetrics) {
      data.metrics = await this.extractMetrics(options.metricSelectors);
    }

    // Extract performance data if requested
    if (options.extractPerformance) {
      data.performance = await this.extractPerformance();
    }

    // Extract SEO data if requested
    if (options.extractSEO) {
      data.seo = await this.extractSEO();
    }

    // Extract accessibility data if requested
    if (options.extractAccessibility) {
      data.accessibility = await this.extractAccessibility();
    }

    // Extract social media data if requested
    if (options.extractSocialMedia) {
      data.socialMedia = await this.extractSocialMedia();
    }

    // Extract custom selectors
    if (options.customSelectors) {
      for (const [key, selector] of Object.entries(options.customSelectors)) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            const value = await element.evaluate(el => el.textContent || el.innerText || '');
            (data as any)[key] = value.trim();
          }
        } catch (error) {
          console.warn(`Failed to extract custom selector ${key}:`, error);
        }
      }
    }

    return data;
  }

  private async extractPrices(selectors?: string[]): Promise<PriceData[]> {
    if (!this.page) return [];

    const defaultPriceSelectors = [
      '[data-price]',
      '.price',
      '.cost',
      '.amount',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="amount"]'
    ];

    const priceSelectors = selectors || defaultPriceSelectors;
    const prices: PriceData[] = [];

    for (const selector of priceSelectors) {
      try {
        const elements = await this.page.$$(selector);
        
        for (const element of elements) {
          const text = await element.evaluate(el => el.textContent || el.innerText || '');
          const priceMatch = text.match(/[\$£€¥₹]\s*(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*[\$£€¥₹]/);
          
          if (priceMatch) {
            const priceValue = parseFloat(priceMatch[1] || priceMatch[2]);
            const currency = text.match(/[\$£€¥₹]/)?.[0] || '$';
            
            prices.push({
              element: selector,
              price: priceValue,
              currency,
              selector,
              text: text.trim()
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to extract prices from selector ${selector}:`, error);
      }
    }

    return prices;
  }

  private async extractMetrics(selectors?: Array<{ name: string; selector: string; type: 'text' | 'number' }>): Promise<MetricData[]> {
    if (!this.page || !selectors) return [];

    const metrics: MetricData[] = [];

    for (const { name, selector, type } of selectors) {
      try {
        const element = await this.page.$(selector);
        
        if (element) {
          const text = await element.evaluate(el => el.textContent || el.innerText || '');
          let value: string | number = text.trim();

          if (type === 'number') {
            const numMatch = text.match(/[\d,]+\.?\d*/);
            if (numMatch) {
              value = parseFloat(numMatch[0].replace(/,/g, ''));
            }
          }

          metrics.push({
            name,
            value,
            selector,
            element: selector
          });
        }
      } catch (error) {
        console.warn(`Failed to extract metric ${name} from selector ${selector}:`, error);
      }
    }

    return metrics;
  }

  private async extractPerformance(): Promise<PerformanceData> {
    if (!this.page) throw new Error('Page not initialized');

    const performanceData = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        resourcesCount: performance.getEntriesByType('resource').length,
        totalSize: performance.getEntriesByType('resource').reduce((total, resource) => {
          return total + (resource as PerformanceResourceTiming).transferSize;
        }, 0)
      };
    });

    return {
      ...performanceData,
      largestContentfulPaint: 0, // Would need additional LCP measurement
      cumulativeLayoutShift: 0,  // Would need additional CLS measurement
      firstInputDelay: 0         // Would need additional FID measurement
    };
  }

  private async extractSEO(): Promise<SEOData> {
    if (!this.page) throw new Error('Page not initialized');

    const seoData = await this.page.evaluate(() => {
      const title = document.title || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const h1Tags = Array.from(document.querySelectorAll('h1')).map(h1 => h1.textContent || '');
      const h2Tags = Array.from(document.querySelectorAll('h2')).map(h2 => h2.textContent || '');
      const images = document.querySelectorAll('img');
      const imageAltTags = Array.from(images).filter(img => img.alt).length;
      const totalImages = images.length;
      const internalLinks = Array.from(document.querySelectorAll('a[href]')).filter(link => {
        const href = link.getAttribute('href') || '';
        return href.startsWith('/') || href.includes(window.location.hostname);
      }).length;
      const externalLinks = Array.from(document.querySelectorAll('a[href]')).filter(link => {
        const href = link.getAttribute('href') || '';
        return href.startsWith('http') && !href.includes(window.location.hostname);
      }).length;
      const canonicalUrl = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      
      // Extract Open Graph tags
      const ogTags: Record<string, string> = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(meta => {
        const property = meta.getAttribute('property')?.replace('og:', '') || '';
        const content = meta.getAttribute('content') || '';
        if (property && content) {
          ogTags[property] = content;
        }
      });

      // Extract Twitter tags
      const twitterTags: Record<string, string> = {};
      document.querySelectorAll('meta[name^="twitter:"]').forEach(meta => {
        const name = meta.getAttribute('name')?.replace('twitter:', '') || '';
        const content = meta.getAttribute('content') || '';
        if (name && content) {
          twitterTags[name] = content;
        }
      });

      // Extract structured data
      const structuredData: any[] = [];
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          const data = JSON.parse(script.textContent || '');
          structuredData.push(data);
        } catch (error) {
          console.warn('Failed to parse structured data:', error);
        }
      });

      return {
        title,
        metaDescription,
        h1Tags,
        h2Tags,
        imageAltTags,
        totalImages,
        internalLinks,
        externalLinks,
        canonicalUrl,
        ogTags,
        twitterTags,
        structuredData
      };
    });

    return seoData;
  }

  private async extractAccessibility(): Promise<AccessibilityData> {
    if (!this.page) throw new Error('Page not initialized');

    const accessibilityData = await this.page.evaluate(() => {
      const issues: Array<{
        type: string;
        severity: 'error' | 'warning' | 'info';
        message: string;
        selector?: string;
      }> = [];

      // Check for images without alt text
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      imagesWithoutAlt.forEach((img, index) => {
        issues.push({
          type: 'missing-alt-text',
          severity: 'error',
          message: 'Image missing alt text',
          selector: `img:nth-child(${index + 1})`
        });
      });

      // Check for form inputs without labels
      const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputsWithoutLabels.forEach((input, index) => {
        const id = input.getAttribute('id');
        if (id && !document.querySelector(`label[for="${id}"]`)) {
          issues.push({
            type: 'missing-label',
            severity: 'error',
            message: 'Form input missing label',
            selector: `input#${id}`
          });
        }
      });

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastHeadingLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastHeadingLevel + 1) {
          issues.push({
            type: 'heading-structure',
            severity: 'warning',
            message: `Heading level ${level} follows level ${lastHeadingLevel} - should be sequential`,
            selector: `${heading.tagName.toLowerCase()}:nth-child(${index + 1})`
          });
        }
        lastHeadingLevel = level;
      });

      const score = Math.max(0, 100 - (issues.length * 10));

      return {
        score,
        issues
      };
    });

    return accessibilityData;
  }

  private async extractSocialMedia(): Promise<SocialMediaData> {
    if (!this.page) throw new Error('Page not initialized');

    const socialMediaData = await this.page.evaluate(() => {
      const data: SocialMediaData = {};

      // Facebook data extraction (example selectors)
      const facebookLikes = document.querySelector('[data-testid="like-count"]')?.textContent;
      if (facebookLikes) {
        data.facebook = {
          likes: parseInt(facebookLikes.replace(/[^\d]/g, '')) || 0
        };
      }

      // Twitter data extraction (example selectors)
      const twitterFollowers = document.querySelector('[data-testid="UserName"] + div')?.textContent;
      if (twitterFollowers) {
        data.twitter = {
          followers: parseInt(twitterFollowers.replace(/[^\d]/g, '')) || 0
        };
      }

      // Instagram data extraction (example selectors)
      const instagramFollowers = document.querySelector('meta[property="instagram:followers"]')?.getAttribute('content');
      if (instagramFollowers) {
        data.instagram = {
          followers: parseInt(instagramFollowers) || 0
        };
      }

      // YouTube data extraction (example selectors)
      const youtubeSubscribers = document.querySelector('#subscriber-count')?.textContent;
      if (youtubeSubscribers) {
        data.youtube = {
          subscribers: parseInt(youtubeSubscribers.replace(/[^\d]/g, '')) || 0
        };
      }

      return data;
    });

    return socialMediaData;
  }

  // Static method for quick scraping without instance management
  static async quickScrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const scraper = new WebScraper();
    try {
      const result = await scraper.scrape(options);
      return result;
    } finally {
      await scraper.closeBrowser();
    }
  }
}

export default WebScraper;

// Utility functions for common scraping patterns
export const ScrapingPresets = {
  // E-commerce price monitoring
  ecommerce: (url: string): ScrapeOptions => ({
    url,
    extractPrices: true,
    priceSelectors: [
      '.price',
      '.cost',
      '.amount',
      '[data-price]',
      '.price-current',
      '.price-now',
      '.sale-price',
      '.regular-price'
    ],
    extractSEO: true,
    waitForSelector: 'body',
    timeout: 30000
  }),

  // Campaign CPM monitoring
  campaign: (url: string, metricSelectors: Array<{ name: string; selector: string; type: 'text' | 'number' }>): ScrapeOptions => ({
    url,
    extractMetrics: true,
    metricSelectors,
    extractPerformance: true,
    timeout: 30000
  }),

  // Competitor analysis
  competitor: (url: string): ScrapeOptions => ({
    url,
    extractSEO: true,
    extractSocialMedia: true,
    extractPerformance: true,
    extractPrices: true,
    fullPageScreenshot: true,
    timeout: 30000
  }),

  // Content monitoring
  content: (url: string, customSelectors: Record<string, string>): ScrapeOptions => ({
    url,
    customSelectors,
    extractSEO: true,
    waitForSelector: 'body',
    timeout: 30000
  })
}; 