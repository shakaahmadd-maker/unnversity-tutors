import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  FileText, 
  Calendar, 
  BookOpen, 
  DollarSign, 
  Upload, 
  X, 
  ArrowRight, 
  CheckCircle, 
  ArrowLeft, 
  User as UserIcon,
  HelpCircle,
  FileCode,
  Globe,
  Loader2
} from 'lucide-react';
import { store } from '../lib/store';
import { User, UserRole, AssignmentStatus, Assignment } from '../types';

interface GetQuotePageProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
  tutors: User[];
  onOpenChat: (tutorId: string) => void;
}

export default function GetQuotePage({ currentUser, onNavigate, tutors, onOpenChat }: GetQuotePageProps) {
  // Step State: 1 = Topic & Info, 2 = Details & Files, 3 = Tutor Pref & Confirmation
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Mathematics & Statistics');
  const [deadline, setDeadline] = useState('');
  const [wordCount, setWordCount] = useState<number>(1000);
  const [referenceStyle, setReferenceStyle] = useState('Harvard style citation');
  const [sourcesCount, setSourcesCount] = useState<number>(3);
  const [instructions, setInstructions] = useState('');
  const [preferredTutorId, setPreferredTutorId] = useState('any');
  
  // File attachments state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; progress: number }[]>([]);

  // On-the-fly registration form state for guest users
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestError, setGuestError] = useState('');

  const subjectsList = [
    'Mathematics & Statistics',
    'Computer Science & Programming',
    'Economics & Finance',
    'Business & Management',
    'Data Science & Analytics',
    'Physics & Quantum Mechanics',
    'Engineering & CAD',
    'Chemistry & Biochemistry',
    'English Lit & Essays',
    'History & Social Sciences',
    'Other / Custom Topic'
  ];

  const citationsList = [
    'Harvard style citation',
    'APA 7th Reference Style',
    'MLA 9th Edition Standard',
    'IEEE LaTeX Formatting',
    'Chicago Manual of Style',
    'Not applicable (STEM Code / Lab)'
  ];

  // Drag and drop handlers
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
      addMockFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addMockFiles(e.target.files);
    }
  };

  const addMockFiles = (filesList: FileList) => {
    const filesArray = Array.from(filesList);
    const updated = filesArray.map(f => {
      const sizeStr = (f.size / (1024 * 1024)).toFixed(2) + ' MB';
      return {
        name: f.name,
        size: sizeStr,
        progress: 0
      };
    });

    setUploadedFiles(prev => [...prev, ...updated]);

    // Animate progress simulation
    updated.forEach((file, index) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 25) + 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }
        setUploadedFiles(prev => prev.map(item => {
          if (item.name === file.name) {
            return { ...item, progress: currentProgress };
          }
          return item;
        }));
      }, 150);
    });
  };

  const removeFile = (name: string) => {
    setUploadedFiles(prev => prev.filter(f => f.name !== name));
  };

  // Submit quote handler
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');

    // Require authentication or generate on-the-fly account
    let userToUse = currentUser;

    if (!userToUse) {
      if (!guestName.trim() || !guestEmail.trim()) {
        setGuestError('Please fill out your identity details to proceed.');
        return;
      }
      
      // On the fly registration logic
      const success = store.register(guestName, guestEmail, UserRole.STUDENT, { verified: true });
      if (!success) {
        setGuestError('Could not create account. Academic email is already registered. Please sign in first.');
        return;
      }
      store.login(guestEmail);
      userToUse = store.currentUser;
    }

    if (!userToUse) {
      setGuestError('Login validation error. Please try again.');
      return;
    }

    if (!title.trim()) {
      setGuestError('Please declare your assignment topic or task title.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create and save to store State
      const tutorToSet = preferredTutorId === 'any' ? (tutors[0]?.id || 'tutor_clara') : preferredTutorId;
      const fileNames = uploadedFiles.map(f => f.name);
      
      const newAssignId = await store.submitAssignment({
        studentId: userToUse.id,
        tutorId: tutorToSet,
        title: title,
        subject: subject,
        deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days default
        wordCount: wordCount,
        referenceStyle: referenceStyle,
        sourcesCount: sourcesCount,
        instructions: instructions || 'Please check attachment parameters.',
        fileUrls: uploadedFiles.map(() => 'https://example.com/mock-upload-document.pdf'),
        fileNames: fileNames,
        quoteAmount: wordCount > 0 ? Math.round(wordCount * 0.08) + 25 : 85
      });

      // Show success celebration
      setSuccessId(newAssignId);
    } catch (err: any) {
      console.error(err);
      setGuestError('An error occurred during escrow registration. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormStep1Valid = title.trim().length > 0 && subject.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-[#0B1528] py-16 px-4 sm:px-6 lg:px-8 font-sans" id="dedicated-get-quote-page">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back and small badge */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Homepage</span>
          </button>
          
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strict Honor Code &amp; Academic Integrity Protected</span>
          </div>
        </div>

        {/* Big Heading Hero */}
        <div className="text-center md:text-left mb-10 space-y-4">
          <h1 className="text-4xl md:text-5.5xl font-black italic uppercase tracking-tight text-[#0B1528] leading-none font-heading">
            Request an <span className="text-[#F99B0C]">Escrow quotation</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 max-w-2xl font-semibold leading-relaxed">
            Fill out your academic project specifications. Our system automatically distributes them to dual-vetted native syllabus experts in your region. You will receive competitive bids directly on your student portal within 15 minutes.
          </p>
        </div>

        {/* Progress Timeline steps */}
        <div className="bg-white border border-gray-150 rounded-3xl p-4 md:p-6 mb-8 shadow-xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs tracking-wider uppercase font-bold relative">
            <div className={`py-1.5 rounded-xl transition-all ${step === 1 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500'}`}>
              <span className="font-mono text-sm mr-1">01.</span> Specs
            </div>
            <div className={`py-1.5 rounded-xl transition-all ${step === 2 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500'}`}>
              <span className="font-mono text-sm mr-1">02.</span> Criteria &amp; Files
            </div>
            <div className={`py-1.5 rounded-xl transition-all ${step === 3 ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500'}`}>
              <span className="font-mono text-sm mr-1">03.</span> Tutor bid
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {successId ? (
            /* Celebration step succeeds */
            <motion.div 
              key="success-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border-2 border-emerald-500 rounded-3xl p-8 text-center space-y-6 shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-pulse">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold font-heading uppercase text-emerald-900 leading-tight">Quotation Registered successfully!</h3>
                <p className="text-[#475569] text-xs md:text-sm max-w-lg mx-auto font-medium leading-relaxed">
                  Excellent! Your project has been registered as pending assignment <strong className="text-gray-950">#{successId}</strong>. We have automatically notified 5 vetted native subject specialists aligned with your curriculum.
                </p>
              </div>

              {/* Highlighting registered account details */}
              <div className="bg-[#fffbf7] border border-orange-100 p-5 rounded-2xl text-left max-w-md mx-auto space-y-3">
                <span className="text-xs font-bold text-orange-950 block uppercase tracking-wide">💡 Your Student Account is Ready</span>
                <p className="text-[11px] text-orange-850 leading-relaxed font-semibold">
                  You have been logged into your real-time academic sandbox environment. Visit your dashboard to manage, chat with advisors, and authorized secure payment releases instantly.
                </p>
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 font-bold border-t border-orange-150 pt-2">
                  <span>User Role: Student</span>
                  <span>Direct Match Sync: Active</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-bold">
                <button
                  onClick={() => {
                    const finalTutorId = preferredTutorId === 'any' ? (tutors[0]?.id || 'tutor_clara') : preferredTutorId;
                    onOpenChat(finalTutorId);
                    onNavigate('dashboard');
                  }}
                  className="w-full sm:w-auto bg-gray-950 hover:bg-black text-white px-6 py-3 rounded-xl shadow-lg transition-all text-xs tracking-wider uppercase cursor-pointer"
                >
                  Enter Student Dashboard &amp; Start Chat
                </button>
                <button 
                  onClick={() => {
                    setStep(1);
                    setSuccessId(null);
                    setTitle('');
                    setInstructions('');
                    setUploadedFiles([]);
                  }}
                  className="w-full sm:w-auto text-[#0B1528] hover:text-orange-500 hover:underline px-4 py-2 transition-colors text-xs"
                >
                  Submit Another Quote
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-navigation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form onSubmit={handleSubmitQuote} className="bg-white border border-gray-150 rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
                
                {/* Form error block if guest validations fail */}
                {guestError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-semibold leading-relaxed">
                    🚨 {guestError}
                  </div>
                )}

                {/* STEP 1: Core parameters */}
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="border-b border-gray-100 pb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#F99B0C]">Step 01</span>
                      <h2 className="text-xl font-bold tracking-tight text-[#0B1528] mt-1">Specify Academic Parameters</h2>
                    </div>

                    <div className="space-y-4">
                      {/* Topic Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="topic-title">Assignment Title / Topic Name *</label>
                        <input 
                          id="topic-title"
                          type="text" 
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Multivariable Derivatives Problem Set 3"
                          className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Course Category */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="course-subject">Academic Category / Discipline *</label>
                          <select 
                            id="course-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          >
                            {subjectsList.map((s, idx) => (
                              <option key={idx} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* Deadline Date */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="dead-line-picker">Target Deadline *</label>
                          <input 
                            id="dead-line-picker"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Word Count (Estimated) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="word-count-num">Estimated Length / Words *</label>
                          <div className="relative">
                            <input 
                              id="word-count-num"
                              type="number"
                              min="0"
                              value={wordCount}
                              onChange={(e) => setWordCount(parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 pl-10"
                            />
                            <BookOpen className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-semibold block uppercase">For STEM assignments, you can leave it at 0</span>
                        </div>

                        {/* Citation Style */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="citation-style-pick">Citation &amp; Style Guidelines</label>
                          <select 
                            id="citation-style-pick"
                            value={referenceStyle}
                            onChange={(e) => setReferenceStyle(e.target.value)}
                            className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none"
                          >
                            {citationsList.map((c, idx) => (
                              <option key={idx} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Source Count */}
                      <div className="space-y-1.5 max-w-xs">
                        <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="src-count">Required Reference Sources Count</label>
                        <input 
                          id="src-count"
                          type="number"
                          min="0"
                          max="20"
                          value={sourcesCount}
                          onChange={(e) => setSourcesCount(parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        disabled={!isFormStep1Valid}
                        onClick={() => setStep(2)}
                        className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center gap-2 ${
                          isFormStep1Valid 
                            ? 'bg-orange-500 hover:bg-orange-650 text-white shadow-lg shadow-orange-500/15 hover:-translate-y-0.5' 
                            : 'bg-gray-100 text-gray-450 cursor-not-allowed'
                        }`}
                      >
                        <span>Configure Criteria &amp; Files</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Detail specifications & file uploads */}
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F99B0C]">Step 02</span>
                        <h2 className="text-xl font-bold tracking-tight text-[#0B1528] mt-1">Provide Criteria &amp; Supporting Files</h2>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* Detailed Instructions */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="detail-notes">Instructions &amp; Special notes</label>
                        <textarea
                          id="detail-notes"
                          rows={4}
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          placeholder="Introduce key academic objectives, grading rubrics, or details of reference materials you need our tutor to address."
                          className="w-full bg-white border border-[#E2E8F0] p-4 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* File Drag and Drop zone */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase">Attach Project Assets &amp; Guidelines</label>
                        
                        <div 
                          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                            isDragging 
                              ? 'border-orange-500 bg-orange-50/20' 
                              : 'border-gray-250 hover:border-orange-400 bg-gray-50/50'
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('file-upload-input')?.click()}
                        >
                          <input 
                            type="file" 
                            id="file-upload-input" 
                            multiple 
                            onChange={handleFileChange}
                            className="hidden" 
                          />
                          <Upload className="w-8 h-8 text-orange-500/80 mx-auto mb-2" />
                          <p className="text-xs text-gray-700 font-bold">Drag and drop file specifications here, or <span className="text-orange-500 hover:underline">browse locally</span></p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Supports PDFs, DOCX, ZIPs, TXT, Excel and images (Max 25MB total)</p>
                        </div>

                        {/* List of uploaded files with simulation progress bars */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-xl border border-gray-150 flex items-center justify-between text-xs font-medium animate-fade-in shadow-xs">
                                <div className="flex items-center gap-2.5 max-w-[70%]">
                                  <FileCode className="w-5 h-5 text-orange-500 shrink-0" />
                                  <div className="truncate">
                                    <p className="font-bold text-[#0B1528] truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{file.size}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  {file.progress < 100 ? (
                                    <div className="flex items-center gap-2 text-orange-600 font-mono text-[10px] font-bold">
                                      <span>Uploading {file.progress}%</span>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    </div>
                                  ) : (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-150 font-bold uppercase">Ready</span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFile(file.name);
                                    }}
                                    className="p-1 rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-[#0B1528]"
                      >
                        Prev Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-xl shadow-lg shadow-orange-500/15 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Choose Preferred Tutor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Account Verification / Tutor Preference */}
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F99B0C]">Step 03</span>
                        <h2 className="text-xl font-bold tracking-tight text-[#0B1528] mt-1">Configure Matching &amp; Match parameters</h2>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* Preferred Tutor Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase" htmlFor="tutor-picker">Preferred Tutor Specialist</label>
                        <select 
                          id="tutor-picker"
                          value={preferredTutorId}
                          onChange={(e) => setPreferredTutorId(e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] p-3.5 rounded-xl text-xs font-bold focus:outline-none"
                        >
                          <option value="any">🌟 System General bid (Fastest matching - recommended)</option>
                          {tutors.map((t) => (
                            <option key={t.id} value={t.id}>
                              🎓 {t.name} (Review rating {t.rating || 4.9}★ • {t.subjects ? t.subjects[0] : 'Syllabus Expert'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Guest Sign-up / ID sync block */}
                      {!currentUser ? (
                        <div className="bg-[#fffcf8] border border-orange-150 p-5 rounded-2xl space-y-4">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-orange-950 uppercase tracking-wider block">🎓 Student Verification Required</span>
                            <p className="text-[11px] text-orange-850 font-semibold leading-relaxed">
                              You are currently submitting request as a Guest student. Enter your name and academic email address. The system will create your user file safely. No password required for initial quotation access!
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-650 uppercase" htmlFor="guest-name">Full name *</label>
                              <input 
                                id="guest-name"
                                type="text"
                                required
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="e.g., Alex Reed"
                                className="w-full bg-white border border-[#E2E8F0] p-3 rounded-xl text-xs font-semibold focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-650 uppercase" htmlFor="guest-mail">Academic Email *</label>
                              <input 
                                id="guest-mail"
                                type="email"
                                required
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="e.g., alex.reed@university.edu"
                                className="w-full bg-white border border-[#E2E8F0] p-3 rounded-xl text-xs font-semibold focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50/50 border border-emerald-150 p-4 rounded-xl flex items-center gap-3.5 text-xs font-semibold">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <UserIcon className="w-5 h-5 text-emerald-650" />
                          </div>
                          <div>
                            <p className="text-emerald-900 font-bold">Logged In as {currentUser.name}</p>
                            <p className="text-[10px] text-emerald-700 uppercase font-mono font-bold leading-none mt-1">Student ID Checklist: sync enabled</p>
                          </div>
                        </div>
                      )}

                      {/* Escrow tuition details */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex gap-3 text-xs leading-relaxed font-semibold">
                        <Globe className="w-5 h-5 text-[#F99B0C] shrink-0" />
                        <div>
                          <p className="text-gray-900 font-bold">Secure Local Pricing Engine Protected</p>
                          <p className="text-[10px] text-gray-500 font-bold mt-1">Your quotation estimate will calculate according to local UK/US coursework credit levels. No payments or advance deposits are charged until you explicitly hire an expert from your chat room.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-[#0B1528]"
                      >
                        Prev Step
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-orange-500 hover:bg-orange-650 text-white font-bold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <span>Registering Escrow Quote...</span>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          </>
                        ) : (
                          <>
                            <span>Secure &amp; Register Quote</span>
                            <CheckCircle className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
