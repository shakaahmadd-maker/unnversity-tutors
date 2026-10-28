import React, { useState, useRef } from 'react';
import { User } from '../types';

interface GetQuotePageProps {
  currentUser?: User | null;
  onNavigate?: (view: string) => void;
  tutors?: User[];
  onOpenChat?: (tutorId: string) => void;
}

// Light-weight custom vector SVG assets for visuals
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-orange-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 hover:text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-200 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function GetQuotePage({ currentUser, onNavigate, tutors, onOpenChat }: GetQuotePageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core Form State
  const [selectedService, setSelectedService] = useState('Online tutoring');
  const [subject, setSubject] = useState('');
  const [studyLevel, setStudyLevel] = useState('Undergraduate / College');
  
  // Timeline State
  const [timelineType, setTimelineType] = useState('Flexible'); // Urgent, Standard, Flexible
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  
  // Uploaded Documents Simulated List
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; progress: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Additional instructions/syllabus details
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Core 4 Services Options
  const servicesList = [
    {
      id: 'Online tutoring',
      title: 'Online Tutoring',
      description: 'Live interactive workspace focusing on deep concepts & syllabus comprehension.',
      badge: 'Interactive Classes'
    },
    {
      id: 'Online assignment tutoring',
      title: 'Online Assignment Tutoring',
      description: 'Collaborative analysis of complex problems, codes, laboratory reports, & homework.',
      badge: 'Assignment Assistance'
    },
    {
      id: 'Online courses work tutoring',
      title: 'Online Course Work Tutoring',
      description: 'Steady structural guidance tracking syllabus progression & course metrics.',
      badge: 'Full Term Support'
    },
    {
      id: 'Online writing services',
      title: 'Online Writing Services',
      description: 'Formatting mechanics, citation auditing, thesis planning, and developmental writing edits.',
      badge: 'Premium Writing Assist'
    }
  ];

  // Specific Study Levels
  const studyLevels = [
    { level: 'High School', tag: 'Foundational', details: 'AP classes, IB diploma, college prep, & standard curricula.' },
    { level: 'Undergraduate / College', tag: 'Highly Popular', details: 'Lower & upper division courses, major electives, & practical projects.' },
    { level: 'Graduate / Master\'s', tag: 'Advanced Specialized', details: 'Statistical models, graduate level research, thesis editing.' },
    { level: 'PhD / Doctoral Level', tag: 'Expert Rigor', details: 'Defense planning, research methodologies, academic publications.' }
  ];

  // Quick subject selections
  const quickSubjects = [
    'Calculus & Analysis',
    'Organic Chemistry',
    'Applied Statistics',
    'Computer Science (Algorithmic Logic)',
    'Financial Accounting',
    'Analytical Essay Writing'
  ];

  // Validate current step prior to transition
  const validateCurrentStep = () => {
    const stepErrors: Record<string, string | null> = {};
    if (currentStep === 1) {
      if (!selectedService) {
        stepErrors.selectedService = 'Please select a core service to proceed.';
      }
      if (!subject.trim()) {
        stepErrors.subject = 'Please specify the target course or subject topic.';
      }
    } else if (currentStep === 2) {
      if (!studyLevel) {
        stepErrors.studyLevel = 'Please choose your current academic study level.';
      }
    } else if (currentStep === 3) {
      if (timelineType === 'Urgent' && (!deadlineDate || !deadlineTime)) {
        stepErrors.timeline = 'Please select a deadline date and time for urgent assistance.';
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).filter(k => stepErrors[k] !== null).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Drag & drop handlers for document upload page
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addSimulatedFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addSimulatedFiles(e.target.files);
    }
  };

  const addSimulatedFiles = (filesList: FileList) => {
    const newFiles = Array.from(filesList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      progress: 100
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const deleteUploadedFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-orange-600 selection:text-white" id="service-selector-wizard">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[640px]">
        
        {/* Visual Accent Side Panel (Orange Gradient Branding) */}
        <div className="md:w-1/3 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Subtle design elements */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-orange-700/20 rounded-full blur-xl transform -translate-x-6 translate-y-6"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/20">
              <span className="w-2 h-2 rounded-full bg-orange-200 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-50">Dashboard Matchmaker</span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200 block mb-1">Authenticated Account Active</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">
                university<br />
                <span className="text-orange-950 font-black">.tutor</span>
              </h1>
            </div>
          </div>

          {/* Stepper Progression Visualizer */}
          <div className="relative z-10 py-8 space-y-4">
            <span className="text-[10px] uppercase font-black tracking-widest text-orange-950">Matching Journey</span>
            <div className="space-y-3">
              {[
                { s: 1, label: 'Service Selection' },
                { s: 2, label: 'Study Level' },
                { s: 3, label: 'Deadline & Timeline' },
                { s: 4, label: 'Syllabus & Documents' },
                { s: 5, label: 'Connect Instant Chat' }
              ].map((stepItem) => (
                <div key={stepItem.s} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                    currentStep === stepItem.s 
                      ? 'bg-orange-950 text-white ring-4 ring-orange-950/20 scale-110' 
                      : currentStep > stepItem.s 
                      ? 'bg-white text-orange-600 font-bold' 
                      : 'bg-orange-400/30 text-orange-200'
                  }`}>
                    {currentStep > stepItem.s ? '✓' : stepItem.s}
                  </div>
                  <span className={`text-xs font-bold transition-all ${
                    currentStep === stepItem.s ? 'text-white font-black' : 'text-orange-100/80'
                  }`}>
                    {stepItem.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Helper Footnote on panel */}
          <div className="relative z-10 pt-4 border-t border-white/20 text-xs text-orange-50/80 leading-snug">
            Your dashboard session automatically updates the administrative matching team with these choices.
          </div>
        </div>

        {/* Right Dynamic Form Section */}
        <div className="flex-1 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-white relative">
          
          {isSubmitted ? (
            /* CONVERSION SUCCESS SCREEN & GOOGLE CHAT LAUNCHER */
            <div className="my-auto text-center space-y-6 py-8 animate-fade-in">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto border border-orange-200 shadow-sm">
                <span className="text-4xl text-orange-600 font-black">✓</span>
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-orange-600 bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">Session Initialized</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3">Ready to Connect!</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your project requirements for <strong className="text-slate-900">{selectedService} ({subject})</strong> have been successfully synced. We have initialized your tutor matching session.
                </p>
              </div>

              {/* Action Box to Redirect to Dashboard */}
              <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-2xl max-w-md mx-auto space-y-4 shadow-xs">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-orange-600 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Standby Tutor Matching Engaged
                </div>
                
                <button 
                  onClick={() => onNavigate && onNavigate('dashboard')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-base py-4 px-6 rounded-xl shadow-lg shadow-orange-600/25 transition-all transform active:scale-95 duration-200 flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ChatBubbleIcon />
                  Go to Dashboard Chat
                </button>
                
                <p className="text-[11px] text-slate-400 leading-normal">
                  Use the button above to go straight to your personal student dashboard where you can chat in real-time with our administrative team and your assigned expert tutor.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(1);
                    setUploadedFiles([]);
                    setSubject('');
                    setNotes('');
                  }}
                  className="text-xs font-extrabold text-slate-400 hover:text-orange-600 transition underline decoration-dotted"
                >
                  Adjust specifications & open another query
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between space-y-8">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <button 
                  onClick={() => onNavigate?.('home')}
                  className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-450 hover:text-orange-600 transition cursor-pointer"
                >
                  ← Back to Home
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Match Wizard v2.4</span>
              </div>

              {/* SCREEN 1: Core Service Selection */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">
                      Select Target Service
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold text-left">Select from our verified academic tutoring segments.</p>
                  </div>

                  {/* 4 Core Services Config Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {servicesList.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`cursor-pointer p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between ${
                          selectedService === service.id
                            ? 'border-orange-600 bg-orange-50/40 ring-4 ring-orange-100'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-md mb-2 inline-block">
                            {service.badge}
                          </span>
                          <h3 className="font-extrabold text-sm md:text-base text-slate-900 block leading-tight mt-1">{service.title}</h3>
                          <p className="text-slate-500 text-[11px] leading-relaxed mt-1">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subject selector and search help */}
                  <div className="space-y-2.5 pt-2 text-left">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                      Target Course Title or Topic *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inorganic Chemistry II, AP Calculus AB, Microeconomics..."
                      value={subject}
                      onChange={(e) => {
                        setSubject(e.target.value);
                        if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
                      }}
                      className={`w-full border-2 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 font-bold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-sm ${
                        errors.subject ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.subject && <p className="text-red-500 text-xs font-bold">{errors.subject}</p>}

                    {/* Fast Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {quickSubjects.map((qs) => (
                        <button
                          key={qs}
                          type="button"
                          onClick={() => {
                            setSubject(qs);
                            if (errors.subject) setErrors((prev) => ({ ...prev, subject: null }));
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-650 hover:bg-orange-50 hover:text-orange-600 transition duration-150 cursor-pointer"
                        >
                          + {qs}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 2: Academic Study Level Selection */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">
                      What is your Study Level?
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold">Tutor pairings and resource libraries scale to match this depth.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {studyLevels.map((lvl) => (
                      <div
                        key={lvl.level}
                        onClick={() => setStudyLevel(lvl.level)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-4 ${
                          studyLevel === lvl.level
                            ? 'border-orange-600 bg-orange-50/40 ring-4 ring-orange-100'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{lvl.level}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                              {lvl.tag}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1 leading-normal">{lvl.details}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          studyLevel === lvl.level ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'
                        }`}>
                          {studyLevel === lvl.level && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SCREEN 3: Deadline & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">
                      Deadline &amp; Timeline
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold text-left">Specify when you need your mentorship assistance.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'Urgent', desc: 'Next 24-48 Hours', badge: 'Fast Track' },
                      { type: 'Standard', desc: '3 to 5 Days', badge: 'Normal Pace' },
                      { type: 'Flexible', desc: 'Over a Week', badge: 'Best Price' }
                    ].map((t) => (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setTimelineType(t.type)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                          timelineType === t.type
                            ? 'border-orange-600 bg-orange-50/40 ring-4 ring-orange-100'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md mb-2 inline-block">
                            {t.badge}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 leading-tight block">{t.type}</h3>
                          <p className="text-slate-500 text-[10px] mt-1 leading-normal">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {timelineType === 'Urgent' && (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-gray-750 uppercase">Deadline Date *</label>
                        <input
                          type="date"
                          value={deadlineDate}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-gray-750 uppercase">Deadline Time *</label>
                        <input
                          type="time"
                          value={deadlineTime}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                    </div>
                  )}
                  {errors.timeline && <p className="text-red-500 text-xs font-bold text-left">{errors.timeline}</p>}
                </div>
              )}

              {/* SCREEN 4: Syllabus & Documents */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">
                      Syllabus &amp; Supporting Documents
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold text-left">Attach any supporting syllabus files, instructions or guidelines.</p>
                  </div>

                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-orange-500 bg-orange-50/20' 
                        : 'border-slate-250 hover:border-orange-400 bg-slate-50/50'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      multiple 
                      accept=".pdf,.doc,.docx,.zip,.rar,.ppt,.pptx,image/*,audio/*,video/*,application/*"
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                    <div className="flex justify-center mb-2">
                      <UploadCloudIcon />
                    </div>
                    <p className="text-xs text-slate-700 font-bold">Drag and drop file specifications here, or <span className="text-orange-600 hover:underline">browse locally</span></p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Supports PDFs, DOCS, ZIPs, PPT, Images, and other media (Max 25MB total)</p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 text-left">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Uploaded Documents ({uploadedFiles.length})</h4>
                      <div className="max-h-36 overflow-y-auto space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-medium animate-fade-in">
                            <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                              <span className="text-lg">📄</span>
                              <div className="truncate text-left">
                                <p className="font-bold text-slate-900 truncate">{file.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{file.size}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteUploadedFile(file.id);
                              }}
                              className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-bold text-slate-750 uppercase">Additional Instructions &amp; Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Introduce key academic objectives, specific coursework guidelines, or notes you want our tutors to focus on."
                      className="w-full bg-white border-2 border-slate-200 rounded-xl p-3.5 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}

              {/* SCREEN 5: Connect Instant Chat */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="space-y-1 text-left">
                    <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight leading-none">
                      Connect to Instant Chat
                    </h2>
                    <p className="text-slate-400 text-xs font-semibold text-left">Final step: connect with our academic matched mentor team.</p>
                  </div>

                  <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900">Summary of Specifications:</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Selected Service:</span>
                        <p className="font-bold text-slate-850">{selectedService}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Target Subject:</span>
                        <p className="font-bold text-slate-850">{subject}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Study Level:</span>
                        <p className="font-bold text-slate-850">{studyLevel}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Timeline / Urgency:</span>
                        <p className="font-bold text-slate-850">
                          {timelineType} {timelineType === 'Urgent' ? `(By ${deadlineDate} ${deadlineTime})` : ''}
                        </p>
                      </div>
                    </div>
                    {notes && (
                      <div className="border-t border-orange-100 pt-3">
                        <span className="text-[10px] font-black uppercase text-slate-400">Special Notes:</span>
                        <p className="text-slate-700 text-xs italic mt-1 font-medium leading-relaxed">"{notes}"</p>
                      </div>
                    )}
                    {uploadedFiles.length > 0 && (
                      <div className="border-t border-orange-100 pt-3">
                        <span className="text-[10px] font-black uppercase text-slate-400">Documents Attached:</span>
                        <p className="text-slate-850 font-bold mt-1 text-xs">✓ {uploadedFiles.length} file(s) uploaded</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3 text-xs leading-relaxed font-semibold">
                    <span className="text-base text-orange-500 shrink-0">ℹ️</span>
                    <div>
                      <p className="text-slate-900 font-bold">Quotation Matching Notice</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">
                        By submitting, your details are sent to our active matching team. You can launch your dashboard chat instantly to connect with an administrator or your matched tutor.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Form Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100 shrink-0">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-orange-600 transition cursor-pointer"
                  >
                    <ChevronLeft />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/15 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                  >
                    Continue
                    <ChevronRight />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-orange-600/25 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
                  >
                    Confirm &amp; Start Chat
                    <SparklesIcon />
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
