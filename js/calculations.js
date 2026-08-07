/**
 * MyForexKit — Calculation Engine (v3, simplified)
 * Pure, framework-free functions for the 3 core tools:
 * Lot Size Calculator, Risk Calculator, Trading Sessions.
 *
 * FX RATES: never invented. Any pair whose quote currency differs from
 * the trader's account currency requires an explicit exchangeRate input.
 * The UI asks the trader for a current rate instead of guessing one —
 * this is the integration point for a live FX-rate provider.
 */
(function (global) {
  "use strict";

  // ---------- Supported pairs ----------
  // contractSize: standard lot size in base-currency units (100,000 for FX, 100 for XAU/USD).
  const PAIRS = [
    { symbol: "EUR/USD", quote: "USD", contractSize: 100000 },
    { symbol: "GBP/USD", quote: "USD", contractSize: 100000 },
    { symbol: "USD/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "USD/CHF", quote: "CHF", contractSize: 100000 },
    { symbol: "AUD/USD", quote: "USD", contractSize: 100000 },
    { symbol: "NZD/USD", quote: "USD", contractSize: 100000 },
    { symbol: "USD/CAD", quote: "CAD", contractSize: 100000 },
    { symbol: "EUR/GBP", quote: "GBP", contractSize: 100000 },
    { symbol: "EUR/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "GBP/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "GBP/CHF", quote: "CHF", contractSize: 100000 },
    { symbol: "EUR/CHF", quote: "CHF", contractSize: 100000 },
    { symbol: "AUD/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "CAD/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "NZD/JPY", quote: "JPY", contractSize: 100000 },
    { symbol: "XAU/USD", quote: "USD", contractSize: 100 },
  ];

  function findPair(symbol) {
    if (typeof symbol !== "string") return null;
    const cleaned = symbol.trim().toUpperCase().replace(/\s/g, "");
    return PAIRS.find((p) => p.symbol.replace("/", "") === cleaned.replace("/", "")) || null;
  }

  function pipSizeForPair(symbol) {
    const p = findPair(symbol);
    if (!p) return null;
    if (p.symbol === "XAU/USD") return 0.01;
    return p.quote === "JPY" ? 0.01 : 0.0001;
  }

  function isFiniteNumber(n) {
    return typeof n === "number" && Number.isFinite(n);
  }
  function toNumberOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function round(value, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * f) / f;
  }

  /** Pip value per 1.00 standard lot, expressed in the pair's quote currency. */
  function pipValuePerLotInQuoteCurrency(symbol) {
    const p = findPair(symbol);
    const pipSize = pipSizeForPair(symbol);
    if (!p || pipSize === null) return null;
    return pipSize * p.contractSize;
  }

  /**
   * Converts pip value from quote currency into the trader's account currency.
   * Returns { value, needsRate }. If quote === account currency, no conversion needed.
   * Otherwise requires exchangeRate = units of account currency per 1 unit of quote currency.
   */
  function pipValuePerLotInAccountCurrency(symbol, accountCurrency, exchangeRate) {
    const p = findPair(symbol);
    const pipValueQuote = pipValuePerLotInQuoteCurrency(symbol);
    if (!p || pipValueQuote === null) return { value: null, needsRate: false, error: "invalid_pair" };
    const acct = (accountCurrency || "").trim().toUpperCase();
    if (p.quote === acct) return { value: pipValueQuote, needsRate: false, error: null };
    if (!isFiniteNumber(exchangeRate) || exchangeRate <= 0) return { value: null, needsRate: true, error: null };
    return { value: pipValueQuote * exchangeRate, needsRate: false, error: null };
  }

  // ---------- 1. Lot Size Calculator ----------
  function computeLotSize({ accountBalance, riskPercent, stopLossPips, pipValuePerLot }) {
    if (!isFiniteNumber(accountBalance) || accountBalance <= 0) {
      return { ok: false, error: "balance" };
    }
    if (!isFiniteNumber(riskPercent) || riskPercent <= 0 || riskPercent > 100) {
      return { ok: false, error: "riskPercent" };
    }
    if (!isFiniteNumber(stopLossPips) || stopLossPips <= 0) {
      return { ok: false, error: "stopLoss" };
    }
    if (!isFiniteNumber(pipValuePerLot) || pipValuePerLot <= 0) {
      return { ok: false, error: "pipValue" };
    }
    const riskAmount = accountBalance * (riskPercent / 100);
    const riskPerLot = stopLossPips * pipValuePerLot;
    if (riskPerLot <= 0) return { ok: false, error: "pipValue" };
    const positionSizeLots = riskAmount / riskPerLot;
    const units = positionSizeLots * 100000;
    return {
      ok: true,
      riskAmount: round(riskAmount, 2),
      positionSizeLots: round(positionSizeLots, 2),
      units: Math.round(units),
      pipValuePerLot: round(pipValuePerLot, 4),
    };
  }

  // ---------- 2. Risk Calculator ----------
  function computeRisk({ accountBalance, riskPercent }) {
    if (!isFiniteNumber(accountBalance) || accountBalance <= 0) return { ok: false, error: "balance" };
    if (!isFiniteNumber(riskPercent) || riskPercent <= 0 || riskPercent > 100) return { ok: false, error: "riskPercent" };
    const riskAmount = accountBalance * (riskPercent / 100);
    const remainingBalance = accountBalance - riskAmount;
    const remainingPercent = 100 - riskPercent;
    return {
      ok: true,
      riskAmount: round(riskAmount, 2),
      remainingBalance: round(remainingBalance, 2),
      remainingPercent: round(remainingPercent, 2),
      riskPercent: riskPercent,
    };
  }

  // ---------- 3. Trading Sessions ----------
  // DST-safe: uses Intl + IANA tz database, never a fixed UTC offset.
  const SESSIONS = [
    { key: "sydney", name: "Sydney", nameFr: "Sydney", timeZone: "Australia/Sydney", openHour: 8, closeHour: 17 },
    { key: "tokyo", name: "Tokyo", nameFr: "Tokyo", timeZone: "Asia/Tokyo", openHour: 9, closeHour: 18 },
    { key: "london", name: "London", nameFr: "Londres", timeZone: "Europe/London", openHour: 8, closeHour: 17 },
    { key: "newyork", name: "New York", nameFr: "New York", timeZone: "America/New_York", openHour: 8, closeHour: 17 },
  ];

  function zonedHourMinute(date, timeZone) {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", hour12: false });
    const parts = fmt.formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour").value);
    const m = Number(parts.find((p) => p.type === "minute").value);
    return { hour: h === 24 ? 0 : h, minute: m };
  }

  function computeSessions(now) {
    return SESSIONS.map((s) => {
      const { hour, minute } = zonedHourMinute(now, s.timeZone);
      const minutesNow = hour * 60 + minute;
      const openMin = s.openHour * 60;
      const closeMin = s.closeHour * 60;
      const isOpen = minutesNow >= openMin && minutesNow < closeMin;
      let minutesToNextEvent, nextEvent;
      if (isOpen) {
        minutesToNextEvent = closeMin - minutesNow;
        nextEvent = "close";
      } else if (minutesNow < openMin) {
        minutesToNextEvent = openMin - minutesNow;
        nextEvent = "open";
      } else {
        minutesToNextEvent = 24 * 60 - minutesNow + openMin;
        nextEvent = "open";
      }
      return {
        key: s.key, name: s.name, nameFr: s.nameFr, timeZone: s.timeZone,
        openHour: s.openHour, closeHour: s.closeHour,
        localHour: hour, localMinute: minute, isOpen, minutesToNextEvent, nextEvent,
      };
    });
  }

  const MFK = {
    PAIRS, findPair, pipSizeForPair,
    pipValuePerLotInQuoteCurrency, pipValuePerLotInAccountCurrency,
    computeLotSize, computeRisk, computeSessions, zonedHourMinute,
    toNumberOrNull, round, SESSIONS,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = MFK;
  else global.MFK = MFK;
})(typeof window !== "undefined" ? window : globalThis);
