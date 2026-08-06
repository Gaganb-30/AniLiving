import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiStar, HiOutlineStar,
  HiChevronRight, HiOutlineTruck, HiOutlineRefresh, HiOutlineShieldCheck,
  HiOutlineCreditCard, HiMinus, HiPlus,
} from 'react-icons/hi';
import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Seo, { productSchema, breadcrumbSchema, reviewSchema } from '../../components/seo/Seo';
import { productService, reviewService } from '../../services/apiServices';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import {
  formatCurrency, discountPercent, colorToCss, timeAgo, errorMessage,
} from '../../utils/format';

/* ══════════════════════════════════════════════════════════════════════
   Star rating (display + input)
   ══════════════════════════════════════════════════════════════════════ */
const Stars = ({ value = 0, size = 16, onChange }) => (
  <span className="stars" style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map((n) => {
      const filled = n <= Math.round(value);
      const Icon = filled ? HiStar : HiOutlineStar;
      return onChange ? (
        <button
          key={n}
          type="button"
          className="stars-btn"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Icon style={{ width: size, height: size }} />
        </button>
      ) : (
        <Icon key={n} style={{ width: size, height: size }} />
      );
    })}
  </span>
);

/* ══════════════════════════════════════════════════════════════════════
   Product detail page
   ══════════════════════════════════════════════════════════════════════ */
const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Which value is picked for each attribute, e.g. { Color: 'Red', Size: 'L' }
  const [selection, setSelection] = useState({});
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState('description');

  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // -------------------------------------------------------------------
  // Load product
  // -------------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);
    setTab('description');

    productService.getProductBySlug(slug)
      .then(({ data }) => {
        if (!alive) return;
        const p = data.data.product;
        setProduct(p);

        // Preselect the variant carried over from the listing card, or the
        // first variant that is actually in stock.
        const requested = searchParams.get('variant');
        const preferred = p.variants?.find((v) => v._id === requested)
          || p.variants?.find((v) => v.stock > 0)
          || p.variants?.[0];

        if (preferred?.attributeCombination) {
          setSelection({ ...preferred.attributeCombination });
        } else {
          setSelection({});
        }
      })
      .catch(() => { if (alive) setNotFound(true); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Reviews load separately so a slow review query never blocks the buy box
  useEffect(() => {
    if (!product?._id) return;
    reviewService.getProductReviews(product._id, { limit: 20 })
      .then(({ data }) => {
        setReviews(data.data.reviews || []);
        setRatingDistribution(data.data.ratingDistribution || []);
      })
      .catch(() => setReviews([]));
  }, [product?._id]);

  // -------------------------------------------------------------------
  // Variant resolution
  // -------------------------------------------------------------------

  /** The variant matching every currently selected attribute value */
  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    const keys = Object.keys(selection);
    if (!keys.length) return null;

    return product.variants.find((variant) => {
      const combo = variant.attributeCombination || {};
      return keys.every((key) => String(combo[key]) === String(selection[key]));
    }) || null;
  }, [product, selection]);

  /**
   * Attribute options with an `available` flag.
   *
   * A value counts as available when *some* in-stock variant exists that has
   * this value together with the shopper's other current choices — the same
   * greying-out behaviour you get on a marketplace size picker.
   */
  const attributeOptions = useMemo(() => {
    if (!product?.attributes?.length || !product?.variants?.length) return [];

    return product.attributes.map((attribute) => ({
      name: attribute.name,
      values: attribute.values.map((value) => {
        const others = Object.entries(selection).filter(([k]) => k !== attribute.name);
        const match = product.variants.find((variant) => {
          const combo = variant.attributeCombination || {};
          return String(combo[attribute.name]) === String(value)
            && others.every(([k, v]) => String(combo[k]) === String(v));
        });
        return {
          value,
          available: Boolean(match && match.stock > 0 && match.isActive !== false),
          image: match?.images?.[0],
        };
      }),
    }));
  }, [product, selection]);

  /** Gallery: variant images take priority, otherwise the product's own set */
  const gallery = useMemo(() => {
    if (!product) return [];
    const variantImages = activeVariant?.images?.filter(Boolean) || [];
    if (variantImages.length) return variantImages;
    return [product.thumbnail, ...(product.images || [])].filter(Boolean);
  }, [product, activeVariant]);

  // Reset the gallery index whenever the image set changes underneath it
  useEffect(() => { setActiveImage(0); }, [activeVariant?._id]);

  const pricing = useMemo(() => {
    if (!product) return { price: 0, mrp: 0, discount: 0, stock: 0 };
    const price = activeVariant?.price ?? product.price;
    const mrp = activeVariant?.mrp ?? product.mrp;
    const stock = activeVariant ? activeVariant.stock : product.stock;
    return { price, mrp, discount: discountPercent(price, mrp) || product.discount || 0, stock };
  }, [product, activeVariant]);

  const needsVariantChoice = Boolean(product?.variants?.length) && !activeVariant;
  const inStock = pricing.stock > 0
    && !['out_of_stock', 'discontinued'].includes(product?.availability);

  const selectAttribute = useCallback((name, value) => {
    setSelection((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  }, []);

  // Keep the URL in sync so the chosen variant is shareable / bookmarkable
  useEffect(() => {
    if (!activeVariant) return;
    const params = new URLSearchParams(searchParams);
    if (params.get('variant') !== activeVariant._id) {
      params.set('variant', activeVariant._id);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVariant?._id]);

  // -------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------
  const handleAddToCart = async ({ buyNow = false } = {}) => {
    if (needsVariantChoice) {
      toast.error('Please choose all options first.');
      return;
    }
    if (!inStock) return;

    setAdding(true);
    const ok = await addItem(product, {
      quantity,
      variantId: activeVariant?._id || null,
      variant: activeVariant?.attributeCombination || null,
      thumbnail: gallery[0],
      price: pricing.price,
      maxStock: pricing.stock,
    });
    setAdding(false);
    if (ok && buyNow) navigate('/checkout');
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast('Sign in to write a review', { icon: '🔒' });
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    if (reviewForm.comment.trim().length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview({ productId: product._id, ...reviewForm });
      toast.success('Thanks for your review!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      const { data } = await reviewService.getProductReviews(product._id, { limit: 20 });
      setReviews(data.data.reviews || []);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not submit your review.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  if (loading) {
    return <div className="container-custom section-padding"><LoadingSpinner size="lg" text="Loading product…" /></div>;
  }

  if (notFound || !product) {
    return (
      <div className="container-custom section-padding">
        <Seo title="Product not found" noindex />
        <div className="empty-state">
          <span className="empty-state-icon">🐾</span>
          <h1 className="empty-state-title">We couldn&apos;t find that product</h1>
          <p className="empty-state-description">It may have been removed or renamed.</p>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>Browse the shop</Link>
        </div>
      </div>
    );
  }

  const specifications = Object.entries(product.specifications || {});
  const wishlisted = isWishlisted(product._id);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(product.category ? [{ name: product.category.name, path: `/shop?category=${product.category.slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <>
      <Seo
        title={product.seo?.title || product.name}
        description={product.seo?.description || product.shortDescription || `Buy ${product.name} online at AniLiving.`}
        keywords={product.seo?.keywords || product.tags?.join(', ')}
        canonical={product.seo?.canonicalUrl || `/product/${product.slug}`}
        image={gallery[0]}
        type="product"
        jsonLd={[
          productSchema(product),
          breadcrumbSchema(breadcrumbs),
          ...(reviewSchema(reviews, product.name) || []),
        ]}
      />

      <div className="container-custom pdp">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="breadcrumb-item">
              {i < breadcrumbs.length - 1
                ? <Link to={crumb.path}>{crumb.name}</Link>
                : <span aria-current="page">{crumb.name}</span>}
              {i < breadcrumbs.length - 1 && <HiChevronRight className="breadcrumb-sep" />}
            </span>
          ))}
        </nav>

        <div className="pdp-grid">
          {/* ── Gallery ─────────────────────────────────────────────── */}
          <div className="pdp-gallery">
            <div className="pdp-main-image">
              <AnimatePresence mode="wait">
                <motion.img
                  key={gallery[activeImage] || 'placeholder'}
                  src={gallery[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0.4, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              {pricing.discount > 0 && (
                <span className="pdp-discount-badge">{pricing.discount}% OFF</span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="pdp-thumbs">
                {gallery.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    className={`pdp-thumb ${i === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {product.videoUrl && (
              <a href={product.videoUrl} target="_blank" rel="noreferrer" className="pdp-video-link">
                ▶ Watch product video
              </a>
            )}
          </div>

          {/* ── Buy box ─────────────────────────────────────────────── */}
          <div className="pdp-info">
            {product.brand?.name && (
              <Link to={`/shop?brand=${product.brand.slug}`} className="pdp-brand">{product.brand.name}</Link>
            )}

            <h1 className="pdp-title">{product.name}</h1>

            {product.ratingsCount > 0 && (
              <button type="button" className="pdp-rating" onClick={() => setTab('reviews')}>
                <Stars value={product.ratingsAverage} />
                <span className="pdp-rating-value">{product.ratingsAverage?.toFixed(1)}</span>
                <span className="pdp-rating-count">{product.ratingsCount} review{product.ratingsCount > 1 ? 's' : ''}</span>
              </button>
            )}

            {product.shortDescription && <p className="pdp-short">{product.shortDescription}</p>}

            <div className="pdp-price-row">
              <span className="pdp-price">{formatCurrency(pricing.price)}</span>
              {pricing.mrp > pricing.price && (
                <>
                  <span className="pdp-mrp">{formatCurrency(pricing.mrp)}</span>
                  <span className="pdp-save">Save {formatCurrency(pricing.mrp - pricing.price)}</span>
                </>
              )}
            </div>
            <p className="pdp-tax-note">Inclusive of all taxes</p>

            {/* ── Attribute pickers (colour, size, anything the admin defines) ── */}
            {attributeOptions.map((attribute) => {
              const isColor = /colou?r|shade/i.test(attribute.name);
              return (
                <div key={attribute.name} className="pdp-attribute">
                  <div className="pdp-attribute-head">
                    <span className="pdp-attribute-name">{attribute.name}</span>
                    {selection[attribute.name] && (
                      <span className="pdp-attribute-value">{selection[attribute.name]}</span>
                    )}
                  </div>

                  <div className={`pdp-attribute-options ${isColor ? 'is-color' : ''}`}>
                    {attribute.values.map((option) => {
                      const selected = selection[attribute.name] === option.value;
                      const css = isColor ? colorToCss(option.value) : null;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={[
                            isColor ? 'pdp-swatch' : 'pdp-chip',
                            selected ? 'is-active' : '',
                            option.available ? '' : 'is-unavailable',
                          ].join(' ')}
                          onClick={() => selectAttribute(attribute.name, option.value)}
                          title={option.available ? option.value : `${option.value} — out of stock`}
                          aria-pressed={selected}
                        >
                          {isColor && css
                            ? <span className="pdp-swatch-fill" style={{ background: css }} />
                            : null}
                          {isColor && !css && option.image
                            ? <img src={option.image} alt={option.value} />
                            : null}
                          {(!isColor || (!css && !option.image)) && <span>{option.value}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* ── Stock line ─────────────────────────────────────────── */}
            <p className={`pdp-stock ${inStock ? 'in' : 'out'}`}>
              {needsVariantChoice
                ? 'Select all options to see availability'
                : inStock
                  ? (pricing.stock <= (product.lowStockAlert || 5)
                    ? `Hurry — only ${pricing.stock} left in stock`
                    : 'In stock')
                  : 'Currently out of stock'}
            </p>

            {/* ── Quantity + actions ─────────────────────────────────── */}
            <div className="pdp-actions">
              <div className="qty-stepper" aria-label="Quantity">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                ><HiMinus /></button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(pricing.stock || 1, q + 1))}
                  disabled={quantity >= pricing.stock}
                  aria-label="Increase quantity"
                ><HiPlus /></button>
              </div>

              <button
                type="button"
                className="btn-primary pdp-add-btn"
                onClick={() => handleAddToCart()}
                disabled={!inStock || adding || needsVariantChoice}
              >
                <HiOutlineShoppingCart />
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>

              <button
                type="button"
                className="btn-secondary pdp-buy-btn"
                onClick={() => handleAddToCart({ buyNow: true })}
                disabled={!inStock || adding || needsVariantChoice}
              >
                Buy Now
              </button>

              <button
                type="button"
                className={`pdp-wish-btn ${wishlisted ? 'is-active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
              </button>
            </div>

            {/* ── Trust strip ────────────────────────────────────────── */}
            <ul className="pdp-usps">
              <li><HiOutlineTruck /> Free delivery on prepaid orders</li>
              <li><HiOutlineRefresh /> Easy 7-day returns</li>
              <li><HiOutlineShieldCheck /> 100% genuine products</li>
              <li><HiOutlineCreditCard /> UPI, cards, netbanking &amp; COD</li>
            </ul>

            {product.features?.length > 0 && (
              <div className="pdp-features">
                <h2>Key features</h2>
                <ul>
                  {product.features.map((feature, i) => <li key={i}>{feature}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="pdp-tabs">
          <div className="pdp-tab-bar" role="tablist">
            {[
              ['description', 'Description'],
              ['specifications', `Specifications${specifications.length ? ` (${specifications.length})` : ''}`],
              ['reviews', `Reviews${product.ratingsCount ? ` (${product.ratingsCount})` : ''}`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`pdp-tab ${tab === key ? 'is-active' : ''}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="pdp-tab-panel">
            {tab === 'description' && (
              <div className="pdp-description">
                {/* Rich description is authored by the admin, so HTML is intentional */}
                {product.richDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: product.richDescription }} />
                ) : product.longDescription ? (
                  product.longDescription.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p>{product.shortDescription || 'No description has been added for this product yet.'}</p>
                )}
              </div>
            )}

            {tab === 'specifications' && (
              specifications.length > 0 ? (
                <table className="pdp-spec-table">
                  <tbody>
                    {specifications.map(([key, value]) => (
                      <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : <p className="pdp-empty-note">No specifications listed for this product.</p>
            )}

            {tab === 'reviews' && (
              <div className="pdp-reviews">
                {product.ratingsCount > 0 && (
                  <div className="pdp-review-summary">
                    <div className="pdp-review-score">
                      <strong>{product.ratingsAverage?.toFixed(1)}</strong>
                      <Stars value={product.ratingsAverage} size={18} />
                      <span>{product.ratingsCount} rating{product.ratingsCount > 1 ? 's' : ''}</span>
                    </div>
                    <div className="pdp-review-bars">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingDistribution.find((d) => d._id === star)?.count || 0;
                        const pct = product.ratingsCount ? (count / product.ratingsCount) * 100 : 0;
                        return (
                          <div key={star} className="pdp-review-bar">
                            <span className="pdp-review-bar-label">{star}★</span>
                            <span className="pdp-review-bar-track">
                              <span className="pdp-review-bar-fill" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="pdp-review-bar-count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form className="pdp-review-form" onSubmit={submitReview}>
                  <h3>Write a review</h3>
                  <Stars
                    value={reviewForm.rating}
                    size={24}
                    onChange={(rating) => setReviewForm((f) => ({ ...f, rating }))}
                  />
                  <input
                    type="text"
                    placeholder="Give your review a title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    maxLength={200}
                  />
                  <textarea
                    rows={4}
                    placeholder="How did your pet like it?"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    maxLength={2000}
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>

                {reviews.length === 0 ? (
                  <p className="pdp-empty-note">No reviews yet — be the first to review this product.</p>
                ) : (
                  <ul className="pdp-review-list">
                    {reviews.map((review) => (
                      <li key={review._id} className="pdp-review">
                        <div className="pdp-review-head">
                          <Stars value={review.rating} size={14} />
                          <span className="pdp-review-author">
                            {review.user?.firstName || 'Verified buyer'}
                          </span>
                          {review.isVerifiedPurchase && (
                            <span className="pdp-review-verified">Verified purchase</span>
                          )}
                          <span className="pdp-review-date">{timeAgo(review.createdAt)}</span>
                        </div>
                        {review.title && <h4>{review.title}</h4>}
                        <p>{review.comment}</p>
                        {review.images?.length > 0 && (
                          <div className="pdp-review-images">
                            {review.images.map((src, i) => (
                              <img key={i} src={src} alt="" loading="lazy" />
                            ))}
                          </div>
                        )}
                        {review.adminReply?.comment && (
                          <div className="pdp-review-reply">
                            <strong>AniLiving replied:</strong> {review.adminReply.comment}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Frequently bought together ────────────────────────────── */}
        {product.frequentlyBoughtTogether?.length > 0 && (
          <section className="pdp-related">
            <div className="section-title" style={{ textAlign: 'left' }}>
              <h2>Frequently bought together</h2>
            </div>
            <div className="product-grid">
              {product.frequentlyBoughtTogether.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Related ───────────────────────────────────────────────── */}
        {product.relatedProducts?.length > 0 && (
          <section className="pdp-related">
            <div className="section-title" style={{ textAlign: 'left' }}>
              <h2>You may also like</h2>
            </div>
            <div className="product-grid">
              {product.relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Sticky mobile buy bar ───────────────────────────────────── */}
      <div className="pdp-sticky-bar">
        <div className="pdp-sticky-price">
          <strong>{formatCurrency(pricing.price)}</strong>
          {pricing.mrp > pricing.price && <span>{formatCurrency(pricing.mrp)}</span>}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleAddToCart()}
          disabled={!inStock || adding || needsVariantChoice}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </>
  );
};

export default ProductDetailPage;
