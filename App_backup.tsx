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
    
    React.useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
            // FIX: Updated model from 'gemini-2.5-flash-lite' to 'gemini-flash-lite-latest' per guidelines.
            model: 'gemini-flash-lite-latest',
            config: { systemInstruction: `You are a helpful AI health assistant. Respond in ${language}.` }
        });

        return () => {
            chatRef.current = null;
        };
    }, [language]);

    const cleanupVoiceResources = React.useCallback(() => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (audioContextRef.current) {
            const ctx = audioContextRef.current;
            audioContextRef.current = null;
            ctx.close().catch(() => undefined);
        }

        if (outputAudioContextRef.current) {
            const ctx = outputAudioContextRef.current;
            outputAudioContextRef.current = null;
            ctx.close().catch(() => undefined);
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (voskSocketRef.current && voskSocketRef.current.readyState === WebSocket.OPEN) {
            try { voskSocketRef.current.close(); } catch { /* noop */ }
        }
        voskSocketRef.current = null;
        partialTranscriptRef.current = '';
        voiceNextStartTimeRef.current = 0;
        setVoiceStatus('idle');
    }, []);

    const stopVoiceConversation = React.useCallback(() => {
        if (voskSocketRef.current) {
            try {
                if (voskSocketRef.current.readyState === WebSocket.OPEN) {
                    // Signal end of stream to Vosk before closing
                    try { voskSocketRef.current.send(JSON.stringify({ eof: 1 })); } catch { /* noop */ }
                }
                voskSocketRef.current.close();
            } catch (error) {
                console.error('Error closing Vosk socket:', error);
            }
        }
        cleanupVoiceResources();
    }, [cleanupVoiceResources]);

    const startVoiceConversation = React.useCallback(async () => {
        if (voiceStatus !== 'idle') {
            return;
        }
        setVoiceStatus('connecting');

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Microphone access is not supported in this browser.');
            }
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const AudioContextConstructor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            audioContextRef.current = new AudioContextConstructor({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContextConstructor({ sampleRate: 24000 });
            partialTranscriptRef.current = '';
            voiceNextStartTimeRef.current = 0;

            const voskUrl = process.env.VOSK_SERVER_URL as string | undefined;
            if (!voskUrl) {
                throw new Error('VOSK_SERVER_URL is not configured. Please set it in .env.local');
            }
            const ws = new WebSocket(voskUrl);
            voskSocketRef.current = ws;

            ws.binaryType = 'arraybuffer';

            ws.onopen = () => {
                setVoiceStatus('listening');
                // send config
                ws.send(JSON.stringify({ config: { sample_rate: 16000 } }));
                if (!audioContextRef.current) return;
                const source = audioContextRef.current.createMediaStreamSource(stream);
                const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                processorRef.current = scriptProcessor;
                scriptProcessor.onaudioprocess = (e) => {
                    if (!voskSocketRef.current || voskSocketRef.current.readyState !== WebSocket.OPEN) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    const int16 = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        int16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                    }
                    voskSocketRef.current.send(int16.buffer);
                };
                source.connect(scriptProcessor);
                scriptProcessor.connect(audioContextRef.current.destination);
            };

            ws.onmessage = async (event) => {
                try {
                    const payload = typeof event.data === 'string' ? event.data : '';
                    if (!payload) return;
                    const msg = JSON.parse(payload);
                    // Vosk messages may contain "partial" for interim, and "text" or "result" for final
                    if (msg.partial) {
                        partialTranscriptRef.current = msg.partial;
                    } else if (msg.text || msg.result) {
                        const finalText = msg.text || (Array.isArray(msg.result) ? msg.result.map((w: any) => w.word).join(' ') : '');
                        const userText = (partialTranscriptRef.current + ' ' + finalText).trim();
                        partialTranscriptRef.current = '';
                        if (userText) {
                            setMessages(prev => [...prev, { sender: 'user', text: userText }]);
                            // send to chat model
                            if (chatRef.current) {
                                try {
                                    const response = await chatRef.current.sendMessage({ message: userText });
                                    const botMessage: ChatMessage = { sender: 'bot', text: response.text };
                                    setMessages(prev => [...prev, botMessage]);
                                } catch (err) {
                                    console.error('Chat error:', err);
                                    setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error.' }]);
                                }
                            }
                        }
                    }
                } catch {
                    // ignore non-JSON frames if any
                }
            };

            ws.onerror = (e) => {
                console.error('Vosk socket error:', e);
                stopVoiceConversation();
            };

            ws.onclose = () => {
                cleanupVoiceResources();
            };
        } catch (error) {
            console.error('Failed to start voice session', error);
            cleanupVoiceResources();
            setMessages(prev => [...prev, { sender: 'bot', text: 'Unable to start voice input. Please check microphone permissions and Vosk server URL, then try again.' }]);
        }
    }, [cleanupVoiceResources, setMessages, stopVoiceConversation, voiceStatus]);

    React.useEffect(() => {
        return () => {
            stopVoiceConversation();
        };
    }, [stopVoiceConversation]);

    const handleSend = async () => {
        if (!input.trim() || !chatRef.current) return;
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatRef.current.sendMessage({ message: input });
            const botMessage: ChatMessage = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = { sender: 'bot', text: 'Sorry, I encountered an error.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const playTTS = async (text: string) => {
        if (playingMessage === text) {
            setPlayingMessage(null); // Basic toggle off - a full implementation would need audio context controls
            return;
        }
        setPlayingMessage(text);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                }
            });
            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                const audioBuffer = await decodeAudioData(b64decode(audioData), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = () => setPlayingMessage(null);
            }
        } catch (error) {
            console.error('TTS Error:', error);
            setPlayingMessage(null);
        }
    };

    const voiceStatusLabel = voiceStatus === 'idle'
        ? texts.startConsultation
        : voiceStatus === 'connecting'
            ? texts.connecting
            : voiceStatus === 'listening'
                ? texts.listening
                : texts.modelSpeaking;

    const isVoiceActive = voiceStatus === 'listening' || voiceStatus === 'speaking';
    const isVoiceBusy = voiceStatus === 'connecting';


    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'bot' && <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">{ICONS.bot}</div>}
                        <div className={`rounded-lg p-3 max-w-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                           {msg.text}
                           {msg.sender === 'bot' && (
                               <button onClick={() => playTTS(msg.text)} className="ml-2 text-gray-500 dark:text-gray-400 hover:text-blue-500">
                                   {playingMessage === msg.text ? ICONS.pulse : ICONS.volume}
                               </button>
                           )}
                        </div>
                        {msg.sender === 'user' && <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">{ICONS.user}</div>}
                    </div>
                ))}
                 {isLoading && <div className="flex items-start gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">{ICONS.bot}</div><div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3"><Loader /></div></div>}
            </div>
            <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => (isVoiceActive ? stopVoiceConversation() : startVoiceConversation())}
                        disabled={isVoiceBusy}
                        className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isVoiceBusy ? 'bg-blue-400 cursor-wait hover:scale-100' : isVoiceActive ? 'bg-red-500 hover:bg-red-600 hover:scale-105' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}
                        title={voiceStatusLabel}
                        aria-label={voiceStatusLabel}
                    >
                        {isVoiceActive ? ICONS.stop : ICONS.microphone}
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-300" role="status" aria-live="polite">
                        {voiceStatusLabel}
                    </p>
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
                        placeholder={texts.typeMessage}
                        className="flex-grow p-3 border rounded-full bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300">
                        {ICONS.send}
                    </button>
                </div>
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
        if (!query.trim() || !location) return;
        setIsLoading(true);
        setResponse(null);
        setLinks([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const result: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: {
                    tools: [{ googleMaps: {} }],
                    toolConfig: { retrievalConfig: { latLng: location } }
                }
            });
            setResponse(result.text);
            const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if(groundingChunks) {
                 setLinks(groundingChunks as unknown as GroundingChunk[]);
            }
        } catch (error) {
            console.error('Maps Grounding Error:', error);
            setResponse('Sorry, an error occurred while searching.');
        } finally {
            setIsLoading(false);
        }
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
                {response && <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: response.replace(/\n/g, '<br />') }} />}
                {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-bold text-lg dark:text-white">Relevant Places:</h4>
                        {links.map((chunk, index) => chunk.maps && (
                            <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" key={index} className="block p-3 bg-blue-50 dark:bg-gray-700 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-700 dark:text-blue-300">
                                {chunk.maps.title}
                            </a>
                        ))}
                    </div>
                )}
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
        setResult(null);
        try {
            const base64Data = await blobToBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: 'Analyze this medical report and provide a simple summary of the key findings. Explain what the values mean in simple terms.' }
                    ]
                }
            });
            setResult(response.text);
        } catch (error) {
            console.error('Image analysis error:', error);
            setResult('Failed to analyze the image.');
        } finally {
            setIsLoading(false);
        }
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
                        <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }}/>
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
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const diagnosisSchema = {
                type: Type.OBJECT,
                properties: {
                    condition: { type: Type.STRING, description: "The name of the potential medical condition." },
                    likelihood: { type: Type.STRING, description: "Estimated likelihood (e.g., High, Medium, Low)." },
                    reasoning: { type: Type.STRING, description: "Brief reasoning based on the provided symptoms." },
                },
                required: ["condition", "likelihood", "reasoning"],
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: `Analyze the following patient symptoms and provide a list of potential differential diagnoses. For each diagnosis, provide the condition, likelihood, and reasoning. Symptoms: "${symptoms}"`,
                config: {
                    systemInstruction: "You are an AI medical assistant designed to help qualified medical professionals with differential diagnoses. Your suggestions are for informational purposes only and are not a substitute for professional medical judgment. Prioritize the most likely conditions.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: diagnosisSchema,
                    },
                }
            });

            const jsonResponse = JSON.parse(response.text);
            setResults(jsonResponse);

        } catch (err) {
            console.error("Symptom Analysis Error:", err);
            setError("Sorry, an error occurred during analysis. Please try again.");
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
