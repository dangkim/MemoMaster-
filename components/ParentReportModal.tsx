import React from 'react';
import { X, TrendingUp, Clock, Target, Award, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { ParentReport } from '../types';

interface ParentReportModalProps {
  report: ParentReport;
  onClose: () => void;
}

const ParentReportModal: React.FC<ParentReportModalProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-float">
        
        {/* Header */}
        <div className="bg-brand-purple p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen size={24} /> Báo Cáo Phụ Huynh
            </h2>
            <p className="text-brand-purple/20 text-white/80 text-sm mt-1">
              Theo dõi tiến độ học tập của bé
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <Clock className="w-6 h-6 mx-auto text-brand-blue mb-1" />
              <div className="text-xl font-bold text-slate-700">{report.summary_stats.total_practice_time}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Thời gian</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <Target className="w-6 h-6 mx-auto text-brand-green mb-1" />
              <div className="text-xl font-bold text-slate-700">{report.summary_stats.best_score}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Điểm cao nhất</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <Award className="w-6 h-6 mx-auto text-brand-yellow mb-1" />
              <div className="text-xl font-bold text-slate-700">{report.summary_stats.lessons_practiced}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Bài học</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
              <TrendingUp className="w-6 h-6 mx-auto text-brand-pink mb-1" />
              <div className="text-xl font-bold text-slate-700">{report.summary_stats.improvement_rate}</div>
              <div className="text-xs text-slate-400 font-bold uppercase">Tiến bộ</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Achievements */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-green flex items-center gap-2">
                <Award size={20} /> Con làm tốt điều gì
              </h3>
              <ul className="space-y-2">
                {report.achievements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-green-50 p-3 rounded-lg border border-green-100">
                    <span className="text-green-500 mt-0.5">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Areas */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-blue flex items-center gap-2">
                <TrendingUp size={20} /> Cơ hội phát triển
              </h3>
              <ul className="space-y-2">
                {report.focus_areas.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <span className="text-blue-500 mt-0.5">➜</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="my-6 border-slate-100" />

          {/* Tips for Parents */}
          <div className="bg-brand-yellow/10 rounded-2xl p-5 border border-brand-yellow/30">
            <h3 className="text-lg font-bold text-brand-orange mb-3 flex items-center gap-2">
              <Lightbulb size={20} /> Lời khuyên cho Ba Mẹ
            </h3>
            <ul className="space-y-2">
              {report.parent_tips.map((tip, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 flex-shrink-0"></span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Next Steps */}
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg">
            <ArrowRight size={16} />
            <span className="font-bold">Bước tiếp theo:</span> {report.next_session_recommendations}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentReportModal;