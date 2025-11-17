import React, { useState, useRef } from 'react';
import '../styles/VoiceChat.css';

interface VoiceChatProps {
  onSendMessage: (message: string) => void;
  onPlayAudio: (audioBase64: string) => void;
  isLoading?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onSendMessage, onPlayAudio, isLoading = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Start recording from microphone
  const startRecording = async () => {
    try {
      setIsRecording(true);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Process the recorded audio
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Transcribe audio to text
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setRecordedText(data.text);
        // Automatically send the transcribed text as a message
        onSendMessage(data.text);
      } else {
        alert('Failed to transcribe audio: ' + data.error);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error transcribing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert text to speech
  const textToSpeech = async (text: string) => {
    try {
      setIsProcessing(true);

      const response = await fetch('http://localhost:5000/api/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.success && data.audio) {
        playAudioFromBase64(data.audio);
      } else {
        console.error('Failed to generate speech:', data.error);
      }
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio from base64
  const playAudioFromBase64 = (audioBase64: string) => {
    try {
      // Decode base64 to binary
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and play
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(err => console.error('Playback error:', err));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <div className="voice-chat-container">
      <div className="voice-controls">
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || isLoading}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Microphone icon */}
            <path d="M12 1a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {isRecording && (
          <div className="recording-indicator">
            <span className="pulse"></span>
            Recording...
          </div>
        )}

        {isProcessing && (
          <div className="processing-indicator">
            Processing...
          </div>
        )}
      </div>

      {recordedText && (
        <div className="recorded-text">
          <p><strong>Transcribed:</strong> {recordedText}</p>
        </div>
      )}

      <div className="voice-help">
        <small>
          {isRecording
            ? 'Listening... Click mic to stop'
            : 'Click the mic to start recording. Your speech will be converted to text and sent.'}
        </small>
      </div>
    </div>
  );
};

export default VoiceChat;
