import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
    secondary: "bg-surface hover:bg-surface/80 text-text border border-white/10",
    danger: "bg-danger hover:bg-danger/90 text-white shadow-lg shadow-danger/20",
    success: "bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
