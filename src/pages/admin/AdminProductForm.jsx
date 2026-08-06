import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSparkles, HiOutlineEye } from 'react-icons/hi';
import {
  AdminPageHeader, RepeatableList, KeyValueList, Modal,
} from '../../components/admin/AdminUI';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { productService, categoryService, brandService } from '../../services/apiServices';
import { formatCurrency, colorToCss, errorMessage } from '../../utils/format';

const EMPTY_PRODUCT = {
  name: '', slug: '', shortDescription: '', longDescription: '', richDescription: '',
  brand: '', category: '', subcategory: '', tags: [],
  price: '', mrp: '', costPrice: '', tax: 0,
  sku: '', barcode: '', stock: 0, availability: 'in_stock', lowStockAlert: 5,
  thumbnail: '', images: [], videoUrl: '',
  specifications: [], features: [], attributes: [], variants: [],
  seo: { title: '', description: '', keywords: '', canonicalUrl: '' },
  isActive: true, isFeatured: false, isNewArrival: false,
  isBestSeller: false, isTrending: false, isFlashDeal: false, flashDealExpiry: '',
};

/** Cartesian product of attribute values — used to generate the variant matrix */
const cartesian = (arrays) => arrays.reduce(
  (acc, values) => acc.flatMap((combo) => values.map((value) => [...combo, value])),
  [[]],
);

/**
 * Product editor.
 *
 * Everything the requirements call "unlimited" is genuinely unlimited here:
 * specifications are free-form key/value rows, attributes are named by the
 * admin, and variants are generated from whatever attributes exist. No field
 * name is hardcoded to a pet type, size or colour.
 */
const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('basics');
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Load reference data + the product being edited ────────────────
  useEffect(() => {
    Promise.all([categoryService.getAdminCategories(), brandService.getAdminBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes.data.data.categories || []);
        setBrands(brandRes.data.data.brands || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    productService.getAdminProduct(id)
      .then(({ data }) => {
        const p = data.data.product;
        setForm({
          ...EMPTY_PRODUCT,
          ...p,
          brand: p.brand || '',
          category: p.category || '',
          subcategory: p.subcategory || '',
          // The API stores specs as an object; the form edits them as rows
          specifications: Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value })),
          seo: { ...EMPTY_PRODUCT.seo, ...(p.seo || {}) },
          flashDealExpiry: p.flashDealExpiry ? p.flashDealExpiry.slice(0, 10) : '',
          variants: (p.variants || []).map((v) => ({
            ...v,
            attributeCombination: v.attributeCombination || {},
            images: v.images || [],
          })),
        });
      })
      .catch(() => toast.error('Could not load that product.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const set = useCallback((patch) => setForm((f) => ({ ...f, ...patch })), []);
  const setSeo = useCallback((patch) => setForm((f) => ({ ...f, seo: { ...f.seo, ...patch } })), []);

  // Subcategories are simply categories whose parent is the chosen category
  const subcategories = useMemo(
    () => categories.filter((c) => (c.parent?._id || c.parent) === form.category),
    [categories, form.category],
  );

  const derivedDiscount = form.mrp && form.price && Number(form.mrp) > Number(form.price)
    ? Math.round(((form.mrp - form.price) / form.mrp) * 100)
    : 0;

  // ── Attributes ────────────────────────────────────────────────────
  const updateAttribute = (index, patch) => {
    const next = [...form.attributes];
    next[index] = { ...next[index], ...patch };
    set({ attributes: next });
  };

  /**
   * Build every attribute combination that doesn't already have a variant.
   * Existing variants are preserved so regenerating never wipes prices/stock
   * the admin has already entered.
   */
  const generateVariants = () => {
    const usable = form.attributes.filter((a) => a.name?.trim() && a.values?.length);
    if (!usable.length) {
      toast.error('Add at least one attribute with values first.');
      return;
    }

    const combos = cartesian(usable.map((a) => a.values));
    const existingKeys = new Set(
      form.variants.map((v) => JSON.stringify(v.attributeCombination || {})),
    );

    const created = [];
    for (const combo of combos) {
      const attributeCombination = Object.fromEntries(
        usable.map((attribute, i) => [attribute.name, combo[i]]),
      );
      if (existingKeys.has(JSON.stringify(attributeCombination))) continue;
      created.push({
        attributeCombination,
        price: form.price || 0,
        mrp: form.mrp || '',
        stock: 0,
        sku: '',
        images: [],
        isActive: true,
      });
    }

    if (!created.length) {
      toast('Every combination already has a variant.', { icon: 'ℹ️' });
      return;
    }
    set({ variants: [...form.variants, ...created] });
    toast.success(`${created.length} variant(s) added`);
  };

  const updateVariant = (index, patch) => {
    const next = [...form.variants];
    next[index] = { ...next[index], ...patch };
    set({ variants: next });
  };

  // ── Save ──────────────────────────────────────────────────────────
  const save = async (event) => {
    event?.preventDefault();

    if (!form.name.trim()) { toast.error('Product name is required.'); setTab('basics'); return; }
    if (form.price === '' || Number.isNaN(Number(form.price))) { toast.error('A valid price is required.'); setTab('pricing'); return; }
    if (!form.category) { toast.error('Please choose a category.'); setTab('basics'); return; }

    const payload = {
      ...form,
      price: Number(form.price),
      mrp: form.mrp === '' ? undefined : Number(form.mrp),
      costPrice: form.costPrice === '' ? undefined : Number(form.costPrice),
      tax: Number(form.tax) || 0,
      stock: Number(form.stock) || 0,
      lowStockAlert: Number(form.lowStockAlert) || 0,
      flashDealExpiry: form.flashDealExpiry || undefined,
    };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.__v;
    delete payload.id;

    setSaving(true);
    try {
      if (isNew) {
        const { data } = await productService.createProduct(payload);
        toast.success('Product created');
        navigate(`/admin/products/${data.data.product._id}`, { replace: true });
      } else {
        await productService.updateProduct(id, payload);
        toast.success('Product saved');
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the product.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading product…" />;

  const TABS = [
    ['basics', 'Basics'],
    ['pricing', 'Pricing & stock'],
    ['media', 'Media'],
    ['details', 'Specs & features'],
    ['variants', `Variants${form.variants.length ? ` (${form.variants.length})` : ''}`],
    ['seo', 'SEO'],
    ['visibility', 'Visibility'],
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title={isNew ? 'Add product' : form.name || 'Edit product'}
        subtitle={isNew ? 'Create a new catalogue entry.' : `Slug: /product/${form.slug}`}
        actions={(
          <>
            <Link to="/admin/products" className="btn-secondary btn-sm">Back to list</Link>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setPreviewOpen(true)}>
              <HiOutlineEye /> Preview
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </button>
          </>
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
        {/* ── Basics ─────────────────────────────────────────────── */}
        {tab === 'basics' && (
          <div className="admin-form-grid">
            <div className="form-field span-2">
              <label htmlFor="name">Product name *</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Premium Chicken & Rice Adult Dog Food"
                required
              />
            </div>

            <div className="form-field span-2">
              <label htmlFor="slug">URL slug</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => set({ slug: e.target.value })}
                placeholder="Leave blank to generate from the name"
              />
              <span className="form-hint">Changing this changes the product URL and can break existing links.</span>
            </div>

            <div className="form-field">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={form.category}
                onChange={(e) => set({ category: e.target.value, subcategory: '' })}
                required
              >
                <option value="">Select a category</option>
                {categories.filter((c) => !c.parent).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="subcategory">Subcategory</label>
              <select
                id="subcategory"
                value={form.subcategory}
                onChange={(e) => set({ subcategory: e.target.value })}
                disabled={!form.category || subcategories.length === 0}
              >
                <option value="">
                  {subcategories.length === 0 ? 'No subcategories available' : 'None'}
                </option>
                {subcategories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="brand">Brand</label>
              <select id="brand" value={form.brand} onChange={(e) => set({ brand: e.target.value })}>
                <option value="">No brand</option>
                {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                value={(form.tags || []).join(', ')}
                onChange={(e) => set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                placeholder="dog, dry food, grain free"
              />
              <span className="form-hint">Comma separated. Tags power the tag filter and search.</span>
            </div>

            <div className="form-field span-2">
              <label htmlFor="shortDescription">Short description</label>
              <textarea
                id="shortDescription"
                rows={2}
                maxLength={300}
                value={form.shortDescription}
                onChange={(e) => set({ shortDescription: e.target.value })}
                placeholder="One or two lines shown under the product title."
              />
              <span className="form-hint">{form.shortDescription.length}/300</span>
            </div>

            <div className="form-field span-2">
              <label htmlFor="longDescription">Long description</label>
              <textarea
                id="longDescription"
                rows={6}
                value={form.longDescription}
                onChange={(e) => set({ longDescription: e.target.value })}
                placeholder="Plain text. Blank lines separate paragraphs."
              />
            </div>

            <div className="form-field span-2">
              <label htmlFor="richDescription">Rich description (HTML)</label>
              <textarea
                id="richDescription"
                rows={6}
                value={form.richDescription}
                onChange={(e) => set({ richDescription: e.target.value })}
                placeholder="<h3>Why pets love it</h3><ul><li>…</li></ul>"
                spellCheck={false}
              />
              <span className="form-hint">
                Optional. When set, this replaces the long description on the product page — every product can
                have a completely different layout.
              </span>
            </div>
          </div>
        )}

        {/* ── Pricing & stock ────────────────────────────────────── */}
        {tab === 'pricing' && (
          <div className="admin-form-grid">
            <div className="form-field">
              <label htmlFor="price">Selling price (₹) *</label>
              <input
                id="price" type="number" min="0" step="0.01" required
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="mrp">MRP (₹)</label>
              <input
                id="mrp" type="number" min="0" step="0.01"
                value={form.mrp}
                onChange={(e) => set({ mrp: e.target.value })}
              />
              {derivedDiscount > 0 && (
                <span className="form-hint is-positive">{derivedDiscount}% discount will be shown</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="costPrice">Cost price (₹)</label>
              <input
                id="costPrice" type="number" min="0" step="0.01"
                value={form.costPrice}
                onChange={(e) => set({ costPrice: e.target.value })}
              />
              <span className="form-hint">Internal only — used for inventory valuation.</span>
            </div>

            <div className="form-field">
              <label htmlFor="tax">Tax rate (%)</label>
              <input
                id="tax" type="number" min="0" max="100" step="0.01"
                value={form.tax}
                onChange={(e) => set({ tax: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="sku">SKU</label>
              <input id="sku" value={form.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="ANI-DF-001" />
            </div>

            <div className="form-field">
              <label htmlFor="barcode">Barcode / EAN</label>
              <input id="barcode" value={form.barcode} onChange={(e) => set({ barcode: e.target.value })} />
            </div>

            <div className="form-field">
              <label htmlFor="stock">Stock quantity</label>
              <input
                id="stock" type="number" min="0"
                value={form.stock}
                onChange={(e) => set({ stock: e.target.value })}
              />
              {form.variants.length > 0 && (
                <span className="form-hint">
                  This product has variants — the total is kept in sync with variant stock.
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="lowStockAlert">Low stock alert at</label>
              <input
                id="lowStockAlert" type="number" min="0"
                value={form.lowStockAlert}
                onChange={(e) => set({ lowStockAlert: e.target.value })}
              />
            </div>

            <div className="form-field">
              <label htmlFor="availability">Availability</label>
              <select
                id="availability"
                value={form.availability}
                onChange={(e) => set({ availability: e.target.value })}
              >
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
                <option value="pre_order">Pre-order</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Media ──────────────────────────────────────────────── */}
        {tab === 'media' && (
          <div className="admin-form-stack">
            <div className="form-field">
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                id="thumbnail"
                value={form.thumbnail}
                onChange={(e) => set({ thumbnail: e.target.value })}
                placeholder="https://cdn.example.com/product.jpg"
              />
              <span className="form-hint">
                Images are referenced by URL — upload them wherever you like and paste the link here.
              </span>
              {form.thumbnail && (
                <div className="admin-image-preview"><img src={form.thumbnail} alt="Thumbnail preview" /></div>
              )}
            </div>

            <RepeatableList
              label="Gallery image URLs"
              type="url"
              values={form.images}
              onChange={(images) => set({ images })}
              placeholder="https://cdn.example.com/gallery-1.jpg"
              hint="Shown in the product gallery, in order."
            />

            <div className="form-field">
              <label htmlFor="videoUrl">Product video URL</label>
              <input
                id="videoUrl"
                value={form.videoUrl}
                onChange={(e) => set({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=…"
              />
            </div>
          </div>
        )}

        {/* ── Specs & features ───────────────────────────────────── */}
        {tab === 'details' && (
          <div className="admin-form-stack">
            <KeyValueList
              label="Specifications"
              pairs={form.specifications}
              onChange={(specifications) => set({ specifications })}
              hint="Add any rows you like — Weight, Material, Protein %, Breed Size, Warranty. Every product can have a completely different set."
            />

            <RepeatableList
              label="Key features"
              values={form.features}
              onChange={(features) => set({ features })}
              placeholder="Waterproof"
              hint="Bullet points shown on the product page. Add as many as you need."
            />

            {/* Attributes */}
            <div className="repeatable">
              <div className="repeatable-head">
                <label>Attributes</label>
                <button
                  type="button"
                  onClick={() => set({ attributes: [...form.attributes, { name: '', values: [] }] })}
                >
                  <HiOutlinePlus /> Add attribute
                </button>
              </div>
              <span className="form-hint">
                Attributes drive both the shop filters and the variant matrix. Name them whatever fits —
                Colour, Size, Flavour, Capacity.
              </span>

              {form.attributes.length === 0 && <p className="repeatable-empty">No attributes yet.</p>}

              {form.attributes.map((attribute, index) => (
                <div key={index} className="attribute-row">
                  <input
                    className="attribute-name"
                    value={attribute.name}
                    placeholder="Colour"
                    onChange={(e) => updateAttribute(index, { name: e.target.value })}
                  />
                  <input
                    className="attribute-values"
                    value={(attribute.values || []).join(', ')}
                    placeholder="Red, Blue, Black"
                    onChange={(e) => updateAttribute(index, {
                      values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                    })}
                  />
                  <button
                    type="button"
                    className="repeatable-remove"
                    onClick={() => set({ attributes: form.attributes.filter((_, i) => i !== index) })}
                    aria-label="Remove attribute"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Variants ───────────────────────────────────────────── */}
        {tab === 'variants' && (
          <div className="admin-form-stack">
            <div className="admin-variant-head">
              <div>
                <h3>Variants</h3>
                <p>
                  Each variant carries its own price, stock, SKU and images. A colour variant&apos;s first image
                  becomes the swatch preview on the product card, so one product shows as a single card with
                  selectable colours.
                </p>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={generateVariants}>
                <HiOutlineSparkles /> Generate from attributes
              </button>
            </div>

            {form.variants.length === 0 ? (
              <p className="repeatable-empty">
                No variants. Add attributes on the &ldquo;Specs &amp; features&rdquo; tab, then generate the matrix —
                or leave this empty for a simple single-option product.
              </p>
            ) : (
              <div className="variant-list">
                {form.variants.map((variant, index) => {
                  const label = Object.entries(variant.attributeCombination || {})
                    .map(([k, v]) => `${k}: ${v}`).join(' · ') || `Variant ${index + 1}`;
                  const colorValue = Object.entries(variant.attributeCombination || {})
                    .find(([k]) => /colou?r|shade/i.test(k))?.[1];
                  const swatch = colorToCss(colorValue);

                  return (
                    <div key={index} className={`variant-card ${variant.isActive === false ? 'is-inactive' : ''}`}>
                      <header className="variant-card-head">
                        <span className="variant-label">
                          {swatch && <span className="variant-swatch" style={{ background: swatch }} />}
                          {label}
                        </span>
                        <div className="variant-card-actions">
                          <label className="form-check">
                            <input
                              type="checkbox"
                              checked={variant.isActive !== false}
                              onChange={(e) => updateVariant(index, { isActive: e.target.checked })}
                            />
                            Active
                          </label>
                          <button
                            type="button"
                            className="repeatable-remove"
                            onClick={() => set({ variants: form.variants.filter((_, i) => i !== index) })}
                            aria-label="Remove variant"
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </header>

                      <div className="variant-fields">
                        <div className="form-field">
                          <label>Price (₹)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, { price: e.target.value })}
                          />
                        </div>
                        <div className="form-field">
                          <label>MRP (₹)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={variant.mrp ?? ''}
                            onChange={(e) => updateVariant(index, { mrp: e.target.value })}
                          />
                        </div>
                        <div className="form-field">
                          <label>Stock</label>
                          <input
                            type="number" min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, { stock: e.target.value })}
                          />
                        </div>
                        <div className="form-field">
                          <label>SKU</label>
                          <input
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, { sku: e.target.value })}
                          />
                        </div>
                      </div>

                      <RepeatableList
                        label="Variant image URLs"
                        type="url"
                        values={variant.images || []}
                        onChange={(images) => updateVariant(index, { images })}
                        placeholder="https://cdn.example.com/red-1.jpg"
                        hint="The first image is used as this option's preview."
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── SEO ────────────────────────────────────────────────── */}
        {tab === 'seo' && (
          <div className="admin-form-grid">
            <div className="form-field span-2">
              <label htmlFor="seoTitle">SEO title</label>
              <input
                id="seoTitle"
                maxLength={70}
                value={form.seo.title}
                onChange={(e) => setSeo({ title: e.target.value })}
                placeholder={form.name}
              />
              <span className="form-hint">{form.seo.title.length}/70 — leave blank to use the product name.</span>
            </div>

            <div className="form-field span-2">
              <label htmlFor="seoDescription">Meta description</label>
              <textarea
                id="seoDescription"
                rows={3}
                maxLength={160}
                value={form.seo.description}
                onChange={(e) => setSeo({ description: e.target.value })}
                placeholder={form.shortDescription}
              />
              <span className="form-hint">{form.seo.description.length}/160</span>
            </div>

            <div className="form-field span-2">
              <label htmlFor="seoKeywords">Keywords</label>
              <input
                id="seoKeywords"
                value={form.seo.keywords}
                onChange={(e) => setSeo({ keywords: e.target.value })}
                placeholder="dog food, grain free dog food, chicken dog food"
              />
            </div>

            <div className="form-field span-2">
              <label htmlFor="canonicalUrl">Canonical URL</label>
              <input
                id="canonicalUrl"
                value={form.seo.canonicalUrl}
                onChange={(e) => setSeo({ canonicalUrl: e.target.value })}
                placeholder="Leave blank to use the product URL"
              />
            </div>

            <div className="admin-seo-preview span-2">
              <span className="admin-seo-preview-label">Google preview</span>
              <div className="admin-seo-preview-card">
                <span className="admin-seo-url">aniliving.com › product › {form.slug || 'product-slug'}</span>
                <strong>{form.seo.title || form.name || 'Product name'}</strong>
                <p>{form.seo.description || form.shortDescription || 'Add a meta description to control how this product appears in search results.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Visibility ─────────────────────────────────────────── */}
        {tab === 'visibility' && (
          <div className="admin-form-stack">
            <div className="admin-toggle-grid">
              {[
                ['isActive', 'Published', 'Visible in the shop and search'],
                ['isFeatured', 'Featured', 'Shown in the homepage featured rail'],
                ['isNewArrival', 'New arrival', 'Shown in the new arrivals rail'],
                ['isBestSeller', 'Best seller', 'Shown in the best sellers rail'],
                ['isTrending', 'Trending', 'Shown in the trending rail'],
                ['isFlashDeal', 'Flash deal', 'Shown in the flash deals rail'],
              ].map(([key, label, hint]) => (
                <label key={key} className={`admin-toggle ${form[key] ? 'is-on' : ''}`}>
                  <input type="checkbox" checked={Boolean(form[key])} onChange={(e) => set({ [key]: e.target.checked })} />
                  <span>
                    <strong>{label}</strong>
                    <em>{hint}</em>
                  </span>
                </label>
              ))}
            </div>

            {form.isFlashDeal && (
              <div className="form-field" style={{ maxWidth: 260 }}>
                <label htmlFor="flashDealExpiry">Flash deal ends on</label>
                <input
                  id="flashDealExpiry"
                  type="date"
                  value={form.flashDealExpiry}
                  onChange={(e) => set({ flashDealExpiry: e.target.value })}
                />
                <span className="form-hint">After this date the product drops out of the flash deals rail automatically.</span>
              </div>
            )}
          </div>
        )}

        <div className="admin-form-foot">
          <Link to="/admin/products" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* ── Preview ──────────────────────────────────────────────── */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Product preview" size="md">
        <div className="admin-preview">
          <div className="admin-preview-image">
            {form.thumbnail ? <img src={form.thumbnail} alt="" /> : <span>🐾</span>}
          </div>
          <div className="admin-preview-body">
            {form.brand && <span className="admin-preview-brand">{brands.find((b) => b._id === form.brand)?.name}</span>}
            <h3>{form.name || 'Untitled product'}</h3>
            <p>{form.shortDescription}</p>
            <div className="admin-preview-price">
              <strong>{formatCurrency(form.price || 0)}</strong>
              {form.mrp > form.price && <span>{formatCurrency(form.mrp)}</span>}
              {derivedDiscount > 0 && <em>{derivedDiscount}% off</em>}
            </div>
            {form.variants.length > 0 && (
              <div className="admin-preview-swatches">
                {form.variants.slice(0, 6).map((variant, i) => {
                  const colorValue = Object.values(variant.attributeCombination || {})[0];
                  const css = colorToCss(colorValue);
                  return (
                    <span
                      key={i}
                      className="swatch"
                      title={colorValue}
                      style={css ? { background: css } : undefined}
                    >
                      {!css && <span className="swatch-text">{String(colorValue || '').slice(0, 2)}</span>}
                    </span>
                  );
                })}
              </div>
            )}
            {form.features.length > 0 && (
              <ul className="admin-preview-features">
                {form.features.slice(0, 4).map((feature, i) => <li key={i}>{feature}</li>)}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminProductForm;
