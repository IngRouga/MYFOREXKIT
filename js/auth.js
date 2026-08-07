/**
 * MyForexKit — Optional account layer.
 *
 * IMPORTANT: This is a lightweight, client-side-only implementation backed
 * by localStorage so the "optional account" UX can be demonstrated and used
 * to persist preferences on this device. It is NOT a real authentication
 * backend — there is no server, no password hashing, no email delivery.
 * Wire this up to a real auth provider (e.g. your own API, Auth0, Supabase)
 * before handling real user credentials in production.
 */
(function () {
  "use strict";

  const USERS_KEY = "mfk_users";
  const SESSION_KEY = "mfk_session";

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function currentUser() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const users = getUsers();
    return users[email] || null;
  }
  function isSignedIn() {
    return !!currentUser();
  }

  function createAccount({ fullName, email, password }) {
    if (!fullName || !email || !password) return { ok: false, error: "missing_fields" };
    if (password.length < 8) return { ok: false, error: "weak_password" };
    const users = getUsers();
    const key = email.trim().toLowerCase();
    if (users[key]) return { ok: false, error: "exists" };
    users[key] = {
      fullName, email: key,
      // Demo-only storage. Never store plaintext passwords in a real system.
      password,
      preferences: { accountCurrency: "USD", riskPercent: 1, language: "en" },
      favoritePairs: [], favoriteFirms: [],
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, key);
    return { ok: true };
  }

  function signIn({ email, password }) {
    const users = getUsers();
    const key = (email || "").trim().toLowerCase();
    const user = users[key];
    if (!user || user.password !== password) return { ok: false, error: "invalid_credentials" };
    localStorage.setItem(SESSION_KEY, key);
    return { ok: true };
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
  }

  function requestPasswordReset(email) {
    // Demo-only: in production this triggers a real email with a signed reset link.
    const users = getUsers();
    const key = (email || "").trim().toLowerCase();
    return { ok: !!users[key] || true }; // always "succeeds" to avoid leaking which emails exist
  }

  function updatePreferences(patch) {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return { ok: false, error: "not_signed_in" };
    const users = getUsers();
    if (!users[email]) return { ok: false, error: "not_signed_in" };
    users[email].preferences = Object.assign({}, users[email].preferences, patch);
    saveUsers(users);
    return { ok: true };
  }

  function toggleFavoritePair(pair) {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return { ok: false, error: "not_signed_in" };
    const users = getUsers();
    const list = users[email].favoritePairs || [];
    const idx = list.indexOf(pair);
    if (idx >= 0) list.splice(idx, 1); else list.push(pair);
    users[email].favoritePairs = list;
    saveUsers(users);
    return { ok: true, favoritePairs: list };
  }

  window.MFKAuth = {
    isSignedIn, currentUser, createAccount, signIn, signOut,
    requestPasswordReset, updatePreferences, toggleFavoritePair,
  };
})();
