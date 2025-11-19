import React from 'react';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 focus:ring-blue-500',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/20 focus:ring-gray-500 backdrop-blur-sm',
    success: 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/20 focus:ring-red-500',
    warning: 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-900/20 focus:ring-yellow-500',
    outline: 'bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 focus:ring-blue-500',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
