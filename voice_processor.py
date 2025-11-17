#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Voice Processing Module using pyttsx3 TTS and sounddevice for recording
Supports audio recording from microphone and text-to-speech playback
"""

import os
import sys
import io
import wave
from typing import Tuple
import pyttsx3
import sounddevice as sd
import numpy as np


class VoiceProcessor:
    """Process voice input and output using TTS and microphone recording"""
    
    def __init__(self):
        """Initialize voice processor with TTS engine"""
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 150)  # Slower speech rate for clarity
        self.sample_rate = 16000  # Standard 16kHz
        self.channels = 1
        
    def record_audio(self, duration: int = 5) -> bytes:
        """
        Record audio from microphone
        
        Args:
            duration: Duration in seconds
        
        Returns:
            Audio data as bytes (WAV format)
        """
        try:
            print(f"[Recording] Starting {duration} second recording...")
            
            # Record audio
            recording = sd.rec(int(duration * self.sample_rate), 
                             samplerate=self.sample_rate, 
                             channels=self.channels, 
                             dtype=np.int16)
            sd.wait()
            
            # Convert to WAV format
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(self.channels)
                wav_file.setsampwidth(2)
                wav_file.setframerate(self.sample_rate)
                wav_file.writeframes(recording.tobytes())
            
            wav_buffer.seek(0)
            audio_data = wav_buffer.getvalue()
            print(f"[Recording] Complete. Audio size: {len(audio_data)} bytes")
            return audio_data
            
        except Exception as e:
            print(f"[Error] Recording failed: {e}")
            return b''
    
    def text_to_speech(self, text: str) -> bytes:
        """
        Convert text to speech using pyttsx3
        
        Args:
            text: Text to convert to speech
        
        Returns:
            Audio data as bytes (WAV format)
        """
        try:
            if not text or text.strip() == '':
                print("[TTS] Empty text provided")
                return b''
            
            print(f"[TTS] Converting: {text[:60]}...")
            
            # Set engine properties
            self.tts_engine.setProperty('rate', 150)
            self.tts_engine.setProperty('volume', 1.0)
            
            # Create temporary WAV file
            temp_wav = 'temp_speech.wav'
            
            # Clean up if exists
            if os.path.exists(temp_wav):
                try:
                    os.remove(temp_wav)
                except:
                    pass
            
            # Generate speech
            self.tts_engine.save_to_file(text, temp_wav)
            self.tts_engine.runAndWait()
            
            # Read the WAV file
            if os.path.exists(temp_wav):
                try:
                    with open(temp_wav, 'rb') as f:
                        wav_data = f.read()
                    print(f"[TTS] Audio generated. Size: {len(wav_data)} bytes")
                    return wav_data
                finally:
                    try:
                        os.remove(temp_wav)
                    except:
                        pass
            
            print("[TTS] Failed to generate audio file")
            return b''
            
        except Exception as e:
            print(f"[Error] TTS failed: {e}")
            return b''
    
    def play_audio(self, audio_data: bytes) -> bool:
        """
        Play audio from bytes (WAV format)
        
        Args:
            audio_data: Audio bytes (WAV format)
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not audio_data or len(audio_data) == 0:
                print("[Playback] No audio data")
                return False
            
            print("[Playback] Starting playback...")
            
            # Parse WAV format
            wav_buffer = io.BytesIO(audio_data)
            with wave.open(wav_buffer, 'rb') as wav_file:
                channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                sample_rate = wav_file.getframerate()
                frames = wav_file.readframes(wav_file.getnframes())
            
            # Convert bytes to numpy array
            audio_array = np.frombuffer(frames, dtype=np.int16)
            
            # Normalize audio
            max_val = np.max(np.abs(audio_array))
            if max_val > 0:
                audio_array = (audio_array / max_val * 32767).astype(np.int16)
            
            # Play audio
            sd.play(audio_array, samplerate=sample_rate)
            sd.wait()
            
            print("[Playback] Complete")
            return True
            
        except Exception as e:
            print(f"[Error] Playback failed: {e}")
            return False
    
    def get_available_voices(self) -> list:
        """Get list of available TTS voices"""
        try:
            voices = self.tts_engine.getProperty('voices')
            return [(v.id, v.name) for v in voices]
        except:
            return []


# Global voice processor instance
_voice_processor = None

def get_voice_processor():
    """Get or create global voice processor"""
    global _voice_processor
    if _voice_processor is None:
        _voice_processor = VoiceProcessor()
    return _voice_processor
