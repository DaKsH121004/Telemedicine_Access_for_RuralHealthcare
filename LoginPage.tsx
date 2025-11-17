import React, { useState } from 'react';
import { Language } from '../types';

interface LoginPageProps {
  onLogin: (phone: string, name: string) => void;
  language: Language;
  texts: { [key: string]: string };
  onLanguageChange: (lang: Language) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  language,
  texts,
  onLanguageChange,
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!phone.trim()) {
      setError(
        language === 'HI'
          ? 'कृपया फोन नंबर दर्ज करें'
          : language === 'PA'
          ? 'ਕਿਰਪਾ ਕਰਕੇ ਫੋਨ ਨੰਬਰ ਦਿਓ'
          : 'Please enter phone number'
      );
      return;
    }

    if (!name.trim()) {
      setError(
        language === 'HI'
          ? 'कृपया नाम दर्ज करें'
          : language === 'PA'
          ? 'ਕਿਰਪਾ ਕਰਕੇ ਨਾਮ ਦਿਓ'
          : 'Please enter your name'
      );
      return;
    }

    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      onLogin(phone, name);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center p-4">
      {/* Language Selector - Top Right */}
      <div className="absolute top-4 right-4">
        <div className="flex gap-2">
          {(['EN', 'HI', 'PA'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                language === lang
                  ? 'bg-white text-primary-600'
                  : 'bg-primary-500 text-white hover:bg-primary-400'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">🏥 Sehat</h1>
          <p className="text-xl opacity-90">
            {language === 'HI'
              ? 'ग्रामीण स्वास्थ्य सेवा'
              : language === 'PA'
              ? 'ਪਿੰਡ ਸਿਹਤ ਸੇਵਾ'
              : 'Rural Health Service'}
          </p>
          <p className="text-sm opacity-75 mt-2">
            {language === 'HI'
              ? 'आपकी स्वास्थ्य सहायक हमेशा आपके साथ'
              : language === 'PA'
              ? 'ਤੁਹਾਡੀ ਸਿਹਤ ਦੀ ਸਹਾਇਤਾ'
              : 'Your health companion always here'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 text-center">
            {language === 'HI'
              ? 'स्वागत है'
              : language === 'PA'
              ? 'ਸਵਾਗਤ ਹੈ'
              : 'Welcome'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-emergency-100 border-l-4 border-emergency-600 text-emergency-700 rounded">
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {language === 'HI'
                  ? 'आपका नाम'
                  : language === 'PA'
                  ? 'ਤੁਹਾਡਾ ਨਾਮ'
                  : 'Your Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  language === 'HI'
                    ? 'नाम दर्ज करें'
                    : language === 'PA'
                    ? 'ਨਾਮ ਦਿਓ'
                    : 'Enter your name'
                }
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-neutral-900 placeholder-neutral-500"
                disabled={isLoading}
              />
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                {language === 'HI'
                  ? 'फोन नंबर'
                  : language === 'PA'
                  ? 'ਫੋਨ ਨੰਬਰ'
                  : 'Phone Number'}
              </label>
              <div className="flex">
                <span className="flex items-center px-4 py-3 bg-neutral-100 border-2 border-neutral-300 border-r-0 rounded-l-lg text-neutral-700 font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder={
                    language === 'HI'
                      ? '98765 43210'
                      : language === 'PA'
                      ? '98765 43210'
                      : '98765 43210'
                  }
                  className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-r-lg focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 text-neutral-900 placeholder-neutral-500"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {language === 'HI'
                  ? '10 अंकों का नंबर'
                  : language === 'PA'
                  ? '10 ਅੰਕ'
                  : '10 digits'}
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white font-bold rounded-lg transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {language === 'HI'
                      ? 'लोड हो रहा है...'
                      : language === 'PA'
                      ? 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...'
                      : 'Loading...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {language === 'HI'
                      ? 'शुरू करें'
                      : language === 'PA'
                      ? 'ਸ਼ੁਰੂ ਕਰੋ'
                      : 'Get Started'}
                  </span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-500 mt-6 text-center">
            {language === 'HI'
              ? 'यह एक प्रदর्शन संस्करण है। आपके डेटा सुरक्षित है।'
              : language === 'PA'
              ? 'ਇਹ ਇੱਕ ਡੈਮੋ ਹੈ। ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਅਤ ਹੈ।'
              : 'This is a demo version. Your data is secure.'}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-white mt-8 text-sm opacity-75">
          <p>
            {language === 'HI'
              ? '© 2025 Sehat | ग्रामीण स्वास्थ्य सेवा'
              : language === 'PA'
              ? '© 2025 Sehat | ਪਿੰਡ ਸਿਹਤ ਸੇਵਾ'
              : '© 2025 Sehat | Rural Health Service'}
          </p>
        </div>
      </div>
    </div>
  );
};
