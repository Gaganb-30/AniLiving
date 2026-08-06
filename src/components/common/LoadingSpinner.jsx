const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeMap = { sm: '24px', md: '40px', lg: '56px' };
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" style={{ width: sizeMap[size], height: sizeMap[size] }} />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
