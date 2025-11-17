import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';

interface VoiceInputProps {
  onTranscript: (text: string, language: Language) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  language: Language;
  texts: { [key: string]: string };
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  isListening,
  setIsListening,
  language,
  texts,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startListening = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      console.error('Microphone error:', err);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsListening(false);
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', language);

      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      if (data.success && data.text) {
        onTranscript(data.text, data.detected_language || language);
      } else {
        setError(data.error || 'Could not transcribe audio');
      }
    } catch (err) {
      setError('Error processing audio. Please try again.');
      console.error('Transcription error:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {error && (
        <div className="w-full p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={isListening ? stopListening : startListening}
        className={`flex items-center justify-center rounded-full w-20 h-20 transition-all transform ${
          isListening
            ? 'bg-emergency-600 scale-110 animate-pulse'
            : 'bg-primary-600 hover:bg-primary-700 active:scale-95'
        } text-white shadow-lg`}
        title={isListening ? 'Stop Recording' : 'Start Voice Input'}
      >
        <span className="text-4xl">🎤</span>
      </button>

      <div className="text-center">
        {isListening ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-primary-600 animate-pulse">
              🔴 Listening...
            </p>
            <p className="text-xs text-neutral-600">
              {language === 'HI' ? 'हिंदी में बोलें' : language === 'PA' ? 'ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ' : 'Speak in English'}
            </p>
            <button
              onClick={stopListening}
              className="mt-2 px-4 py-2 bg-emergency-600 text-white rounded-lg text-sm hover:bg-emergency-700"
            >
              {language === 'HI' ? 'बंद करें' : language === 'PA' ? 'ਬंद ਕਰੋ' : 'Stop'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-neutral-600">
            {language === 'HI' ? 'अपने लक्षण बताने के लिए माइक दबाएं' : language === 'PA' ? 'ਆਪਣੇ ਲੱਛਣ ਦੱਸਣ ਲਈ ਮਾਈਕ ਦਬਾਓ' : 'Press mic to describe symptoms'}
          </p>
        )}
      </div>
    </div>
  );
};
