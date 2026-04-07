import { useEffect } from 'react';

const GA_STORAGE_KEY = 'cros_ga_measurement_id';

/**
 * Globally injects Google Analytics gtag script on every page
 * when a GA Measurement ID is saved in localStorage.
 */
export function useGlobalAnalytics() {
  useEffect(() => {
    const id = localStorage.getItem(GA_STORAGE_KEY);
    if (!id) return;

    // Avoid duplicates
    if (document.getElementById('ga-global-script')) return;

    const script = document.createElement('script');
    script.id = 'ga-global-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.id = 'ga-global-inline';
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
    document.head.appendChild(inline);

    return () => {
      document.getElementById('ga-global-script')?.remove();
      document.getElementById('ga-global-inline')?.remove();
    };
  }, []);
}
