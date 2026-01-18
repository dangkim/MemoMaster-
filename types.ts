export interface Mismatch {
  type: 'omission' | 'addition' | 'substitution' | 'sequence';
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  original: string;
  student_said: string;
  impact: string;
  memory_aid: string;
}

export interface AccuracyBreakdown {
  similarity_score: number;
  key_concepts_score: number;
  structure_score: number;
}

export interface Achievement {
  title: string;
  emoji: string;
  description: string;
}

export interface LearningTip {
  technique_name: string;
  why_it_helps: string;
  how_to_do_it: string;
  try_it_now: string;
  expected_result: string;
}

export interface SpeechAnalysis {
  original_speech: string;
  cleaned_speech: string;
  detected_language: string;
  confidence_score: number;
  alternate_interpretations: string[];
  quality_flags: string[];
  processing_notes: string;
}

export interface DocumentExtractionResult {
  extracted_text: string;
  metadata: {
    document_type: string;
    page_count: number;
    word_count: number;
    detected_language: string;
    has_images: boolean;
    has_tables: boolean;
    extraction_method: string;
  };
  quality_assessment: {
    overall_score: number;
    confidence_level: 'high' | 'medium' | 'low';
    issues_detected: string[];
    recommendations: string[];
  };
  structure: {
    headings: string[];
    sections: {
      title: string;
      content: string;
      word_count: number;
    }[];
  };
}

export interface FeedbackResponse {
  overall_score: number;
  grade_level: string; 
  encouragement_message: string;
  accuracy_breakdown: AccuracyBreakdown;
  mismatches: Mismatch[];
  strengths: string[];
  improvement_areas: string[];
  transcription: string;
  achievements: Achievement[];
  learning_tip?: LearningTip;
  speech_analysis?: SpeechAnalysis;
}

export interface ParentReport {
  report_type: 'session' | 'weekly' | 'lesson';
  student_name: string;
  period: string;
  summary_stats: {
    total_practice_time: string;
    lessons_practiced: number;
    average_score: number;
    best_score: number;
    improvement_rate: string;
  };
  achievements: string[];
  focus_areas: string[];
  parent_tips: string[];
  next_session_recommendations: string;
}

export enum AppState {
  SETUP = 'SETUP',
  PRACTICE = 'PRACTICE',
  EVALUATING = 'EVALUATING',
  FEEDBACK = 'FEEDBACK',
}

export interface Lesson {
  title: string;
  content: string;
}

export interface SessionStats {
  attempts: number;
  bestScore: number;
  previousScore: number | null;
  history: { score: number; timestamp: number }[];
  startTime: number;
}