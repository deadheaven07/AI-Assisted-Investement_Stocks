import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFutureValue, generateSipProjection, formatINR } from './calc';

test('calculateFutureValue handles zero interest correctly', () => {
  // 10,000 lump sum + 1,000/mo for 12 months with 0% interest = 22,000
  const result = calculateFutureValue(10000, 1000, 12, 0);
  assert.equal(result, 22000);
});

test('calculateFutureValue handles lump sum only with compound interest', () => {
  // 100,000 lump sum at 12% annual rate for 12 months:
  // monthly rate i = 0.01. FV = 100000 * (1.01)^12 = 112682.50
  const result = calculateFutureValue(100000, 0, 12, 12);
  const expected = Math.round(100000 * Math.pow(1.01, 12) * 100) / 100;
  assert.equal(result, expected);
});

test('calculateFutureValue handles monthly SIP only with annuity due formula', () => {
  // 5,000 monthly SIP at 12% for 12 months:
  // i = 0.01. FV = 5000 * [((1.01)^12 - 1) / 0.01] * 1.01
  const i = 0.01;
  const n = 12;
  const expected = Math.round(5000 * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) * 100) / 100;
  const result = calculateFutureValue(0, 5000, 12, 12);
  assert.equal(result, expected);
});

test('generateSipProjection produces accurate yearly breakdowns', () => {
  const projection = generateSipProjection({
    lumpSum: 50000,
    monthlySip: 5000,
    horizonYears: 5,
    badRatePercent: 6,
    normalRatePercent: 11,
    goodRatePercent: 15,
  });

  // Length should be 6 (Year 0 through Year 5)
  assert.equal(projection.length, 6);

  // Year 0
  assert.equal(projection[0].year, 0);
  assert.equal(projection[0].totalInvested, 50000);
  assert.equal(projection[0].badCase, 50000);
  assert.equal(projection[0].normalCase, 50000);
  assert.equal(projection[0].goodCase, 50000);

  // Year 5 total invested: 50,000 + 5,000 * 60 = 3,50,000
  assert.equal(projection[5].year, 5);
  assert.equal(projection[5].totalInvested, 350000);

  // Growth cases hierarchy: good > normal > bad > totalInvested (at positive compounding)
  assert.ok(projection[5].goodCase > projection[5].normalCase);
  assert.ok(projection[5].normalCase > projection[5].badCase);
  assert.ok(projection[5].badCase > projection[5].totalInvested);
});

test('formatINR formats numbers with Indian numbering style', () => {
  assert.equal(formatINR(1000), '₹1,000');
  assert.equal(formatINR(150000), '₹1,50,000');
  assert.equal(formatINR(10000000), '₹1,00,00,000');
});
