import React from 'react';

const Card = ({ 
  children, 
  className = '',
  hover = false,
  onClick,
  ...props 
}) => {
  const baseStyles = 'bg-gray-800 rounded-lg shadow-md border border-gray-700 transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-xl hover:border-gray-600 hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
