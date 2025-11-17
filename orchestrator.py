#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Orchestrator for Sehat Nabha chatbot.
Main entry point that coordinates all modules (NLP, rules, knowledge).
Uses modular components for symptom extraction, disease matching, and triage.
"""

import os
import sys
import pandas as pd
from typing import Dict, List, Any

# Add src directory to path for imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, 'src'))

# Import modular components
from nlp.symptom_extractor import SymptomExtractor
from rules.triage_engine import TriageEngine
from rules.disease_matcher import DiseaseMatcher
from knowledge.knowledge_loader import KnowledgeLoader
from knowledge.precaution_loader import PrecautionLoader

# CONFIG - paths
DS_PATH = os.path.join(BASE_DIR, "data", "DiseaseAndSymptoms.csv")
KB_PATH = os.path.join(BASE_DIR, "data", "disease_knowledgebase.csv")
PREC_PATH = os.path.join(BASE_DIR, "data", "Disease precaution.csv")

# Load data once at startup
def load_data():
    """Load all CSV data files"""
    try:
        ds_df = pd.read_csv(DS_PATH) if os.path.exists(DS_PATH) else pd.DataFrame()
        kb_df = pd.read_csv(KB_PATH) if os.path.exists(KB_PATH) else pd.DataFrame()
        prec_df = pd.read_csv(PREC_PATH) if os.path.exists(PREC_PATH) else pd.DataFrame()
        return ds_df, kb_df, prec_df
    except Exception as e:
        print(f"Warning: Could not load data files: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

# Load all data
ds_df, kb_df, prec_df = load_data()

# Build dictionaries from CSV data
def build_symptom_dict(ds_df: pd.DataFrame) -> Dict[str, List[str]]:
    """Build a dictionary mapping diseases to symptoms"""
    symptom_dict = {}
    if 'Disease' in ds_df.columns:
        for _, row in ds_df.iterrows():
            disease = str(row['Disease']).strip()
            symptoms = []
            for col in ds_df.columns:
                if col.startswith('Symptom_'):
                    symptom = str(row[col]).strip()
                    if symptom and symptom != 'nan':
                        symptoms.append(symptom)
            if disease not in symptom_dict:
                symptom_dict[disease] = []
            symptom_dict[disease].extend(symptoms)
    for disease in symptom_dict:
        symptom_dict[disease] = list(set(symptom_dict[disease]))
    return symptom_dict

def build_kb_dict(kb_df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """Build a dictionary of disease knowledge"""
    kb_dict = {}
    if 'Disease' in kb_df.columns:
        for _, row in kb_df.iterrows():
            disease = str(row['Disease']).strip()
            kb_dict[disease] = row.to_dict()
    return kb_dict

# Initialize data dictionaries
symptom_dict = build_symptom_dict(ds_df)
kb_dict = build_kb_dict(kb_df)

# Initialize modular components
print(f"Initializing Sehat Nabha orchestrator...")
print(f"  - Loaded {len(symptom_dict)} diseases")

symptom_extractor = SymptomExtractor(symptom_dict)
triage_engine = TriageEngine()
disease_matcher = DiseaseMatcher(symptom_dict, kb_dict)
knowledge_loader = KnowledgeLoader(KB_PATH)
precaution_loader = PrecautionLoader(PREC_PATH)

def extract_symptoms(text: str) -> List[str]:
    """Extract mentioned symptoms from user input (wrapper for component)"""
    return symptom_extractor.extract_symptoms(text)

def find_matching_diseases(symptoms: List[str]) -> List[Dict[str, Any]]:
    """Find diseases that match the given symptoms (wrapper for component)"""
    return disease_matcher.find_matching_diseases(symptoms)

def determine_triage_level(symptoms: List[str]) -> Dict[str, Any]:
    """Determine urgency level based on symptoms (wrapper for component)"""
    return triage_engine.determine_triage_level(symptoms)

def analyze(transcript: str, age: int = None, sex: str = None) -> Dict[str, Any]:
    """
    Main analysis function using modular components.
    Coordinates between NLP, rules, and knowledge modules.
    """
    try:
        extracted_symptoms = symptom_extractor.extract_symptoms(transcript)
        overall_triage = triage_engine.determine_triage_level(extracted_symptoms + transcript.lower().split())
        disease_matches = disease_matcher.find_matching_diseases(extracted_symptoms)
        ranked_diagnoses = disease_matcher.rank_diseases(disease_matches)
        
        # Add urgency level for each disease
        for diagnosis in ranked_diagnoses:
            disease_name = diagnosis['name']
            disease_urgency = determine_disease_urgency(disease_name, extracted_symptoms, diagnosis['match_count'])
            diagnosis['urgency'] = disease_urgency
            diagnosis['precautions'] = precaution_loader.get_precautions(disease_name)
        
        mapped_precautions = {}
        if ranked_diagnoses:
            top_diagnosis = ranked_diagnoses[0]['name']
            precautions = precaution_loader.get_precautions(top_diagnosis)
            mapped_precautions = {'disease': top_diagnosis, 'precautions': precautions}
        
        result = {
            'transcript': transcript,
            'symptoms_extracted': [{'name': s} for s in extracted_symptoms],
            'diagnoses': ranked_diagnoses,
            'overall_triage': overall_triage,
            'mapped_precautions': mapped_precautions,
            'age': age,
            'sex': sex,
            'success': True
        }
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            'transcript': transcript,
            'symptoms_extracted': [],
            'diagnoses': [],
            'overall_triage': None,
            'mapped_precautions': {},
            'error': str(e),
            'success': False
        }


def determine_disease_urgency(disease_name: str, symptoms: List[str], match_count: int) -> Dict[str, Any]:
    """
    Determine urgency level for a specific disease based on:
    1. Match count (primary factor)
    2. Disease type severity (secondary factor)
    
    Higher match count = higher urgency
    """
    # Disease severity mapping (predefined medical knowledge)
    high_severity_diseases = {
        'heart attack': True, 'stroke': True, 'myocardial infarction': True,
        'sepsis': True, 'acute respiratory distress': True, 'pneumonia': True,
        'meningitis': True, 'encephalitis': True, 'anaphylaxis': True,
        'status asthmaticus': True, 'hemorrhage': True, 'trauma': True
    }
    
    medium_severity_diseases = {
        'appendicitis': True, 'pancreatitis': True, 'cholecystitis': True,
        'dengue': True, 'malaria': True, 'typhoid': True, 'hepatitis': True,
        'gastroenteritis': True, 'urinary tract infection': True, 'kidney stones': True,
        'severe infection': True, 'diabetes': True
    }
    
    disease_lower = disease_name.lower()
    
    # Check if disease is in high severity list
    if any(severe in disease_lower for severe in high_severity_diseases.keys()):
        # High severity disease + 4+ matching symptoms = CRITICAL
        if match_count >= 4:
            return {
                'level': 'Critical',
                'color': 'red',
                'icon': '🚨',
                'reasoning': f'{disease_name} is a critical condition',
                'action': 'Call emergency services (102/911) immediately'
            }
        # High severity disease + 2-3 matching symptoms = URGENT
        elif match_count >= 2:
            return {
                'level': 'Urgent',
                'color': 'red',
                'icon': '⚠️',
                'reasoning': f'{disease_name} requires immediate hospital visit',
                'action': 'Go to hospital/emergency center NOW'
            }
        # High severity disease + 1 matching symptom = MODERATE
        else:
            return {
                'level': 'Moderate',
                'color': 'amber',
                'icon': '⏱️',
                'reasoning': f'Symptoms suggest {disease_name}, needs urgent evaluation',
                'action': 'Visit hospital within 2-4 hours'
            }
    
    # Check if disease is in medium severity list
    if any(med in disease_lower for med in medium_severity_diseases.keys()):
        # Medium severity + 4+ matching symptoms = URGENT
        if match_count >= 4:
            return {
                'level': 'Urgent',
                'color': 'amber',
                'icon': '⚠️',
                'reasoning': f'{disease_name} needs prompt medical attention',
                'action': 'Visit hospital/clinic today'
            }
        # Medium severity + 2-3 matching symptoms = MODERATE
        elif match_count >= 2:
            return {
                'level': 'Moderate',
                'color': 'amber',
                'icon': '⏱️',
                'reasoning': f'{disease_name} requires medical consultation soon',
                'action': 'See doctor within 24 hours'
            }
        # Medium severity + 1 matching symptom = MILD
        else:
            return {
                'level': 'Mild',
                'color': 'green',
                'icon': '✓',
                'reasoning': f'Possible {disease_name}, monitor symptoms',
                'action': 'Home care, consult doctor if symptoms worsen'
            }
    
    # Low severity diseases (common cold, minor infections, etc.)
    if match_count >= 4:
        return {
            'level': 'Moderate',
            'color': 'amber',
            'icon': '⏱️',
            'reasoning': f'Likely {disease_name}, moderate match',
            'action': 'See doctor within 2-3 days'
        }
    elif match_count >= 2:
        return {
            'level': 'Mild',
            'color': 'green',
            'icon': '✓',
            'reasoning': f'Possible {disease_name}, monitor symptoms',
            'action': 'Home care, consult doctor if needed'
        }
    
    return {
        'level': 'Mild',
        'color': 'green',
        'icon': '✓',
        'reasoning': f'Low likelihood of {disease_name}',
        'action': 'Monitor symptoms, consult if they persist'
    }

if __name__ == '__main__':
    # Test the analyzer
    test_input = "I have a fever, cough, and headache"
    result = analyze(test_input)
    print("Test Result:", result)