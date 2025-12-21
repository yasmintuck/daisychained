// Small runtime helper to set CSS --vh (1% of visual viewport height) and keep it updated.
// This prevents layout shifts on iOS/Chrome mobile where the browser chrome (address bar)
// changes the visual viewport and causes 100vh-based math to misalign.
(function applyVisualVh() {
  const doc = document.documentElement;

  function updateVh() {
    try {
      const vv = window.visualViewport;
      const height = vv ? vv.height : window.innerHeight;
      // set --vh to 1% of the visual viewport in px units
      doc.style.setProperty('--vh', (height * 0.01) + 'px');

      // keep --nav-h in sync with actual navbar height if present
      const nav = document.querySelector('.navbar') || document.querySelector('nav');
      if (nav) {
        const navH = nav.getBoundingClientRect().height;
        doc.style.setProperty('--nav-h', navH + 'px');
      }
    } catch (e) {
      // silently fail — don't break app if something unexpected happens
      // (older browsers or SSR contexts)
    }
  }

  // initial set
  updateVh();

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVh, { passive: true });
    window.visualViewport.addEventListener('scroll', updateVh, { passive: true });
  }
  window.addEventListener('resize', updateVh);

  // Also update after a short delay on load in case metrics settle
  window.addEventListener('load', () => setTimeout(updateVh, 250));
})();
