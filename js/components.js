/**
 * Injects the shared MyForexKit header + footer.
 * `root` is the relative path back to the site root (e.g. "../../" from a tool page).
 */
(function () {
  function mount(root) {
    root = root || "./";
    const header = document.getElementById("mfk-header");
    const footer = document.getElementById("mfk-footer");
    const signedIn = window.MFKAuth ? window.MFKAuth.isSignedIn() : false;
    const accountLink = signedIn
      ? `<a href="${root}account/profile/index.html" class="nav-signin" data-i18n="profile_prefs">Account</a>`
      : `<a href="${root}account/sign-in/index.html" class="nav-signin" data-i18n="nav_signin">Sign In</a>`;
    const accountCta = signedIn
      ? `<a href="${root}account/profile/index.html" class="nav-cta">Profile</a>`
      : `<a href="${root}account/create-account/index.html" class="nav-cta" data-i18n="nav_create">Create Account</a>`;

    if (header) {
      header.outerHTML = `
      <header>
        <div class="container nav">
          <a href="${root}index.html" class="brand"><img src="${root}assets/logo.png" alt="MyForexKit logo"> MyForexKit</a>
          <nav class="nav-links">
            <a href="${root}tools/index.html" data-i18n="nav_tools">Tools</a>
            <a href="${root}prop-firms/index.html" data-i18n="nav_propfirms">Prop Firms</a>
          </nav>
          <div class="nav-right">
            <div class="lang-toggle">
              <button type="button" data-lang="en">EN</button>
              <button type="button" data-lang="fr">FR</button>
            </div>
            ${accountLink}
            ${accountCta}
          </div>
          <button class="burger" aria-label="Menu" onclick="document.body.classList.toggle('menu-open')">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-menu container">
          <a href="${root}tools/index.html" data-i18n="nav_tools">Tools</a>
          <a href="${root}prop-firms/index.html" data-i18n="nav_propfirms">Prop Firms</a>
          <div class="lang-toggle" style="margin-top:14px;">
            <button type="button" data-lang="en">EN</button>
            <button type="button" data-lang="fr">FR</button>
          </div>
          <div class="row">
            ${signedIn
              ? `<a href="${root}account/profile/index.html" class="nav-signin-btn" style="flex:1;text-align:center;" data-i18n="profile_prefs">Account</a>`
              : `<a href="${root}account/sign-in/index.html" class="nav-signin-btn" data-i18n="nav_signin">Sign In</a>
                 <a href="${root}account/create-account/index.html" class="nav-cta" data-i18n="nav_create">Create Account</a>`}
          </div>
        </div>
      </header>`;
      document.querySelectorAll(".mobile-menu a").forEach((a) =>
        a.addEventListener("click", () => document.body.classList.remove("menu-open"))
      );
      document.querySelectorAll(".lang-toggle button").forEach((btn) => {
        btn.addEventListener("click", () => window.MFKi18n && window.MFKi18n.setLang(btn.dataset.lang));
      });
    }

    if (footer) {
      footer.outerHTML = `
      <footer>
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="footer-brand"><img src="${root}assets/logo.png" alt="MyForexKit logo" style="height:24px;"> MyForexKit</div>
              <p style="font-size:13.5px; max-width:320px; margin-top:10px; line-height:1.6;" data-i18n="footer_tagline">An independent toolkit for forex traders. Not a broker or investment adviser.</p>
            </div>
            <div class="footer-links">
              <a href="${root}tools/index.html" data-i18n="nav_tools">Tools</a>
              <a href="${root}prop-firms/index.html" data-i18n="nav_propfirms">Prop Firms</a>
              <a href="${root}index.html" data-i18n="footer_about">About</a>
              <a href="${root}index.html" data-i18n="footer_contact">Contact</a>
              <a href="${root}index.html" data-i18n="footer_privacy">Privacy</a>
              <a href="${root}index.html" data-i18n="footer_terms">Terms</a>
              <a href="${root}index.html" data-i18n="footer_affiliate">Affiliate Disclosure</a>
              <a href="${root}index.html" data-i18n="footer_risk">Risk Disclaimer</a>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© 2026 MyForexKit</p>
            <p>myforexkit.com</p>
          </div>
          <p class="footer-disclaimer" data-i18n="footer_disclaimer">MyForexKit provides informational tools and does not provide investment advice.</p>
        </div>
      </footer>`;
    }

    if (window.MFKi18n) window.MFKi18n.applyTranslations();
  }

  window.MFKComponents = { mount };
})();
