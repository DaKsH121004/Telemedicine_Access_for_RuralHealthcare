
import type { ReactNode } from 'react';
import React from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-start space-y-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
