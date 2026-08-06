import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const { name, image, productCount, subcategories } = category;

  return (
    <Link to={`/shop?category=${category._id}`} className="category-card">
      <div className="category-card-image">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <div className="category-card-placeholder">🐾</div>
        )}
      </div>
      <h3 className="category-card-name">{name}</h3>
      {productCount !== undefined && (
        <p className="category-card-count">{productCount}+ Products</p>
      )}
      {subcategories && subcategories.length > 0 && (
        <div className="category-card-subcategories">
          {subcategories.slice(0, 3).map((sub) => (
            <span key={sub._id} className="category-card-sub">{sub.name}</span>
          ))}
        </div>
      )}
    </Link>
  );
};

export const CategoryCardSkeleton = () => (
  <div className="category-card skeleton">
    <div className="category-card-image skeleton-image" style={{ borderRadius: '50%' }} />
    <div className="skeleton-line" style={{ width: '60%', height: '14px', margin: '0.5rem auto 0' }} />
    <div className="skeleton-line" style={{ width: '40%', height: '12px', margin: '0.25rem auto 0' }} />
  </div>
);

export default CategoryCard;
