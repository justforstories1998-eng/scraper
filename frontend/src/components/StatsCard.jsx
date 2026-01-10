/**
 * StatsCard.jsx
 *
 * A reusable component to display a single statistic with an icon and label.
 */

import React from 'react';

const StatsCard = ({ icon, label, value, colorClass = 'text-primary-500', bgColorClass = 'bg-primary-50' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-soft p-6 flex items-center transition-colors duration-300">
      <div className={`p-3 rounded-full ${bgColorClass} flex-shrink-0`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass}` })}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;