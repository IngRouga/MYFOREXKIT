/**
 * MyForexKit — Calculation Engine
 * Pure, framework-free functions used by every calculator page.
 * No UI code lives here so the logic can be unit tested and reused.
 *
 * IMPORTANT — FX RATES:
 * These functions never invent an exchange rate. Any calculation that
 * needs a currency conversion (e.g. a JPY pip value converted into a
 * USD account, or a cross pair converted into a non-quote account
 * currency) takes that rate as an explicit input. Callers should wire
 * a live FX-rate provider to supply `exchangeRate` in production; until
 * then the UI asks the trader to enter a current rate manually and
 * clearly labels the figure as user-supplied, not live market data.
 */

(function (global) {
  "use strict";

  // ---------- Shared helpers ----------

  /** Parses "EUR/USD" -> { base: "EUR", quote: "USD" } */
  function parsePair(pair) {
    if (typeof pair !== "string") return null;
    const cleaned = pair.trim().toUpperCase().replace(/\s/g, "");
    const m = cleaned.match(/^([A-Z]{3})\/?([A-Z]{3})$/);
    if (!m) return null;
    return { base: m[1], quote: m[2] };
  }

  /** Standard pip size: 0.01 for JPY-quoted pairs, 0.0001 otherwise. */
  function pipSizeForPair(pair) {
    const parsed = parsePair(pair);
    if (!parsed) return null;
    return parsed.quote === "JPY" ? 0.01 : 0.0001;
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

  /**
   * Pip value per 1.00 standard lot (100,000 units of base currency),
   * expressed in the pair's QUOTE currency.
   * This is currency-agnostic and always correct:
   *   pipValueInQuoteCurrency = pipSize * 100000
   */
  function pipValuePerLotInQuoteCurrency(pair) {
    const pipSize = pipSizeForPair(pair);
    if (pipSize === null) return null;
    return pipSize * 100000;
  }

  /**
   * Converts a pip value from the pair's quote currency into the
   * trader's account currency.
   *
   * - If quote currency === account currency: no conversion needed.
   * - Otherwise: requires `exchangeRate` = units of account currency
   *   per 1 unit of quote currency (i.e. quote -> account rate).
   *   Pass null if unknown; the function returns needsRate:true so the
   *   UI can prompt for it instead of guessing.
   */
  function pipValuePerLotInAccountCurrency(pair, accountCurrency, exchangeRate) {
    const parsed = parsePair(pair);
    const pipValueQuote = pipValuePerLotInQuoteCurrency(pair);
    if (!parsed || pipValueQuote === null) {
      return { value: null, needsRate: false, error: "invalid_pair" };
    }
    const acct = (accountCurrency || "").trim().toUpperCase();
    if (parsed.quote === acct) {
      return { value: pipValueQuote, needsRate: false, error: null };
    }
    if (!isFiniteNumber(exchangeRate) || exchangeRate <= 0) {
      return { value: null, needsRate: true, error: null };
    }
    return { value: pipValueQuote * exchangeRate, needsRate: false, error: null };
  }

  // ---------- 1. Lot Size Calculator ----------

  /**
   * @param {Object} p
   * @param {number} p.accountBalance
   * @param {number} p.riskPercent
   * @param {number} p.stopLossPips
   * @param {number} p.pipValuePerLot - per-lot pip value in account currency
   * @returns {{ok:boolean, error?:string, riskAmount?:number, positionSizeLots?:number, units?:number, pipValuePerLot?:number}}
   */
  function computeLotSize({ accountBalance, riskPercent, stopLossPips, pipValuePerLot }) {
    if (!isFiniteNumber(accountBalance) || accountBalance <= 0) {
      return { ok: false, error: "Enter a valid account balance greater than 0." };
    }
    if (!isFiniteNumber(riskPercent) || riskPercent <= 0) {
      return { ok: false, error: "Enter a risk percentage greater than 0." };
    }
    if (riskPercent > 100) {
      return { ok: false, error: "Risk percentage cannot exceed 100%." };
    }
    if (!isFiniteNumber(stopLossPips) || stopLossPips <= 0) {
      return { ok: false, error: "Enter a stop loss distance greater than 0 pips." };
    }
    if (!isFiniteNumber(pipValuePerLot) || pipValuePerLot <= 0) {
      return { ok: false, error: "Pip value is unavailable — provide an exchange rate to continue." };
    }

    const riskAmount = accountBalance * (riskPercent / 100);
    const riskPerLot = stopLossPips * pipValuePerLot;
    if (riskPerLot <= 0) {
      return { ok: false, error: "Unable to calculate — check stop loss and pip value inputs." };
    }
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
    if (!isFiniteNumber(accountBalance) || accountBalance <= 0) {
      return { ok: false, error: "Enter a valid account balance greater than 0." };
    }
    if (!isFiniteNumber(riskPercent) || riskPercent <= 0) {
      return { ok: false, error: "Enter a risk percentage greater than 0." };
    }
    if (riskPercent > 100) {
      return { ok: false, error: "Risk percentage cannot exceed 100%." };
    }
    const riskAmount = accountBalance * (riskPercent / 100);
    const remainingBalance = accountBalance - riskAmount;
    const remainingPercent = 100 - riskPercent;
    return {
      ok: true,
      riskAmount: round(riskAmount, 2),
      remainingBalance: round(remainingBalance, 2),
      remainingPercent: round(remainingPercent, 2),
    };
  }

  // ---------- 3. Risk/Reward Calculator ----------

  /**
   * @param {Object} p
   * @param {number} p.entry
   * @param {number} p.stop
   * @param {number} p.takeProfit
   * @param {"buy"|"sell"} p.direction
   */
  function computeRiskReward({ entry, stop, takeProfit, direction }) {
    if (![entry, stop, takeProfit].every(isFiniteNumber)) {
      return { ok: false, error: "Enter valid numbers for entry, stop loss and take profit." };
    }
    if (direction !== "buy" && direction !== "sell") {
      return { ok: false, error: "Select a trade direction." };
    }

    let riskDistance, rewardDistance;
    if (direction === "buy") {
      riskDistance = entry - stop;
      rewardDistance = takeProfit - entry;
    } else {
      riskDistance = stop - entry;
      rewardDistance = entry - takeProfit;
    }

    if (riskDistance <= 0 || rewardDistance <= 0) {
      return {
        ok: false,
        error:
          direction === "buy"
            ? "Invalid setup — for a Buy, stop loss must be below entry and take profit must be above entry."
            : "Invalid setup — for a Sell, stop loss must be above entry and take profit must be below entry.",
      };
    }

    const ratio = rewardDistance / riskDistance;
    return {
      ok: true,
      riskDistance: round(riskDistance, 5),
      rewardDistance: round(rewardDistance, 5),
      ratio: round(ratio, 2),
      ratioLabel: `1 : ${round(ratio, 2)}`,
    };
  }

  // ---------- 4. Drawdown Calculator ----------

  /**
   * @param {Object} p
   * @param {number} p.startingBalance - initial funded account balance
   * @param {number} p.currentEquity - current account equity
   * @param {number} p.maxDrawdownPercent - max overall drawdown allowed, % of starting balance
   * @param {number} p.dailyDrawdownPercent - daily drawdown allowed, % of today's starting equity
   * @param {number} p.todayStartEquity - equity at the start of today
   * @param {number} p.currentDailyPL - today's running P&L (negative = loss)
   */
  function computeDrawdown({
    startingBalance,
    currentEquity,
    maxDrawdownPercent,
    dailyDrawdownPercent,
    todayStartEquity,
    currentDailyPL,
  }) {
    const nums = [startingBalance, currentEquity, maxDrawdownPercent, dailyDrawdownPercent, todayStartEquity, currentDailyPL];
    if (!nums.every(isFiniteNumber)) {
      return { ok: false, error: "Enter valid numbers for every field." };
    }
    if (startingBalance <= 0 || todayStartEquity <= 0) {
      return { ok: false, error: "Balances must be greater than 0." };
    }
    if (maxDrawdownPercent <= 0 || dailyDrawdownPercent <= 0) {
      return { ok: false, error: "Drawdown limits must be greater than 0%." };
    }

    const currentDrawdownAmount = Math.max(0, startingBalance - currentEquity);
    const currentDrawdownPercent = (currentDrawdownAmount / startingBalance) * 100;
    const maxLossAllowed = startingBalance * (maxDrawdownPercent / 100);
    const drawdownRemaining = Math.max(0, maxLossAllowed - currentDrawdownAmount);

    const dailyLossAllowed = todayStartEquity * (dailyDrawdownPercent / 100);
    const todaysLoss = Math.max(0, -currentDailyPL);
    const dailyLossRemaining = Math.max(0, dailyLossAllowed - todaysLoss);

    const overallUsedPct = maxLossAllowed > 0 ? (currentDrawdownAmount / maxLossAllowed) * 100 : 0;
    const dailyUsedPct = dailyLossAllowed > 0 ? (todaysLoss / dailyLossAllowed) * 100 : 0;
    const worstUsedPct = Math.max(overallUsedPct, dailyUsedPct);

    let status = "SAFE";
    if (worstUsedPct >= 80) status = "DANGER";
    else if (worstUsedPct >= 50) status = "CAUTION";

    return {
      ok: true,
      currentDrawdownAmount: round(currentDrawdownAmount, 2),
      currentDrawdownPercent: round(currentDrawdownPercent, 2),
      maxLossAllowed: round(maxLossAllowed, 2),
      drawdownRemaining: round(drawdownRemaining, 2),
      dailyLossAllowed: round(dailyLossAllowed, 2),
      dailyLossRemaining: round(dailyLossRemaining, 2),
      overallUsedPct: round(Math.min(100, overallUsedPct), 1),
      dailyUsedPct: round(Math.min(100, dailyUsedPct), 1),
      status,
    };
  }

  // ---------- 5. Profit Calculator ----------

  /**
   * @param {Object} p
   * @param {string} p.pair - e.g. "EUR/USD"
   * @param {"buy"|"sell"} p.direction
   * @param {number} p.entry
   * @param {number} p.exit
   * @param {number} p.positionSizeLots
   * @param {number|null} p.pipValuePerLot - per-lot pip value in account currency (from pipValuePerLotInAccountCurrency)
   * @param {number|null} p.accountBalance - optional, to compute return %
   */
  function computeProfit({ pair, direction, entry, exit, positionSizeLots, pipValuePerLot, accountBalance }) {
    const pipSize = pipSizeForPair(pair);
    if (pipSize === null) {
      return { ok: false, error: "Enter a valid currency pair, e.g. EUR/USD." };
    }
    if (direction !== "buy" && direction !== "sell") {
      return { ok: false, error: "Select a trade direction." };
    }
    if (![entry, exit, positionSizeLots].every(isFiniteNumber) || entry <= 0 || exit <= 0 || positionSizeLots <= 0) {
      return { ok: false, error: "Enter valid entry price, exit price and position size." };
    }
    if (!isFiniteNumber(pipValuePerLot) || pipValuePerLot <= 0) {
      return { ok: false, error: "Pip value is unavailable — provide an exchange rate to continue." };
    }

    const rawMove = direction === "buy" ? exit - entry : entry - exit;
    const pipMovement = rawMove / pipSize;
    const pnl = pipMovement * pipValuePerLot * positionSizeLots;

    let returnPercent = null;
    if (isFiniteNumber(accountBalance) && accountBalance > 0) {
      returnPercent = round((pnl / accountBalance) * 100, 2);
    }

    return {
      ok: true,
      pipMovement: round(pipMovement, 1),
      pnl: round(pnl, 2),
      returnPercent,
    };
  }

  // ---------- 6. Trading Sessions ----------
  // DST-safe: relies on the IANA tz database via Intl, never a fixed UTC offset.

  const SESSIONS = [
    { key: "sydney", name: "Sydney", timeZone: "Australia/Sydney", openHour: 8, closeHour: 17 },
    { key: "tokyo", name: "Tokyo", timeZone: "Asia/Tokyo", openHour: 9, closeHour: 18 },
    { key: "london", name: "London", timeZone: "Europe/London", openHour: 8, closeHour: 17 },
    { key: "newyork", name: "New York", timeZone: "America/New_York", openHour: 8, closeHour: 17 },
  ];

  /** Returns the wall-clock hour/minute for a given IANA time zone at instant `date`. */
  function zonedHourMinute(date, timeZone) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const h = Number(parts.find((p) => p.type === "hour").value);
    const m = Number(parts.find((p) => p.type === "minute").value);
    return { hour: h === 24 ? 0 : h, minute: m };
  }

  /**
   * Computes open/closed status for every major session at the given instant.
   * @param {Date} now
   * @returns {Array<{key,name,timeZone,openHour,closeHour,localTime,isOpen,minutesToNextEvent,nextEvent}>}
   */
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
        key: s.key,
        name: s.name,
        timeZone: s.timeZone,
        openHour: s.openHour,
        closeHour: s.closeHour,
        localHour: hour,
        localMinute: minute,
        isOpen,
        minutesToNextEvent,
        nextEvent,
      };
    });
  }

  // ---------- Exports ----------

  const MFK = {
    parsePair,
    pipSizeForPair,
    pipValuePerLotInQuoteCurrency,
    pipValuePerLotInAccountCurrency,
    computeLotSize,
    computeRisk,
    computeRiskReward,
    computeDrawdown,
    computeProfit,
    computeSessions,
    zonedHourMinute,
    toNumberOrNull,
    round,
    SESSIONS,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = MFK;
  } else {
    global.MFK = MFK;
  }
})(typeof window !== "undefined" ? window : globalThis);
