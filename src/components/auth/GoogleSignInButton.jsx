import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
let gsiLoader = null;

/** Load Google Identity Services once, on demand */
const loadGsi = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.accounts?.id) return Promise.resolve(true);

  if (!gsiLoader) {
    gsiLoader = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => { gsiLoader = null; resolve(false); };
      document.head.appendChild(script);
    });
  }
  return gsiLoader;
};

/**
 * Google sign-in button.
 *
 * Uses Google Identity Services, which hands us a signed ID token that the
 * server verifies against Google's public keys — the browser never asserts an
 * identity we simply trust.
 *
 * The client ID comes from the API's public settings payload (with a build-time
 * env var as a fallback), so switching Google projects is a server-side change.
 * When no client ID is configured the button renders nothing at all rather than
 * showing a control that cannot work.
 */
const GoogleSignInButton = ({ onCredential, text = 'signin_with' }) => {
  const { integrations } = useSettings();
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const clientId = integrations?.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;

    loadGsi().then((ok) => {
      if (cancelled) return;
      if (!ok || !window.google?.accounts?.id) { setFailed(true); return; }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) onCredential(response.credential);
        },
        // Keep the flow explicit — no surprise auto sign-in on page load
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text,
          logo_alignment: 'center',
          width: containerRef.current.offsetWidth || 320,
        });
      }
      setReady(true);
    });

    return () => { cancelled = true; };
  }, [clientId, onCredential, text]);

  if (!clientId) return null;

  return (
    <div className="google-signin">
      <div ref={containerRef} className="google-signin-target" />
      {!ready && !failed && <div className="google-signin-placeholder">Loading Google sign-in…</div>}
      {failed && (
        <p className="google-signin-error">
          Google sign-in couldn&apos;t load. Please use your email and password.
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
