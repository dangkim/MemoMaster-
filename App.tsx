import React, { useState } from 'react';
import Layout from './components/Layout';
import SetupScreen from './components/SetupScreen';
import PracticeScreen from './components/PracticeScreen';
import FeedbackScreen from './components/FeedbackScreen';
import ParentReportModal from './components/ParentReportModal';
import { AppState, Lesson, FeedbackResponse, SessionStats, ParentReport } from './types';
import { evaluateRecitation, generateParentReport } from './services/gemini';
import { Loader2 } from 'lucide-react';

// Helper to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SETUP);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [parentReport, setParentReport] = useState<ParentReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Motivation State Tracking
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    attempts: 0,
    bestScore: 0,
    previousScore: null,
    history: [],
    startTime: Date.now()
  });

  const handleStart = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    // Reset stats for new lesson
    setSessionStats({
        attempts: 0,
        bestScore: 0,
        previousScore: null,
        history: [],
        startTime: Date.now()
    });
    setAppState(AppState.PRACTICE);
  };

  const handleEvaluate = async (audioBlob: Blob | null, textInput: string | null) => {
    if (!currentLesson) return;
    
    setAppState(AppState.EVALUATING);
    
    try {
      let audioBase64: string | null = null;
      
      if (audioBlob) {
        audioBase64 = await blobToBase64(audioBlob);
      }

      const result = await evaluateRecitation(currentLesson.content, audioBase64, textInput, sessionStats);
      
      // Update stats based on result
      setSessionStats(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        bestScore: Math.max(prev.bestScore, result.overall_score),
        previousScore: result.overall_score,
        history: [...prev.history, { score: result.overall_score, timestamp: Date.now() }]
      }));

      setFeedback(result);
      setAppState(AppState.FEEDBACK);
    } catch (error) {
      console.error("Evaluation failed", error);
      // In a real app, handle error UI here
      setAppState(AppState.PRACTICE);
    }
  };

  const handleRetry = () => {
    setAppState(AppState.PRACTICE);
    setFeedback(null);
  };

  const handleNewLesson = () => {
    setAppState(AppState.SETUP);
    setCurrentLesson(null);
    setFeedback(null);
    setSessionStats({
        attempts: 0,
        bestScore: 0,
        previousScore: null,
        history: [],
        startTime: Date.now()
    });
  };

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      try {
          const report = await generateParentReport(sessionStats);
          setParentReport(report);
      } catch (e) {
          console.error("Failed to generate report", e);
      } finally {
          setIsGeneratingReport(false);
      }
  };

  return (
    <Layout>
      {appState === AppState.SETUP && (
        <SetupScreen onStart={handleStart} />
      )}

      {appState === AppState.PRACTICE && currentLesson && (
        <PracticeScreen 
            lesson={currentLesson} 
            onEvaluate={handleEvaluate} 
            onBack={handleNewLesson}
        />
      )}

      {appState === AppState.EVALUATING && (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-pulse">
            <div className="bg-white p-6 rounded-full shadow-lg mb-6 relative">
                <Loader2 size={64} className="text-brand-purple animate-spin" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Đang lắng nghe & suy nghĩ...</h2>
            <p className="text-slate-500">Đang so sánh trí nhớ siêu phàm của bạn!</p>
        </div>
      )}

      {appState === AppState.FEEDBACK && feedback && (
        <FeedbackScreen 
            feedback={feedback} 
            onRetry={handleRetry} 
            onNew={handleNewLesson}
            onShowReport={handleGenerateReport}
        />
      )}

      {/* Loading Overlay for Report */}
      {isGeneratingReport && (
          <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-4 rounded-xl flex items-center gap-3 shadow-xl">
                  <Loader2 className="animate-spin text-brand-purple" />
                  <span className="font-bold text-slate-700">Đang tạo báo cáo...</span>
              </div>
          </div>
      )}

      {/* Report Modal */}
      {parentReport && (
          <ParentReportModal 
              report={parentReport} 
              onClose={() => setParentReport(null)} 
          />
      )}
    </Layout>
  );
};

export default App;