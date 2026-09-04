import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
} from 'react-icons/hi';
import {
  AdminPageHeader, AdminTable, AdminPagination, Modal, ConfirmDialog,
} from '../../components/admin/AdminUI';
import {
  categoryService, brandService, couponService, bannerService,
  reviewService, userAdminService,
} from '../../services/apiServices';
import {
  formatCurrency, formatDate, errorMessage, timeAgo,
} from '../../utils/format';
import { useDebounce } from '../../hooks/useDebounce';

/* ══════════════════════════════════════════════════════════════════════
   Categories — unlimited depth via a self-referencing parent
   ══════════════════════════════════════════════════════════════════════ */
export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = {
    name: '', slug: '', description: '', image: '', parent: '',
    sortOrder: 0, isActive: true, seo: { title: '', description: '', keywords: '' },
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(() => {
    setLoading(true);
    categoryService.getAdminCategories()
      .then(({ data }) => setCategories(data.data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (category) => {
    setEditing(category || 'new');
    setForm(category
      ? {
        ...blank,
        ...category,
        parent: category.parent?._id || category.parent || '',
        seo: { ...blank.seo, ...(category.seo || {}) },
      }
      : blank);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parent: form.parent || null, sortOrder: Number(form.sortOrder) || 0 };
      delete payload._id; delete payload.__v; delete payload.createdAt;
      delete payload.updatedAt; delete payload.subcategories; delete payload.productCount; delete payload.id;

      if (editing === 'new') await categoryService.createCategory(payload);
      else await categoryService.updateCategory(editing._id, payload);

      toast.success(editing === 'new' ? 'Category created' : 'Category updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await categoryService.deleteCategory(confirm._id);
      toast.success('Category deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  };

  const topLevel = categories.filter((c) => !c.parent);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Categories"
        subtitle="Create unlimited categories and subcategories — the storefront picks them up automatically."
        actions={<button type="button" className="btn-primary btn-sm" onClick={() => open(null)}><HiOutlinePlus /> Add category</button>}
      />

      <AdminTable
        columns={['Category', 'Parent', 'Products', 'Order', 'Status', '']}
        loading={loading}
        empty={!loading && categories.length === 0 ? 'No categories yet — add your first one.' : null}
      >
        {categories.map((category) => (
          <tr key={category._id}>
            <td>
              <div className="admin-product-cell">
                <span className="admin-thumb">
                  {category.image ? <img src={category.image} alt="" loading="lazy" /> : '🏷️'}
                </span>
                <div>
                  <strong>{category.name}</strong>
                  <span className="admin-cell-sub">/{category.slug}</span>
                </div>
              </div>
            </td>
            <td>{category.parent?.name || categories.find((c) => c._id === category.parent)?.name || '—'}</td>
            <td className="admin-cell-num">{category.productCount ?? '—'}</td>
            <td className="admin-cell-num">{category.sortOrder}</td>
            <td>
              <span className={`status-pill tone-${category.isActive ? 'success' : 'muted'}`}>
                {category.isActive ? 'Active' : 'Hidden'}
              </span>
            </td>
            <td>
              <div className="admin-row-actions">
                <button type="button" onClick={() => open(category)} title="Edit"><HiOutlinePencil /></button>
                <button type="button" className="is-danger" onClick={() => setConfirm(category)} title="Delete">
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New category' : 'Edit category'}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save category'}
            </button>
          </>
        )}
      >
        <form className="admin-form-grid" onSubmit={save}>
          <div className="form-field span-2">
            <label htmlFor="cat-name">Name *</label>
            <input id="cat-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>

          <div className="form-field">
            <label htmlFor="cat-slug">Slug</label>
            <input id="cat-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated" />
          </div>

          <div className="form-field">
            <label htmlFor="cat-parent">Parent category</label>
            <select id="cat-parent" value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))}>
              <option value="">None (top level)</option>
              {topLevel.filter((c) => c._id !== editing?._id).map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-field span-2">
            <label htmlFor="cat-image">Image URL</label>
            <input id="cat-image" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://…" />
            {form.image && <div className="admin-image-preview"><img src={form.image} alt="" /></div>}
          </div>

          <div className="form-field span-2">
            <label htmlFor="cat-desc">Description</label>
            <textarea id="cat-desc" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="form-field">
            <label htmlFor="cat-order">Sort order</label>
            <input id="cat-order" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
          </div>

          <label className="form-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Visible on the storefront
          </label>

          <div className="form-field span-2">
            <label htmlFor="cat-seo-title">SEO title</label>
            <input
              id="cat-seo-title" maxLength={70}
              value={form.seo.title}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, title: e.target.value } }))}
            />
          </div>

          <div className="form-field span-2">
            <label htmlFor="cat-seo-desc">SEO description</label>
            <textarea
              id="cat-seo-desc" rows={2} maxLength={160}
              value={form.seo.description}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, description: e.target.value } }))}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete category?"
        message={`"${confirm?.name}" will be removed. Products in this category will need reassigning.`}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Brands
   ══════════════════════════════════════════════════════════════════════ */
export const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = {
    name: '', slug: '', logo: '', banner: '', description: '',
    isActive: true, seo: { title: '', description: '', keywords: '' },
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(() => {
    setLoading(true);
    brandService.getAdminBrands()
      .then(({ data }) => setBrands(data.data.brands || []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (brand) => {
    setEditing(brand || 'new');
    setForm(brand ? { ...blank, ...brand, seo: { ...blank.seo, ...(brand.seo || {}) } } : blank);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload._id; delete payload.__v; delete payload.createdAt;
      delete payload.updatedAt; delete payload.productCount; delete payload.id;

      if (editing === 'new') await brandService.createBrand(payload);
      else await brandService.updateBrand(editing._id, payload);

      toast.success(editing === 'new' ? 'Brand created' : 'Brand updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await brandService.deleteBrand(confirm._id);
      toast.success('Brand deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Brands"
        subtitle="Manage the brands you stock, with logos, banners and SEO metadata."
        actions={<button type="button" className="btn-primary btn-sm" onClick={() => open(null)}><HiOutlinePlus /> Add brand</button>}
      />

      <AdminTable
        columns={['Brand', 'Products', 'Status', '']}
        loading={loading}
        empty={!loading && brands.length === 0 ? 'No brands yet.' : null}
      >
        {brands.map((brand) => (
          <tr key={brand._id}>
            <td>
              <div className="admin-product-cell">
                <span className="admin-thumb">
                  {brand.logo ? <img src={brand.logo} alt="" loading="lazy" /> : '🏢'}
                </span>
                <div>
                  <strong>{brand.name}</strong>
                  <span className="admin-cell-sub">/{brand.slug}</span>
                </div>
              </div>
            </td>
            <td className="admin-cell-num">{brand.productCount ?? '—'}</td>
            <td>
              <span className={`status-pill tone-${brand.isActive ? 'success' : 'muted'}`}>
                {brand.isActive ? 'Active' : 'Hidden'}
              </span>
            </td>
            <td>
              <div className="admin-row-actions">
                <button type="button" onClick={() => open(brand)} title="Edit"><HiOutlinePencil /></button>
                <button type="button" className="is-danger" onClick={() => setConfirm(brand)} title="Delete">
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New brand' : 'Edit brand'}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save brand'}
            </button>
          </>
        )}
      >
        <form className="admin-form-grid" onSubmit={save}>
          <div className="form-field span-2">
            <label htmlFor="brand-name">Name *</label>
            <input id="brand-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-field span-2">
            <label htmlFor="brand-slug">Slug</label>
            <input id="brand-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="Auto-generated" />
          </div>
          <div className="form-field">
            <label htmlFor="brand-logo">Logo URL</label>
            <input id="brand-logo" value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} />
          </div>
          <div className="form-field">
            <label htmlFor="brand-banner">Banner URL</label>
            <input id="brand-banner" value={form.banner} onChange={(e) => setForm((f) => ({ ...f, banner: e.target.value }))} />
          </div>
          <div className="form-field span-2">
            <label htmlFor="brand-desc">Description</label>
            <textarea id="brand-desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-field span-2">
            <label htmlFor="brand-seo-title">SEO title</label>
            <input
              id="brand-seo-title" maxLength={70}
              value={form.seo.title}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, title: e.target.value } }))}
            />
          </div>
          <div className="form-field span-2">
            <label htmlFor="brand-seo-desc">SEO description</label>
            <textarea
              id="brand-seo-desc" rows={2} maxLength={160}
              value={form.seo.description}
              onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, description: e.target.value } }))}
            />
          </div>
          <label className="form-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Visible on the storefront
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete brand?"
        message={`"${confirm?.name}" will be removed from the catalogue.`}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Coupons
   ══════════════════════════════════════════════════════════════════════ */
export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = {
    code: '', type: 'percentage', value: '', minOrderValue: 0, maxDiscount: '',
    expiryDate: '', usageLimit: '', usageLimitPerUser: 1, isActive: true, description: '',
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(() => {
    setLoading(true);
    couponService.getCoupons()
      .then(({ data }) => setCoupons(data.data.coupons || []))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (coupon) => {
    setEditing(coupon || 'new');
    setForm(coupon
      ? {
        ...blank,
        ...coupon,
        expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
        maxDiscount: coupon.maxDiscount ?? '',
        usageLimit: coupon.usageLimit ?? '',
      }
      : blank);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        value: Number(form.value),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: form.maxDiscount === '' ? undefined : Number(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        usageLimitPerUser: Number(form.usageLimitPerUser) || 1,
      };
      delete payload._id; delete payload.__v; delete payload.createdAt;
      delete payload.updatedAt; delete payload.usedBy; delete payload.usedCount; delete payload.id;

      if (editing === 'new') await couponService.createCoupon(payload);
      else await couponService.updateCoupon(editing._id, payload);

      toast.success(editing === 'new' ? 'Coupon created' : 'Coupon updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await couponService.deleteCoupon(confirm._id);
      toast.success('Coupon deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Coupons"
        subtitle="Percentage or fixed discounts with minimum order value, expiry and usage limits."
        actions={<button type="button" className="btn-primary btn-sm" onClick={() => open(null)}><HiOutlinePlus /> Add coupon</button>}
      />

      <AdminTable
        columns={['Code', 'Discount', 'Min order', 'Expires', 'Used', 'Status', '']}
        loading={loading}
        empty={!loading && coupons.length === 0 ? 'No coupons yet.' : null}
      >
        {coupons.map((coupon) => {
          const expired = new Date(coupon.expiryDate) < new Date();
          return (
            <tr key={coupon._id}>
              <td>
                <strong className="admin-code">{coupon.code}</strong>
                {coupon.description && <span className="admin-cell-sub">{coupon.description}</span>}
              </td>
              <td>
                {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                {coupon.maxDiscount && <span className="admin-cell-sub">max {formatCurrency(coupon.maxDiscount)}</span>}
              </td>
              <td className="admin-cell-num">{formatCurrency(coupon.minOrderValue)}</td>
              <td>{formatDate(coupon.expiryDate)}</td>
              <td className="admin-cell-num">
                {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
              </td>
              <td>
                <span className={`status-pill tone-${!coupon.isActive ? 'muted' : expired ? 'error' : 'success'}`}>
                  {!coupon.isActive ? 'Disabled' : expired ? 'Expired' : 'Active'}
                </span>
              </td>
              <td>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => open(coupon)} title="Edit"><HiOutlinePencil /></button>
                  <button type="button" className="is-danger" onClick={() => setConfirm(coupon)} title="Delete">
                    <HiOutlineTrash />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New coupon' : 'Edit coupon'}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save coupon'}
            </button>
          </>
        )}
      >
        <form className="admin-form-grid" onSubmit={save}>
          <div className="form-field">
            <label htmlFor="c-code">Code *</label>
            <input
              id="c-code" required
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="WELCOME10"
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-type">Type *</label>
            <select id="c-type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="c-value">{form.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *</label>
            <input
              id="c-value" type="number" min="0" required
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-max">Max discount (₹)</label>
            <input
              id="c-max" type="number" min="0"
              value={form.maxDiscount}
              onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))}
              disabled={form.type !== 'percentage'}
              placeholder="Caps a percentage discount"
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-min">Minimum order (₹)</label>
            <input
              id="c-min" type="number" min="0"
              value={form.minOrderValue}
              onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-expiry">Expiry date *</label>
            <input
              id="c-expiry" type="date" required
              value={form.expiryDate}
              onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-limit">Total uses</label>
            <input
              id="c-limit" type="number" min="0"
              value={form.usageLimit}
              onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              placeholder="Blank = unlimited"
            />
          </div>

          <div className="form-field">
            <label htmlFor="c-per-user">Uses per customer</label>
            <input
              id="c-per-user" type="number" min="1"
              value={form.usageLimitPerUser}
              onChange={(e) => setForm((f) => ({ ...f, usageLimitPerUser: e.target.value }))}
            />
          </div>

          <div className="form-field span-2">
            <label htmlFor="c-desc">Description</label>
            <input
              id="c-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="10% off your first order"
            />
          </div>

          <label className="form-check">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete coupon?"
        message={`Coupon "${confirm?.code}" will stop working immediately.`}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Banners
   ══════════════════════════════════════════════════════════════════════ */
export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const blank = {
    title: '', subtitle: '', image: '', mobileImage: '', link: '',
    buttonText: 'Shop Now', sortOrder: 0, isActive: true, startDate: '', endDate: '',
  };
  const [form, setForm] = useState(blank);

  const load = useCallback(() => {
    setLoading(true);
    bannerService.getAdminBanners()
      .then(({ data }) => setBanners(data.data.banners || []))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const open = (banner) => {
    setEditing(banner || 'new');
    setForm(banner
      ? {
        ...blank,
        ...banner,
        startDate: banner.startDate ? banner.startDate.slice(0, 10) : '',
        endDate: banner.endDate ? banner.endDate.slice(0, 10) : '',
      }
      : blank);
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.image || !form.image.trim()) {
      toast.error('Please enter a banner image URL.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title?.trim() || `Hero Slide ${banners.length + 1}`,
        sortOrder: Number(form.sortOrder) || 0,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      };
      delete payload._id; delete payload.__v; delete payload.createdAt; delete payload.updatedAt; delete payload.id;

      if (editing === 'new') await bannerService.createBanner(payload);
      else await bannerService.updateBanner(editing._id, payload);

      toast.success(editing === 'new' ? 'Banner created' : 'Banner updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await bannerService.deleteBanner(confirm._id);
      toast.success('Banner deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Homepage banners"
        subtitle="Manage the hero carousel slides — upload image URLs, links, and text."
        actions={<button type="button" className="btn-primary btn-sm" onClick={() => open(null)}><HiOutlinePlus /> Add banner</button>}
      />

      <AdminTable
        columns={['Banner', 'Link', 'Schedule', 'Order', 'Status', '']}
        loading={loading}
        empty={!loading && banners.length === 0 ? 'No banners yet — the homepage falls back to its default hero.' : null}
      >
        {banners.map((banner) => (
          <tr key={banner._id}>
            <td>
              <div className="admin-product-cell">
                <span className="admin-thumb admin-thumb-wide">
                  {banner.image ? <img src={banner.image} alt="" loading="lazy" /> : '🖼️'}
                </span>
                <div>
                  <strong>{banner.title}</strong>
                  {banner.subtitle && <span className="admin-cell-sub">{banner.subtitle}</span>}
                </div>
              </div>
            </td>
            <td><span className="admin-cell-sub">{banner.link || '—'}</span></td>
            <td>
              <span className="admin-cell-sub">
                {banner.startDate ? formatDate(banner.startDate) : 'Always'}
                {banner.endDate ? ` → ${formatDate(banner.endDate)}` : ''}
              </span>
            </td>
            <td className="admin-cell-num">{banner.sortOrder}</td>
            <td>
              <span className={`status-pill tone-${banner.isActive ? 'success' : 'muted'}`}>
                {banner.isActive ? 'Live' : 'Hidden'}
              </span>
            </td>
            <td>
              <div className="admin-row-actions">
                <button type="button" onClick={() => open(banner)} title="Edit"><HiOutlinePencil /></button>
                <button type="button" className="is-danger" onClick={() => setConfirm(banner)} title="Delete">
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New hero banner' : 'Edit hero banner'}
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save banner'}
            </button>
          </>
        )}
      >
        <form className="admin-form-grid" onSubmit={save}>
          <div className="form-field span-2">
            <label htmlFor="b-image">Banner Image URL *</label>
            <input
              id="b-image"
              required
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://images.unsplash.com/... or any hosted image URL"
            />
            {form.image ? (
              <div className="admin-image-preview is-wide" style={{ height: '140px', marginTop: '0.625rem', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img src={form.image} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <span className="form-hint">Paste any hosted image URL (Unsplash, Cloudinary, AWS S3, etc.)</span>
            )}
          </div>

          <div className="form-field span-2">
            <label htmlFor="b-title">Title (Optional)</label>
            <input
              id="b-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Everything Your Pet Needs"
            />
          </div>

          <div className="form-field span-2">
            <label htmlFor="b-subtitle">Subtitle (Optional)</label>
            <input
              id="b-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
              placeholder="e.g. Premium food, toys and accessories"
            />
          </div>

          <div className="form-field span-2">
            <label htmlFor="b-mobile">Mobile Image URL (Optional)</label>
            <input
              id="b-mobile"
              value={form.mobileImage}
              onChange={(e) => setForm((f) => ({ ...f, mobileImage: e.target.value }))}
              placeholder="Optional separate image URL for mobile screens"
            />
            <span className="form-hint">
              Optional — a portrait-friendly crop keeps the hero compact on mobile devices.
            </span>
          </div>

          <div className="form-field">
            <label htmlFor="b-link">CTA Link</label>
            <input
              id="b-link"
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="/shop or /categories"
            />
          </div>

          <div className="form-field">
            <label htmlFor="b-button">Button Text</label>
            <input
              id="b-button"
              value={form.buttonText}
              onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
              placeholder="Shop Now"
            />
          </div>

          <div className="form-field">
            <label htmlFor="b-order">Sort Order</label>
            <input
              id="b-order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="form-field">
            <label className="form-check" style={{ marginTop: '1.75rem' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Live on homepage carousel
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete banner?"
        message={`"${confirm?.title}" will be removed from the homepage.`}
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Reviews
   ══════════════════════════════════════════════════════════════════════ */
export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(null);
  const [reply, setReply] = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    reviewService.getAllReviews({ page, limit: 20 })
      .then(({ data }) => {
        setReviews(data.data.reviews || []);
        setPagination(data.data.pagination);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleApproval = async (review) => {
    try {
      await reviewService.toggleApproval(review._id);
      toast.success(review.isApproved ? 'Review hidden' : 'Review approved');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const sendReply = async () => {
    try {
      await reviewService.replyToReview(replying._id, reply);
      toast.success('Reply posted');
      setReplying(null);
      setReply('');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async () => {
    try {
      await reviewService.deleteReview(confirm._id);
      toast.success('Review deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
      setConfirm(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Reviews"
        subtitle="Approve, reply to or remove customer reviews."
      />

      <AdminTable
        columns={['Review', 'Product', 'Customer', 'Rating', 'Status', '']}
        loading={loading}
        empty={!loading && reviews.length === 0 ? 'No reviews yet.' : null}
      >
        {reviews.map((review) => (
          <tr key={review._id}>
            <td style={{ maxWidth: 320 }}>
              {review.title && <strong>{review.title}</strong>}
              <span className="admin-cell-sub admin-review-text">{review.comment}</span>
              {review.adminReply?.comment && (
                <span className="admin-cell-sub is-positive">↳ {review.adminReply.comment}</span>
              )}
            </td>
            <td>{review.product?.name || '—'}</td>
            <td>
              {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
              <span className="admin-cell-sub">{timeAgo(review.createdAt)}</span>
              {review.isVerifiedPurchase && <span className="admin-flag">Verified</span>}
            </td>
            <td className="admin-cell-num">{'★'.repeat(review.rating)}</td>
            <td>
              <span className={`status-pill tone-${review.isApproved ? 'success' : 'warning'}`}>
                {review.isApproved ? 'Published' : 'Hidden'}
              </span>
            </td>
            <td>
              <div className="admin-row-actions">
                <button type="button" onClick={() => toggleApproval(review)}>
                  {review.isApproved ? 'Hide' : 'Approve'}
                </button>
                <button type="button" onClick={() => { setReplying(review); setReply(review.adminReply?.comment || ''); }}>
                  Reply
                </button>
                <button type="button" className="is-danger" onClick={() => setConfirm(review)} title="Delete">
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminPagination pagination={pagination} page={page} onPage={setPage} />

      <Modal
        open={Boolean(replying)}
        onClose={() => setReplying(null)}
        title="Reply to review"
        footer={(
          <>
            <button type="button" className="btn-secondary" onClick={() => setReplying(null)}>Cancel</button>
            <button type="button" className="btn-primary" onClick={sendReply} disabled={!reply.trim()}>Post reply</button>
          </>
        )}
      >
        {replying && (
          <>
            <blockquote className="admin-quote">
              <strong>{'★'.repeat(replying.rating)}</strong> {replying.comment}
            </blockquote>
            <div className="form-field">
              <label htmlFor="reply">Your reply (shown publicly)</label>
              <textarea id="reply" rows={4} value={reply} onChange={(e) => setReply(e.target.value)} />
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete review?"
        message="This review will be permanently removed and the product's rating recalculated."
        onCancel={() => setConfirm(null)}
        onConfirm={remove}
      />
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   Customers
   ══════════════════════════════════════════════════════════════════════ */
export const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const load = useCallback(() => {
    setLoading(true);
    userAdminService.getAllUsers({ page, limit: 20, search: debouncedSearch || undefined })
      .then(({ data }) => {
        setUsers(data.data.users || []);
        setPagination(data.data.pagination);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const toggleStatus = async (user) => {
    try {
      await userAdminService.updateUserStatus(user._id, !user.isActive);
      toast.success(user.isActive ? 'Account deactivated' : 'Account reactivated');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <AdminPageHeader
        title="Customers"
        subtitle={`${pagination.total} registered account${pagination.total === 1 ? '' : 's'}`}
      />

      <div className="admin-filters">
        <div className="admin-search">
          <HiOutlineSearch />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <AdminTable
        columns={['Customer', 'Contact', 'Signed up', 'Sign-in', 'Role', 'Status', '']}
        loading={loading}
        empty={!loading && users.length === 0 ? 'No customers found.' : null}
      >
        {users.map((user) => (
          <tr key={user._id}>
            <td>
              <strong>{user.firstName} {user.lastName}</strong>
              <span className="admin-cell-sub">{user.email}</span>
            </td>
            <td>{user.phone || '—'}</td>
            <td>
              {formatDate(user.createdAt)}
              {user.lastLogin && <span className="admin-cell-sub">Last seen {timeAgo(user.lastLogin)}</span>}
            </td>
            <td>{user.authProvider === 'google' ? 'Google' : 'Email'}</td>
            <td>
              <span className={`status-pill tone-${user.role === 'admin' ? 'primary' : 'muted'}`}>
                {user.role}
              </span>
            </td>
            <td>
              <span className={`status-pill tone-${user.isActive ? 'success' : 'error'}`}>
                {user.isActive ? 'Active' : 'Deactivated'}
              </span>
            </td>
            <td>
              <div className="admin-row-actions">
                <button type="button" onClick={() => toggleStatus(user)}>
                  {user.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminPagination pagination={pagination} page={page} onPage={setPage} />
    </motion.div>
  );
};
