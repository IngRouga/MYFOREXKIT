/**
 * Injects the shared MyForexKit header + footer into any page that has
 * <div id="mfk-header"></div> and <div id="mfk-footer"></div> placeholders.
 * `root` is the relative path prefix back to the site root (e.g. "../../" from a tool page).
 */
(function () {
  function mount(root) {
    root = root || "./";
    const header = document.getElementById("mfk-header");
    const footer = document.getElementById("mfk-footer");

    if (header) {
      header.outerHTML = `
      <header>
        <div class="container nav">
          <a href="${root}index.html" class="brand"><img src="${root}assets/logo.png" alt="MyForexKit logo"> MyForexKit</a>
          <nav class="nav-links">
            <a href="${root}tools/index.html">Tools</a>
            <a href="${root}prop-firms/index.html">Prop Firms</a>
            <a href="${root}index.html#journal">Journal</a>
            <a href="${root}index.html#resources">Resources</a>
          </nav>
          <a href="${root}tools/index.html" class="nav-cta">Launch Toolkit</a>
          <button class="burger" aria-label="Menu" onclick="document.body.classList.toggle('menu-open')">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="mobile-menu container">
          <a href="${root}tools/index.html">Tools</a>
          <a href="${root}prop-firms/index.html">Prop Firms</a>
          <a href="${root}index.html#journal">Journal</a>
          <a href="${root}index.html#resources">Resources</a>
          <a href="${root}tools/index.html" class="nav-cta">Launch Toolkit</a>
        </div>
      </header>`;
      document.querySelectorAll(".mobile-menu a").forEach((a) =>
        a.addEventListener("click", () => document.body.classList.remove("menu-open"))
      );
    }

    if (footer) {
      footer.outerHTML = `
      <footer>
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="footer-brand"><img src="${root}assets/logo.png" alt="MyForexKit logo"> MyForexKit</div>
              <p>An independent toolkit and information platform for forex and funded traders. Not a broker or investment adviser.</p>
            </div>
            <div class="footer-col">
              <h5>Product</h5>
              <ul><li><a href="${root}tools/index.html">Tools</a></li><li><a href="${root}prop-firms/index.html">Prop Firms</a></li><li><a href="${root}index.html#journal">Journal</a></li></ul>
            </div>
            <div class="footer-col">
              <h5>Resources</h5>
              <ul><li><a href="${root}index.html#resources">Resources</a></li><li><a href="${root}index.html">About</a></li><li><a href="${root}index.html">Contact</a></li></ul>
            </div>
            <div class="footer-col">
              <h5>Legal</h5>
              <ul><li><a href="${root}index.html">Privacy Policy</a></li><li><a href="${root}index.html">Terms</a></li></ul>
            </div>
            <div class="footer-col">
              <h5>Disclosures</h5>
              <ul><li><a href="${root}index.html">Affiliate Disclosure</a></li><li><a href="${root}index.html">Risk Disclaimer</a></li></ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© 2026 MyForexKit. All rights reserved.</p>
            <p>myforexkit.com</p>
          </div>
          <p class="footer-disclaimer">MyForexKit is an independent informational and trading-tools platform. It is not a broker, prop firm, or investment adviser, and does not provide financial advice. Trading forex and CFDs involves substantial risk of loss and is not suitable for all investors. Some links on this site may be affiliate links, meaning MyForexKit may earn a commission at no additional cost to you if you choose to sign up through them.</p>
        </div>
      </footer>`;
    }
  }

  window.MFKComponents = { mount };
})();
