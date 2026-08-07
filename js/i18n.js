/**
 * MyForexKit — i18n
 * English (default) / French. Brand name "MyForexKit" is never translated.
 * Language preference persists in localStorage and applies across pages.
 */
(function () {
  "use strict";

  const STRINGS = {
    en: {
      nav_tools: "Tools", nav_propfirms: "Prop Firms", nav_signin: "Sign In", nav_create: "Create Account",
      hero_eyebrow: "Independent trading toolkit",
      hero_h1_1: "Smarter tools", hero_h1_2: "for forex traders.",
      hero_sub: "Calculate risk, size your trades, track global trading sessions and compare prop firms — all in one place.",
      hero_cta_primary: "Explore Tools", hero_cta_secondary: "Compare Prop Firms",
      preview_risk: "Risk per trade", preview_session: "London · NY overlap", preview_lot: "Position size",
      tools_eyebrow: "Free tools", tools_h2: "Essential tools. Nothing you don't need.",
      lot_title: "Lot Size Calculator", lot_desc: "Calculate position size based on account balance, risk and stop loss.", lot_cta: "Calculate Lot Size",
      risk_title: "Risk Calculator", risk_desc: "Know exactly how much money you're risking before entering a trade.", risk_cta: "Calculate Risk",
      sessions_title: "Trading Sessions", sessions_desc: "See which major forex sessions are open in real time.", sessions_cta: "View Sessions",
      final_h2: "Trade with better tools.",
      footer_tagline: "An independent toolkit for forex traders. Not a broker or investment adviser.",
      footer_about: "About", footer_contact: "Contact", footer_privacy: "Privacy", footer_terms: "Terms",
      footer_affiliate: "Affiliate Disclosure", footer_risk: "Risk Disclaimer",
      footer_disclaimer: "MyForexKit provides informational tools and does not provide investment advice.",
      breadcrumb_home: "Home", breadcrumb_tools: "Tools",
      field_currency: "Account currency", field_balance: "Account balance", field_risk: "Risk percentage",
      field_pair: "Currency pair", field_stoploss: "Stop loss", field_stoploss_hint: "in pips",
      field_rate: "Exchange rate — quote → account currency", field_rate_hint: "needed for this pair",
      btn_reset: "Reset", btn_calculate: "Calculate",
      result_title: "Result", result_empty: "Enter your trade details and press Calculate.",
      result_riskamount: "Money at risk", result_lotsize: "Recommended position size", result_units: "Units", result_pipvalue: "Pip value / lot",
      result_note_lot: "Pip values are derived precisely from the currency pair. When the pair's quote currency differs from your account currency, we ask for a current exchange rate rather than guessing one — connect a live FX-rate feed here for fully automatic conversion.",
      risk_result_atrisk: "Amount at risk", risk_result_after: "Balance if stopped out", risk_result_remaining: "Percent remaining",
      risk_meter_safe: "Safe", risk_meter_high: "High",
      err_balance: "Enter a balance greater than 0.", err_risk: "Enter a risk % between 0 and 100.",
      err_stoploss: "Enter a stop loss greater than 0 pips.", err_pair: "Enter a valid pair, e.g. EUR/USD.",
      err_rate: "Enter the current exchange rate to convert this pair into your account currency.",
      err_fixfields: "Fix the highlighted fields to see your result.",
      err_needsrate: "This pair needs an exchange rate — see the field on the left.",
      sessions_your_time: "Your local time", sessions_utc: "UTC time",
      sessions_open: "Open", sessions_closed: "Closed",
      sessions_hours: "Session hours", sessions_opens_in: "Opens in", sessions_closes_in: "Closes in",
      timeline_title: "Session overlap timeline", timeline_overlap: "London – New York overlap",
      propfirms_eyebrow: "Prop firms", propfirms_h1: "Compare funded trading accounts.",
      propfirms_sub: "Filter by account size, challenge type and platform.",
      filter_size: "Account size", filter_challenge: "Challenge type", filter_platform: "Platform", filter_all: "All",
      propfirms_empty_title: "Live comparisons coming soon",
      propfirms_empty_body: "We only publish verified, up-to-date prop firm terms — nothing invented. This page will populate once real, current data is connected.",
      affiliate_note: "Some links to prop firms are affiliate links. MyForexKit may earn a commission at no extra cost to you. This never affects our comparisons.",
      auth_signin_title: "Sign in", auth_signin_sub: "Access your saved preferences and favorites.",
      auth_create_title: "Create your account", auth_create_sub: "Optional — all tools work without an account.",
      auth_forgot_title: "Reset your password", auth_forgot_sub: "We'll send you a reset link.",
      field_name: "Full name", field_email: "Email", field_password: "Password",
      auth_signin_btn: "Sign In", auth_create_btn: "Create Account", auth_forgot_btn: "Send Reset Link",
      auth_no_account: "Don't have an account?", auth_have_account: "Already have an account?",
      auth_forgot_link: "Forgot password?", auth_back_signin: "Back to sign in",
      auth_note: "Accounts are optional — every calculator and the sessions dashboard work without signing in.",
      profile_prefs: "Preferences", profile_favorites: "Favorites", profile_language: "Language", profile_settings: "Account Settings",
      profile_default_currency: "Default account currency", profile_default_risk: "Default risk %",
      profile_fav_pairs: "Favorite currency pairs", profile_fav_firms: "Favorite prop firms",
      profile_save: "Save changes",
    },
    fr: {
      nav_tools: "Outils", nav_propfirms: "Prop Firms", nav_signin: "Connexion", nav_create: "Créer un compte",
      hero_eyebrow: "Boîte à outils de trading indépendante",
      hero_h1_1: "Des outils plus intelligents", hero_h1_2: "pour les traders forex.",
      hero_sub: "Calculez votre risque, dimensionnez vos trades, suivez les sessions de trading mondiales et comparez les prop firms — le tout au même endroit.",
      hero_cta_primary: "Explorer les outils", hero_cta_secondary: "Comparer les prop firms",
      preview_risk: "Risque par trade", preview_session: "Chevauchement Londres · NY", preview_lot: "Taille de position",
      tools_eyebrow: "Outils gratuits", tools_h2: "Des outils essentiels. Rien de superflu.",
      lot_title: "Calculateur de taille de lot", lot_desc: "Calculez la taille de position selon le solde, le risque et le stop loss.", lot_cta: "Calculer la taille de lot",
      risk_title: "Calculateur de risque", risk_desc: "Sachez exactement combien vous risquez avant d'entrer en position.", risk_cta: "Calculer le risque",
      sessions_title: "Sessions de trading", sessions_desc: "Voyez quelles sessions forex majeures sont ouvertes en temps réel.", sessions_cta: "Voir les sessions",
      final_h2: "Tradez avec de meilleurs outils.",
      footer_tagline: "Une boîte à outils indépendante pour les traders forex. Ni courtier, ni conseiller en investissement.",
      footer_about: "À propos", footer_contact: "Contact", footer_privacy: "Confidentialité", footer_terms: "Conditions",
      footer_affiliate: "Déclaration d'affiliation", footer_risk: "Avertissement sur les risques",
      footer_disclaimer: "MyForexKit fournit des outils d'information et ne propose pas de conseils en investissement.",
      breadcrumb_home: "Accueil", breadcrumb_tools: "Outils",
      field_currency: "Devise du compte", field_balance: "Solde du compte", field_risk: "Pourcentage de risque",
      field_pair: "Paire de devises", field_stoploss: "Stop loss", field_stoploss_hint: "en pips",
      field_rate: "Taux de change — devise de cotation → devise du compte", field_rate_hint: "nécessaire pour cette paire",
      btn_reset: "Réinitialiser", btn_calculate: "Calculer",
      result_title: "Résultat", result_empty: "Entrez les détails de votre trade et cliquez sur Calculer.",
      result_riskamount: "Montant à risque", result_lotsize: "Taille de position recommandée", result_units: "Unités", result_pipvalue: "Valeur du pip / lot",
      result_note_lot: "Les valeurs de pip sont calculées précisément à partir de la paire de devises. Si la devise de cotation diffère de votre devise de compte, nous demandons un taux de change actuel plutôt que de le deviner — connectez un flux FX en direct ici pour une conversion entièrement automatique.",
      risk_result_atrisk: "Montant à risque", risk_result_after: "Solde si le stop est touché", risk_result_remaining: "Pourcentage restant",
      risk_meter_safe: "Faible", risk_meter_high: "Élevé",
      err_balance: "Entrez un solde supérieur à 0.", err_risk: "Entrez un risque entre 0 et 100 %.",
      err_stoploss: "Entrez un stop loss supérieur à 0 pip.", err_pair: "Entrez une paire valide, ex. EUR/USD.",
      err_rate: "Entrez le taux de change actuel pour convertir cette paire dans votre devise de compte.",
      err_fixfields: "Corrigez les champs en surbrillance pour voir votre résultat.",
      err_needsrate: "Cette paire nécessite un taux de change — voir le champ à gauche.",
      sessions_your_time: "Votre heure locale", sessions_utc: "Heure UTC",
      sessions_open: "Ouvert", sessions_closed: "Fermé",
      sessions_hours: "Heures de session", sessions_opens_in: "Ouvre dans", sessions_closes_in: "Ferme dans",
      timeline_title: "Chronologie des chevauchements de sessions", timeline_overlap: "Chevauchement Londres – New York",
      propfirms_eyebrow: "Prop firms", propfirms_h1: "Comparez les comptes de trading financés.",
      propfirms_sub: "Filtrez par taille de compte, type de challenge et plateforme.",
      filter_size: "Taille de compte", filter_challenge: "Type de challenge", filter_platform: "Plateforme", filter_all: "Tous",
      propfirms_empty_title: "Comparatifs en direct bientôt disponibles",
      propfirms_empty_body: "Nous ne publions que des conditions de prop firms vérifiées et à jour — rien n'est inventé. Cette page se remplira dès que des données réelles et actuelles seront connectées.",
      affiliate_note: "Certains liens vers des prop firms sont des liens d'affiliation. MyForexKit peut toucher une commission sans coût supplémentaire pour vous. Cela n'influence jamais nos comparatifs.",
      auth_signin_title: "Connexion", auth_signin_sub: "Accédez à vos préférences et favoris enregistrés.",
      auth_create_title: "Créez votre compte", auth_create_sub: "Optionnel — tous les outils fonctionnent sans compte.",
      auth_forgot_title: "Réinitialisez votre mot de passe", auth_forgot_sub: "Nous vous enverrons un lien de réinitialisation.",
      field_name: "Nom complet", field_email: "Email", field_password: "Mot de passe",
      auth_signin_btn: "Se connecter", auth_create_btn: "Créer un compte", auth_forgot_btn: "Envoyer le lien",
      auth_no_account: "Pas encore de compte ?", auth_have_account: "Déjà un compte ?",
      auth_forgot_link: "Mot de passe oublié ?", auth_back_signin: "Retour à la connexion",
      auth_note: "Les comptes sont optionnels — tous les calculateurs et le tableau des sessions fonctionnent sans connexion.",
      profile_prefs: "Préférences", profile_favorites: "Favoris", profile_language: "Langue", profile_settings: "Paramètres du compte",
      profile_default_currency: "Devise de compte par défaut", profile_default_risk: "Risque par défaut %",
      profile_fav_pairs: "Paires de devises favorites", profile_fav_firms: "Prop firms favorites",
      profile_save: "Enregistrer",
    },
  };

  function getLang() {
    return localStorage.getItem("mfk_lang") || "en";
  }
  function setLang(lang) {
    localStorage.setItem("mfk_lang", lang);
    applyTranslations();
    document.documentElement.lang = lang;
  }
  function t(key) {
    const lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
  }
  function applyTranslations() {
    const lang = getLang();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll(".lang-toggle button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
  }

  window.MFKi18n = { getLang, setLang, t, applyTranslations, STRINGS };
})();
