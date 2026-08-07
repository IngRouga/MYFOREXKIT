const assert = require("assert");
const MFK = require("./calculations.js");
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ok  - " + name); }
  catch (e) { console.error("FAIL - " + name); console.error(e); process.exitCode = 1; }
}

console.log("Pair lookup & pip size");
test("finds EUR/USD", () => assert.ok(MFK.findPair("EUR/USD")));
test("finds pair without slash", () => assert.ok(MFK.findPair("USDJPY")));
test("unsupported pair returns null", () => assert.strictEqual(MFK.findPair("ABC/XYZ"), null));
test("non-JPY pip size 0.0001", () => assert.strictEqual(MFK.pipSizeForPair("EUR/USD"), 0.0001));
test("JPY pip size 0.01", () => assert.strictEqual(MFK.pipSizeForPair("USD/JPY"), 0.01));
test("XAU/USD pip size 0.01", () => assert.strictEqual(MFK.pipSizeForPair("XAU/USD"), 0.01));

console.log("\nPip value");
test("EUR/USD pip value per lot = $10 in quote currency", () => {
  assert.strictEqual(MFK.pipValuePerLotInQuoteCurrency("EUR/USD"), 10);
});
test("USD/JPY pip value per lot = 1000 JPY", () => {
  assert.strictEqual(MFK.pipValuePerLotInQuoteCurrency("USD/JPY"), 1000);
});
test("XAU/USD pip value per lot (100oz) = $1", () => {
  assert.strictEqual(MFK.pipValuePerLotInQuoteCurrency("XAU/USD"), 1);
});
test("no conversion needed when quote===account", () => {
  const r = MFK.pipValuePerLotInAccountCurrency("EUR/USD", "USD", null);
  assert.strictEqual(r.needsRate, false);
  assert.strictEqual(r.value, 10);
});
test("flags needsRate for JPY pair into USD account", () => {
  const r = MFK.pipValuePerLotInAccountCurrency("USD/JPY", "USD", null);
  assert.strictEqual(r.needsRate, true);
});
test("converts with supplied rate", () => {
  const r = MFK.pipValuePerLotInAccountCurrency("USD/JPY", "USD", 1 / 150);
  assert.ok(Math.abs(r.value - 1000 / 150) < 0.001);
});

console.log("\nLot size calculator");
test("$10,000 balance, 1% risk, 25 pip stop, EUR/USD", () => {
  const r = MFK.computeLotSize({ accountBalance: 10000, riskPercent: 1, stopLossPips: 25, pipValuePerLot: 10 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.riskAmount, 100);
  assert.strictEqual(r.positionSizeLots, 0.4);
  assert.strictEqual(r.units, 40000);
});
test("rejects zero stop loss", () => {
  assert.strictEqual(MFK.computeLotSize({ accountBalance: 10000, riskPercent: 1, stopLossPips: 0, pipValuePerLot: 10 }).ok, false);
});
test("rejects negative balance", () => {
  assert.strictEqual(MFK.computeLotSize({ accountBalance: -1, riskPercent: 1, stopLossPips: 10, pipValuePerLot: 10 }).ok, false);
});
test("never returns NaN/Infinity", () => {
  const r = MFK.computeLotSize({ accountBalance: 10000, riskPercent: 1, stopLossPips: 25, pipValuePerLot: 10 });
  Object.values(r).forEach((v) => { if (typeof v === "number") assert.ok(Number.isFinite(v)); });
});

console.log("\nRisk calculator");
test("example from spec: $100,000 @ 0.5% = $500 risk, $99,500 remaining", () => {
  const r = MFK.computeRisk({ accountBalance: 100000, riskPercent: 0.5 });
  assert.strictEqual(r.riskAmount, 500);
  assert.strictEqual(r.remainingBalance, 99500);
});
test("rejects zero balance", () => assert.strictEqual(MFK.computeRisk({ accountBalance: 0, riskPercent: 1 }).ok, false));
test("rejects risk over 100%", () => assert.strictEqual(MFK.computeRisk({ accountBalance: 1000, riskPercent: 150 }).ok, false));

console.log("\nTrading sessions");
test("returns 4 sessions", () => assert.strictEqual(MFK.computeSessions(new Date()).length, 4));
test("DST resolved via IANA zone (London winter vs summer differ by 1h)", () => {
  const winter = new Date(Date.UTC(2026, 0, 15, 12, 0, 0));
  const summer = new Date(Date.UTC(2026, 6, 15, 12, 0, 0));
  const w = MFK.zonedHourMinute(winter, "Europe/London").hour;
  const s = MFK.zonedHourMinute(summer, "Europe/London").hour;
  assert.strictEqual((s - w + 24) % 24, 1);
});

console.log(`\n${passed} tests passed.`);
