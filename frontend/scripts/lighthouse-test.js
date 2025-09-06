#!/usr/bin/env node

/**
 * Lighthouse Performance Test Script
 * 
 * This script runs Lighthouse audits on the landing page to ensure
 * performance, accessibility, SEO, and best practices scores meet requirements.
 * 
 * Requirements:
 * - Performance ≥ 90
 * - Accessibility ≥ 90  
 * - SEO ≥ 90
 * - Best Practices ≥ 90
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  url: 'http://localhost:3000',
  outputDir: './lighthouse-reports',
  thresholds: {
    performance: 90,
    accessibility: 90,
    seo: 90,
    bestPractices: 90
  }
};

// Lighthouse configuration
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      'interactive',
      'uses-responsive-images',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-text-compression',
      'uses-rel-preconnect',
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'efficient-animated-content',
      'preload-lcp-image',
      'color-contrast',
      'image-alt',
      'label',
      'link-name',
      'button-name',
      'html-has-lang',
      'html-lang-valid',
      'meta-description',
      'document-title',
      'hreflang',
      'canonical',
      'robots-txt',
      'structured-data',
      'viewport',
      'tap-targets',
      'font-display',
      'crawlable-anchors',
      'is-crawlable',
      'robots-meta-tag',
      'h1',
      'heading-order',
      'bypass',
      'focus-traps',
      'focusable-controls',
      'interactive-element-affordance',
      'logical-tab-order',
      'managed-focus',
      'offscreen-content-hidden',
      'use-landmarks',
      'visual-order-follows-dom'
    ]
  }
};

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse audit...');
  console.log(`📊 Testing URL: ${CONFIG.url}`);
  
  // Create output directory
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu']
  });

  try {
    // Run Lighthouse
    const runnerResult = await lighthouse(CONFIG.url, {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'info',
      ...lighthouseConfig
    });

    const { lhr } = runnerResult;
    
    // Extract scores
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100)
    };

    // Display results
    console.log('\n📈 Lighthouse Results:');
    console.log('====================');
    console.log(`Performance: ${scores.performance}/100 ${scores.performance >= CONFIG.thresholds.performance ? '✅' : '❌'}`);
    console.log(`Accessibility: ${scores.accessibility}/100 ${scores.accessibility >= CONFIG.thresholds.accessibility ? '✅' : '❌'}`);
    console.log(`SEO: ${scores.seo}/100 ${scores.seo >= CONFIG.thresholds.seo ? '✅' : '❌'}`);
    console.log(`Best Practices: ${scores.bestPractices}/100 ${scores.bestPractices >= CONFIG.thresholds.bestPractices ? '✅' : '❌'}`);

    // Check if all thresholds are met
    const allPassed = Object.entries(scores).every(([category, score]) => 
      score >= CONFIG.thresholds[category]
    );

    if (allPassed) {
      console.log('\n🎉 All Lighthouse thresholds met!');
    } else {
      console.log('\n⚠️  Some Lighthouse thresholds not met:');
      Object.entries(scores).forEach(([category, score]) => {
        if (score < CONFIG.thresholds[category]) {
          console.log(`   - ${category}: ${score} < ${CONFIG.thresholds[category]}`);
        }
      });
    }

    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlReport = path.join(CONFIG.outputDir, `lighthouse-report-${timestamp}.html`);
    const jsonReport = path.join(CONFIG.outputDir, `lighthouse-report-${timestamp}.json`);

    fs.writeFileSync(htmlReport, runnerResult.report[0]);
    fs.writeFileSync(jsonReport, runnerResult.report[1]);

    console.log(`\n📄 Reports saved:`);
    console.log(`   HTML: ${htmlReport}`);
    console.log(`   JSON: ${jsonReport}`);

    // Detailed audit results
    console.log('\n🔍 Key Audit Results:');
    console.log('====================');
    
    const keyAudits = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'color-contrast',
      'image-alt',
      'meta-description',
      'document-title'
    ];

    keyAudits.forEach(auditId => {
      const audit = lhr.audits[auditId];
      if (audit) {
        const status = audit.score === 1 ? '✅' : audit.score === 0 ? '❌' : '⚠️';
        console.log(`${status} ${audit.title}: ${audit.displayValue || audit.description}`);
      }
    });

    return allPassed;

  } finally {
    await chrome.kill();
  }
}

// Run the audit
if (require.main === module) {
  runLighthouse()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Lighthouse audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runLighthouse, CONFIG };
