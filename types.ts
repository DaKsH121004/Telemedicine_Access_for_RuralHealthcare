export enum Language {
  EN = 'English',
  HI = 'हिन्दी',
  PA = 'ਪੰਜਾਬੀ',
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHATBOT = 'CHATBOT',
  FIND_CARE = 'FIND_CARE',
  ANALYZE_REPORT = 'ANALYZE_REPORT',
  SYMPTOM_ANALYZER = 'SYMPTOM_ANALYZER',
  EMERGENCY = 'EMERGENCY',
  VIDEO_CONSULT = 'VIDEO_CONSULT',
  MEDICINE = 'MEDICINE',
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}

export interface DiagnosisSuggestion {
  condition: string;
  likelihood: string;
  reasoning: string;
}
