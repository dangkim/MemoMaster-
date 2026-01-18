import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Eye, EyeOff, Send, Keyboard, RefreshCcw } from 'lucide-react';
import { Lesson } from '../types';

interface PracticeScreenProps {
  lesson: Lesson;
  onEvaluate: (audioBlob: Blob | null, text: string | null) => void;
  onBack: () => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ lesson, onEvaluate, onBack }) => {
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Chúng tôi cần quyền truy cập micro để nghe bạn! Vui lòng kiểm tra cài đặt.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Typically webm in browser
        onEvaluate(blob, null);
        
        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
    }
  };

  const handleTextSubmit = () => {
    if (typedText.trim()) {
      onEvaluate(null, typedText);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Bar: Title & Controls */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium text-sm flex items-center gap-1 transition-colors">
          <RefreshCcw size={14} /> Đổi Bài
        </button>
        <h2 className="text-2xl font-bold text-slate-700 truncate max-w-[200px]">{lesson.title}</h2>
        <button 
          onClick={() => setShowHint(!showHint)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${showHint ? 'bg-brand-yellow text-slate-800' : 'bg-slate-200 text-slate-500'}`}
        >
          {showHint ? <EyeOff size={16} /> : <Eye size={16} />}
          {showHint ? 'Ẩn' : 'Xem'}
        </button>
      </div>

      {/* Hint Card */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showHint ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-brand-yellow/20 border-2 border-brand-yellow/50 rounded-2xl p-4 mb-2">
          <p className="text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">{lesson.content}</p>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-slate-100 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
        
        {/* Mode Toggle */}
        <div className="absolute top-4 right-4 flex bg-slate-100 rounded-lg p-1">
            <button 
                onClick={() => setMode('voice')}
                className={`p-2 rounded-md transition-all ${mode === 'voice' ? 'bg-white shadow text-brand-blue' : 'text-slate-400'}`}
            >
                <Mic size={20} />
            </button>
            <button 
                onClick={() => setMode('text')}
                className={`p-2 rounded-md transition-all ${mode === 'text' ? 'bg-white shadow text-brand-purple' : 'text-slate-400'}`}
            >
                <Keyboard size={20} />
            </button>
        </div>

        {mode === 'voice' ? (
          <div className="flex flex-col items-center gap-6">
             <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 relative ${isRecording ? 'bg-red-50 scale-110' : 'bg-brand-blue/10'}`}>
                {isRecording && (
                    <span className="absolute w-full h-full rounded-full border-4 border-red-400 animate-ping opacity-20"></span>
                )}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-brand-blue hover:bg-brand-purple text-white'}`}
                >
                    {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={36} />}
                </button>
             </div>
             
             <div className="text-center">
                 <p className={`text-2xl font-bold font-mono transition-colors ${isRecording ? 'text-red-500' : 'text-slate-300'}`}>
                     {formatTime(recordingTime)}
                 </p>
                 <p className="text-slate-500 mt-2 font-medium">
                     {isRecording ? 'Đang nghe... Nhấn để dừng' : 'Nhấn mic để bắt đầu đọc'}
                 </p>
             </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-4">
            <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Gõ những gì bạn nhớ vào đây..."
                className="w-full h-48 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-brand-purple outline-none resize-none text-lg text-slate-700 placeholder:text-slate-300"
            />
            <button
                onClick={handleTextSubmit}
                disabled={!typedText.trim()}
                className="self-end bg-brand-purple text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-pink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Gửi <Send size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-slate-400 text-sm">
            MemoMaster AI hoạt động tốt nhất trong phòng yên tĩnh! 🤫
        </p>
      </div>
    </div>
  );
};

export default PracticeScreen;