// src/components/common/Card.jsx
const Card = ({ children, className = '', hover = false }) => {
  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;