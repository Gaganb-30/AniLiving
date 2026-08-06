import { Link } from 'react-router-dom';

const EmptyState = ({ icon = '📦', title, description, actionText, actionLink }) => (
  <div className="empty-state">
    <span className="empty-state-icon">{icon}</span>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-description">{description}</p>}
    {actionText && actionLink && (
      <Link to={actionLink} className="btn-primary" style={{ marginTop: '1rem' }}>
        {actionText}
      </Link>
    )}
  </div>
);

export default EmptyState;
