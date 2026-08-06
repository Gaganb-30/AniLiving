import { useEffect, useState } from 'react';
import { settingsService } from '../services/apiServices';

/**
 * Site settings + public integration keys, fetched once per page load and
 * shared through a module-level cache so the Navbar, Footer and Checkout
 * don't each fire their own request.
 */

const DEFAULTS = {
  siteName: 'AniLiving',
  tagline: 'Everything Your Pet Deserves.',
  currencySymbol: '₹',
  codEnabled: true,
  shippingCharge: 0,
  freeShippingThreshold: 499,
  taxRate: 18,
  socialLinks: {},
  seo: {},
};

let cache = null;
let inflight = null;

export const fetchSettings = async () => {
  if (cache) return cache;
  if (!inflight) {
    inflight = settingsService.getSettings()
      .then(({ data }) => {
        cache = {
          settings: { ...DEFAULTS, ...(data.data?.settings || {}) },
          integrations: data.data?.integrations || {},
        };
        return cache;
      })
      .catch(() => ({ settings: DEFAULTS, integrations: {} }))
      .finally(() => { inflight = null; });
  }
  return inflight;
};

/** Drop the cache after an admin saves settings so the change shows immediately */
export const invalidateSettings = () => { cache = null; };

export const useSettings = () => {
  const [state, setState] = useState(cache || { settings: DEFAULTS, integrations: {} });
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    let alive = true;
    if (cache) { setState(cache); setLoading(false); return undefined; }

    fetchSettings().then((result) => {
      if (alive) { setState(result); setLoading(false); }
    });
    return () => { alive = false; };
  }, []);

  return { ...state, loading };
};

export default useSettings;
