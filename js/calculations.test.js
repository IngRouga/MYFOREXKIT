/**
 * Unit tests for calculations.js
 * Run with: node calculations.test.js
 */
const assert = require("assert");
const MFK = require("./calculations.js");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok  - ${name}`);
  } catch (e) {
    console.error(`FAIL - ${name}`);
    console.error(e);
    process.exitCode = 1;
  }
}

console.log("Pip size & pair parsing");
test("non-JPY pair pip size is 0.0001", () => {
  assert.strictEqual(MFK.pipSizeForPair("EUR/USD"), 0.0001);
});
test("JPY pair pip size is 0.01", () => {
  assert.strictEqual(MFK.pipSizeForPair("USD/JPY"), 0.01);
});
test("handles pair without slash", () => {
  assert.strictEqual(MFK.pipSizeForPair("GBPJPY"), 0.01);
});
test("invalid pair returns null", () => {
  assert.strictEqual(MFK.pipSizeForPair("NOTAPAIR"), null);
});

console.log("\nPip value conversion");
test("pip value per lot in quote currency for EUR/USD", () => {
  assert.strictEqual(MFK.pipValuePerLotInQuoteCurrency("EUR/USD"), 10);
});
test("pip value per lot in quote currency for USD/JPY", () => {
  assert.strictEqual(MFK.pipValuePerLotInQuoteCurrency("USD/JPY"), 1000);
});
test("no conversion needed when quote === account currency", () => {
  const r = MFK.pipValuePerLotInAccountCurrency("EUR/USD", "USD", null);
  assert.strictEqual(r.needsRate, false);
  assert.strictEqual(r.value, 10);
});
test("flags needsRate when quote !== account currency and no rate given", () => {
  const r = MFK.pipValuePerLotInAccountCurrency("USD/JPY", "USD", null);
  assert.strictEqual(r.needsRate, true);
  assert.strictEqual(r.value, null);
});
test("converts JPY pip value into USD account currency with a supplied rate", () => {
  // USD/JPY at 150.00 -> 1 JPY = 1/150 USD
  const r = MFK.pipValuePerLotInAccountCurrency("USD/JPY", "USD", 1 / 150);
  assert.ok(Math.abs(r.value - 1000 / 150) < 0.001);
});

console.log("\nLot size calculator");
test("standard EUR/USD example: $10,000 balance, 1% risk, 25 pip stop", () => {
  const r = MFK.computeLotSize({
    accountBalance: 10000,
    riskPercent: 1,
    stopLossPips: 25,
    pipValuePerLot: 10,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.riskAmount, 100);
  assert.strictEqual(r.positionSizeLots, 0.4);
  assert.strictEqual(r.units, 40000);
});
test("rejects zero stop loss (division by zero guard)", () => {
  const r = MFK.computeLotSize({ accountBalance: 10000, riskPercent: 1, stopLossPips: 0, pipValuePerLot: 10 });
  assert.strictEqual(r.ok, false);
});
test("rejects negative account balance", () => {
  const r = MFK.computeLotSize({ accountBalance: -500, riskPercent: 1, stopLossPips: 10, pipValuePerLot: 10 });
  assert.strictEqual(r.ok, false);
});
test("rejects risk percent above 100", () => {
  const r = MFK.computeLotSize({ accountBalance: 10000, riskPercent: 150, stopLossPips: 10, pipValuePerLot: 10 });
  assert.strictEqual(r.ok, false);
});
test("never returns NaN or Infinity", () => {
  const r = MFK.computeLotSize({ accountBalance: 10000, riskPercent: 1, stopLossPips: 25, pipValuePerLot: 10 });
  Object.values(r).forEach((v) => {
    if (typeof v === "number") assert.ok(Number.isFinite(v));
  });
});

console.log("\nRisk calculator");
test("2% risk on $50,000", () => {
  const r = MFK.computeRisk({ accountBalance: 50000, riskPercent: 2 });
  assert.strictEqual(r.riskAmount, 1000);
  assert.strictEqual(r.remainingBalance, 49000);
  assert.strictEqual(r.remainingPercent, 98);
});
test("rejects zero balance", () => {
  const r = MFK.computeRisk({ accountBalance: 0, riskPercent: 1 });
  assert.strictEqual(r.ok, false);
});

console.log("\nRisk/Reward calculator");
test("classic 1:2 buy setup", () => {
  const r = MFK.computeRiskReward({ entry: 1.1000, stop: 1.0950, takeProfit: 1.1100, direction: "buy" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.ratio, 2);
  assert.strictEqual(r.ratioLabel, "1 : 2");
});
test("sell setup with correct direction math", () => {
  const r = MFK.computeRiskReward({ entry: 1.1000, stop: 1.1050, takeProfit: 1.0900, direction: "sell" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.ratio, 2);
});
test("invalid buy setup — stop above entry", () => {
  const r = MFK.computeRiskReward({ entry: 1.1000, stop: 1.1050, takeProfit: 1.1100, direction: "buy" });
  assert.strictEqual(r.ok, false);
});
test("invalid sell setup — take profit above entry", () => {
  const r = MFK.computeRiskReward({ entry: 1.1000, stop: 1.1050, takeProfit: 1.1100, direction: "sell" });
  assert.strictEqual(r.ok, false);
});

console.log("\nDrawdown calculator");
test("safe status when usage is low", () => {
  const r = MFK.computeDrawdown({
    startingBalance: 100000,
    currentEquity: 99000,
    maxDrawdownPercent: 10,
    dailyDrawdownPercent: 5,
    todayStartEquity: 99500,
    currentDailyPL: -100,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.status, "SAFE");
});
test("danger status when close to max drawdown", () => {
  const r = MFK.computeDrawdown({
    startingBalance: 100000,
    currentEquity: 91500,
    maxDrawdownPercent: 10,
    dailyDrawdownPercent: 5,
    todayStartEquity: 92000,
    currentDailyPL: -200,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.status, "DANGER");
});
test("caution status in the middle range", () => {
  const r = MFK.computeDrawdown({
    startingBalance: 100000,
    currentEquity: 94500,
    maxDrawdownPercent: 10,
    dailyDrawdownPercent: 5,
    todayStartEquity: 95000,
    currentDailyPL: -100,
  });
  assert.strictEqual(r.status, "CAUTION");
});
test("positive daily P&L never produces negative loss-used", () => {
  const r = MFK.computeDrawdown({
    startingBalance: 100000,
    currentEquity: 101000,
    maxDrawdownPercent: 10,
    dailyDrawdownPercent: 5,
    todayStartEquity: 100000,
    currentDailyPL: 500,
  });
  assert.strictEqual(r.dailyUsedPct, 0);
  assert.strictEqual(r.status, "SAFE");
});

console.log("\nProfit calculator");
test("buy profit on non-JPY pair", () => {
  const r = MFK.computeProfit({
    pair: "EUR/USD",
    direction: "buy",
    entry: 1.1000,
    exit: 1.1050,
    positionSizeLots: 1,
    pipValuePerLot: 10,
    accountBalance: 10000,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.pipMovement, 50);
  assert.strictEqual(r.pnl, 500);
  assert.strictEqual(r.returnPercent, 5);
});
test("sell profit on non-JPY pair (price drops = profit)", () => {
  const r = MFK.computeProfit({
    pair: "EUR/USD",
    direction: "sell",
    entry: 1.1000,
    exit: 1.0950,
    positionSizeLots: 1,
    pipValuePerLot: 10,
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.pipMovement, 50);
  assert.strictEqual(r.pnl, 500);
});
test("JPY pair pip movement uses 0.01 pip size", () => {
  const r = MFK.computeProfit({
    pair: "USD/JPY",
    direction: "buy",
    entry: 150.0,
    exit: 150.5,
    positionSizeLots: 1,
    pipValuePerLot: 1000 / 150, // USD/JPY at ~150
  });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.pipMovement, 50);
});
test("buy loses money when price falls", () => {
  const r = MFK.computeProfit({
    pair: "EUR/USD",
    direction: "buy",
    entry: 1.1000,
    exit: 1.0950,
    positionSizeLots: 1,
    pipValuePerLot: 10,
  });
  assert.ok(r.pnl < 0);
});

console.log("\nTrading sessions");
test("computeSessions returns all 4 sessions", () => {
  const r = MFK.computeSessions(new Date());
  assert.strictEqual(r.length, 4);
  const names = r.map((s) => s.name).sort();
  assert.deepStrictEqual(names, ["London", "New York", "Sydney", "Tokyo"]);
});
test("session marked open when local time is inside its hours", () => {
  // Construct a UTC instant, then verify London's open/closed matches its own local hour.
  const now = new Date();
  const sessions = MFK.computeSessions(now);
  const london = sessions.find((s) => s.key === "london");
  const minutesNow = london.localHour * 60 + london.localMinute;
  const expectedOpen = minutesNow >= london.openHour * 60 && minutesNow < london.closeHour * 60;
  assert.strictEqual(london.isOpen, expectedOpen);
});
test("DST is resolved via IANA zone, not a fixed offset (July vs January differ for London/NY)", () => {
  const winter = new Date(Date.UTC(2026, 0, 15, 12, 0, 0)); // Jan 15, 12:00 UTC
  const summer = new Date(Date.UTC(2026, 6, 15, 12, 0, 0)); // Jul 15, 12:00 UTC
  const wLondon = MFK.zonedHourMinute(winter, "Europe/London").hour;
  const sLondon = MFK.zonedHourMinute(summer, "Europe/London").hour;
  // London is UTC+0 in winter and UTC+1 in summer (BST), so local hour should differ by 1.
  assert.strictEqual((sLondon - wLondon + 24) % 24, 1);
});

console.log(`\n${passed} tests passed.`);
