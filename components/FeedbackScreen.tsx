import React, { useEffect, useState } from 'react';
import { Repeat, Volume2, Target, CheckCircle2, TrendingUp, AlertCircle, Bookmark, PlusCircle, AlertTriangle, Lightbulb, Info, Award, FileText, Sparkles, Zap, Mic, Globe, Activity } from 'lucide-react';
import { FeedbackResponse } from '../types';
import { generateSpeech } from '../services/gemini';

interface FeedbackScreenProps {
  feedback: FeedbackResponse;
  onRetry: () => void;
  onNew: () => void;
  onShowReport: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ feedback, onRetry, onNew, onShowReport }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudio = async () => {
        // Construct a summary string for the AI to speak
        const textToSpeak = `${feedback.encouragement_message} Bạn đạt ${feedback.overall_score} điểm. ${feedback.strengths[0] || ''}.`;
        const url = await generateSpeech(textToSpeak);
        if (url) setAudioUrl(url);
    };
    fetchAudio();
  }, [feedback]);

  const playFeedback = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.play();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-brand-green';
    if (score >= 70) return 'text-brand-blue';
    if (score >= 50) return 'text-brand-orange';
    return 'text-brand-pink';
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
        case 'critical': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
        case 'moderate': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' };
        case 'minor': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
        default: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-800' };
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
        case 'critical': return 'Nghiêm trọng';
        case 'moderate': return 'Trung bình';
        case 'minor': return 'Nhỏ';
        default: return severity;
    }
  };

  const getTypeIcon = (type: string) => {
      switch (type) {
          case 'omission': return <Bookmark size={16} />;
          case 'addition': return <PlusCircle size={16} />;
          case 'sequence': return <TrendingUp size={16} />;
          case 'substitution': return <AlertTriangle size={16} />;
          default: return <AlertCircle size={16} />;
      }
  };

  const getTypeLabel = (type: string) => {
      switch (type) {
          case 'omission': return 'Thiếu sót';
          case 'addition': return 'Thừa từ';
          case 'sequence': return 'Sai trật tự';
          case 'substitution': return 'Sai từ';
          default: return 'Lỗi khác';
      }
  };

  const mapQualityFlag = (flag: string) => {
      switch (flag) {
          case 'background_noise': return 'Tiếng ồn nền';
          case 'low_volume': return 'Âm lượng nhỏ';
          case 'multiple_speakers': return 'Nhiều người nói';
          case 'unclear_pronunciation': return 'Phát âm chưa rõ';
          default: return flag;
      }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-8">
      
      {/* Header Section with Score */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-t-8 border-brand-purple flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        
        {/* Score Circle */}
        <div className="relative flex-shrink-0">
             <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center relative z-10 bg-white">
                 <div className="text-center">
                     <span className={`text-4xl font-black ${getScoreColor(feedback.overall_score)}`}>{feedback.overall_score}</span>
                     <span className="text-xs block text-slate-400 font-bold uppercase">Điểm</span>
                 </div>
             </div>
             {/* Decorative ring */}
             <div className={`absolute top-0 left-0 w-full h-full rounded-full border-8 ${getScoreColor(feedback.overall_score)} border-t-transparent animate-spin opacity-30`}></div>
        </div>

        {/* Message */}
        <div className="flex-grow text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-brand-yellow/20 text-brand-orange font-bold rounded-full text-xs uppercase tracking-wider mb-2">
                {feedback.grade_level}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 leading-tight">
                {feedback.encouragement_message}
            </h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                 <button 
                    onClick={playFeedback}
                    disabled={!audioUrl}
                    className="flex items-center gap-2 bg-brand-purple/10 text-brand-purple px-4 py-2 rounded-full font-bold text-sm hover:bg-brand-purple/20 transition-colors"
                >
                    <Volume2 size={16} /> Nghe
                </button>
                <button
                    onClick={onShowReport}
                    className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                    <FileText size={16} /> Báo cáo Phụ Huynh
                </button>
            </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {feedback.achievements.length > 0 && (
          <div className="bg-gradient-to-r from-brand-yellow/10 to-brand-orange/10 rounded-2xl p-4 border border-brand-yellow/30">
              <h3 className="text-sm font-bold text-brand-orange mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Award size={18} /> Thành tích mới!
              </h3>
              <div className="flex flex-wrap gap-3">
                  {feedback.achievements.map((badge, idx) => (
                      <div key={idx} className="bg-white p-2 pr-4 rounded-xl shadow-sm border border-brand-yellow/20 flex items-center gap-3 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                          <span className="text-3xl filter drop-shadow-sm">{badge.emoji}</span>
                          <div>
                              <p className="font-bold text-slate-800 text-sm">{badge.title}</p>
                              <p className="text-xs text-slate-500">{badge.description}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Learning Tip Card */}
      {feedback.learning_tip && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-100 shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles size={120} className="text-indigo-300" />
             </div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900 leading-none">Mẹo Ghi Nhớ Từ Chuyên Gia</h3>
                        <p className="text-indigo-500 text-sm font-medium">Dành riêng cho bài học này</p>
                    </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50">
                    <h4 className="text-xl font-bold text-indigo-800 mb-2 flex items-center gap-2">
                        {feedback.learning_tip.technique_name}
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Tại sao hiệu quả?</p>
                                <p className="text-slate-700 text-sm">{feedback.learning_tip.why_it_helps}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Cách thực hiện</p>
                                <p className="text-slate-700 text-sm">{feedback.learning_tip.how_to_do_it}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-indigo-100/50 p-3 rounded-xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                    <Zap size={12} /> Thử ngay
                                </p>
                                <p className="text-indigo-900 font-medium text-sm italic">
                                    "{feedback.learning_tip.try_it_now}"
                                </p>
                            </div>
                             <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Kết quả mong đợi</p>
                                <p className="text-slate-700 text-sm">{feedback.learning_tip.expected_result}</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
      )}

      {/* Accuracy Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
             <span className="text-brand-blue font-bold text-2xl mb-1">{feedback.accuracy_breakdown.similarity_score}%</span>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Chính xác</span>
             <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                 <div className="bg-brand-blue h-full rounded-full" style={{ width: `${feedback.accuracy_breakdown.similarity_score}%` }}></div>
             </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
             <span className="text-brand-green font-bold text-2xl mb-1">{feedback.accuracy_breakdown.key_concepts_score}%</span>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Ý chính</span>
             <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                 <div className="bg-brand-green h-full rounded-full" style={{ width: `${feedback.accuracy_breakdown.key_concepts_score}%` }}></div>
             </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
             <span className="text-brand-orange font-bold text-2xl mb-1">{feedback.accuracy_breakdown.structure_score}%</span>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Trình tự</span>
             <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                 <div className="bg-brand-orange h-full rounded-full" style={{ width: `${feedback.accuracy_breakdown.structure_score}%` }}></div>
             </div>
          </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
             <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                 <CheckCircle2 size={20} /> Bạn đã làm tốt
             </h3>
             <ul className="space-y-3">
                 {feedback.strengths.map((str, i) => (
                     <li key={i} className="flex items-start gap-3 text-green-900 text-sm font-medium leading-relaxed">
                         <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"></span>
                         {str}
                     </li>
                 ))}
             </ul>
          </div>
          <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
             <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                 <Target size={20} /> Cần cải thiện
             </h3>
             <ul className="space-y-3">
                 {feedback.improvement_areas.map((imp, i) => (
                     <li key={i} className="flex items-start gap-3 text-blue-900 text-sm font-medium leading-relaxed">
                         <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></span>
                         {imp}
                     </li>
                 ))}
             </ul>
          </div>
      </div>

      {/* Mismatches Detail */}
      {feedback.mismatches.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="bg-brand-pink/20 p-1.5 rounded-lg text-brand-pink"><Repeat size={18} /></span> 
                Phân tích chi tiết
            </h3>
            <div className="space-y-4">
                {feedback.mismatches.map((m, idx) => {
                    const styles = getSeverityStyles(m.severity);
                    return (
                    <div key={idx} className={`${styles.bg} p-5 rounded-2xl flex flex-col gap-3 border ${styles.border} transition-all`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles.badge}`}>
                                    {getSeverityLabel(m.severity)}
                                </span>
                                <span className={`text-xs font-bold uppercase flex items-center gap-1 ${styles.text}`}>
                                    {getTypeIcon(m.type)} {getTypeLabel(m.type)}
                                </span>
                            </div>
                        </div>
                        
                        <p className={`font-medium text-sm ${styles.text}`}>{m.description}</p>
                        
                        {(m.original || m.student_said) && (
                            <div className="bg-white p-3 rounded-xl border border-slate-200 text-sm grid gap-2 shadow-sm">
                                {m.student_said && (
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-slate-500">
                                        <span className="font-bold text-brand-pink whitespace-nowrap">Bạn nói:</span>
                                        <span className="line-through decoration-brand-pink/50 decoration-2">{m.student_said}</span>
                                    </div>
                                )}
                                {m.original && (
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-slate-700">
                                        <span className="font-bold text-brand-green whitespace-nowrap">Bài học:</span>
                                        <span>{m.original}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-3 mt-1">
                             {/* Impact */}
                             {m.impact && (
                                <div className="flex items-start gap-2 bg-white/50 p-2 rounded-lg text-xs text-slate-600">
                                    <Info size={14} className="mt-0.5 text-brand-blue flex-shrink-0" />
                                    <span>{m.impact}</span>
                                </div>
                             )}
                             {/* Memory Aid */}
                             {m.memory_aid && (
                                <div className="flex items-start gap-2 bg-brand-yellow/20 p-2 rounded-lg text-xs font-bold text-slate-700">
                                    <Lightbulb size={14} className="mt-0.5 text-brand-orange flex-shrink-0" />
                                    <span>Mẹo: {m.memory_aid}</span>
                                </div>
                             )}
                        </div>
                    </div>
                )})}
            </div>
          </div>
      )}

      {/* Speech Analysis Accordion */}
      <div className="text-center mt-4">
         <details className="text-slate-500 text-sm cursor-pointer group" open>
             <summary className="hover:text-brand-purple transition-colors font-medium flex items-center justify-center gap-2">
                 <Mic size={16} /> Phân tích giọng nói
             </summary>
             <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-left border border-slate-200 shadow-sm">
                 
                 {/* Main Transcription */}
                 <div className="mb-3">
                     <p className="text-xs text-slate-400 font-bold uppercase mb-1">AI nghe được (Đã lọc nhiễu)</p>
                     <p className="text-slate-700 font-medium italic">
                         "{feedback.speech_analysis?.cleaned_speech || feedback.transcription}"
                     </p>
                     {feedback.speech_analysis && feedback.speech_analysis.cleaned_speech !== feedback.speech_analysis.original_speech && (
                         <p className="text-xs text-slate-400 mt-2">
                             <span className="font-bold">Gốc:</span> {feedback.speech_analysis.original_speech}
                         </p>
                     )}
                 </div>

                 {/* Badges */}
                 {feedback.speech_analysis && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                            <Globe size={12} /> {feedback.speech_analysis.detected_language}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold">
                            <Activity size={12} /> Độ tin cậy: {Math.round(feedback.speech_analysis.confidence_score * 100)}%
                        </span>
                        {feedback.speech_analysis.quality_flags.map((flag, idx) => {
                            if (flag === 'none') return null;
                            return (
                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-bold">
                                    <AlertTriangle size={12} /> {mapQualityFlag(flag)}
                                </span>
                            );
                        })}
                    </div>
                 )}
                 
                 {/* Processing Notes */}
                 {feedback.speech_analysis?.processing_notes && (
                     <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">
                         <span className="font-bold">Ghi chú xử lý:</span> {feedback.speech_analysis.processing_notes}
                     </p>
                 )}
             </div>
         </details>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <button 
            onClick={onRetry}
            className="bg-white border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
        >
            <Repeat size={20} /> Thử lại
        </button>
        <button 
            onClick={onNew}
            className="bg-brand-purple text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-pink transition-colors shadow-lg shadow-brand-purple/20"
        >
            Bài mới
        </button>
      </div>

    </div>
  );
};

export default FeedbackScreen;