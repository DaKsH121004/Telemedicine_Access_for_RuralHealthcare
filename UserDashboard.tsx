import React, { useState } from 'react';
import { Language } from '../types';

interface UserProfile {
  name: string;
  phone: string;
  age?: number;
  gender?: string;
  location?: string;
  lastVisit?: string;
}

interface UserDashboardProps {
  language: Language;
  texts: { [key: string]: string };
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  language,
  texts,
  user,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'HI') {
      if (hour < 12) return 'सुप्रभात';
      if (hour < 18) return 'नमस्ते';
      return 'शुभ संध्या';
    } else if (language === 'PA') {
      if (hour < 12) return 'ਸਵੇਰ';
      if (hour < 18) return 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ';
      return 'ਸ਼ਾਮ';
    } else {
      if (hour < 12) return 'Good Morning';
      if (hour < 18) return 'Hello';
      return 'Good Evening';
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-primary-600 text-white rounded-lg"
      >
        <span className="text-xl">👤</span>
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-neutral-200 dark:border-gray-700 z-40 transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 overflow-y-auto`}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-primary-600 to-primary-700 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Sehat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-xl"
            >
              ✕
            </button>
          </div>
          <p className="text-primary-100 text-sm">
            {language === 'HI'
              ? 'ग्रामीण स्वास्थ्य सेवा'
              : language === 'PA'
              ? 'ਪਿੰਡ ਸਿਹਤ ਸੇਵਾ'
              : 'Rural Health Service'}
          </p>
        </div>

        {/* User Profile Section */}
        {user ? (
          <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-health-600 text-white flex items-center justify-center text-lg font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-600 dark:text-gray-400">
                  {user.phone}
                </p>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="space-y-2 text-sm">
              {user.age && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-2 rounded">
                  <p className="text-xs text-neutral-600 dark:text-gray-400">
                    {language === 'HI'
                      ? 'आयु'
                      : language === 'PA'
                      ? 'ਉਮਰ'
                      : 'Age'}
                  </p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {user.age} {language === 'HI' ? 'वर्ष' : language === 'PA' ? 'ਸਾਲ' : 'years'}
                  </p>
                </div>
              )}

              {user.gender && (
                <div className="bg-health-50 dark:bg-health-900/20 p-2 rounded">
                  <p className="text-xs text-neutral-600 dark:text-gray-400">
                    {language === 'HI'
                      ? 'लिंग'
                      : language === 'PA'
                      ? 'ਲਿਂਗ'
                      : 'Gender'}
                  </p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {user.gender === 'M'
                      ? language === 'HI'
                        ? 'पुरुष'
                        : language === 'PA'
                        ? 'ਮਰਦ'
                        : 'Male'
                      : language === 'HI'
                      ? 'महिला'
                      : language === 'PA'
                      ? 'ਔਰਤ'
                      : 'Female'}
                  </p>
                </div>
              )}

              {user.location && (
                <div className="bg-warning-50 dark:bg-warning-900/20 p-2 rounded">
                  <p className="text-xs text-neutral-600 dark:text-gray-400">
                    {language === 'HI'
                      ? 'स्थान'
                      : language === 'PA'
                      ? 'ਸਥਾਨ'
                      : 'Location'}
                  </p>
                  <p className="font-semibold text-neutral-900 dark:text-white truncate">
                    {user.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-neutral-600 dark:text-gray-400">
            {language === 'HI'
              ? 'लॉगिन करें'
              : language === 'PA'
              ? 'ਲਾਗਇਨ ਕਰੋ'
              : 'Please login'}
          </div>
        )}

        {/* Quick Stats */}
        <div className="p-4 space-y-3 border-b border-neutral-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-neutral-700 dark:text-gray-300 uppercase">
            📊 {language === 'HI' ? 'सारांश' : language === 'PA' ? 'ਸਾਰ' : 'Summary'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary-600">3</p>
              <p className="text-xs text-neutral-600 dark:text-gray-400">
                {language === 'HI'
                  ? 'जांच'
                  : language === 'PA'
                  ? 'ਜਾਂਚ'
                  : 'Check-ups'}
              </p>
            </div>
            <div className="bg-health-50 dark:bg-health-900/20 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-health-600">5</p>
              <p className="text-xs text-neutral-600 dark:text-gray-400">
                {language === 'HI'
                  ? 'रिकॉर्ड'
                  : language === 'PA'
                  ? 'ਰਿਕਾਰਡ'
                  : 'Records'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {user && (
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-emergency-600 hover:bg-emergency-700 text-white rounded-lg text-sm font-medium transition"
            >
              {language === 'HI'
                ? 'लॉगआउट'
                : language === 'PA'
                ? 'ਲਾਗ ਆਉਟ'
                : 'Logout'}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 text-xs text-neutral-500 dark:text-gray-500 text-center">
          <p>
            {language === 'HI'
              ? 'संस्करण 1.0'
              : language === 'PA'
              ? 'ਸੰਸਕਰਣ 1.0'
              : 'v1.0'}
          </p>
        </div>
      </div>
    </>
  );
};
