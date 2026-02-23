import React from 'react';

const Select = ({ children, className = '', ...props }) => {
  return (
    <select
      className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export { Select };
export default Select;
