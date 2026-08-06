import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineRefresh, HiOutlineExternalLink } from 'react-icons/hi';
import { AdminPageHeader } from '../../components/admin/AdminUI';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { settingsService } from '../../services/apiServices';
import { invalidateSettings } from '../../hooks/useSettings';
import { errorMessage } from '../../utils/format';

/**
 * Store settings — branding, contact details, commerce rules and site SEO.
 * Payment and OAuth secrets deliberately live in the server's .env rather than
 * the database, so they never travel to a browser.
 */
const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [refreshingSitemap, setRefreshingSitemap] = useState(false);

  useEffect(() => {
    settingsService.getSettings()
      .then(({ data }) => {
        setSettings(data.data.settings);
        setIntegrations(data.data.integrations || {});
      })
      .catch(() => toast.error('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const setSocial = (patch) => setSettings((s) => ({ ...s, socialLinks: { ...s.socialLinks, ...patch } }));
  const setSeo = (patch) => setSettings((s) => ({ ...s, seo: { ...s.seo, ...patch } }));

  const save = async (event) => {
    event?.preventDefault();
    setSaving(true);
    try {
      const payload = { ...settings };
      delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt; delete payload.id;

      const { data } = await settingsService.updateSettings(payload);
      setSettings(data.data.settings);
      invalidateSettings();   // storefront re-reads on next mount
      toast.success('Settings saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const refreshSitemap = async () => {
    setRefreshingSitemap(true);
    try {
      await settingsService.refreshSitemap();
      toast.success('Sitemap regenerated from the database');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRefreshingSitemap(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading settings…" />;
  if (!settings) return <p className="admin-error">Settings unavailable.</p>;

  const TABS = [
    ['general', 'General'],
    ['commerce', 'Commerce'],
    ['seo', 'SEO'],
    ['integrations', 'Integrations'],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Store settings"
        subtitle="Branding, delivery rules, taxes and site-wide SEO."
        actions={(
          <button type="button" className="btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        )}
      />

      <div className="admin-tab-bar" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`admin-tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <form className="admin-card" onSubmit={save}>
        {tab === 'general' && (
          <div className="admin-form-grid">
            <div className="form-field">
              <label htmlFor="siteName">Store name</label>
              <input id="siteName" value={settings.siteName || ''} onChange={(e) => set({ siteName: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="tagline">Tagline</label>
              <input id="tagline" value={settings.tagline || ''} onChange={(e) => set({ tagline: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="logo">Logo URL</label>
              <input id="logo" value={settings.logo || ''} onChange={(e) => set({ logo: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="favicon">Favicon URL</label>
              <input id="favicon" value={settings.favicon || ''} onChange={(e) => set({ favicon: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="contactEmail">Contact email</label>
              <input id="contactEmail" type="email" value={settings.contactEmail || ''} onChange={(e) => set({ contactEmail: e.target.value })} />
            </div>
            <div className="form-field">
              <label htmlFor="contactPhone">Contact phone</label>
              <input id="contactPhone" value={settings.contactPhone || ''} onChange={(e) => set({ contactPhone: e.target.value })} />
            </div>
            <div className="form-field span-2">
              <label htmlFor="address">Registered address</label>
              <textarea id="address" rows={2} value={settings.address || ''} onChange={(e) => set({ address: e.target.value })} />
              <span className="form-hint">
                Shown in the footer, on the contact page and on invoices — Razorpay onboarding requires this.
              </span>
            </div>

            <h3 className="admin-subhead span-2">Social links</h3>
            {['facebook', 'instagram', 'twitter', 'youtube', 'whatsapp'].map((network) => (
              <div key={network} className="form-field">
                <label htmlFor={`social-${network}`} style={{ textTransform: 'capitalize' }}>{network}</label>
                <input
                  id={`social-${network}`}
                  value={settings.socialLinks?.[network] || ''}
                  onChange={(e) => setSocial({ [network]: e.target.value })}
                  placeholder="https://…"
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'commerce' && (
          <div className="admin-form-grid">
            <label className="form-check span-2">
              <input
                type="checkbox"
                checked={Boolean(settings.codEnabled)}
                onChange={(e) => set({ codEnabled: e.target.checked })}
              />
              <span>
                <strong>Cash on delivery available</strong>
                <em>Turn this off to make online payment the only option at checkout.</em>
              </span>
            </label>

            <div className="form-field">
              <label htmlFor="shippingCharge">Delivery charge (₹)</label>
              <input
                id="shippingCharge" type="number" min="0"
                value={settings.shippingCharge ?? 0}
                onChange={(e) => set({ shippingCharge: Number(e.target.value) })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="freeShippingThreshold">Free delivery above (₹)</label>
              <input
                id="freeShippingThreshold" type="number" min="0"
                value={settings.freeShippingThreshold ?? 0}
                onChange={(e) => set({ freeShippingThreshold: Number(e.target.value) })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="taxRate">GST rate (%)</label>
              <input
                id="taxRate" type="number" min="0" max="100" step="0.01"
                value={settings.taxRate ?? 0}
                onChange={(e) => set({ taxRate: Number(e.target.value) })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="minOrderValue">Minimum order value (₹)</label>
              <input
                id="minOrderValue" type="number" min="0"
                value={settings.minOrderValue ?? 0}
                onChange={(e) => set({ minOrderValue: Number(e.target.value) })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="currencySymbol">Currency symbol</label>
              <input
                id="currencySymbol"
                value={settings.currencySymbol || '₹'}
                onChange={(e) => set({ currencySymbol: e.target.value })}
              />
            </div>

            <label className="form-check span-2">
              <input
                type="checkbox"
                checked={Boolean(settings.reviewAutoApprove)}
                onChange={(e) => set({ reviewAutoApprove: e.target.checked })}
              />
              <span>
                <strong>Publish reviews automatically</strong>
                <em>Turn this off to hold new reviews for moderation.</em>
              </span>
            </label>

            <label className="form-check span-2">
              <input
                type="checkbox"
                checked={Boolean(settings.autoConfirmOrders)}
                onChange={(e) => set({ autoConfirmOrders: e.target.checked })}
              />
              <span>
                <strong>Auto-confirm orders</strong>
                <em>New paid orders move straight to Confirmed instead of waiting for review.</em>
              </span>
            </label>
          </div>
        )}

        {tab === 'seo' && (
          <div className="admin-form-grid">
            <div className="form-field span-2">
              <label htmlFor="seoTitle">Default page title</label>
              <input
                id="seoTitle" maxLength={70}
                value={settings.seo?.title || ''}
                onChange={(e) => setSeo({ title: e.target.value })}
              />
            </div>
            <div className="form-field span-2">
              <label htmlFor="seoDesc">Default meta description</label>
              <textarea
                id="seoDesc" rows={3} maxLength={160}
                value={settings.seo?.description || ''}
                onChange={(e) => setSeo({ description: e.target.value })}
              />
            </div>
            <div className="form-field span-2">
              <label htmlFor="seoKeywords">Default keywords</label>
              <input
                id="seoKeywords"
                value={settings.seo?.keywords || ''}
                onChange={(e) => setSeo({ keywords: e.target.value })}
              />
            </div>

            <div className="admin-info-card span-2">
              <h3>Sitemap &amp; robots.txt</h3>
              <p>
                Both are generated live from the database. Adding, editing or deleting a product,
                category or brand invalidates the cache automatically — you only need the button
                below after a bulk import or if a crawler is showing stale data.
              </p>
              <div className="admin-info-actions">
                <button type="button" className="btn-secondary btn-sm" onClick={refreshSitemap} disabled={refreshingSitemap}>
                  <HiOutlineRefresh /> {refreshingSitemap ? 'Regenerating…' : 'Regenerate sitemap'}
                </button>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  View sitemap.xml <HiOutlineExternalLink />
                </a>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  View robots.txt <HiOutlineExternalLink />
                </a>
              </div>
            </div>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="admin-form-stack">
            <div className="admin-info-card">
              <h3>Razorpay</h3>
              <p className={integrations.razorpayEnabled ? 'is-positive' : 'is-warning'}>
                {integrations.razorpayEnabled
                  ? `Connected · key ${integrations.razorpayKeyId}`
                  : 'Not configured — online payments are disabled and checkout will offer COD only.'}
              </p>
              <p className="form-hint">
                Set <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code> and{' '}
                <code>RAZORPAY_WEBHOOK_SECRET</code> in <code>server/.env</code>, then restart the API.
                Point the Razorpay webhook at{' '}
                <code>{`${window.location.origin}/api/orders/webhook/razorpay`}</code> and subscribe to{' '}
                <code>payment.captured</code>, <code>payment.failed</code> and <code>refund.processed</code>.
              </p>
            </div>

            <div className="admin-info-card">
              <h3>Google sign-in</h3>
              <p className={integrations.googleClientId ? 'is-positive' : 'is-warning'}>
                {integrations.googleClientId
                  ? 'Connected — the Google button appears on sign-in and sign-up.'
                  : 'Not configured — customers can still sign in with email and password.'}
              </p>
              <p className="form-hint">
                Set <code>GOOGLE_CLIENT_ID</code> in <code>server/.env</code> and add{' '}
                <code>{window.location.origin}</code> to your OAuth client&apos;s authorised JavaScript origins.
              </p>
            </div>

            <div className="admin-info-card">
              <h3>Email</h3>
              <p className="form-hint">
                Transactional email uses SMTP settings from <code>server/.env</code>. When they are blank,
                emails are skipped with a warning rather than failing orders — useful in development.
              </p>
            </div>
          </div>
        )}

        <div className="admin-form-foot">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminSettings;
