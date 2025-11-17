#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Flask API server that wraps the orchestrator.py functionality.
Provides REST endpoints for the React frontend to interact with the local chatbot.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
import time
from werkzeug.utils import secure_filename

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import orchestrator functions - use simple version
try:
    from orchestrator_simple import analyze
except ImportError:
    # Fallback if simple version not available
    from orchestrator import analyze

# Import voice processor
VOICE_ENABLED = False
try:
    from voice_processor import get_voice_processor
    VOICE_ENABLED = True
    print("[API] Voice processing enabled")
except (ImportError, ModuleNotFoundError, Exception) as e:
    VOICE_ENABLED = False
    print(f"[API] Voice processing not available: {str(e)}")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "API server is running"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Process user message through the orchestrator.
    Analyzes ALL symptoms from input, not just one.
    
    Request JSON:
    {
        "message": "user's symptoms",
        "age": 30,
        "sex": "M"
    }
    
    Response JSON:
    {
        "success": true,
        "message": "input text",
        "result": {...},
        "diagnoses": [all matching diseases],
        "triage": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'message' field in request"
            }), 400
        
        message = data.get('message', '').strip()
        age = data.get('age')
        sex = data.get('sex')
        
        if not message:
            return jsonify({
                "success": False,
                "error": "Message cannot be empty"
            }), 400
        
        # Call the orchestrator analyze function
        result = analyze(transcript=message, age=age, sex=sex)
        
        # Format response
        response = {
            "success": True,
            "message": message,
            "result": result,
            # Extract key fields for easier frontend access
            "diagnoses": result.get("diagnoses", []),
            "triage": result.get("overall_triage"),
            "overall_triage": result.get("overall_triage"),
            "symptoms_extracted": result.get("symptoms_extracted", []),
            "precautions": result.get("mapped_precautions", {})
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in /api/chat: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Diagnostic endpoint to get symptoms list
@app.route('/api/symptoms', methods=['GET'])
def get_symptoms():
    """Get list of all known symptoms"""
    try:
        from orchestrator import symptom_dict
        symptoms = list(symptom_dict.keys())
        return jsonify({
            "success": True,
            "symptoms": symptoms,
            "count": len(symptoms)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/api/disease', methods=['GET'])
def get_disease():
    """Return disease information by name (query param: name)
    Example: /api/disease?name=Malaria
    """
    try:
        name = request.args.get('name')
        if not name:
            return jsonify({"success": False, "error": "Missing 'name' query parameter"}), 400

        import orchestrator
        
        # Get disease description from knowledge base
        disease_info = orchestrator.knowledge_loader.get_disease_info(name)
        
        # Get precautions for disease
        precautions = orchestrator.precaution_loader.get_precautions(name)
        
        # Build response
        response_data = {
            "name": name,
            "description": disease_info if isinstance(disease_info, str) else f"Information about {name}",
            "symptoms": [],  # Could be populated from disease_info if structured
            "precautions": precautions if precautions else [],
            "recommendations": [
                "Consult with a qualified healthcare professional",
                "Do not self-diagnose or self-medicate",
                "Follow medical advice from licensed practitioners"
            ]
        }
        
        return jsonify({"success": True, **response_data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/health-record', methods=['POST'])
def save_health_record():
    """Save uploaded health record metadata (framework).
    Accepts JSON: { 'patient_id': str, 'title': str, 'notes': str }
    Files/uploads can be added later.
    """
    try:
        data = request.get_json() or {}
        patient_id = data.get('patient_id', 'anonymous')
        title = data.get('title', 'record')
        notes = data.get('notes', '')

        records_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'records')
        os.makedirs(records_dir, exist_ok=True)
        timestamp = int(time.time())
        filename = f"{patient_id}_{timestamp}.json"
        filepath = os.path.join(records_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump({'patient_id': patient_id, 'title': title, 'notes': notes, 'created_at': timestamp}, f, ensure_ascii=False, indent=2)

        return jsonify({"success": True, "message": "Health record saved", "file": filename}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/medicine-search', methods=['GET'])
def medicine_search():
    """Search for medicine availability near user location.
    Query params: ?medicine=paracetamol&lat=30.98&lon=75.35
    Returns pharmacies with stock information, sorted by availability and distance.
    """
    try:
        from src.medicine.medicine_service import get_medicine_service
        
        medicine = request.args.get('medicine', '').strip()
        user_lat = request.args.get('lat', type=float)
        user_lon = request.args.get('lon', type=float)
        
        if not medicine:
            return jsonify({
                "success": False,
                "error": "Missing 'medicine' query parameter"
            }), 400
        
        # Get medicine service and search
        service = get_medicine_service()
        result = service.search_medicine(medicine, user_lat, user_lon)
        
        return jsonify(result), (200 if result.get('success') else 404)
    except Exception as e:
        print(f"[ERROR] Medicine search failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/helplines', methods=['GET'])
def helplines():
    """Return placeholder emergency contacts and helplines. Data will be provided/updated later."""
    try:
        data = {
            "emergency_numbers": [
                {"name": "Ambulance", "number": "102"},
                {"name": "Police", "number": "100"}
            ],
            "nearby_hospitals": [
                {"name": "District Hospital", "phone": "01234-567890", "distance_km": 2.1}
            ],
            "ngos": [
                {"name": "Health NGO", "phone": "09876-543210"}
            ]
        }
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text using Vosk STT
    Supports: English, Hindi, Punjabi
    """
    try:
        if not VOICE_ENABLED:
            return jsonify({
                "success": False,
                "error": "Voice processing not configured. Install vosk and pyaudio."
            }), 500
        
        if 'audio' not in request.files:
            return jsonify({"success": False, "error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        language = request.form.get('language', 'en').lower()[:2]
        
        if not audio_file:
            return jsonify({"success": False, "error": "Audio file is empty"}), 400
        
        # Read audio data
        audio_data = audio_file.read()
        
        # Get voice processor and transcribe
        voice_processor = get_voice_processor()
        
        # Detect language and transcribe
        detected_lang, text = voice_processor.detect_language(audio_data)
        
        if not text:
            return jsonify({
                "success": False,
                "error": "Could not transcribe audio. Please speak clearly."
            }), 400
        
        # Map language codes
        lang_map = {'en': 'EN', 'hi': 'HI', 'pa': 'PA'}
        
        return jsonify({
            "success": True,
            "text": text.strip(),
            "detected_language": lang_map.get(detected_lang, 'EN'),
            "confidence": len(text.split())  # Simple confidence metric
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Transcription error: {str(e)}"
        }), 500


@app.route('/api/voice/speak', methods=['POST'])
def voice_speak():
    """Convert text to speech
    
    Request JSON:
    {
        "text": "text to speak",
        "language": "en"  # optional
    }
    
    Response:
    Audio file (WAV format) or JSON error
    """
    try:
        if not VOICE_ENABLED:
            return jsonify({
                "success": False,
                "error": "Voice processing not enabled"
            }), 500
        
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({
                "success": False,
                "error": "Text cannot be empty"
            }), 400
        
        # Get voice processor and convert to speech
        voice_processor = get_voice_processor()
        audio_bytes = voice_processor.text_to_speech(text)
        
        if not audio_bytes:
            return jsonify({
                "success": False,
                "error": "Failed to generate speech"
            }), 500
        
        # Return audio as WAV file
        return app.response_class(
            response=audio_bytes,
            status=200,
            mimetype='audio/wav',
            headers={'Content-Disposition': 'attachment; filename="response.wav"'}
        )
    
    except Exception as e:
        print(f"Error in /api/voice/speak: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500




@app.route('/api/voice/record', methods=['POST'])
def voice_record():
    """
    Record audio from microphone (or accept uploaded audio)
    
    Request JSON:
    {
        "duration": 5  # seconds to record
    }
    
    Response: Audio file (WAV format)
    """
    try:
        if not VOICE_ENABLED:
            return jsonify({
                "success": False,
                "error": "Voice processing not available"
            }), 500
        
        data = request.get_json() or {}
        duration = data.get('duration', 5)
        
        # Validate duration
        if duration < 1 or duration > 30:
            duration = 5
        
        voice_processor = get_voice_processor()
        audio_data = voice_processor.record_audio(duration=duration)
        
        if not audio_data:
            return jsonify({
                "success": False,
                "error": "Failed to record audio"
            }), 500
        
        # Return audio as base64 encoded JSON
        import base64
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return jsonify({
            "success": True,
            "audio": audio_base64,
            "duration": duration,
            "format": "wav"
        }), 200
    
    except Exception as e:
        print(f"[Error] Voice record failed: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    print("Starting Sehat Nabha API Server...")
    print("API will be available at http://localhost:5000")
    print("CORS enabled for http://localhost:3000 (Vite dev server)")
    
    # Run Flask with debug mode
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False  # Disable reloader to avoid double-initialization
    )
