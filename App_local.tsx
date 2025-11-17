import React, { useState, useMemo } from 'react';
import { Language, AppView, ChatMessage, GroundingChunk, DiagnosisSuggestion } from './types';
import { TEXTS, ICONS, NAV_ITEMS } from './constants';
import FeatureCard from './components/FeatureCard';
import LanguageSelector from './components/LanguageSelector';
import Loader from './components/Loader';

const API_BASE_URL = 'http://localhost:5000/api';

// --- Feature Components ---

const ChatbotView: React.FC<{ texts: { [key: string]: string }, language: Language }> = ({ texts, language }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                // Extract diagnoses from the result
                const diagnoses = data.result.diagnoses || [];
                const symptoms = data.result.symptoms_extracted || [];
                const triage = data.result.triage;
                
                // Format bot response
                let botText = 'Analysis Results:\n\n';
                
                if (triage && triage.level) {
                    botText += `⚠️ Triage Level: ${triage.level}\n`;
                    if (triage.reason) botText += `Reason: ${triage.reason}\n\n`;
                }
                
                if (symptoms.length > 0) {
                    botText += `📋 Extracted Symptoms:\n`;
                    symptoms.forEach((s: any) => {
                        const name = typeof s === 'string' ? s : s.name || s;
                        botText += `  • ${name}\n`;
                    });
                    botText += '\n';
                }
                
                if (diagnoses.length > 0) {
                    botText += `🏥 Potential Diagnoses:\n`;
                    diagnoses.forEach((d: any) => {
                        const name = typeof d === 'string' ? d : d.name || d;
                        botText += `  • ${name}\n`;
                    });
                } else {
                    botText += '📊 Analysis complete. Please consult with a healthcare professional for proper diagnosis.';
                }
                
                const botMessage: ChatMessage = { sender: 'bot', text: botText };
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

    return (
        <div className="p-4 flex flex-col h-full">
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

            <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 mb-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center">
                        <div>
                            <div className="text-4xl mb-4">{ICONS.chat}</div>
                            <p>{texts.typeMessage || 'Describe your symptoms to get started...'}</p>
                        </div>
                    </div>
                )}
                
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">{ICONS.bot}</div>}
                        <div className={`rounded-lg p-3 max-w-md whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                            {msg.text}
                        </div>
                        {msg.sender === 'user' && <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0">{ICONS.user}</div>}
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
                    onClick={handleSend} 
                    disabled={isLoading || !input.trim()} 
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {ICONS.send}
                </button>
            </div>
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
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const texts = useMemo(() => TEXTS[language], [language]);

  const renderView = () => {
    switch (currentView) {
      case AppView.CHATBOT:
        return <ChatbotView texts={texts} language={language} />;
      case AppView.FIND_CARE:
        return <FindCareView texts={texts} />;
      case AppView.ANALYZE_REPORT:
        return <AnalyzeReportView texts={texts} />;
      case AppView.SYMPTOM_ANALYZER:
        return <SymptomAnalyzerView texts={texts} />;
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
    <div className="min-h-screen flex flex-col font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {currentView !== AppView.DASHBOARD && (
               <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                 {ICONS.home}
               </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">{texts.appName}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{texts.tagline}</p>
            </div>
          </div>
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 flex flex-col">
        <div className="flex-grow flex flex-col h-[calc(100vh-64px)]">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
