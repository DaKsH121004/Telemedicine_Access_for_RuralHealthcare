import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface DiseaseModalProps {
  diseaseLabel: string;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const DiseaseModal: React.FC<DiseaseModalProps> = ({
  diseaseLabel,
  isOpen,
  onClose,
  language,
}) => {
  const [loading, setLoading] = useState(false);
  const [diseaseData, setDiseaseData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && diseaseLabel) {
      setLoading(true);
      fetch(`http://localhost:5000/api/disease?name=${encodeURIComponent(diseaseLabel)}`)
        .then((res) => res.json())
        .then((data) => {
          setDiseaseData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching disease info:', err);
          setLoading(false);
        });
    }
  }, [isOpen, diseaseLabel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 text-2xl leading-none"
        >
          ×
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
          </div>
        ) : diseaseData ? (
          <div className="space-y-4">
            {/* Disease title */}
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{diseaseLabel}</h2>

            {/* Description */}
            {diseaseData.description && (
              <div>
                <h3 className="mb-2 font-semibold text-neutral-700 dark:text-neutral-200">📋 {language === 'HI' ? 'विवरण' : language === 'PA' ? 'ਵਿਵਰਣ' : 'Description'}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{diseaseData.description}</p>
              </div>
            )}

            {/* Symptoms */}
            {diseaseData.symptoms && diseaseData.symptoms.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-neutral-700 dark:text-neutral-200">🔍 {language === 'HI' ? 'सामान्य लक्षण' : language === 'PA' ? 'ਸਾਧਾਰਣ ਲੱਛਣ' : 'Common Symptoms'}</h3>
                <div className="flex flex-wrap gap-2">
                  {diseaseData.symptoms.map((symptom: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-sm text-primary-700 dark:text-primary-200"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Precautions */}
            {diseaseData.precautions && diseaseData.precautions.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-neutral-700 dark:text-neutral-200">✓ {language === 'HI' ? 'सावधानियाँ' : language === 'PA' ? 'ਸावधानियाँ' : 'Precautions'}</h3>
                <ul className="space-y-1 text-neutral-600 dark:text-neutral-300">
                  {diseaseData.precautions.map((precaution: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 text-health-600">✓</span>
                      <span>{precaution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {diseaseData.recommendations && diseaseData.recommendations.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold text-neutral-700 dark:text-neutral-200">💡 {language === 'HI' ? 'सुझाव' : language === 'PA' ? 'ਸੁਝਾਅ' : 'Recommendations'}</h3>
                <ul className="space-y-1 text-neutral-600 dark:text-neutral-300">
                  {diseaseData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 text-primary-600">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* When to seek immediate care */}
            <div className="rounded-lg border-l-4 border-emergency-600 bg-emergency-50 dark:bg-emergency-900/20 p-4">
              <h3 className="mb-1 font-semibold text-emergency-700 dark:text-emergency-200">
                ⚠️ {language === 'HI' ? 'तुरंत चिकित्सा देखभाल कब लें' : language === 'PA' ? 'ਤੁਰੰਤ ਡਾਕਟਰ ਕੋਲ ਕਦੋਂ ਜਾਓ' : 'When to Seek Immediate Care'}
              </h3>
              <p className="text-sm text-emergency-600 dark:text-emergency-200">
                {language === 'HI'
                  ? 'अगर लक्षण गंभीर हैं या बिगड़ रहे हैं, तो तुरंत आपातकालीन केंद्र जाएं या आपातकालीन सेवाएं (102) बुलाएं।'
                  : language === 'PA'
                  ? 'ਜੇ ਲੱਛਣ ਗंभीर ਹਨ ਜਾਂ ਵਿਗੜ ਰਹੇ ਹਨ, ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਸੈਂਟਰ ਜਾਓ ਜਾਂ 102 ਪੁਕਾਰੋ।'
                  : 'If symptoms are severe or rapidly worsening, visit an emergency care center immediately or call 102.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-600 dark:text-neutral-300">
            <p>
              {language === 'HI'
                ? 'रोग की जानकारी लोड नहीं कर सकी। कृपया दोबारा कोशिश करें।'
                : language === 'PA'
                ? 'ਰੋਗ ਦੀ ਜਾਣਕਾਰੀ ਲੋਡ ਨਹੀਂ ਹੋ ਸਕੀ।'
                : 'Unable to load disease information. Please try again.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
