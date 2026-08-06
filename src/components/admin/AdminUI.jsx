import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

/**
 * Small shared building blocks for the admin panel. Keeping them here means
 * every admin screen gets the same modal behaviour, the same empty states and
 * the same table chrome without duplicating markup ten times.
 */

/* ── Modal ───────────────────────────────────────────────────────────── */
export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  // Escape closes, and the page behind must not scroll while a modal is open
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="admin-modal-root">
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`admin-modal admin-modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <header className="admin-modal-head">
              <h2>{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close"><HiX /></button>
            </header>
            <div className="admin-modal-body">{children}</div>
            {footer && <footer className="admin-modal-foot">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* ── Page header ─────────────────────────────────────────────────────── */
export const AdminPageHeader = ({ title, subtitle, actions }) => (
  <div className="admin-page-head">
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actions && <div className="admin-page-actions">{actions}</div>}
  </div>
);

/* ── Stat card ───────────────────────────────────────────────────────── */
export const StatCard = ({ icon: Icon, label, value, hint, tone = 'primary', trend }) => (
  <div className={`admin-stat tone-${tone}`}>
    <div className="admin-stat-top">
      <span className="admin-stat-icon">{Icon && <Icon />}</span>
      {trend !== undefined && trend !== null && (
        <span className={`admin-stat-trend ${Number(trend) >= 0 ? 'is-up' : 'is-down'}`}>
          {Number(trend) >= 0 ? '▲' : '▼'} {Math.abs(Number(trend))}%
        </span>
      )}
    </div>
    <strong className="admin-stat-value">{value}</strong>
    <span className="admin-stat-label">{label}</span>
    {hint && <span className="admin-stat-hint">{hint}</span>}
  </div>
);

/* ── Table shell ─────────────────────────────────────────────────────── */
export const AdminTable = ({ columns, children, empty, loading, colSpan }) => (
  <div className="admin-table-wrap">
    <table className="admin-table">
      <thead>
        <tr>{columns.map((col) => <th key={col} scope="col">{col}</th>)}</tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={colSpan || columns.length} className="admin-table-state">Loading…</td></tr>
        ) : empty ? (
          <tr><td colSpan={colSpan || columns.length} className="admin-table-state">{empty}</td></tr>
        ) : children}
      </tbody>
    </table>
  </div>
);

/* ── Pagination ──────────────────────────────────────────────────────── */
export const AdminPagination = ({ pagination, page, onPage }) => {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Previous</button>
      <span>Page {page} of {pagination.pages} · {pagination.total} total</span>
      <button type="button" disabled={page >= pagination.pages} onClick={() => onPage(page + 1)}>Next →</button>
    </nav>
  );
};

/* ── Repeatable text list (features, image URLs, tags) ───────────────── */
export const RepeatableList = ({ label, values = [], onChange, placeholder, hint, type = 'text' }) => (
  <div className="repeatable">
    <div className="repeatable-head">
      <label>{label}</label>
      <button type="button" onClick={() => onChange([...values, ''])}>
        <HiOutlinePlus /> Add
      </button>
    </div>
    {hint && <span className="form-hint">{hint}</span>}

    {values.length === 0 && <p className="repeatable-empty">None added yet.</p>}

    {values.map((value, index) => (
      <div key={index} className="repeatable-row">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            const next = [...values];
            next[index] = e.target.value;
            onChange(next);
          }}
        />
        {type === 'url' && value && (
          <span className="repeatable-preview"><img src={value} alt="" /></span>
        )}
        <button
          type="button"
          className="repeatable-remove"
          onClick={() => onChange(values.filter((_, i) => i !== index))}
          aria-label="Remove"
        >
          <HiOutlineTrash />
        </button>
      </div>
    ))}
  </div>
);

/* ── Repeatable key/value pairs (specifications) ─────────────────────── */
export const KeyValueList = ({ label, pairs = [], onChange, hint, keyPlaceholder = 'Weight', valuePlaceholder = '500 g' }) => (
  <div className="repeatable">
    <div className="repeatable-head">
      <label>{label}</label>
      <button type="button" onClick={() => onChange([...pairs, { key: '', value: '' }])}>
        <HiOutlinePlus /> Add row
      </button>
    </div>
    {hint && <span className="form-hint">{hint}</span>}

    {pairs.length === 0 && <p className="repeatable-empty">No specifications yet.</p>}

    {pairs.map((pair, index) => (
      <div key={index} className="repeatable-row">
        <input
          value={pair.key}
          placeholder={keyPlaceholder}
          onChange={(e) => {
            const next = [...pairs];
            next[index] = { ...next[index], key: e.target.value };
            onChange(next);
          }}
        />
        <input
          value={pair.value}
          placeholder={valuePlaceholder}
          onChange={(e) => {
            const next = [...pairs];
            next[index] = { ...next[index], value: e.target.value };
            onChange(next);
          }}
        />
        <button
          type="button"
          className="repeatable-remove"
          onClick={() => onChange(pairs.filter((_, i) => i !== index))}
          aria-label="Remove"
        >
          <HiOutlineTrash />
        </button>
      </div>
    ))}
  </div>
);

/* ── Confirm dialog ──────────────────────────────────────────────────── */
export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={(
      <>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </>
    )}
  >
    <p>{message}</p>
  </Modal>
);

export default Modal;
