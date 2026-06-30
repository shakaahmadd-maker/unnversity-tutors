import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Loader2, 
  Download,
  Terminal,
  CircleDot
} from 'lucide-react';

interface HowItWorksSectionProps {
  onNavigate: (view: string) => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export default function HowItWorksSection({ onNavigate }: HowItWorksSectionProps) {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [wizardOption, setWizardOption] = useState<'analysis' | 'design'>('analysis');
  const [wizardVal, setWizardVal] = useState<number>(120);
  const [matchingQuality, setMatchingQuality] = useState<number>(99.4);
  const [typedMessage, setTypedMessage] = useState<string>('Designing assignment outlines and frameworks...');
  const [plagiarismPercent, setPlagiarismPercent] = useState<number>(100);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto type effect for Stage 3 Chat
  const typeMessage = (msgList: string[]) => {
    const selected = msgList[Math.floor(Math.random() * msgList.length)];
    setTypedMessage('');
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < selected.length) {
        setTypedMessage(prev => prev + selected.charAt(idx));
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  };

  // Run dynamic indicators on stage changes
  useEffect(() => {
    if (activeStage === 2) {
      // Step 2 Matchmaker accuracy count-up ticker
      setMatchingQuality(40);
      let count = 40;
      const interval = setInterval(() => {
        if (count >= 99) {
          clearInterval(interval);
          setMatchingQuality(99.4);
        } else {
          count += Math.floor(Math.random() * 8) + 4;
          if (count > 99) count = 99;
          setMatchingQuality(parseFloat(`${count}.${Math.floor(Math.random() * 9)}`));
        }
      }, 50);
      return () => clearInterval(interval);
    }

    if (activeStage === 3) {
      // Step 3 typed discussion simulation
      const messages = [
        "Analyzing project instructions...",
        "Drafting outline mockups...",
        "Structuring flowcharts & formulas...",
        "Perfecting layout & strict criteria..."
      ];
      return typeMessage(messages);
    }

    if (activeStage === 4) {
      // Step 4 plagiarism ring ticker
      setPlagiarismPercent(0);
      let val = 0;
      const interval = setInterval(() => {
        if (val >= 100) {
          clearInterval(interval);
          setPlagiarismPercent(100);
        } else {
          val += 5;
          setPlagiarismPercent(val);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [activeStage]);

  // Step 1 Calculator simulation with count-up animation
  const calculateWizard = (option: 'analysis' | 'design', targetAmount: number) => {
    setWizardOption(option);
    setWizardVal(0);
    let current = 0;
    const interval = setInterval(() => {
      if (current >= targetAmount) {
        clearInterval(interval);
        setWizardVal(targetAmount);
      } else {
        current += 10;
        setWizardVal(current);
      }
    }, 20);
  };

  // Step 4 color particle confetti explosion
  const triggerConfettiExplosion = (e: React.MouseEvent<HTMLButtonElement>) => {
    const parent = containerRef.current;
    if (!parent) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const relativeX = rect.left - parentRect.left + rect.width / 2;
    const relativeY = rect.top - parentRect.top;

    const colors = ['#F99B0C', '#E2E8F0', '#0B1528', '#10B981', '#F43F5E', '#3B82F6'];
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 125 + 35;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance - 20;

      newParticles.push({
        id: Math.random() + i,
        x,
        y,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    setParticles(newParticles);
    showToastAlert("Downloading verified delivery vault package!");

    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 850);
  };

  const showToastAlert = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <section className="bg-white text-[#0B1528] py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100 font-sans" id="how-it-works-section">
      <div className="max-w-7xl mx-auto">
        
        {/* Style injection for animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes radar-pulse-glow {
            0% { transform: scale(0.85); opacity: 0.95; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          @keyframes float-slow-avatar {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
          }
          @keyframes confetti-pop {
            0% {
              transform: translate(0, 0) scale(1) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(var(--p-x), var(--p-y)) scale(0.15) rotate(360deg);
              opacity: 0;
            }
          }
          .animate-radar-pulse-glow {
            animation: radar-pulse-glow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
          }
          .animate-float-slow-custom {
            animation: float-slow-avatar 5s ease-in-out infinite;
          }
          .animate-confetti-particle {
            animation: confetti-pop 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          }
        `}} />

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-orange-100 text-[#F99B0C] border border-orange-200/50 mb-4 font-sans shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>DYNAMIC FLOW EXPERIENCE</span>
          </div>
          <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black italic tracking-tight uppercase leading-none mb-6">
            HOW IT <span className="text-[#F99B0C]">WORKS</span>
          </h2>
          <p className="text-[#64748B] text-base sm:text-lg leading-relaxed font-normal px-4">
            We've synchronized our entire ecosystem. Select any milestone below to observe operations in the central real-time interactive terminal.
          </p>
        </div>

        {/* Core Sandbox Interactive Grid */}
        <div ref={containerRef} className="relative w-full bg-slate-50 border border-gray-150 rounded-[40px] p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center overflow-hidden min-h-[550px]">
          
          {/* Grid Background accents */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-[80px] pointer-events-none z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full max-w-6xl relative z-10">
            
            {/* LEFT COLUMN: Stage 1 & 2 Cards */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
              
              {/* STAGE 1 */}
              <div 
                onClick={() => setActiveStage(1)}
                className={`group cursor-pointer bg-white border rounded-[28px] p-6 transition-all duration-300 relative flex gap-4 ${
                  activeStage === 1 
                    ? 'border-[#F99B0C] ring-2 ring-[#F99B0C]/10 shadow-[0_20px_40px_rgba(249,155,12,0.06)] -translate-y-1' 
                    : 'border-slate-200/80 hover:border-[#F99B0C]/40 hover:shadow-[0_12px_24px_rgba(249,155,12,0.03)]'
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                  activeStage === 1 
                    ? 'bg-[#F99B0C] text-white shadow-md shadow-[#F99B0C]/20' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  1
                </div>
                <div className="text-left flex-1">
                  <h4 className={`font-bold text-lg mb-1.5 transition-colors ${
                    activeStage === 1 ? 'text-[#0B1528]' : 'text-slate-800'
                  }`}>
                    Get Started
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    <strong className="text-emerald-700">You do:</strong> Choose project specs and estimate complexity.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    <strong className="text-[#F99B0C]">We do:</strong> Instantly calculate optimized pricing plans.
                  </p>
                  {/* Timeline Progress Bar indicator */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-[#F99B0C] h-full transition-transform duration-500 origin-left"
                      style={{ transform: activeStage === 1 ? 'scaleX(1)' : 'scaleX(0)' }}
                    />
                  </div>
                </div>
              </div>

              {/* STAGE 2 */}
              <div 
                onClick={() => setActiveStage(2)}
                className={`group cursor-pointer bg-white border rounded-[28px] p-6 transition-all duration-300 relative flex gap-4 ${
                  activeStage === 2 
                    ? 'border-[#F99B0C] ring-2 ring-[#F99B0C]/10 shadow-[0_20px_40px_rgba(249,155,12,0.06)] -translate-y-1' 
                    : 'border-slate-200/80 hover:border-[#F99B0C]/40 hover:shadow-[0_12px_24px_rgba(249,155,12,0.03)]'
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                  activeStage === 2 
                    ? 'bg-[#F99B0C] text-white shadow-md shadow-[#F99B0C]/20' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </div>
                <div className="text-left flex-1">
                  <h4 className={`font-bold text-lg mb-1.5 transition-colors ${
                    activeStage === 2 ? 'text-[#0B1528]' : 'text-slate-800'
                  }`}>
                    Get Matched
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    <strong className="text-emerald-700">You do:</strong> Securely approve spec constraints and quotes.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    <strong className="text-[#F99B0C]">We do:</strong> Launch direct syllabus matching expert matching.
                  </p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-[#F99B0C] h-full transition-transform duration-500 origin-left"
                      style={{ transform: activeStage === 2 ? 'scaleX(1)' : 'scaleX(0)' }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* CENTRAL COLUMN: Simulated Interactive Terminal Frame */}
            <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2 py-4 relative">
              <div className="w-[310px] h-[315px] sm:w-[350px] sm:h-[355px] rounded-[32px] p-4 bg-white border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden relative">
                
                {/* Window Terminal Header Buttons */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-2 shrink-0">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold text-slate-400" id="terminal-badge-sync">
                    <Terminal className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                    <span>SYSTEM_SYNC</span>
                  </div>
                </div>

                {/* Simulated Content Screen wrapper block */}
                <div className="flex-1 relative flex flex-col justify-center items-stretch text-left">
                  
                  {/* SCREEN 1: Interactive calculator details */}
                  {activeStage === 1 && (
                    <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full py-1">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#F99B0C] uppercase block mb-1">Configuration Wizard</span>
                        <p className="text-[11.5px] font-semibold text-slate-500">Select target academic disciplines below:</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-1">
                        <button 
                          onClick={() => calculateWizard('analysis', 120)}
                          className={`p-2.5 text-left rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            wizardOption === 'analysis' 
                              ? 'border-[#F99B0C] border-2 bg-white shadow-xs' 
                              : 'border-slate-150 hover:border-[#F99B0C]/40 bg-white'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-700">Analysis Task</span>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                            wizardOption === 'analysis' ? 'bg-[#F99B0C] text-white font-bold' : 'bg-slate-100'
                          }`}>
                            {wizardOption === 'analysis' ? '✓' : ''}
                          </span>
                        </button>
                        <button 
                          onClick={() => calculateWizard('design', 180)}
                          className={`p-2.5 text-left rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            wizardOption === 'design' 
                              ? 'border-[#F99B0C] border-2 bg-white shadow-xs' 
                              : 'border-slate-150 hover:border-[#F99B0C]/40 bg-white'
                          }`}
                        >
                          <span className="text-[11px] font-bold text-slate-700">UI Design</span>
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                            wizardOption === 'design' ? 'bg-[#F99B0C] text-white font-bold' : 'bg-slate-100'
                          }`}>
                            {wizardOption === 'design' ? '✓' : ''}
                          </span>
                        </button>
                      </div>

                      <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-150 flex justify-between items-center shadow-xs">
                        <div>
                          <span className="text-[9.5px] text-slate-450 block font-bold uppercase tracking-wide">Estimated Query price</span>
                          <span className="text-xl font-bold font-sans text-slate-900">${wizardVal}.00</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9.5px] text-slate-450 block font-bold uppercase tracking-wide">Work scale limit</span>
                          <span className="text-xs font-bold text-emerald-600">24-48 Hours</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: Matching scanner simulator */}
                  {activeStage === 2 && (
                    <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full py-1">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#F99B0C] uppercase block mb-1">Scanning Curriculums</span>
                        <p className="text-[11.5px] font-semibold text-slate-500">Iterating specialty matching indices...</p>
                      </div>

                      {/* Radar pulses visual overlay */}
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border border-[#F99B0C]/20 animate-radar-pulse-glow"></div>
                        <div className="absolute w-20 h-20 rounded-full border border-[#F99B0C]/35 animate-radar-pulse-glow" style={{ animationDelay: '1s' }}></div>
                        
                        {/* Portrait avatar indicator */}
                        <div className="relative w-14 h-14 rounded-full border-2 border-[#F99B0C] overflow-hidden shadow-lg shadow-[#F99B0C]/20 bg-slate-100 animate-float-slow-custom">
                          <img 
                            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" 
                            alt="Recommended special examiner"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#FDF8F0]/80 rounded-xl px-3py-2 border border-orange-150/50 p-2 text-xs font-bold">
                        <span className="text-[#F99B0C]">Estimated Matching accuracy:</span>
                        <span className="text-slate-900 text-sm font-sans tracking-wide">{matchingQuality}%</span>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: Active Live discussion portal */}
                  {activeStage === 3 && (
                    <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full py-1">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-[#F99B0C] uppercase block mb-1">Interactive Discussion</span>
                        <p className="text-[11.5px] font-semibold text-slate-500">Checking project specifications...</p>
                      </div>

                      <div className="flex flex-col gap-2 my-1 max-h-[140px] overflow-hidden">
                        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-2xl rounded-tl-none self-start max-w-[85%] shadow-xs">
                          <span className="text-[9px] font-bold text-[#F99B0C] block mb-0.5">Specialist Coordinator Sarah</span>
                          <p className="text-[11px] text-slate-700 leading-tight font-medium h-[32px]">
                            {typedMessage}
                          </p>
                        </div>
                        <div className="bg-[#F99B0C] text-white p-2.5 rounded-2xl rounded-tr-none self-end max-w-[80%] shadow-xs text-right">
                          <p className="text-[11px] font-semibold leading-tight">Excellent! Perfect parameters</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span className="text-slate-700">Channel Status: Active</span>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Matched</span>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 4: Delivery authentication report vault */}
                  {activeStage === 4 && (
                    <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full py-1">
                      <div className="text-center">
                        <span className="text-[10px] font-bold tracking-wider text-[#F99B0C] uppercase block mb-1">Verify Deliverables</span>
                        <p className="text-[11.5px] font-semibold text-slate-500">Uniqueness certification secure report:</p>
                      </div>

                      <div className="relative w-24 h-24 mx-auto flex flex-col items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            stroke="#F99B0C" 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray="251.2" 
                            strokeDashoffset={251.2 - (251.2 * plagiarismPercent) / 100}
                            className="transition-all duration-300 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-lg font-black text-[#F99B0C]">{plagiarismPercent}%</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Unique</span>
                        </div>
                      </div>

                      {/* Action trigger deliverable */}
                      <button 
                        onClick={triggerConfettiExplosion}
                        className="w-full bg-[#0B1528] hover:bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0B1528]/10 hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download deliverables</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: Stage 3 & 4 Cards */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-3">
              
              {/* STAGE 3 */}
              <div 
                onClick={() => setActiveStage(3)}
                className={`group cursor-pointer bg-white border rounded-[28px] p-6 transition-all duration-300 relative flex gap-4 ${
                  activeStage === 3 
                    ? 'border-[#F99B0C] ring-2 ring-[#F99B0C]/10 shadow-[0_20px_40px_rgba(249,155,12,0.06)] -translate-y-1' 
                    : 'border-slate-200/80 hover:border-[#F99B0C]/40 hover:shadow-[0_12px_24px_rgba(249,155,12,0.03)]'
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                  activeStage === 3 
                    ? 'bg-[#F99B0C] text-white shadow-md shadow-[#F99B0C]/20' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  3
                </div>
                <div className="text-left flex-1">
                  <h4 className={`font-bold text-lg mb-1.5 transition-colors ${
                    activeStage === 3 ? 'text-[#0B1528]' : 'text-slate-800'
                  }`}>
                    Expert Collaboration
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    <strong className="text-emerald-700">You do:</strong> Discuss requirements in real-time &amp; evaluate mock draft templates.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    <strong className="text-[#F99B0C]">We do:</strong> Sync daily progress pipelines &amp; issue escrow release codes.
                  </p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-[#F99B0C] h-full transition-transform duration-500 origin-left"
                      style={{ transform: activeStage === 3 ? 'scaleX(1)' : 'scaleX(0)' }}
                    />
                  </div>
                </div>
              </div>

              {/* STAGE 4 */}
              <div 
                onClick={() => setActiveStage(4)}
                className={`group cursor-pointer bg-white border rounded-[28px] p-6 transition-all duration-300 relative flex gap-4 ${
                  activeStage === 4 
                    ? 'border-[#F99B0C] ring-2 ring-[#F99B0C]/10 shadow-[0_20px_40px_rgba(249,155,12,0.06)] -translate-y-1' 
                    : 'border-slate-200/80 hover:border-[#F99B0C]/40 hover:shadow-[0_12px_24px_rgba(249,155,12,0.03)]'
                }`}
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-300 ${
                  activeStage === 4 
                    ? 'bg-[#F99B0C] text-white shadow-md shadow-[#F99B0C]/20' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  4
                </div>
                <div className="text-left flex-1">
                  <h4 className={`font-bold text-lg mb-1.5 transition-colors ${
                    activeStage === 4 ? 'text-[#0B1528]' : 'text-slate-800'
                  }`}>
                    Approve &amp; Download
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    <strong className="text-emerald-700">You do:</strong> Approve double-checked uniqueness metrics and download final assets.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 font-semibold">
                    <strong className="text-[#F99B0C]">We do:</strong> Formally yield total copyright access details instantly.
                  </p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-[#F99B0C] h-full transition-transform duration-500 origin-left"
                      style={{ transform: activeStage === 4 ? 'scaleX(1)' : 'scaleX(0)' }}
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Particle Explosion Layer */}
          {particles.map((p) => (
            <div 
              key={p.id}
              className="absolute pointer-events-none animate-confetti-particle shrink-0"
              style={{
                left: `${p.x + (containerRef.current?.clientWidth || 300) / 2}px`,
                top: `${p.y + (containerRef.current?.clientHeight || 200) / 2}px`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '15%',
                '--p-x': `${p.x}px`,
                '--p-y': `${p.y}px`
              } as React.CSSProperties}
            />
          ))}

        </div>

        {/* Dynamic CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <button 
            onClick={() => onNavigate('get-a-quote')}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-600 to-[#F99B0C] hover:from-[#F99B0C] hover:to-orange-500 text-white font-bold tracking-wider text-sm uppercase shadow-xl shadow-[#F99B0C]/15 hover:shadow-[#F99B0C]/30 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 font-black italic">
              Launch Your Project
              <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>

      </div>

      {/* Floating toast alert notifications */}
      <div 
        className={`fixed bottom-6 right-6 px-5 py-4 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur border border-slate-850 flex items-center gap-2.5 transition-all duration-300 ease-out z-50 ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span>{toastMessage}</span>
      </div>

    </section>
  );
}
