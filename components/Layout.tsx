import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center">
      {/* Background Decor */}
      <div className="blob w-96 h-96 bg-brand-blue rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2" />
      <div className="blob w-80 h-80 bg-brand-yellow rounded-full top-1/2 right-0 translate-x-1/2 -translate-y-1/2" />
      <div className="blob w-72 h-72 bg-brand-pink rounded-full bottom-0 left-1/3 translate-y-1/2" />

      {/* Header */}
      <header className="w-full max-w-4xl p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full shadow-sm border border-white/50">
          <div className="bg-brand-purple p-2 rounded-full text-white">
            <BrainCircuit size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-700 tracking-tight">
            Memo<span className="text-brand-purple">Master</span> AI
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full text-sm font-medium text-slate-600">
          <Sparkles size={16} className="text-brand-yellow" />
          <span>Bạn Đồng Hành Học Tập</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-2xl px-4 pb-12 z-10 flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
};

export default Layout;