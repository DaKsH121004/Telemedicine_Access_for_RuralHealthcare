
import React from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex space-x-2 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
      {(Object.keys(Language) as Array<keyof typeof Language>).map((key) => (
        <button
          key={key}
          onClick={() => onLanguageChange(Language[key])}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-300 ${
            currentLanguage === Language[key]
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-300 shadow'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          {Language[key]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
