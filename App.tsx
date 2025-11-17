import React, { useState, useMemo } from 'react';
import { Language, AppView, ChatMessage, GroundingChunk, DiagnosisSuggestion } from './types';
import { TEXTS, ICONS, NAV_ITEMS } from './constants';
import FeatureCard from './components/FeatureCard';
import LanguageSelector from './components/LanguageSelector';
import Loader from './components/Loader';
import { DiseaseModal } from './components/DiseaseModal';
import { VoiceInput } from './components/VoiceInput';
import { LoginPage } from './components/LoginPage';
import MedicineFinder from './components/MedicineFinder';
import MedicineAvailability from './components/MedicineAvailability';
import EmergencySOS from './components/EmergencySOS';
import VideoConsult from './components/VideoConsult';
import HealthRecord from './components/HealthRecord';

const API_BASE_URL = 'http://localhost:5000/api';

// --- Feature Components ---

const ChatbotView: React.FC<{ texts: { [key: string]: string }, language: Language }> = ({ texts, language }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [isListening, setIsListening] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);

    // Initialize with greeting messages
    React.useEffect(() => {
        if (messages.length === 0) {
            const greetingMessages: ChatMessage[] = [
                {
                    sender: 'bot',
                    text: 'greeting'
                }
            ];
            setMessages(greetingMessages);
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    language: language
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.result) {
                setAnalysisData(data.result);
                const botMessage: ChatMessage = { sender: 'bot', text: 'structured_result' };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorMsg = err instanceof Error ? err.message : 'An error occurred while processing your request.';
            setError(errorMsg);
            const errorMessage: ChatMessage = { 
                sender: 'bot', 
                text: `Sorry, I encountered an error: ${errorMsg}. Please ensure the API server is running on port 5000.` 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceTranscript = (text: string, detectedLanguage: Language) => {
        setInput(text);
        // Auto-send after voice input
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'user', text: text }]);
            setInput('');
            setIsLoading(true);
            setError(null);

            fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    language: detectedLanguage
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.result) {
                    setAnalysisData(data.result);
                    setMessages(prev => [...prev, { sender: 'bot', text: 'structured_result' }]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Voice processing error:', err);
                setIsLoading(false);
                setError('Could not process voice input');
            });
        }, 500);
    };

    const getUrgencyColor = (color: string) => {
        switch (color) {
            case 'red':
                return 'border-emergency-300 bg-emergency-50 dark:bg-emergency-900/30';
            case 'amber':
                return 'border-warning-300 bg-warning-50 dark:bg-warning-900/30';
            case 'yellow':
                return 'border-warning-300 bg-warning-50 dark:bg-warning-900/30';
            case 'green':
                return 'border-health-300 bg-health-50 dark:bg-health-900/30';
            default:
                return 'border-neutral-300 bg-neutral-50 dark:bg-gray-900/30';
        }
    };

    const getUrgencyTextColor = (color: string) => {
        switch (color) {
            case 'red':
                return 'text-emergency-800 dark:text-emergency-200';
            case 'amber':
                return 'text-warning-800 dark:text-warning-200';
            case 'yellow':
                return 'text-warning-800 dark:text-warning-200';
            case 'green':
                return 'text-health-800 dark:text-health-200';
            default:
                return 'text-neutral-800 dark:text-neutral-200';
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <DiseaseModal
                diseaseLabel={selectedDisease || ''}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                language={language}
            />

            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-800 dark:text-red-200 rounded">
                    <p className="font-semibold">{texts.error || 'Error'}</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
            
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 text-blue-800 dark:text-blue-200 rounded">
                <p className="font-semibold">{texts.disclaimer || 'Disclaimer'}</p>
                <p className="text-sm">{texts.disclaimer || 'This tool provides diagnostic suggestions based on local AI analysis and is intended for informational purposes only.'}</p>
            </div>

            <div className="flex-grow overflow-y-auto bg-neutral-50 dark:bg-gray-900 rounded-lg p-4 space-y-4 mb-4">
                {messages.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
                        <div className="text-6xl">👋</div>
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                                {language === 'HI' ? 'स्वागत है' : language === 'PA' ? 'ਸਵਾਗਤ ਹੈ' : 'Welcome'}
                            </h2>
                            <p className="text-neutral-600 dark:text-gray-300 text-lg mb-4">
                                {language === 'HI'
                                    ? 'अपने लक्षण बताएं और हम आपकी मदद करेंगे'
                                    : language === 'PA'
                                    ? 'ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ ਅਤੇ ਅਸੀਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗੇ'
                                    : 'Tell us about your symptoms and we will help'}
                            </p>
                        </div>

                        <div className="w-full max-w-xs">
                            <VoiceInput
                                onTranscript={handleVoiceTranscript}
                                isListening={isListening}
                                setIsListening={setIsListening}
                                language={language}
                                texts={texts}
                            />
                        </div>

                        <p className="text-sm text-neutral-500 dark:text-gray-400 pt-4">
                            {language === 'HI'
                                ? 'या नीचे टाइप करें'
                                : language === 'PA'
                                ? 'ਜਾਂ ਹੇਠਾਂ ਟਾਈਪ ਕਰੋ'
                                : 'Or type below'}
                        </p>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index}>
                        {msg.sender === 'user' && (
                            <div className="flex justify-end mb-4">
                                <div className="rounded-lg p-3 max-w-md bg-primary-600 text-white shadow-md">
                                    {msg.text}
                                </div>
                            </div>
                        )}
                        
                        {msg.sender === 'bot' && msg.text === 'greeting' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-neutral-200 dark:border-gray-700 mb-4 shadow-sm">
                                <div className="flex gap-3 items-start">
                                    <span className="text-3xl">👋</span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1">
                                            {language === 'HI' ? 'नमस्ते!' : language === 'PA' ? 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ!' : 'Hello!'}
                                        </h3>
                                        <p className="text-neutral-700 dark:text-gray-300">
                                            {language === 'HI'
                                                ? 'मैं आपकी स्वास्थ्य सहायक हूँ। आप मुझसे अपने लक्षणों के बारे में बता सकते हैं। कृपया याद रखें - मैं सुझाव देता हूँ, निदान नहीं। हमेशा अपने डॉक्टर से मिलें।'
                                                : language === 'PA'
                                                ? 'ਮੈਂ ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਆਪਣੇ ਲੱਛਣਾਂ ਬਾਰੇ ਦੱਸ ਸਕਦੇ ਹੋ। ਯਾਦ ਰੱਖੋ - ਮੈਂ ਸਲਾਹ ਦਿੰਦਾ ਹਾਂ, ਨਿਦਾਨ ਨਹੀਂ। ਆਪਣੇ ਡਾਕਟਰ ਨੂੰ ਹਮੇਸ਼ਾ ਮਿਲੋ।'
                                                : "I'm your AI health assistant. Tell me about your symptoms. Remember, I suggest but don't diagnose. Always see a doctor."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {msg.sender === 'bot' && msg.text === 'structured_result' && analysisData && (
                            <div className="space-y-4 mb-4">
                                {/* Symptoms Section */}
                                {analysisData.symptoms_extracted && analysisData.symptoms_extracted.length > 0 && (
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                        <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">📋 Extracted Symptoms</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisData.symptoms_extracted.map((symptom: any, idx: number) => {
                                                const name = typeof symptom === 'string' ? symptom : symptom.name || symptom;
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="inline-block rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-medium"
                                                    >
                                                        {name}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Overall Triage */}
                                {analysisData.overall_triage && (
                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                                        <h3 className="font-bold text-lg mb-2 text-purple-900 dark:text-purple-100">⚡ Overall Triage Level</h3>
                                        <p className="text-purple-800 dark:text-purple-200 font-semibold">
                                            {typeof analysisData.overall_triage === 'object' 
                                                ? analysisData.overall_triage.level 
                                                : analysisData.overall_triage}
                                        </p>
                                    </div>
                                )}

                                {/* Diseases Section */}
                                {analysisData.diagnoses && analysisData.diagnoses.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">🏥 Probable Diseases</h3>
                                        <div className="grid gap-3">
                                            {analysisData.diagnoses.map((diagnosis: any, idx: number) => {
                                                const urgency = diagnosis.urgency || {};
                                                const color = urgency.color || 'gray';
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`rounded-lg p-4 border-2 cursor-pointer transition hover:shadow-lg ${getUrgencyColor(color)}`}
                                                        onClick={() => {
                                                            setSelectedDisease(diagnosis.name);
                                                            setIsModalOpen(true);
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                                                {diagnosis.name}
                                                            </h4>
                                                            {urgency.level && (
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-2 ${getUrgencyTextColor(color)}`}>
                                                                    {urgency.icon} {urgency.level}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                            {urgency.reasoning || 'Disease analysis'}
                                                        </p>
                                                        
                                                        {diagnosis.score && (
                                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                                                Match Score: {Math.round(diagnosis.score * 10) / 10}%
                                                            </p>
                                                        )}
                                                        
                                                        {urgency.action && (
                                                            <div className={`text-sm font-semibold ${getUrgencyTextColor(color)} bg-opacity-20`}>
                                                                → {urgency.action}
                                                            </div>
                                                        )}

                                                        {diagnosis.precautions && diagnosis.precautions.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-opacity-30 border-gray-400">
                                                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Quick Precautions:</p>
                                                                <ul className="text-xs space-y-1">
                                                                    {diagnosis.precautions.slice(0, 2).map((prec: string, pidx: number) => (
                                                                        <li key={pidx} className="text-gray-700 dark:text-gray-300">• {prec}</li>
                                                                    ))}
                                                                    {diagnosis.precautions.length > 2 && (
                                                                        <li className="text-gray-600 dark:text-gray-400 italic">+{diagnosis.precautions.length - 2} more</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Click to see full details</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {analysisData.diagnoses && analysisData.diagnoses.length === 0 && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                                        <p className="text-yellow-800 dark:text-yellow-200">
                                            📊 Analysis complete. Please consult with a healthcare professional for proper diagnosis.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">{ICONS.bot}</div>
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                            <Loader />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={texts.typeMessage || 'Type your symptoms here...'}
                    disabled={isLoading}
                    className="flex-grow p-3 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                    onClick={() => setShowVoiceModal(true)}
                    className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 hover:shadow-lg transition text-xl"
                    title={language === 'HI' ? 'माइक्रोफोन' : language === 'PA' ? 'ਮਾਈਕ੍ਰੋਫੋਨ' : 'Microphone'}
                >
                    🎤
                </button>
                <button 
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()} 
                    className="bg-health-600 text-white p-3 rounded-full hover:bg-health-700 disabled:bg-health-300 transition"
                >
                    {ICONS.send}
                </button>
            </div>

            {/* Voice Input Modal */}
            {showVoiceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'HI' ? '🎤 आवाज़ इनपुट' : language === 'PA' ? '🎤 ਅਵਾਜ਼ ਇਨਪੁਟ' : '🎤 Voice Input'}
                            </h3>
                            <button
                                onClick={() => setShowVoiceModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <VoiceInput
                            onTranscript={(text, lang) => {
                                setInput(text);
                                setShowVoiceModal(false);
                                // Auto-send voice input
                                setTimeout(() => {
                                    setMessages(prev => [...prev, { sender: 'user', text: text }]);
                                    setIsLoading(true);
                                    setError(null);

                                    fetch(`${API_BASE_URL}/chat`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            message: text,
                                            language: lang
                                        })
                                    })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.success && data.result) {
                                            setAnalysisData(data.result);
                                            setMessages(prev => [...prev, { sender: 'bot', text: 'structured_result' }]);
                                        }
                                        setIsLoading(false);
                                    })
                                    .catch(err => {
                                        console.error('Voice processing error:', err);
                                        setIsLoading(false);
                                        setError('Could not process voice input');
                                    });
                                }, 500);
                            }}
                            isListening={isListening}
                            setIsListening={setIsListening}
                            language={language}
                            texts={texts}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const FindCareView: React.FC<{ texts: { [key: string]: string } }> = ({ texts }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [links, setLinks] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    React.useEffect(() => {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setIsLoading(false);
            },
            () => {
                setLocationError(texts.locationError);
                setIsLoading(false);
            }
        );
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [texts.locationError]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResponse('This feature requires Google Gemini API integration. Please use the local Chatbot feature instead.');
        setIsLoading(false);
    };
    
    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-4">
                 <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={texts.askLocation}
                    className="flex-grow p-3 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSearch} disabled={isLoading || !location} className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300">
                    {ICONS.map}
                </button>
            </div>
            <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4">
                {isLoading && <Loader />}
                {locationError && <p className="text-red-500">{locationError}</p>}
                {!location && !locationError && <p className="text-gray-500">{texts.gettingLocation}</p>}
                {response && <div className="prose dark:prose-invert text-gray-700 dark:text-gray-300">{response}</div>}
            </div>
        </div>
    );
};

const AnalyzeReportView: React.FC<{ texts: { [key: string]: string } }> = ({ texts }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setIsLoading(true);
        setResult('This feature requires Google Gemini API integration. Please use the local Chatbot feature for medical analysis.');
        setIsLoading(false);
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer text-blue-600 dark:text-blue-400 font-semibold">
                        {ICONS.upload}
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{texts.uploadPrompt}</p>
                    </label>
                </div>
                {preview && <img src={preview} alt="Report preview" className="max-w-full max-h-64 mx-auto rounded-lg" />}
                {file && <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">{isLoading ? <Loader/> : texts.analyze}</button>}
                {result && (
                    <div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">{texts.analysisResult}</h3>
                        <div className="text-gray-700 dark:text-gray-300">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SymptomAnalyzerView: React.FC<{ texts: { [key: string]: string } }> = ({ texts }) => {
    const [symptoms, setSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<DiagnosisSuggestion[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return;

        setIsLoading(true);
        setResults(null);
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: symptoms
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.result) {
                const diagnoses = data.result.diagnoses || [];
                
                // Convert diagnoses to DiagnosisSuggestion format
                const formattedDiagnoses: DiagnosisSuggestion[] = diagnoses.map((d: any) => ({
                    condition: typeof d === 'string' ? d : d.name || d,
                    likelihood: d.likelihood || 'Medium',
                    reasoning: d.reasoning || 'Based on symptom analysis'
                }));
                
                setResults(formattedDiagnoses);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error("Symptom Analysis Error:", err);
            setError(err instanceof Error ? err.message : "An error occurred during analysis. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getLikelihoodColor = (likelihood: string) => {
        switch (likelihood.toLowerCase()) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-r-lg">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-200">For Professional Use Only</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{texts.disclaimer}</p>
            </div>

            <div className="flex flex-col space-y-4">
                <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder={texts.enterSymptoms}
                    className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    rows={5}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !symptoms.trim()}
                    className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex justify-center items-center"
                >
                    {isLoading ? <Loader /> : texts.analyzeSymptoms}
                </button>
            </div>
            
            <div className="mt-6 flex-grow overflow-y-auto">
                {error && <p className="text-red-500 text-center">{error}</p>}
                {results && (
                    <div>
                        <h3 className="text-xl font-bold mb-4 dark:text-white">{texts.analysisResults}</h3>
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{result.condition}</h4>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLikelihoodColor(result.likelihood)}`}>
                                            {result.likelihood}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{result.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; phone: string } | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const texts = useMemo(() => TEXTS[language], [language]);

  const handleLogin = (phone: string, name: string) => {
    setCurrentUser({ name, phone });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.CHATBOT:
        return <ChatbotView texts={texts} language={language} />;
      case AppView.MEDICINE:
        return <MedicineAvailability />;
      case AppView.FIND_CARE:
        return <MedicineFinder />;
      case AppView.ANALYZE_REPORT:
        return <HealthRecord />;
      case AppView.EMERGENCY:
        return <EmergencySOS />;
      case AppView.VIDEO_CONSULT:
        return <VideoConsult />;
      case AppView.DASHBOARD:
      default:
        return (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {NAV_ITEMS.map(item => (
                <FeatureCard
                  key={item.view}
                  icon={item.icon}
                  title={texts[item.textKey]}
                  description={texts[`${item.textKey}Desc`]}
                  onClick={() => setCurrentView(item.view)}
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} language={language} texts={texts} onLanguageChange={setLanguage} />
      ) : (
        <div className="min-h-screen flex flex-col font-sans text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-gray-900">
          {/* Header */}
          <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-neutral-200 dark:border-gray-700 shadow-sm z-10">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {currentView !== AppView.DASHBOARD && (
                   <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-gray-700">
                     {ICONS.home}
                   </button>
                )}
                <div>
                  <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">{texts.appName}</h1>
                  <p className="text-xs text-neutral-500 dark:text-gray-400">{texts.tagline}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-emergency-600 dark:text-gray-400 dark:hover:text-emergency-400"
                >
                  {language === 'EN' ? 'Logout' : language === 'HI' ? 'लॉगआउट' : 'ਲਾਗਆਉਟ'}
                </button>
              </div>
            </div>
          </header>

          {/* Main Layout with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full">
              <div className="container mx-auto px-4 py-4 flex flex-col h-full">
                {renderView()}
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
