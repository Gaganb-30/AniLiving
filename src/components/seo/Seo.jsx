import { Helmet } from 'react-helmet-async';

/**
 * Seo — the single place every page declares its metadata.
 *
 * Emits title, description, canonical, Open Graph, Twitter cards and any
 * schema.org JSON-LD blocks passed in. Because it renders through
 * react-helmet-async, each route replaces the previous route's tags rather
 * than stacking them.
 */

const SITE_NAME = 'AniLiving';
const DEFAULT_DESCRIPTION = 'Shop premium pet supplies at AniLiving — food, toys, grooming and accessories for dogs and every companion. Free delivery on prepaid orders.';
const DEFAULT_IMAGE = '/images/hero-banner.png';

/** Absolute site origin; falls back to the browser origin during development */
export const siteUrl = (
  import.meta.env.VITE_SITE_URL
  || (typeof window !== 'undefined' ? window.location.origin : 'https://aniliving.com')
).replace(/\/+$/, '');

export const absoluteUrl = (path = '') => {
  if (!path) return siteUrl;
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
  children,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Everything Your Pet Deserves`;
  const canonicalUrl = absoluteUrl(canonical ?? (typeof window !== 'undefined' ? window.location.pathname : '/'));
  const imageUrl = absoluteUrl(image);

  // Accept a single object or an array of schema blocks
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow, max-image-preview:large" />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}

      {children}
    </Helmet>
  );
};

// ---------------------------------------------------------------------------
// schema.org builders
// ---------------------------------------------------------------------------

export const organizationSchema = (settings = {}) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: settings.siteName || SITE_NAME,
  url: siteUrl,
  logo: absoluteUrl(settings.logo || '/logo.png'),
  description: settings.seo?.description || DEFAULT_DESCRIPTION,
  ...(settings.contactPhone && {
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contactPhone,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  }),
  ...(settings.address && {
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressCountry: 'IN' },
  }),
  sameAs: Object.values(settings.socialLinks || {}).filter(Boolean),
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const productSchema = (product) => {
  if (!product) return null;

  const availability = product.stock > 0 && product.availability === 'in_stock'
    ? 'https://schema.org/InStock'
    : product.availability === 'pre_order'
      ? 'https://schema.org/PreOrder'
      : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.longDescription || product.name,
    image: [product.thumbnail, ...(product.images || [])].filter(Boolean).map(absoluteUrl),
    sku: product.sku || product._id,
    ...(product.barcode && { gtin: product.barcode }),
    ...(product.brand?.name && { brand: { '@type': 'Brand', name: product.brand.name } }),
    ...(product.category?.name && { category: product.category.name }),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: 'INR',
      price: product.price,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.ratingsCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingsAverage,
        reviewCount: product.ratingsCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };
};

export const reviewSchema = (reviews = [], productName = '') => {
  if (!reviews.length) return null;
  return reviews.slice(0, 10).map((r) => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@type': 'Product', name: productName },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    author: { '@type': 'Person', name: r.user?.firstName ? `${r.user.firstName} ${r.user.lastName?.[0] || ''}.` : 'Verified Buyer' },
    datePublished: r.createdAt,
    reviewBody: r.comment,
  }));
};

export const faqSchema = (faqs = []) => {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
};

export const itemListSchema = (products = [], listName = 'Products') => {
  if (!products.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/product/${p.slug}`),
      name: p.name,
    })),
  };
};

export default Seo;
