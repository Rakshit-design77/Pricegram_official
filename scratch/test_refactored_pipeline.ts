// Pre-initialize environment variables before importing modules that run validateEnvironment() at startup
process.env.VALUESERP_API_KEY = 'test_key';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_clerk_pub';
process.env.CLERK_SECRET_KEY = 'test_clerk_secret';

import { validateEnvironment } from '../src/lib/env';
import {
  extractShoppingResults,
  detectMerchant,
  validateProduct,
  normalizeProductTitle,
} from '../src/lib/scrapers/valueserp';
import { calculateTokenOverlap } from '../src/app/api/search/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${message}`);
  }
  console.log(`[PASS] ${message}`);
}


function testEnvironment() {
  console.log('\n--- Testing Environment Validation ---');
  // Set mock environment variables
  process.env.VALUESERP_API_KEY = 'test_key';
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_clerk_pub';
  process.env.CLERK_SECRET_KEY = 'test_clerk_secret';

  try {
    validateEnvironment();
    assert(true, 'validateEnvironment succeeds when all keys are present');
  } catch (err) {
    assert(false, 'validateEnvironment should succeed when keys are present');
  }

  // Test missing keys
  delete process.env.VALUESERP_API_KEY;
  try {
    validateEnvironment();
    assert(false, 'validateEnvironment should fail when VALUESERP_API_KEY is missing');
  } catch (err: any) {
    assert(err.message.includes('VALUESERP_API_KEY'), 'validateEnvironment throws correct error for missing key');
  }
}

function testParsing() {
  console.log('\n--- Testing Defensive Schema Parsing ---');
  
  const testData1 = {
    shopping_results: [{ title: 'Item 1' }]
  };
  const res1 = extractShoppingResults(testData1);
  assert(res1.length === 1 && res1[0].title === 'Item 1', 'Correctly parses flat shopping_results array');

  const testData2 = {
    shopping_results: {
      results: [{ title: 'Item 2' }]
    }
  };
  const res2 = extractShoppingResults(testData2);
  assert(res2.length === 1 && res2[0].title === 'Item 2', 'Correctly parses nested shopping_results.results array');

  const testData3 = {
    inline_shopping_results: [{ title: 'Item 3' }]
  };
  const res3 = extractShoppingResults(testData3);
  assert(res3.length === 1 && res3[0].title === 'Item 3', 'Correctly parses flat inline_shopping_results array');

  const testData4 = null;
  const res4 = extractShoppingResults(testData4);
  assert(res4.length === 0, 'Safely handles null/undefined data');
}

function testMerchantDetection() {
  console.log('\n--- Testing Merchant Mapping ---');
  
  assert(detectMerchant({ merchant: 'Amazon India' }) === 'Amazon', 'Maps "Amazon India" to canonical "Amazon"');
  assert(detectMerchant({ source_name: 'amazon.in' }) === 'Amazon', 'Maps "amazon.in" to canonical "Amazon"');
  assert(detectMerchant({ merchant: 'Flipkart' }) === 'Flipkart', 'Maps "Flipkart" to canonical "Flipkart"');
  assert(detectMerchant({ source: 'Blinkit' }) === 'Blinkit', 'Maps "Blinkit" to canonical "Blinkit"');
  assert(detectMerchant({ merchant: 'swiggy instamart' }) === 'Swiggy Instamart', 'Maps "swiggy instamart" to canonical "Swiggy Instamart"');
  assert(detectMerchant({ domain: 'www.reliancedigital.in' }) === 'Reliancedigital', 'Maps domain to capitalized platform name');
}

function testProductValidation() {
  console.log('\n--- Testing Product Validation ---');
  
  const validProduct = {
    title: 'Apple iPhone 15 Pro',
    price: 120000,
    platform: 'Amazon',
  };
  assert(validateProduct(validProduct) === true, 'Accepts valid product');

  const invalidProductPrice = {
    title: 'Apple iPhone 15 Pro',
    price: 0,
    platform: 'Amazon',
  };
  assert(validateProduct(invalidProductPrice) === false, 'Rejects product with price <= 0');

  const invalidProductTitle = {
    title: 'Ap',
    price: 100,
    platform: 'Amazon',
  };
  assert(validateProduct(invalidProductTitle) === false, 'Rejects product with title length < 3');

  const invalidProductPlatform = {
    title: 'Apple iPhone 15 Pro',
    price: 100,
    platform: '',
  };
  assert(validateProduct(invalidProductPlatform) === false, 'Rejects product with missing platform');
}

function testTitleNormalizationAndSimilarity() {
  console.log('\n--- Testing Title Normalization & Jaccard Similarity ---');
  
  const rawTitle = 'Apple iPhone 15 Pro 128GB Blue';
  const normTitle = normalizeProductTitle(rawTitle);
  assert(normTitle === 'apple iphone 15 pro 128gb blue', 'Correctly normalizes raw product title');

  // Competitors matching: Same model, different storage/color should match (>= 0.4 similarity)
  const score1 = calculateTokenOverlap('Apple iPhone 15 Pro 128GB Blue', 'Apple iPhone 15 Pro 256GB Black');
  assert(score1 >= 0.4, `Same model similarity (${score1.toFixed(3)}) is >= 0.4`);

  // Different models should not match (< 0.4 similarity)
  const score2 = calculateTokenOverlap('Apple iPhone 15 Pro 128GB Blue', 'Samsung Galaxy S24 Ultra');
  assert(score2 < 0.4, `Different models similarity (${score2.toFixed(3)}) is < 0.4`);

  const score3 = calculateTokenOverlap('Apple iPhone 15 Pro 128GB Blue', 'Apple MacBook Air M3');
  assert(score3 < 0.4, `Different products similarity (${score3.toFixed(3)}) is < 0.4`);
}

function runTests() {
  try {
    testEnvironment();
    testParsing();
    testMerchantDetection();
    testProductValidation();
    testTitleNormalizationAndSimilarity();
    console.log('\n[SUCCESS] All unit tests passed successfully!');
  } catch (error) {
    console.error('\n[FAILURE] Unit test run failed:', error);
    process.exit(1);
  }
}

runTests();
