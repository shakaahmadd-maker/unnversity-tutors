import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  FileText, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Check, 
  CheckCircle, 
  Clock, 
  Star, 
  ChevronDown, 
  HelpCircle, 
  Award,
  Download,
  Shield,
  ThumbsUp,
  UserCheck,
  TrendingUp,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { User } from '../types';
import hero1on1Img from '../assets/images/hero_1on1_tutoring_1787387369345.jpg';
import heroAssignmentImg from '../assets/images/hero_assignment_guidance_1787387387028.jpg';
import heroCourseworkImg from '../assets/images/hero_coursework_tracks_1787387403661.jpg';
import heroEssayImg from '../assets/images/hero_essay_rhetoric_1787387419893.jpg';

interface DedicatedServicePagesProps {
  selectedServiceId: string;
  tutors: User[];
  onTutorSelect: (tutor: User) => void;
  onNavigate: (view: string) => void;
  onBackToHub: () => void;
}

export default function DedicatedServicePages({
  selectedServiceId,
  tutors,
  onTutorSelect,
  onNavigate,
  onBackToHub
}: DedicatedServicePagesProps) {
  
  // Collapse state for general FAQs
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);

  // States for 1-on-1 Math & Science live calculator
  const [calcLevel, setCalcLevel] = useState<string>('undergraduate');
  const [calcSubject, setCalcSubject] = useState<string>('stem');
  const [calcHours, setCalcHours] = useState<number>(4);
  const [calcSlotSelected, setCalcSlotSelected] = useState<string>('Today 5:00 PM');

  // States for Assignment Diagnostic Tool
  const [checkText, setCheckText] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [diagnosticReport, setDiagnosticReport] = useState<{ score: number; feedback: string[] } | null>(null);

  // States for Semester Coursework Tracks Roadmap
  const [courseCodeName, setCourseCodeName] = useState<string>('MATH-202');
  const [courseGradeGoal, setCourseGradeGoal] = useState<string>('A');
  const [courseCompletedMilestones, setCourseCompletedMilestones] = useState<Record<number, boolean>>({ 0: true });

  // States for Rhetoric Thesis assertions tool
  const [essayTopic, setEssayTopic] = useState<string>('');
  const [essayTone, setEssayTone] = useState<string>('persuasive');
  const [optimizedThesis, setOptimizedThesis] = useState<{ before: string; after: string; comment: string } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // --- REGISTRATION / TRIAL WIZARD STATES ---
  const [regStep, setRegStep] = useState<number>(1);
  const [regSubject, setRegSubject] = useState<string>('');
  const [regGrade, setRegGrade] = useState<string>('');
  const [regGoals, setRegGoals] = useState<string[]>([]);
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regTimeSlot, setRegTimeSlot] = useState<string>('');
  const [regMatchedTutor, setRegMatchedTutor] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<boolean>(false);
  const [regLoading, setRegLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live subject explorer tabs state (1-on-1 page)
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('math');

  // Initialize form default state based on service selected
  useEffect(() => {
    if (selectedServiceId === '1on1') {
      setRegSubject('Mathematics');
    } else if (selectedServiceId === 'assignment') {
      setRegSubject('Sciences');
    } else if (selectedServiceId === 'coursework') {
      setRegSubject('Mathematics');
    } else if (selectedServiceId === 'essay') {
      setRegSubject('Languages & SATs');
    }
    // Reset steps
    setRegStep(1);
    setRegSuccess(false);
  }, [selectedServiceId]);

  // Dynamic status ticker rotations
  const tickerPhrases = [
    "Expert academic coaching consultants online",
    "Next matching slot begins tomorrow",
    "Dr. Evelyn has 2 custom slots left",
    "15 students initiated discovery matching this morning",
    "Custom chemistry and SAT prep experts active"
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerPhrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Show customized alert-free Toast notification
  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cost calculator based on parameters
  const calculateCost = () => {
    let base = 35;
    if (calcLevel === 'graduate') base = 55;
    if (calcLevel === 'highschool') base = 25;
    if (calcSubject === 'cs' || calcSubject === 'business') base += 5;
    return base * calcHours;
  };

  // Run automated outline check simulation
  const handleRunDiagnostic = () => {
    if (!checkText.trim()) {
      displayToast("Please provide or load a draft outline to analyze!");
      return;
    }
    setIsChecking(true);
    setDiagnosticReport(null);
    setTimeout(() => {
      setIsChecking(false);
      const wordCount = checkText.trim().split(/\s+/).length;
      let score = 84;
      let feedback = [
        "Structure looks strong. Chronological topic transitions conform to elite peer review outlines.",
        "Emphasize the statistical derivations context early in paragraph transitions.",
        "Update Harvard bibliography entries to match double trailing colons."
      ];
      if (wordCount < 10) {
        score = 50;
        feedback = [
          "Input length is too limited for a comprehensive formatting assessment.",
          "Please type a full introduction paragraphs or outline steps below to receive structural tips."
        ];
      } else if (checkText.toLowerCase().includes("therefore") || checkText.toLowerCase().includes("consequently")) {
        score = 95;
        feedback = [
          "Superb empirical flow! Connective academic keywords ('therefore', 'consequently') are optimally mapped.",
          "Hypothesis statement is authoritative and clearly positioned.",
          "Double check paragraph margins before exporting."
        ];
      }
      setDiagnosticReport({ score, feedback });
    }, 1100);
  };

  // Run prose assertion optimizer
  const handleOptimizeProse = () => {
    if (!essayTopic.trim()) {
      displayToast("Please provide some raw thesis ideas to optimize!");
      return;
    }
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      let before = essayTopic;
      let after = "";
      let comment = "";

      if (essayTone === 'persuasive') {
        after = `By synthesizing dynamic empirical analysis, this study posits that ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} serves as a primary paradigm shift in institutional performance.`;
        comment = "Replaced self-referential filters ('I think', 'My essay is about') with an authoritative, objective claim prefix and upgraded the academic vocabulary.";
      } else if (essayTone === 'analysis') {
        after = `A critical examination reveals that ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} is fundamentally predicated on localized structural shifts rather than isolated variables.`;
        comment = "Structured generic descriptive explanations into a formal analytical statement modeling peer critical review standards.";
      } else {
        after = `This scholarly inquiry explores how ${essayTopic.replace(/^(I think|My essay is about|We will analyze)/i, '').trim()} achieves significant rhetorical resonance within nineteenth-century historical frameworks.`;
        comment = "Refined descriptive, biographical elements into formal scholarly prose suitable for Statement of Purpose (SOP) entries.";
      }
      setOptimizedThesis({ before, after, comment });
    }, 900);
  };

  // Advancing steps inside Trial Booking card
  const handleGoToStep = (stepNum: number) => {
    if (stepNum === 2 && regStep === 1) {
      if (!regSubject) {
        displayToast("Please designate your current target subject field first.");
        return;
      }
      if (!regGrade) {
        displayToast("Please select your academic grade group.");
        return;
      }
    } else if (stepNum === 3 && regStep === 2) {
      if (!regName || !regEmail || !regPhone) {
        displayToast("Please input complete profile data before proceeding.");
        return;
      }
    }
    setRegStep(stepNum);
  };

  // Goal checkboxes selection helper
  const handleGoalToggle = (goalVal: string) => {
    if (regGoals.includes(goalVal)) {
      setRegGoals(regGoals.filter(v => v !== goalVal));
    } else {
      setRegGoals([...regGoals, goalVal]);
    }
  };

  // Handle Match booking submit
  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTimeSlot) {
      displayToast("Please select a preferred study time slot window.");
      return;
    }
    setRegLoading(true);
    setTimeout(() => {
      setRegLoading(false);
      setRegSuccess(true);
    }, 1400);
  };

  const handleResetRegForm = () => {
    setRegStep(1);
    setRegGoals([]);
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegTimeSlot('');
    setRegMatchedTutor('');
    setRegSuccess(false);
  };

  // Direct tutor select into matching card
  const handleSelectTutorInForm = (tutorName: string) => {
    setRegMatchedTutor(tutorName);
    displayToast(`Requested matching tutor: ${tutorName}`);
    
    // Auto advance step corresponding to current inputs
    if (!regSubject || !regGrade) {
      setRegStep(1);
    } else if (!regName || !regEmail || !regPhone) {
      setRegStep(2);
    } else {
      setRegStep(3);
    }

    // Scroll to the booking card smoothly
    const bookingEl = document.getElementById('dedicated-booking-card-container');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-10 pb-16 relative">
      
      {/* Toast Warning overlay */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-white border-2 border-orange-500 px-6 py-4 text-xs font-bold text-gray-950 shadow-xl flex items-center gap-2 animate-bounce">
          <HelpCircle className="w-4 h-4 text-orange-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col gap-4 border-b border-gray-150 pb-6 focus:outline-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBackToHub}
            className="group text-xs font-bold text-orange-600 hover:text-orange-850 flex items-center gap-1.5 cursor-pointer transition-all"
            id="back-to-services-hub-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to All Services Hub</span>
          </button>
          
          <span className="text-xs font-mono text-gray-400">
            Services &gt;&nbsp;
            <span className="text-orange-600 font-extrabold pb-0.5 border-b border-orange-200">
              {selectedServiceId === '1on1' && '1-on-1 Online Tutoring'}
              {selectedServiceId === 'assignment' && 'Assignment Guidance'}
              {selectedServiceId === 'coursework' && 'Semester Coursework Tracks'}
              {selectedServiceId === 'essay' && 'Essay Rhetoric & Citations'}
            </span>
          </span>
        </div>

        {/* Horizontal Quick Jump Selector bar */}
        <div className="flex flex-wrap gap-2 pt-2 bg-gray-50/70 p-2 rounded-2xl border border-gray-150">
          {[
            { id: '1on1', label: '1-on-1 Live Tutoring', icon: <Video className="w-3.5 h-3.5" /> },
            { id: 'assignment', label: 'Assignment Guidance', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'coursework', label: 'Coursework Track', icon: <Calendar className="w-3.5 h-3.5" /> },
            { id: 'essay', label: 'Essay & Reference Checks', icon: <BookOpen className="w-3.5 h-3.5" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate('services');
                const element = document.getElementById('services-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
                // Dispatch event to sync state in marketing pages parent
                const mockEvent = new CustomEvent('change-dedicated-service', { detail: item.id });
                window.dispatchEvent(mockEvent);
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                selectedServiceId === item.id 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10 border-orange-500' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-150'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* TWO-COLUMN WORKSPACE GRID (Left: service core details, Right: Sticky CTA Form) */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 items-start text-left">
        
        {/* LEFT COLUMN: MODULE-SPECIFIC CONTENT (8 Columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-16">
          
          {/* ==================== 1. 1-ON-1 ONLINE TUTORING CONTENT ==================== */}
          {selectedServiceId === '1on1' && (
            <div className="space-y-16 animate-fade-in">
              {/* Service Hero section */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-700">
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Private Online Instruction for Accelerated Academic Growth</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  Unlocking Potential with <br />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Elite 1-1 Virtual Coaching</span>
                </h1>
                
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold">
                  Empower your academic journey with bespoke lesson plans designed around your school syllabus. Our curriculum-aligned expert academic coaching bridges learning gaps, guarantees top performance, and boosts homework confidence.
                </p>

                {/* Hero Visual Banner with Relevant Image & Live Overlays */}
                <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl group">
                  <img 
                    src={hero1on1Img} 
                    alt="1-on-1 Live Online Academic Tutoring with Interactive Digital Whiteboard" 
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-transparent pointer-events-none"></div>

                  {/* Top Status Overlays */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-gray-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>HD Audio &amp; Interactive Whiteboard Active</span>
                    </div>
                    <div className="bg-orange-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-1 shadow-lg">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Avg. Match: &lt; 45s</span>
                    </div>
                  </div>

                  {/* Bottom Information Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left space-y-2 pointer-events-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 block">Personalized 1-on-1 Workspace</span>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">Curriculum-Aligned STEM &amp; Humanities Coaching</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/20">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>4.98/5 Rating (12k+ sessions)</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-200 line-clamp-2 max-w-xl">
                      Live video lectures, LaTeX math derivations, and real-time screen sharing recorded automatically for exam revisions.
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">100% Custom</p>
                    <p className="text-[10px] text-gray-500 font-bold">Curated Lesson Mapping</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-orange-600">Top 1%</p>
                    <p className="text-[10px] text-gray-500 font-bold">Vetted Ivy &amp; PhD Mentors</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">Unlimited</p>
                    <p className="text-[10px] text-gray-500 font-bold">Recorded Sessions Access</p>
                  </div>
                </div>
              </div>

              {/* Apex Framework Advantages list */}
              <section className="space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Bespoke Framework</span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 mt-1">Why Elite 1-1 Academic Coaching Outperforms Classrooms</h2>
                  <p className="text-xs text-gray-500 mt-2 font-medium">Static school rooms leave students behind. Our bespoke lesson plans adapt immediately to your student's workload, curriculum frameworks (AP, IB, GCSE, Standardized SATs), and specific learning speed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Personalized Homework Help", desc: "No generic task-matching. Our mentors integrate current school assignments directly, targeting difficult mechanics, math proofs, and language elements to convert stress into dynamic confidence.", icon: <Check className="w-4 h-4 text-orange-600" /> },
                    { title: "High School Test Prep Strategy", desc: "Excel in high-stakes testing. From AP exam revisions and GCSE physics to standardized college admissions (SAT/ACT) guides, we build structural, test-taking efficiency.", icon: <Sparkles className="w-4 h-4 text-orange-600" /> },
                    { title: "1-on-1 Interactive Workspaces", desc: "Our bespoke platform saves every stream. Students and parents access high-definition lesson recordings to revise critical formulations at double speed prior to school finals.", icon: <Clock className="w-4 h-4 text-orange-600" /> },
                    { title: "Adaptive Progress Monitoring", desc: "Track homework timelines, conceptual weak points, and session performance seamlessly. Receive post-session metric assessments within 24 hours after every study hour.", icon: <TrendingUp className="w-4 h-4 text-orange-600" /> }
                  ].map((feat, idx) => (
                    <div key={idx} className="bg-white border border-gray-150 p-4 rounded-2xl space-y-2 hover:shadow-md transition-all">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        {feat.icon}
                      </div>
                      <h4 className="font-extrabold text-xs text-gray-950">{feat.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Dynamic Cost & Slot Calculator */}
              <div className="bg-white border border-orange-150 p-6 rounded-3xl space-y-6 shadow-2xs">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Classroom Assistance Tool</span>
                  <h3 className="text-sm font-extrabold text-zinc-900 mt-1">Interactive Class Cost &amp; Slot Estimator</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1">Configure your academic parameters below to estimate escrow cost targets and book matching consultation slots.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-left">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 uppercase text-[9px] tracking-wide block">Select Academic Level</label>
                    <select
                      value={calcLevel}
                      onChange={(e) => setCalcLevel(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-orange-500 text-xs"
                    >
                      <option value="highschool">High School GCSE / IB Core</option>
                      <option value="undergraduate">Undergraduate (College Years 1-4)</option>
                      <option value="graduate">Graduate Thesis / Ph.D. Level</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-800 uppercase text-[9px] tracking-wide block">Course Division</label>
                    <select
                      value={calcSubject}
                      onChange={(e) => setCalcSubject(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2.5 font-bold focus:outline-none focus:border-orange-500 text-xs"
                    >
                      <option value="stem">STEM (Calculus, Organic Chem, Stats)</option>
                      <option value="cs">Computer Science & Python Matrices</option>
                      <option value="business">Econ, Finance & Accounting Derivatives</option>
                      <option value="humanities">Humanities, SOP Statements, Languages</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="font-bold text-gray-800 uppercase text-[9px] tracking-wide block">Weekly Hours Requested</label>
                      <span className="font-mono font-bold text-orange-600 uppercase text-[10px]">{calcHours} hours</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={calcHours}
                      onChange={(e) => setCalcHours(parseInt(e.target.value))}
                      className="w-full accent-orange-500 h-1.5 bg-gray-200 rounded-lg mt-2 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-left space-y-1">
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block leading-none">Dynamic Estimate Rate Bracket</span>
                    <div className="flex items-baseline gap-1 pt-1 font-sans">
                      <span className="text-2xl font-black text-gray-950">${calculateCost()}</span>
                      <span className="text-[10px] text-gray-500 font-bold">/ week (held in secure Escrow lock)</span>
                    </div>
                    <p className="text-[9.5px] text-gray-500 italic">
                      *Based on an average rate of ${calcLevel === 'graduate' ? 55 : calcLevel === 'highschool' ? 25 : 35}/hr escrow locked.
                    </p>
                  </div>

                  <div className="space-y-1 w-full md:w-auto">
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Choose Availability Window</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Today 5:00 PM', 'Tomorrow 10:00 AM', 'Wed 4:00 PM', 'Sat 11:30 AM'].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setCalcSlotSelected(slot)}
                          className={`px-2.5 py-1.5 border rounded-lg text-[9.5px] font-semibold transition-all ${
                            calcSlotSelected === slot 
                              ? 'bg-orange-500 text-white border-orange-500 font-bold' 
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Paths interactive panel */}
              <section className="space-y-4">
                <div>
                  <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Academic Pathways</span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900 mt-1">Our Comprehensive Tutoring Map</h2>
                  <p className="text-xs text-gray-500 mt-1">Select any program map below to customize your trial session application.</p>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-smooth">
                  {[
                    { id: 'math', label: 'Mathematics & Calculus', icon: '🧮' },
                    { id: 'science', label: 'Physics & Bio Sciences', icon: '🔬' },
                    { id: 'coding', label: 'Coding & Tech', icon: '💻' },
                    { id: 'languages', label: 'English & SAT Prep', icon: '✍️' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveSubjectTab(tab.id);
                        displayToast(`Switched pathways map to: ${tab.label}`);
                      }}
                      className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        activeSubjectTab === tab.id 
                          ? 'bg-orange-100 text-orange-800 border-orange-200' 
                          : 'bg-white text-gray-600 hover:bg-gray-55/40 border-gray-200'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sub panels */}
                <div className="bg-zinc-50 border border-gray-200 rounded-2xl p-5 md:p-6 space-y-4">
                  {activeSubjectTab === 'math' && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-zinc-900 text-sm">Expert Mathematics &amp; Calculus Guidance</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        Our math pathway simplifies abstract proofs into logical modules. We teach foundational algebra, geometry proof matrices, AP Calculus AB/BC prep, and advanced college-level data statistics.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-650 font-semibold">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> AP Calculus AB/BC Revision</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Algebra I &amp; II &amp; Geometry</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Statistics &amp; Probability Math</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> SAT Prep Quant Sections</span>
                      </div>
                    </div>
                  )}

                  {activeSubjectTab === 'science' && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-zinc-900 text-sm">Bio, Chemistry &amp; Physics Instruction</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        Overcome rigorous lab formulations and scientific theory. We use premium custom virtual simulations to teach AP Mechanics, Chemistry equilibrium balances, and core molecular microbiology.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-655 font-semibold">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> AP Physics (1, 2, Mechanics, EM)</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Advanced AP/IB Biochemistry</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Cellular Biology Systems</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> GCSE Combined Sciences Prep</span>
                      </div>
                    </div>
                  )}

                  {activeSubjectTab === 'coding' && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-zinc-900 text-sm">Coding, Algorithms &amp; Tech Prep</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        Learn computational logic from scratch. Our programmers specialize in assisting with AP Computer Science A/Principles, Python structure fundamentals, dynamic web architecture, and C++ workflows.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-655 font-semibold">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> AP Computer Science (Java Core)</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Python Foundations &amp; OOP</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Full-Stack HTML/CSS/JS</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> C++ Algorithms &amp; Data Structures</span>
                      </div>
                    </div>
                  )}

                  {activeSubjectTab === 'languages' && (
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-zinc-900 text-sm">Language Arts, Essays &amp; SAT Prep</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        Master premium critical reading strategies and essay blueprints. We assist with AP English Literature, SAT Verbal prep, ESL writing metrics, and college admissions essay proofing.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-655 font-semibold">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> AP English Lit &amp; Rhetoric</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> SAT &amp; ACT Verbal Core</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Essay Structure Mechanics</span>
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-orange-600" /> Spanish &amp; French Core Grammar</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Custom valuation details */}
              <section className="space-y-4">
                <div className="border-b border-gray-150 pb-2">
                  <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Bespoke Experience</span>
                  <h2 className="text-lg md:text-xl font-extrabold text-zinc-900 mt-1">Our Tailored Strategy &amp; Valuation Matrix</h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Every student's academic path is completely unique. To ensure unmatched value, we do not employ static, cookie-cutter pricing tiers. Rates are carefully formulated on a custom, case-by-case basis during your complimentary matching assessment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "01", title: "Academic Level & Scope", text: "Rates adapt based on study rigor—from middle school homework foundations to advanced AP calculus preparation and specialized university testing." },
                    { id: "02", title: "Frequency & Urgency", text: "Whether you require a comprehensive 6-month GPA enrichment campaign, twice-weekly test strategies, or intensive pre-final crash courses." },
                    { id: "03", title: "Perfect Mentor Pairing", text: "We coordinate alignment with verified subject-matter mentors, including certified career teachers, Ivy League grads, or doctoral academic advisors." }
                  ].map((elem, idx) => (
                    <div key={idx} className="bg-white border p-4 rounded-xl flex flex-col justify-between hover:border-orange-500/30 transition-all">
                      <div className="space-y-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600 font-extrabold text-xs">{elem.id}</span>
                        <h4 className="font-extrabold text-zinc-900 text-xs">{elem.title}</h4>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">{elem.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Specific pricing roadmap steps info */}
              <div className="rounded-2xl border border-dashed border-orange-500/30 bg-orange-50/20 p-5 space-y-4">
                <h4 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider">Your Free Matching &amp; Pricing Process</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                  <div className="space-y-1 text-left">
                    <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-extrabold text-[10px]">1</div>
                    <h5 className="font-bold text-zinc-900 text-[11px] pt-1">Submit Free Profile</h5>
                    <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">Fill out the trial booking form. Share goals, struggles, subject fields, and schedules.</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-extrabold text-[10px]">2</div>
                    <h5 className="font-bold text-zinc-900 text-[11px] pt-1">Complimentary Discovery</h5>
                    <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">Connect with our matches for a free 45-minute demo to analyze student concepts and gaps.</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white font-extrabold text-[10px]">3</div>
                    <h5 className="font-bold text-zinc-900 text-[11px] pt-1">Get Custom Quote</h5>
                    <p className="text-[10px] text-gray-550 leading-relaxed font-semibold">Receive a custom proposal. No fixed contracts, pay only for exactly what your student requires.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. ASSIGNMENT GUIDANCE CONTENT ==================== */}
          {selectedServiceId === 'assignment' && (
            <div className="space-y-16 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-700">
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Rubric Vetting &amp; Compliancy Outlines</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  Academic Reference Outlines &amp; <br />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Ethical Rubric Guidance</span>
                </h1>
                
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold">
                  Stuck on a rigorous chemistry lab report, financial modeling case study or complex assignment prompt sheets? Work 1-on-1 with accredited university advisors who review your rubric criteria and compile flawless reference layouts ethically.
                </p>

                {/* Hero Visual Banner with Relevant Image & Overlays */}
                <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl group">
                  <img 
                    src={heroAssignmentImg} 
                    alt="University student reviewing structured assignment rubrics and research blueprints" 
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-transparent pointer-events-none"></div>

                  {/* Top Status Overlays */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-gray-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-2 shadow-lg">
                      <Shield className="w-3.5 h-3.5 text-orange-400" />
                      <span>100% Ethical &amp; Turnitin-Safe Reference Models</span>
                    </div>
                    <div className="bg-red-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-1 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      <span>Emergency Queue &lt; 15 Mins</span>
                    </div>
                  </div>

                  {/* Bottom Information Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left space-y-2 pointer-events-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-orange-400 block">Rubric Compliance Engine</span>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">Step-by-Step Methodology, Formula Derivations &amp; Blueprints</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/20">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>University Code Compliant</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-200 line-clamp-2 max-w-xl">
                      Master complex problem sets, case studies, and lab reports with line-by-line grading criteria audits and structured outlines.
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">Zero</p>
                    <p className="text-[10px] text-gray-500 font-bold">Ghostwriting / 100% Ethical</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-orange-600">Strict</p>
                    <p className="text-[10px] text-gray-500 font-bold">Rubric Alignment Scoring</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">24/7</p>
                    <p className="text-[10px] text-gray-500 font-bold">On-Demand Mentor Queue</p>
                  </div>
                </div>
              </div>

              {/* Diagnostics tool */}
              <div className="bg-white border border-orange-150 p-6 rounded-3xl space-y-6 shadow-2xs">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Diagnostic Utility Tool</span>
                  <h3 className="text-sm font-extrabold text-zinc-900 mt-1">Interactive Rubric Outline &amp; Compliancy Evaluator</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1">Load academic samples below or input trial outlines to evaluate formatting compliance against grading outlines.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5 items-center text-[10px] font-bold">
                    <span className="text-gray-500 mr-1">Quick Load Examples:</span>
                    {[
                      { label: "Calculus Limits Homework Outline", text: "This methodology proof intends to prove limit bounds boundaries. Consequently, we compile optimization matrices to evaluate derivatives patterns." },
                      { label: "Molecular Biology Lab Abstract", text: "This biology experiment analyzes cellular proteins structures. However, our bibliography has limited citation guides, making reference structures weak." },
                      { label: "Macroeconomics SWOT Paragraph", text: "Therefore, supply elasticity outlines demonstrate price fluctuations. We analyze localized inflation metrics across demographic brackets." }
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCheckText(item.text);
                          setDiagnosticReport(null);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2.5 py-1 rounded-lg text-[9px] cursor-pointer transition"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={checkText}
                    onChange={(e) => setCheckText(e.target.value)}
                    placeholder="Paste or type your homework description or draft paragraph here to inspect compliance layout..."
                    className="w-full h-24 border border-gray-200 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-orange-500 font-sans leading-relaxed"
                  />

                  <div className="flex justify-end gap-3 font-semibold">
                    <button
                      onClick={() => {
                        setCheckText('');
                        setDiagnosticReport(null);
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 px-3 text-xs rounded-xl cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleRunDiagnostic}
                      disabled={isChecking}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 text-xs rounded-xl cursor-pointer transition disabled:opacity-40"
                    >
                      {isChecking ? "Running Structural Vetting..." : "Analyze Outline Compliance"}
                    </button>
                  </div>
                </div>

                {diagnosticReport && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[9px] font-mono font-bold text-orange-600 uppercase tracking-widest">Simulated Alignment Summary</span>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${diagnosticReport.score >= 80 ? 'bg-green-150 text-green-800' : 'bg-amber-150 text-amber-800'}`}>
                        {diagnosticReport.score}/100 Match Confidence
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-gray-700 font-medium">
                      {diagnosticReport.feedback.map((bullet, idx) => (
                        <div key={idx} className="flex gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-[10px] text-gray-500 flex justify-between items-center gap-2">
                      <span>💡 <strong>Tutor Advice:</strong> Connecting with expert Liam Thompson can help clarify this syllabus equation sheet immediately.</span>
                      <button
                        onClick={() => {
                          const Liam = tutors.find(t => t.name.includes("Liam")) || tutors[0];
                          onTutorSelect(Liam);
                        }}
                        className="bg-orange-600 text-white font-bold hover:bg-orange-700 px-3 py-1.5 rounded-lg text-[9px] shrink-0"
                      >
                        Discuss Liam
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Integrity locks box */}
              <div className="p-5 bg-amber-50 border border-amber-200/50 rounded-2xl text-left space-y-2">
                <span className="text-xs font-bold text-amber-900 block uppercase tracking-wide">🔒 Strict Academic Integrity Escrow Guarantee</span>
                <p className="text-[11px] text-amber-950 leading-relaxed italic font-semibold">
                  "Our system enforces strict compliance parameters. We provide structural tutoring, formula derivations guides, and editorial prose coaching. Our advisors are strictly prohibited from writing assignments or taking proctored exams for you. We help you learn to secure genuine high marks safely."
                </p>
              </div>

            </div>
          )}

          {/* ==================== 3. SEMESTER-LONG COURSEWORK tracks CONTENT ==================== */}
          {selectedServiceId === 'coursework' && (
            <div className="space-y-16 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>Semester Grade Milestones Track</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  Semester Syllabi Companions: <br />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Weekly Progress Mentorships</span>
                </h1>
                
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold">
                  Don't wait until final exam panic compromises your semester averages during Week 12. Connect with a dedicated subject companion who tracks your syllabus weekly, reviews worksheets, and coordinates perfect quiz revisions.
                </p>

                {/* Hero Visual Banner with Relevant Image & Overlays */}
                <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl group">
                  <img 
                    src={heroCourseworkImg} 
                    alt="University student in library tracking semester coursework syllabus and milestone roadmap" 
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-transparent pointer-events-none"></div>

                  {/* Top Status Overlays */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-gray-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-2 shadow-lg">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>14-Week Syllabus Synchronization</span>
                    </div>
                    <div className="bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Avg. +1.4 GPA Boost</span>
                    </div>
                  </div>

                  {/* Bottom Information Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left space-y-2 pointer-events-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-300 block">Term-Long Academic Security</span>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">Dedicated 1-on-1 Subject Mentor Across the Entire Term</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/20">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Milestone Escrow Security</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-200 line-clamp-2 max-w-xl">
                      Weekly 1-on-1 check-ins, pre-midterm problem set auditing, and tailored study packs aligned directly to your professor's class schedule.
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">Unified</p>
                    <p className="text-[10px] text-gray-500 font-bold">Same Expert All Term</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-orange-600">Weekly</p>
                    <p className="text-[10px] text-gray-500 font-bold">Worksheet &amp; Quiz Audits</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">Proactive</p>
                    <p className="text-[10px] text-gray-500 font-bold">Pre-Finals Diagnostic Exams</p>
                  </div>
                </div>
              </div>

              {/* Syllabi Roadmap Builder */}
              <div className="bg-white border border-orange-150 p-6 rounded-3xl space-y-6 shadow-2xs">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Coursework Utility Tool</span>
                  <h3 className="text-sm font-extrabold text-zinc-900 mt-1">Interactive 14-Week Syllabus Roadmap Planner</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1">Type your Course Code to formulate custom checklists. Click checkboxes below to evaluate your projected exam success confidence.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase font-mono tracking-widest font-bold block">Syllabus Course / Class Identifier</label>
                      <input
                        type="text"
                        value={courseCodeName}
                        onChange={(e) => setCourseCodeName(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-orange-500 text-xs"
                        placeholder="e.g. ECON-305, MECH-102..."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 uppercase font-mono tracking-widest font-bold block">Target Grade Average Goal</label>
                      <div className="flex gap-2">
                        {['A', 'B', 'PASS'].map((grade) => (
                          <button
                            key={grade}
                            onClick={() => setCourseGradeGoal(grade)}
                            className={`flex-1 py-2 rounded-xl border text-[11px] font-bold cursor-pointer transition ${
                              courseGradeGoal === grade 
                                ? 'bg-orange-500 text-white border-orange-500' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            Grade {grade}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Progress slider bar mock */}
                    <div className="bg-gray-50 p-4 border rounded-xl space-y-2">
                      <span className="text-[9px] font-mono font-bold uppercase text-gray-500 block">Syllabus Match Confidence scale</span>
                      <div className="flex justify-between items-baseline pt-0.5">
                        <span className="text-2xl font-black text-gray-950 font-mono">
                          {45 + (Object.values(courseCompletedMilestones).filter(Boolean).length * 13)}%
                        </span>
                        <span className="text-emerald-600 font-bold text-[10px]">Highly Compatible Sync</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${45 + (Object.values(courseCompletedMilestones).filter(Boolean).length * 13)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist triggers */}
                  <div className="space-y-2 bg-gray-50 p-4 rounded-xl border">
                    <span className="text-[9px] font-bold text-gray-500 uppercase block tracking-wider mb-1">14-week Roadmap Milestones ({courseCodeName.toUpperCase()})</span>
                    {[
                      { title: "Weeks 1-4: Class Concepts Alignment", desc: "Select subject expert, audit initial syllabus worksheets, and map formulas." },
                      { title: "Weeks 5-8: Midterm Revisions", desc: "Formulate revision guides, solve study templates, and check proofs." },
                      { title: "Week 12: Term Project Reviews", desc: "Deep structural critiques of drafts, citations, and reference structures." },
                      { title: "Week 14: Finals Strategy Exam", desc: "Perfect solution templates, exam mock answer outlines in dynamic whiteboard sandbox." }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCourseCompletedMilestones({
                            ...courseCompletedMilestones,
                            [idx]: !courseCompletedMilestones[idx]
                          });
                        }}
                        className={`p-2 bg-white border rounded-lg cursor-pointer flex gap-2 transition ${
                          courseCompletedMilestones[idx] ? 'border-orange-200 bg-orange-50/20' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                          courseCompletedMilestones[idx] ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
                        }`}>
                          {courseCompletedMilestones[idx] && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                        </div>
                        <div className="leading-snug">
                          <span className="font-extrabold text-[11px] text-zinc-900 block">{item.title}</span>
                          <span className="text-[9.5px] text-gray-500 block">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==================== 4. ESSAY RHETORIC CONTENT ==================== */}
          {selectedServiceId === 'essay' && (
            <div className="space-y-16 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-orange-700">
                  <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Prose Refinement &amp; Citations</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                  Essay Rhetoric Construction &amp; <br />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Bibliography Citations Help</span>
                </h1>
                
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-semibold">
                  Struggling with prose structure flows, weak thesis assertions, or complicated citation styles like bibliography registers (APA, MLA, Harvard, Chicago)? We help you evaluate prompt topics, organize layouts, and master authoritative essay composition.
                </p>

                {/* Hero Visual Banner with Relevant Image & Overlays */}
                <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-xl group">
                  <img 
                    src={heroEssayImg} 
                    alt="University student editing academic essay draft and style guides on desk" 
                    className="w-full h-72 sm:h-96 object-cover group-hover:scale-102 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-950/30 to-transparent pointer-events-none"></div>

                  {/* Top Status Overlays */}
                  <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                    <div className="bg-gray-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-2 shadow-lg">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>APA, MLA, Harvard &amp; Chicago Verified</span>
                    </div>
                    <div className="bg-amber-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] sm:text-xs text-white font-bold tracking-wide flex items-center gap-1 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thesis Tone Optimizer</span>
                    </div>
                  </div>

                  {/* Bottom Information Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 text-white text-left space-y-2 pointer-events-none">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 block">Critical Editorial Coaching</span>
                        <h4 className="text-sm sm:text-base font-extrabold text-white">Authoritative Argument Flows &amp; Scholarly Vocabulary</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-white border border-white/20">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>SOP &amp; Research Theses</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-200 line-clamp-2 max-w-xl">
                      Elevate raw drafts into authoritative academic prose with structured paragraph transitions and flawless citation mechanics.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => displayToast("Downloading Free Premium Essay Checklist PDF: Models proper thesis hook structures, database citation formats, and formatting outlines.")}
                    className="bg-amber-100 hover:bg-amber-150 border border-amber-200 text-amber-900 font-bold text-xs px-4 py-2.5 rounded-xl transition inline-flex items-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-800" />
                    <span>Download Free Academic Essay Handbook Checklist (PDF)</span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">Line-by-Line</p>
                    <p className="text-[10px] text-gray-500 font-bold">Editorial Prose Critiques</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-orange-600">All Formats</p>
                    <p className="text-[10px] text-gray-500 font-bold">APA / MLA / Harvard / Chicago</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-extrabold text-zinc-900">SOP &amp; Thesis</p>
                    <p className="text-[10px] text-gray-500 font-bold">Admissions &amp; Dissertation Mentors</p>
                  </div>
                </div>
              </div>

              {/* Prose before/after visual comparing review */}
              <div className="bg-white border text-xs border-gray-150 rounded-2xl p-5 shadow-2xs space-y-4">
                <span className="text-[9px] font-mono tracking-widest text-orange-600 font-bold block uppercase border-b pb-1.5">CRITICAL EDITORIAL PROSE COMPARISON</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-100">
                    <span className="text-[9px] font-mono bg-red-100 text-red-700 font-bold uppercase px-1.5 py-0.5 rounded">Average Prose Student Draft</span>
                    <p className="text-gray-500 line-through mt-2 italic text-[11px] leading-relaxed">
                      "Mary Shelley's novels are creepy and describe computer science technologies of science."
                    </p>
                  </div>
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-150">
                    <span className="text-[9px] font-mono bg-emerald-100 text-emerald-950 font-bold uppercase px-1.5 py-0.5 rounded">Guided Model Tutor Revision</span>
                    <p className="text-gray-900 font-bold mt-2 italic text-[11px] leading-relaxed">
                      "Shelley’s gothic prose operates as a prophetic warning regarding the unchecked scientific hubris of the early nineteenth century."
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 p-3 text-[10px] text-gray-600 rounded-lg">
                  💬 <strong>Tutoring Alignment Note:</strong> We advise replacing generic descriptive sentences with precise vocabulary parameters to build immediate persuasive authority.
                </div>
              </div>

              {/* Essay Optimizer assertion tool */}
              <div className="bg-white border border-orange-150 p-6 rounded-3xl space-y-6 shadow-2xs">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-600 block">Prose Styling Tool</span>
                  <h3 className="text-sm font-extrabold text-zinc-900 mt-1">Interactive Thesis Statement &amp; Tone Optimizer</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mt-1">Configure a raw research thesis idea below, choose your expected rhetorical tone, and inspect how direct linguistic tweaks upgrade the text matching authority.</p>
                </div>

                <div className="space-y-4 text-xs font-bold font-sans">
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 tracking-wide block uppercase font-mono">Input Basic Thesis Idea</label>
                    <textarea
                      value={essayTopic}
                      onChange={(e) => setEssayTopic(e.target.value)}
                      placeholder="e.g. 'This essay is about how social media is bad for young people' or 'Climate change is bad because of science'..."
                      className="w-full h-16 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] text-gray-500 block uppercase font-mono">Select Rhetorical Tone Goal</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'persuasive', label: 'Persuasive Academic (Assertive Claim focus)' },
                        { id: 'analysis', label: 'Critical Analytical (Empirical Research focus)' },
                        { id: 'narrative', label: 'Scholarly Personal Statement (Narrative SOP)' }
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setEssayTone(btn.id)}
                          className={`px-3 py-1.5 border rounded-xl text-[10.5px] font-bold cursor-pointer transition ${
                            essayTone === btn.id 
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleOptimizeProse}
                      disabled={isOptimizing}
                      className="bg-orange-500 hover:bg-orange-655 text-white font-bold text-xs px-5 py-2 rounded-xl cursor-pointer disabled:opacity-45"
                    >
                      {isOptimizing ? "Optimizing Thesis Statement Structure..." : "Run Prose Thesis Optimizer"}
                    </button>
                  </div>
                </div>

                {optimizedThesis && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-150 space-y-3 text-xs leading-relaxed">
                    <span className="text-[9px] font-mono font-bold text-orange-600 uppercase block tracking-wider border-b pb-1">PROSE COMPARISON BREAKDOWN</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] font-mono bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">Raw Basic Thesis Idea</span>
                        <p className="text-gray-550 italic bg-white border p-3 rounded-xl mt-2 leading-relaxed">"{optimizedThesis.before}"</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-mono bg-emerald-100 text-emerald-950 font-bold px-1.5 py-0.5 rounded">Tutor Refined Assertion</span>
                        <p className="text-gray-900 font-bold bg-white border border-emerald-150 p-3 rounded-xl mt-2 leading-relaxed">"{optimizedThesis.after}"</p>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 leading-normal font-medium">
                      <span className="font-bold text-orange-950 text-[10px] uppercase font-mono block mb-0.5">🔍 Academic Improvement Details</span>
                      <span className="text-gray-700">{optimizedThesis.comment}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* FACULTY AND DISCOVERY TUTORS GRID (USED ACROSS ALL VIEWS) */}
          {/* ======================================================== */}
          <section id="tutors" className="space-y-6 pt-6">
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Exemplary Faculty</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Meet Our Featured Instructors</h2>
              <p className="text-xs text-gray-500 mt-1">Our subject matter mentors are tested for conceptual mastery, communication skills, and empathy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentor 1 (Evelyn) */}
              <div className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80" className="w-16 h-16 rounded-xl object-cover" alt="Dr. Evelyn Parker" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white font-bold border-2 border-white">★</span>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-zinc-900 leading-none">Dr. Evelyn Parker</h4>
                    <span className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded-full">Ph.D. Math</span>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold">Stanford Alum</p>
                  <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2 font-medium">8+ years experience guiding high school seniors through AP Calculus BC and Linear Algebra.</p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-450"><strong className="text-zinc-900">120+</strong> Students Boosted</span>
                    <button onClick={() => handleSelectTutorInForm('Dr. Evelyn Parker')} className="text-orange-600 font-bold hover:underline cursor-pointer">Match Me &gt;</button>
                  </div>
                </div>
              </div>

              {/* Mentor 2 (Marcus) */}
              <div className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" className="w-16 h-16 rounded-xl object-cover" alt="Marcus Thompson" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white font-bold border-2 border-white">★</span>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-zinc-900 leading-none">Marcus Thompson</h4>
                    <span className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded-full">B.S. CS &amp; Physics</span>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold">MIT Graduate</p>
                  <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2 font-medium">Coding and physical science specialist, custom tailoring Python frameworks & mechanics.</p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-450"><strong className="text-zinc-900">95+</strong> Students Assisted</span>
                    <button onClick={() => handleSelectTutorInForm('Marcus Thompson')} className="text-orange-600 font-bold hover:underline cursor-pointer">Match Me &gt;</button>
                  </div>
                </div>
              </div>

              {/* Mentor 3 (Daniel) */}
              <div className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" className="w-16 h-16 rounded-xl object-cover" alt="Daniel Reyes" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white font-bold border-2 border-white">★</span>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-zinc-900 leading-none">Daniel Reyes</h4>
                    <span className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded-full">M.A. Literature</span>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold">Harvard Alum</p>
                  <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2 font-medium">Specializes in SAT verbal strategies, language arts, and admissions consulting frameworks.</p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-450"><strong className="text-zinc-900">140+</strong> Students Mentored</span>
                    <button onClick={() => handleSelectTutorInForm('Daniel Reyes')} className="text-orange-600 font-bold hover:underline cursor-pointer">Match Me &gt;</button>
                  </div>
                </div>
              </div>

              {/* Mentor 4 (Sarah) */}
              <div className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition-all">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&q=80" className="w-16 h-16 rounded-xl object-cover" alt="Dr. Sarah Jenkins" referrerPolicy="no-referrer" />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white font-bold border-2 border-white">★</span>
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-extrabold text-zinc-900 leading-none">Dr. Sarah Jenkins</h4>
                    <span className="text-[9px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded-full">Ph.D. Biology</span>
                  </div>
                  <p className="text-[10px] text-orange-600 font-bold">Oxford Alum</p>
                  <p className="text-[10px] text-gray-550 leading-relaxed line-clamp-2 font-medium">Expert IB and AP Biology revision coordinator guiding student conceptual workflows.</p>
                  <div className="pt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-gray-450"><strong className="text-zinc-900">110+</strong> High Scores</span>
                    <button onClick={() => handleSelectTutorInForm('Dr. Sarah Jenkins')} className="text-orange-600 font-bold hover:underline cursor-pointer">Match Me &gt;</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Module-specific FAQ Blocks combined */}
          <section id="faqs" className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider block">Support Core</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-zinc-900">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-500 mt-1">Everything you need to know about our custom lesson strategies and dynamic tutoring programs.</p>
            </div>

            <div className="space-y-3 font-sans">
              {[
                { 
                  q: "How do you customformulate tutoring rates?", 
                  a: "Since every student's learning gaps, grade level, and schedule intensity are entirely distinct, pricing is fully customized. We analyze requirements during the discovery trial and present tailored tuition suggestions without any commitments or long contracts." 
                },
                { 
                  q: "Can we swap our designated mentor if it is not a perfect match?", 
                  a: "Yes. Pairing your learner with an advisor whose communication matches their persona is crucial. If your initial pairing does not fit, we reassess parameters, match you with a new candidate immediately, and carry over any remaining credits free of charge." 
                },
                { 
                  q: "Are lesson recording modules saved automatically?", 
                  a: "Absolutely. Every dynamic classroom session is recorded in HD. Students can easily access archives through their custom workspace, enabling immediate revision of formulas and essay outlines before major high school examinations." 
                },
                {
                  q: "What hardware is necessary to join the live whiteboard?",
                  a: "Any desktop computer, laptop or iPad equipped with a working microphone, webcam, and modern browser. Our collaborative whiteboard sandbox does not require any heavy plugin downloads."
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setActiveFaqId(activeFaqId === `gen-faq-${idx}` ? null : `gen-faq-${idx}`)}
                    className="flex justify-between items-center w-full p-4 text-xs font-extrabold text-gray-900 text-left hover:bg-gray-55/30 transition-all font-semibold"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${activeFaqId === `gen-faq-${idx}` ? 'rotate-180 text-orange-500' : ''}`} />
                  </button>
                  {activeFaqId === `gen-faq-${idx}` && (
                    <div className="p-4 bg-gray-55/20 text-xs text-gray-650 leading-relaxed border-t border-gray-100 font-semibold leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ====================================================================== */}
        {/* RIGHT COLUMN: STICKY LEAD CAPTURE / TRIAL BOOKING STEPS WIDGET (4 Columns) */}
        {/* ====================================================================== */}
        <div id="dedicated-booking-card-container" className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 self-start">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl relative overflow-hidden">
            
            {/* Premium top gradient line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500"></div>

            {/* Trial header */}
            {!regSuccess && (
              <div className="text-center space-y-1 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700 uppercase tracking-wider border border-orange-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span> Free Consult &amp; Tutor Match
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900">Claim Free 45-Min Session</h3>
                <p className="text-[10.5px] text-gray-500 font-medium">We'll design your student's bespoke matching blueprint.</p>
              </div>
            )}

            {/* Stepper Wizard Progress Indicators (Hidden on success) */}
            {!regSuccess && (
              <div className="flex items-center justify-between mb-6 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-100 w-full z-0"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-orange-600 z-0 transition-all duration-300"
                  style={{ width: `${(regStep - 1) * 50}%` }}
                ></div>
                
                {[
                  { step: 1, label: "Focus" },
                  { step: 2, label: "Profile" },
                  { step: 3, label: "Details" }
                ].map((s) => (
                  <div key={s.step} className="relative z-10 flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full font-bold text-xs flex items-center justify-center border-4 border-white transition-all duration-300 ${
                      regStep >= s.step 
                        ? 'bg-orange-600 text-white shadow-md' 
                        : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      {s.step}
                    </div>
                    <span className={`text-[10px] mt-1 font-bold ${regStep >= s.step ? 'text-zinc-900' : 'text-zinc-400'}`}>{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* LEADS EXCEL FORM WIZARD */}
            {!regSuccess ? (
              <form onSubmit={handleMatchSubmit} className="space-y-4">
                
                {/* STEP 1: SUBJECT & GRADE DETAILS */}
                {regStep === 1 && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Subject Selection</label>
                      <select 
                        value={regSubject}
                        onChange={(e) => setRegSubject(e.target.value)}
                        required 
                        className="block w-full rounded-xl border border-gray-200 bg-zinc-50 py-2.5 px-3.5 text-xs text-zinc-900 font-bold focus:none focus:border-orange-500"
                      >
                        <option value="">Select a Subject Field...</option>
                        <option value="Mathematics">Mathematics (AP Calculus, Algebra)</option>
                        <option value="Sciences">Sciences (Physics, Chem, Bio)</option>
                        <option value="Coding">Coding &amp; Computer Science</option>
                        <option value="Languages & SATs">Language Arts &amp; SATs Prep</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Academic Grade / Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Middle', label: 'Middle School' },
                          { id: 'HighSchool', label: 'High School' },
                          { id: 'University', label: 'University' }
                        ].map((gr) => (
                          <button
                            type="button"
                            key={gr.id}
                            onClick={() => {
                              setRegGrade(gr.id);
                              displayToast(`Set level parameter: ${gr.label}`);
                            }}
                            className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-center bg-white transition-all ${
                              regGrade === gr.id 
                                ? 'border-2 border-orange-500 bg-orange-50/30' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-zinc-700">{gr.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Main Academic Objectives</label>
                      <div className="space-y-1.5">
                        {[
                          { id: 'GradeBoost', label: 'Rapid GPA Improvement Program' },
                          { id: 'ExamPrep', label: 'AP / IB Exam Revision Solutions' },
                          { id: 'AdmissionsSOP', label: 'College Ivy Admissions & SOP prep' }
                        ].map((g) => (
                          <div 
                            key={g.id}
                            onClick={() => handleGoalToggle(g.id)}
                            className={`flex items-center gap-2.5 border rounded-xl p-2.5 cursor-pointer bg-white transition-colors text-[10.5px] font-bold ${
                              regGoals.includes(g.id) ? 'border-orange-200 bg-orange-50/10' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${
                              regGoals.includes(g.id) ? 'bg-orange-600 border-orange-600' : 'border-gray-300 bg-white'
                            }`}>
                              {regGoals.includes(g.id) && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                            </div>
                            <span className="text-zinc-700">{g.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleGoToStep(2)} 
                      className="w-full rounded-xl bg-orange-600 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-500 hover:shadow-orange-glow transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Continue to Step 2</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* STEP 2: PROFILE DATA */}
                {regStep === 2 && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wide mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="E.g., Allison Miller" 
                        required
                        className="block w-full rounded-xl border border-gray-255 bg-zinc-50 py-2.5 px-3.5 text-xs text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wide mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="E.g., allison.m@example.com" 
                        required
                        className="block w-full rounded-xl border border-gray-255 bg-zinc-50 py-2.5 px-3.5 text-xs text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wide mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="E.g., (555) 012-3456" 
                        required
                        className="block w-full rounded-xl border border-gray-255 bg-zinc-50 py-2.5 px-3.5 text-xs text-zinc-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => handleGoToStep(1)} 
                        className="w-1/3 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-zinc-500 hover:bg-gray-50 bg-white"
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleGoToStep(3)} 
                        className="w-2/3 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white hover:bg-orange-500 hover:shadow-orange-glow transition-all"
                      >
                        Continue to Step 3
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: AVAILABILITY & VERIFICATIONS */}
                {regStep === 3 && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Preferred Study Hour Window</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'afternoon', label: 'Afternoon (1pm - 5pm)' },
                          { id: 'evening', label: 'Evening (5pm - 9pm)' }
                        ].map((tm) => (
                          <button
                            type="button"
                            key={tm.id}
                            onClick={() => {
                              setRegTimeSlot(tm.id);
                              displayToast(`Preferred slot: ${tm.label}`);
                            }}
                            className={`border rounded-xl p-3 text-center flex flex-col items-center justify-center bg-white transition-all ${
                              regTimeSlot === tm.id 
                                ? 'border-2 border-orange-500 bg-orange-50/20' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-zinc-750">{tm.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Highly dynamic custom matching badge if a tutor was clicked first */}
                    {regMatchedTutor && (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 p-2.5 flex items-center justify-between text-[11px] text-orange-800 font-bold">
                        <div className="flex items-center gap-1.5 leading-none">
                          <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>Matched Instructor: <strong className="text-zinc-900">{regMatchedTutor}</strong></span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setRegMatchedTutor('')} 
                          className="text-gray-400 hover:text-red-500 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200 text-[10px] text-gray-500 leading-normal space-y-1">
                      <div className="flex items-center gap-1 font-bold text-zinc-900 uppercase tracking-wide">
                        <Shield className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Bespoke Trial Security Assured
                      </div>
                      <p>No card input is requested today. Session coaching rates are custom-formulated post-session and maps perfectly to your term budget plans.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleGoToStep(2)} 
                        className="w-1/3 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-zinc-500 hover:bg-gray-50 bg-white"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={regLoading}
                        className="w-2/3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-2.5 text-xs font-extrabold text-white shadow-lg hover:from-orange-500 hover:to-amber-500 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {regLoading ? "Locking Trial..." : "Finish & Book Session"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* SUCCESS STATE PANEL DISPLAY */
              <div className="space-y-6 text-center py-6 animate-fade-in text-xs font-semibold">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600 border border-orange-150 animate-bounce">
                  <Check className="w-6 h-6 text-orange-600 stroke-[3.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-zinc-900">Coaching Profile Registered!</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Thank you, <strong className="text-orange-600">{regName || "Student"}</strong>. An academic consultant has been assigned to evaluate your matching parameters. We'll present 3 vetted tutor profiles to you within 2 hours.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-3.5 bg-zinc-50 text-left space-y-2 max-w-xs mx-auto text-[10.5px]">
                  <div className="flex items-center gap-1.5 text-zinc-800"><CheckCircle className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Target subject profile loaded</div>
                  <div className="flex items-center gap-1.5 text-zinc-800"><CheckCircle className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Complimentary matching trial credit active</div>
                  <div className="flex items-center gap-1.5 text-zinc-800"><CheckCircle className="w-3.5 h-3.5 text-orange-600 shrink-0" /> Personal coordinator review initialized</div>
                </div>

                <button 
                  onClick={handleResetRegForm} 
                  className="w-full rounded-xl bg-zinc-100 font-bold py-2.5 text-zinc-800 hover:bg-zinc-200 transition-all text-xs"
                >
                  Register Another Profile
                </button>
              </div>
            )}

            {/* Minor Trust badges below form widget */}
            <div className="mt-6 border-t border-zinc-150 pt-4 space-y-3">
              <div className="flex items-center justify-between text-[10.5px] text-gray-500">
                <span>Trust Score: <strong className="text-zinc-900">4.9/5.0</strong></span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                  <Star className="w-3 h-3 fill-amber-500" />
                </div>
              </div>

              {/* Dynamic ticker updates */}
              <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-2.5 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                <p className="text-[10px] text-orange-850 font-bold leading-tight" id="dynamic-ticker">
                  {tickerPhrases[tickerIndex]}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Footer All Services Navigation Section */}
      <div className="pt-10 border-t flex flex-wrap justify-between items-center text-xs text-left text-gray-400 border-gray-200">
        <span className="font-bold text-gray-900">Want to explore premium plans for other university subject categories?</span>
        <button
          onClick={onBackToHub}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all mt-2 sm:mt-0"
        >
          View All Core Services Hub
        </button>
      </div>

    </div>
  );
}
