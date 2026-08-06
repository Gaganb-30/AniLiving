import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiStar } from 'react-icons/hi';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { formatCurrency, discountPercent, colorToCss } from '../../utils/format';

/**
 * ProductCard
 *
 * One card per product — never one per colour. When a product has colour
 * variants they appear as swatches under the price; picking a swatch swaps the
 * card's image, price and stock in place, exactly like Amazon and Flipkart.
 * The chosen colour is carried through to the cart and to the product page.
 */
const ProductCard = ({ product, onAddToCart, onToggleWishlist }) => {
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);

  const colorOptions = product.colorOptions || [];
  const [selectedColor, setSelectedColor] = useState(() => (
    colorOptions.find((c) => c.stock > 0) || colorOptions[0] || null
  ));

  // The selected swatch overrides the base product's image and pricing
  const display = useMemo(() => {
    const image = selectedColor?.image || product.thumbnail;
    const price = selectedColor?.price ?? product.price;
    const mrp = selectedColor?.mrp ?? product.mrp;
    return {
      image,
      price,
      mrp,
      discount: discountPercent(price, mrp) || product.discount || 0,
      inStock: selectedColor ? selectedColor.stock > 0 : (product.inStock ?? product.stock > 0),
    };
  }, [selectedColor, product]);

  const wishlisted = isWishlisted(product._id);

  // Badge priority: stock state first, then merchandising flags, then discount
  const badge = useMemo(() => {
    if (!display.inStock) return { text: 'Out of Stock', className: 'badge-out' };
    if (product.isFlashDeal) return { text: 'Flash Deal', className: 'badge-discount' };
    if (product.isBestSeller) return { text: 'Best Seller', className: 'badge-best-seller' };
    if (product.isNewArrival) return { text: 'New', className: 'badge-new' };
    if (product.isTrending) return { text: 'Trending', className: 'badge-trending' };
    if (display.discount > 0) return { text: `${display.discount}% OFF`, className: 'badge-discount' };
    return null;
  }, [product, display]);

  // Preserve the shopper's colour choice when they open the product page
  const productLink = selectedColor
    ? `/product/${product.slug}?variant=${selectedColor.variantId}`
    : `/product/${product.slug}`;

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onAddToCart) { onAddToCart(product, selectedColor); return; }
    if (!display.inStock) return;

    setAdding(true);
    await addItem(product, {
      quantity: 1,
      variantId: selectedColor?.variantId || null,
      variant: selectedColor ? { [selectedColor.name]: selectedColor.value } : null,
      thumbnail: display.image,
      price: display.price,
      maxStock: selectedColor?.stock ?? product.stock,
    });
    setAdding(false);
  };

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onToggleWishlist) { onToggleWishlist(product); return; }
    toggleWishlist(product);
  };

  return (
    <article className="product-card">
      <Link to={productLink} className="product-card-image-link">
        <div className="product-card-image">
          {display.image ? (
            <img src={display.image} alt={product.name} loading="lazy" decoding="async" />
          ) : (
            <div className="product-card-placeholder">🐾</div>
          )}
          {badge && <span className={`product-card-badge ${badge.className}`}>{badge.text}</span>}
        </div>
      </Link>

      <button
        type="button"
        className={`product-card-wish ${wishlisted ? 'is-active' : ''}`}
        onClick={handleWishlist}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wishlisted}
      >
        {wishlisted ? <HiHeart /> : <HiOutlineHeart />}
      </button>

      <div className="product-card-body">
        {product.brand?.name && <span className="product-card-brand">{product.brand.name}</span>}

        <Link to={productLink} className="product-card-title">{product.name}</Link>

        {product.ratingsCount > 0 && (
          <div className="product-card-rating">
            <HiStar className="product-card-star" />
            <span className="product-card-rating-value">{product.ratingsAverage?.toFixed(1)}</span>
            <span className="product-card-rating-count">({product.ratingsCount})</span>
          </div>
        )}

        <div className="product-card-price">
          <span className="product-card-current-price">{formatCurrency(display.price)}</span>
          {display.mrp > display.price && (
            <>
              <span className="product-card-mrp">{formatCurrency(display.mrp)}</span>
              <span className="product-card-discount">{display.discount}% off</span>
            </>
          )}
        </div>

        {/* ── Colour swatches ─────────────────────────────────────────── */}
        {colorOptions.length > 1 && (
          <div className="product-card-swatches" role="group" aria-label="Available colours">
            {colorOptions.slice(0, 5).map((option) => {
              const css = colorToCss(option.value);
              const active = selectedColor?.variantId === option.variantId;
              return (
                <button
                  key={option.variantId || option.value}
                  type="button"
                  title={`${option.value}${option.stock > 0 ? '' : ' — out of stock'}`}
                  aria-label={option.value}
                  aria-pressed={active}
                  className={`swatch ${active ? 'is-active' : ''} ${option.stock > 0 ? '' : 'is-empty'}`}
                  style={css ? { background: css } : undefined}
                  onClick={(e) => { e.preventDefault(); setSelectedColor(option); }}
                >
                  {!css && <span className="swatch-text">{option.value.slice(0, 2)}</span>}
                </button>
              );
            })}
            {colorOptions.length > 5 && (
              <Link to={productLink} className="swatch-more">+{colorOptions.length - 5}</Link>
            )}
          </div>
        )}

        <div className="product-card-actions">
          <button
            type="button"
            className="product-card-cart-btn"
            onClick={handleAddToCart}
            disabled={!display.inStock || adding}
          >
            <HiOutlineShoppingCart />
            {display.inStock ? (adding ? 'Adding…' : 'Add to Cart') : 'Out of Stock'}
          </button>
        </div>
      </div>
    </article>
  );
};

/** Skeleton placeholder shown while a product grid loads */
export const ProductCardSkeleton = () => (
  <div className="product-card skeleton">
    <div className="product-card-image skeleton-image" />
    <div className="product-card-body">
      <div className="skeleton-line" style={{ width: '40%', height: '10px' }} />
      <div className="skeleton-line" style={{ width: '85%', height: '14px' }} />
      <div className="skeleton-line" style={{ width: '55%', height: '16px' }} />
      <div className="skeleton-line" style={{ width: '100%', height: '38px', borderRadius: '10px' }} />
    </div>
  </div>
);

export default ProductCard;
