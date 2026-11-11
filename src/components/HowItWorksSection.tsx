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
    <section className="mt-10 sm:mt-20 pt-6 sm:pt-10 border-t border-orange-200/50 bg-white text-[#0B1528] px-3.5 sm:px-6 lg:px-8 font-sans" id="how-it-works-section">
      <div className="max-w-7xl mx-auto">
        
        {/* Style injection for animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes radar-pulse-glow {
            0% { transform: scale(0.85); opacity: 0.95; }
            100% { transform: scale(2.2); opacity: 0; }
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
          .animate-confetti-particle {
            animation: confetti-pop 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
          }
        `}} />

        {/* Top Pill Tag & Title (Compact on mobile) */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-orange-50/90 border border-orange-200/80 text-orange-600 text-[10px] sm:text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-4 shadow-xs select-none">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" />
            <span>Dynamic Flow Experience</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tight text-gray-950 uppercase leading-snug font-heading">
            HOW IT <span className="text-orange-500 not-italic">WORKS</span>
          </h2>

          <p className="mt-2 text-xs sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
            We've synchronized our entire ecosystem. Select any milestone below to observe operations in the central real-time interactive terminal.
          </p>
        </div>

        {/* Outer Light Grey/Blue Container Box */}
        <div 
          ref={containerRef}
          className="relative bg-slate-50/80 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 lg:p-10 shadow-xs overflow-hidden"
        >
          {/* Subtle glow accent */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-orange-500/5 blur-[70px] pointer-events-none z-0"></div>

          {/* Mobile Step Pills Carousel / Quick Navigation (Visible on mobile/tablet, hidden on desktop) */}
          <div className="flex lg:hidden overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden gap-2 pb-3 mb-3 border-b border-slate-200/60 relative z-10">
            {[
              { id: 1, label: 'Get Started' },
              { id: 2, label: 'Get Matched' },
              { id: 3, label: 'Collaboration' },
              { id: 4, label: 'Approve & Download' },
            ].map((step) => {
              const isActive = activeStage === step.id;
              return (
                <button
                  key={step.id}
                  id={`mobile-step-pill-${step.id}`}
                  onClick={() => setActiveStage(step.id)}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'bg-white text-gray-600 border border-slate-200 font-semibold hover:border-orange-200'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {step.id}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center relative z-10 text-left">
            
            {/* LEFT SIDE: Steps 1 & 2 (order-2 on mobile, order-1 on desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 order-2 lg:order-1">
              
              {/* Step 1 Card */}
              <div 
                id="step-card-1"
                onClick={() => setActiveStage(1)}
                className={`cursor-pointer p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white select-none ${
                  activeStage === 1
                    ? 'border-2 border-orange-500 shadow-md ring-2 ring-orange-500/10'
                    : 'border border-slate-200/90 hover:border-orange-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`step-num w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                    activeStage === 1 ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Get Started</h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-emerald-700 font-semibold">You do:</strong> Choose project specs and estimate complexity.
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-orange-600 font-semibold">We do:</strong> Instantly calculate optimized pricing plans.
                    </p>
                    <div className="step-progress-bar mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300 origin-left"
                        style={{ transform: activeStage === 1 ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 Card */}
              <div 
                id="step-card-2"
                onClick={() => setActiveStage(2)}
                className={`cursor-pointer p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white select-none ${
                  activeStage === 2
                    ? 'border-2 border-orange-500 shadow-md ring-2 ring-orange-500/10'
                    : 'border border-slate-200/90 hover:border-orange-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`step-num w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                    activeStage === 2 ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Get Matched</h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-emerald-700 font-semibold">You do:</strong> Securely approve spec constraints and quotes.
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-orange-600 font-semibold">We do:</strong> Launch direct syllabus matching expert matching.
                    </p>
                    <div className="step-progress-bar mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300 origin-left"
                        style={{ transform: activeStage === 2 ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* CENTER: 3D Terminal Model & Live State Machine (order-1 on mobile, order-2 on desktop) */}
            <div className="lg:col-span-4 flex items-center justify-center order-1 lg:order-2 my-1 sm:my-0">
              <div className="w-full max-w-xs sm:max-w-sm bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
                
                {/* Device Bezel Reflection Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>

                {/* Top Terminal Header (Chrome dots + Status tag) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <span className="text-orange-500 font-bold">&gt;_</span>
                    <span id="terminal-sync-status">SYSTEM_SYNC</span>
                  </div>
                </div>

                {/* Dynamic Screen Body: Step 1 (Configuration Wizard) */}
                {activeStage === 1 && (
                  <div id="screen-step-1" className="pt-3.5 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        Configuration Wizard
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-slate-700 mt-0.5">
                        Select target academic disciplines below:
                      </div>
                    </div>

                    {/* Interactive Chips */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        type="button"
                        onClick={() => calculateWizard('analysis', 120)}
                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-[11px] transition-all text-left cursor-pointer ${
                          wizardOption === 'analysis'
                            ? 'border-orange-500 bg-orange-50/60 font-bold text-gray-900 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white font-semibold text-gray-600'
                        }`}
                      >
                        <span>Analysis Task</span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          wizardOption === 'analysis'
                            ? 'bg-orange-500 text-white font-bold'
                            : 'border border-slate-300'
                        }`}>
                          {wizardOption === 'analysis' ? '✓' : ''}
                        </span>
                      </button>
                      
                      <button 
                        type="button"
                        onClick={() => calculateWizard('design', 95)}
                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-[11px] transition-all text-left cursor-pointer ${
                          wizardOption === 'design'
                            ? 'border-orange-500 bg-orange-50/60 font-bold text-gray-900 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white font-semibold text-gray-600'
                        }`}
                      >
                        <span>UI Design</span>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          wizardOption === 'design'
                            ? 'bg-orange-500 text-white font-bold'
                            : 'border border-slate-300'
                        }`}>
                          {wizardOption === 'design' ? '✓' : ''}
                        </span>
                      </button>
                    </div>

                    {/* Calculated Output Card */}
                    <div className="mt-3 bg-white border border-slate-900 rounded-xl p-3 flex items-end justify-between shadow-xs">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Estimated Query Price</span>
                        <span id="calculated-price" className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight font-sans">
                          ${wizardVal}.00
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Work Scale Limit</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-600">24-48 Hours</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Screen Body: Step 2 (Match Pipeline) */}
                {activeStage === 2 && (
                  <div id="screen-step-2" className="pt-3.5 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        Radar Match Pipeline
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-slate-700 mt-0.5">
                        Live tutor discovery &amp; syllabus calibration
                      </div>
                    </div>

                    {/* 3D Mini Radar Animation */}
                    <div className="relative bg-slate-900 text-white rounded-xl p-3 flex flex-col items-center justify-center overflow-hidden">
                      <div className="w-20 h-20 rounded-full border border-emerald-500/30 flex items-center justify-center relative animate-pulse">
                        <div className="w-12 h-12 rounded-full border border-emerald-400/50 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">● 14 COUNTRY EXPERTS READY</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 text-center">
                      <span className="text-[11px] font-bold text-orange-700">Auto-assigned top syllabus specialist ({matchingQuality}%)</span>
                    </div>
                  </div>
                )}

                {/* Screen Body: Step 3 (Real-time Collaboration) */}
                {activeStage === 3 && (
                  <div id="screen-step-3" className="pt-3.5 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        Live Collaboration Sync
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-slate-700 mt-0.5">
                        Encrypted chat &amp; draft annotations
                      </div>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="bg-slate-100 rounded-lg p-2 text-slate-700">
                        <span className="font-bold text-slate-900">Dr. Helen (Tutor):</span> First draft methodology section calibrated to Harvard format.
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-orange-900 text-right">
                        <span className="font-bold">Student:</span> Looks great! Checked references.
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Milestone: <strong>3 of 4 Complete</strong></span>
                      <span className="text-emerald-600 font-bold">Escrow Protected</span>
                    </div>
                  </div>
                )}

                {/* Screen Body: Step 4 (Approve & Download) */}
                {activeStage === 4 && (
                  <div id="screen-step-4" className="pt-3.5 space-y-3 animate-fade-in">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-600">
                        Verification &amp; Release
                      </div>
                      <div className="text-xs sm:text-[13px] font-medium text-slate-700 mt-0.5">
                        Zero-plagiarism score &amp; license grant
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                      <div className="text-xl">🏆</div>
                      <div className="text-xs font-bold text-emerald-900">{plagiarismPercent}% Originality Verified</div>
                      <div className="text-[10px] text-emerald-700">Full copyright rights released immediately</div>
                    </div>

                    <button 
                      type="button"
                      onClick={triggerConfettiExplosion}
                      className="w-full py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Verified Assets</span>
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT SIDE: Steps 3 & 4 (order-3 on mobile and desktop) */}
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 order-3">
              
              {/* Step 3 Card */}
              <div 
                id="step-card-3"
                onClick={() => setActiveStage(3)}
                className={`cursor-pointer p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white select-none ${
                  activeStage === 3
                    ? 'border-2 border-orange-500 shadow-md ring-2 ring-orange-500/10'
                    : 'border border-slate-200/90 hover:border-orange-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`step-num w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                    activeStage === 3 ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-gray-600'
                  }`}>
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Expert Collaboration</h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-emerald-700 font-semibold">You do:</strong> Discuss requirements in real-time &amp; evaluate mock draft templates.
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-orange-600 font-semibold">We do:</strong> Sync daily progress pipelines &amp; issue escrow release codes.
                    </p>
                    <div className="step-progress-bar mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300 origin-left"
                        style={{ transform: activeStage === 3 ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 Card */}
              <div 
                id="step-card-4"
                onClick={() => setActiveStage(4)}
                className={`cursor-pointer p-3.5 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 bg-white select-none ${
                  activeStage === 4
                    ? 'border-2 border-orange-500 shadow-md ring-2 ring-orange-500/10'
                    : 'border border-slate-200/90 hover:border-orange-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`step-num w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                    activeStage === 4 ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-100 text-gray-600'
                  }`}>
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Approve &amp; Download</h3>
                    <p className="mt-1 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-emerald-700 font-semibold">You do:</strong> Approve double-checked uniqueness metrics and download final assets.
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-gray-600 leading-snug">
                      <strong className="text-orange-600 font-semibold">We do:</strong> Formally yield total copyright access details instantly.
                    </p>
                    <div className="step-progress-bar mt-2.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300 origin-left"
                        style={{ transform: activeStage === 4 ? 'scaleX(1)' : 'scaleX(0)' }}
                      />
                    </div>
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
        <div className="text-center mt-8 sm:mt-12">
          <button 
            type="button"
            onClick={() => onNavigate('get-a-quote')}
            className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-[#F99B0C] hover:from-[#F99B0C] hover:to-orange-500 text-white font-bold tracking-wider text-xs sm:text-sm uppercase shadow-lg shadow-orange-500/15 hover:shadow-orange-500/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
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
        className={`fixed bottom-6 right-6 px-5 py-4 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur border border-slate-800 flex items-center gap-2.5 transition-all duration-300 ease-out z-50 ${
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
