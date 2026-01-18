import React, { useState, useRef } from 'react';
import { ArrowRight, BookOpen, Quote, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lesson, DocumentExtractionResult } from '../types';
import { extractDocumentText } from '../services/gemini';

interface SetupScreenProps {
  onStart: (lesson: Lesson) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [docResult, setDocResult] = useState<DocumentExtractionResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!content.trim()) {
      setError("Vui lòng dán nội dung hoặc tải tài liệu lên!");
      return;
    }
    if (content.length < 10) {
      setError("Ngắn quá! Hãy thử thêm một câu đầy đủ xem sao.");
      return;
    }
    onStart({ title: title || 'Bài Học Của Tôi', content });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // Check type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        setError("Chỉ hỗ trợ tệp PDF hoặc Word.");
        return;
    }

    setIsProcessing(true);
    setError('');
    setDocResult(null);

    try {
        const reader = new FileReader();
        reader.onload = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const result = await extractDocumentText(base64, file.type || 'application/pdf');
            
            setDocResult(result);
            setContent(result.extracted_text);
            if (!title) setTitle(file.name.split('.')[0]);
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    } catch (e) {
        console.error(e);
        setError("Có lỗi khi phân tích tài liệu. Thử lại nhé!");
        setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  return (
    <div className="flex flex-col gap-6 animate-float">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-slate-800 mb-2">Hôm nay chúng ta học gì nào? 📚</h2>
        <p className="text-slate-500 text-lg">Dán văn bản hoặc tải tài liệu PDF/Word lên nhé!</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-brand-blue/20 space-y-6">
        
        {/* Title Input */}
        <div>
          <label className="block text-slate-600 font-bold mb-2 ml-1">Tiêu đề bài học</label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Lịch sử Việt Nam"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 border-2 border-transparent focus:border-brand-blue focus:outline-none transition-colors text-slate-700 font-medium"
            />
            <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>
        </div>

        {/* Upload Zone */}
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center gap-3 ${isDragOver ? 'border-brand-purple bg-brand-purple/5 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:border-brand-blue'}`}
            onClick={() => fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
            
            {isProcessing ? (
                <div className="flex flex-col items-center animate-pulse">
                    <Loader2 className="animate-spin text-brand-purple mb-2" size={40} />
                    <p className="text-brand-purple font-bold">Đang phân tích tài liệu...</p>
                    <p className="text-xs text-slate-400">Làm sạch nhiễu, trích xuất cấu trúc...</p>
                </div>
            ) : (
                <>
                    <div className="bg-white p-3 rounded-full shadow-md text-brand-blue">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="text-slate-700 font-bold">Tải lên PDF hoặc Word</p>
                        <p className="text-slate-400 text-sm">Kéo thả hoặc nhấn để chọn tệp</p>
                    </div>
                </>
            )}
        </div>

        {/* Content Preview / Manual Input */}
        <div>
          <label className="block text-slate-600 font-bold mb-2 ml-1">Nội dung học tập</label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
                setDocResult(null);
              }}
              placeholder="Nội dung sẽ xuất hiện ở đây sau khi tải tài liệu, hoặc bạn có thể tự dán vào..."
              className="w-full bg-slate-50 rounded-xl px-4 py-3 min-h-[180px] border-2 border-transparent focus:border-brand-blue focus:outline-none transition-colors text-slate-700 resize-y"
            />
            <Quote className="absolute right-4 top-4 text-slate-400" size={20} />
          </div>
          
          {docResult && (
              <div className="mt-3 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="text-emerald-500 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                      <p className="text-emerald-800 text-xs font-bold">Trích xuất thành công!</p>
                      <p className="text-emerald-600 text-xs italic">Độ tin cậy: {docResult.quality_assessment.overall_score}% • {docResult.metadata.word_count} từ</p>
                  </div>
              </div>
          )}

          {error && (
              <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-red-800 text-xs font-bold">{error}</p>
              </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isProcessing}
        className="group bg-brand-blue hover:bg-brand-purple text-white text-xl font-bold py-4 px-8 rounded-full shadow-lg shadow-brand-blue/30 transform transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Bắt đầu Luyện tập</span>
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default SetupScreen;