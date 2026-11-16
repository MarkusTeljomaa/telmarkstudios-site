(() => {
  const storageKey = 'telmark-ads-measurement-v1';
  const settingsLink = document.getElementById('ad-settings-link');
  const settings = document.getElementById('ad-settings');
  const panel = document.getElementById('ad-consent');
  const heading = document.getElementById('ad-consent-heading');
  let containerLoaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  function setConsent(command, allowed) {
    const measurement = allowed ? 'granted' : 'denied';
    gtag('consent', command, {
      ad_storage: measurement,
      ad_user_data: measurement,
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  }

  function readChoice() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function showPanel(visible) {
    panel.hidden = !visible;
    settings.setAttribute('aria-expanded', String(visible));
  }

  function loadContainer() {
    if (containerLoaded) return;
    containerLoaded = true;
    setConsent('update', true);
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WNHSWMLF';
    document.head.append(script);
  }

  function choose(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {
      // The choice can still be applied on this page if storage is blocked.
    }

    showPanel(false);
    settings.focus({ preventScroll: true });
    if (choice === 'allow') {
      loadContainer();
    } else if (containerLoaded) {
      withdrawConsent();
    }
  }

  function withdrawConsent() {
    setConsent('update', false);
    // Reload to remove the running container and any tags it has loaded.
    window.location.reload();
  }

  setConsent('default', false);
  settingsLink.hidden = false;
  settings.addEventListener('click', () => {
    showPanel(true);
    heading.focus();
  });
  document.getElementById('ad-allow').addEventListener('click', () => choose('allow'));
  document.getElementById('ad-decline').addEventListener('click', () => choose('decline'));
  window.addEventListener('storage', (event) => {
    if (containerLoaded && (event.key === storageKey || event.key === null) && readChoice() !== 'allow') {
      withdrawConsent();
    }
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && containerLoaded && readChoice() !== 'allow') {
      withdrawConsent();
    }
  });

  const choice = readChoice();
  if (choice === 'allow') {
    loadContainer();
  } else if (choice !== 'decline') {
    showPanel(true);
  }
})();
