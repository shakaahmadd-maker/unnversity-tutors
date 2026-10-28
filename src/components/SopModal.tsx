import React, { useState } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  CreditCard, 
  FileText, 
  Activity, 
  Download, 
  RotateCcw, 
  CheckSquare, 
  X,
  HelpCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleConnect?: () => void;
}

export default function SopModal({ isOpen, onClose, onGoogleConnect }: SopModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [checklist, setChecklist] = useState({
    login: true,
    chat: false,
    quote: false,
    pay: false,
    submit: false,
    track: false,
    revision: false
  });

  if (!isOpen) return null;

  const steps = [
    {
      title: "1. Access Portal & Pick a Service",
      description: "Register a secure Student account, or choose a pre-loaded quick-demo trial account. Lands on the core Service Selection page starring the 4 major university study help categories.",
      icon: <BookOpen className="w-6 h-6 text-orange-500" />
    },
    {
      title: "2. Connect & Negotiate Cost",
      description: "Browse certified US/UK specialist tutors' rates and country flags. Click 'Chat & Discuss' to open private conversations. Explain brief assignment files and custom deadlines. Tutors will send a custom Quote pricing card in the live chat.",
      icon: <MessageSquare className="w-6 h-6 text-orange-500" />
    },
    {
      title: "3. Custom Payment Link Processing",
      description: "No automatic charges. Click 'Accept & Request Payment Link' in chat, and an administrator will provide a secure payment link. Your payment is held securely in escrow, released only after you confirm and download successful work.",
      icon: <CreditCard className="w-6 h-6 text-orange-500" />
    },
    {
      title: "4. Detailed Briefing Form",
      description: "Upon secure payment confirmation, complete the interactive homework/essay form fields. Choose referencing guides (APA, MLA, Harvard), submit page counts, and upload research documents securely.",
      icon: <FileText className="w-6 h-6 text-orange-500" />
    },
    {
      title: "5. Real-Time Status Monitor",
      description: "The Student dashboard shows state counters (In Progress, Review, etc.) and real-time completion percentages. Email notifications trigger when files are completed by the tutor.",
      icon: <Activity className="w-6 h-6 text-orange-500" />
    },
    {
      title: "6. Deliverables & Free Revisions",
      description: "Preview completed paper samples inside chat or dashboards. Hit 'Confirm & Approve' to release funds, or trigger 'Request Revision' within 7 days for free formatting refinements.",
      icon: <RotateCcw className="w-6 h-6 text-orange-500" />
    }
  ];

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row my-8" id="sop-modal-container">
        {/* Left Side Navigation & Checklist */}
        <div className="bg-gray-50 p-6 md:w-80 border-r border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-gray-900 tracking-tight text-lg">System SOP Guide</h3>
            </div>
            
            <p className="text-xs text-gray-500 mb-6">
              Learn how universitytutors.com coordinates students, specialist tutors, and escrow guarantees safely.
            </p>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Onboarding Checklist</h4>
            <div className="space-y-2">
              {[
                { label: "Log in / Pick Account", key: "login" },
                { label: "Find Tutor & Open Chat", key: "chat" },
                { label: "Get Quote Pricing", key: "quote" },
                { label: "Secure Payment", key: "pay" },
                { label: "Submit Brief Form", key: "submit" },
                { label: "Track 0-100% Progress", key: "track" },
                { label: "Approve or Edit Draft", key: "revision" }
              ].map((item) => (
                <button
                  key={item.key}
                  id={`sop-check-${item.key}`}
                  onClick={() => toggleCheck(item.key as keyof typeof checklist)}
                  className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key as keyof typeof checklist]}
                    readOnly
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 pointer-events-none"
                  />
                  <span className={`text-xs ${checklist[item.key as keyof typeof checklist] ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="bg-orange-50 p-3 rounded-xl flex items-start gap-2.5">
              <UserCheck className="w-5 h-5 text-orange-600 shrink-0" />
              <span className="text-xs text-orange-850 leading-relaxed text-left">
                <strong>Need Support?</strong> All disputes are resolved manually by Admin Emily in the arbitration panel.
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Slides */}
        <div className="p-8 flex-1 flex flex-col justify-between relative bg-white">
          <button 
            id="close-sop-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-150 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Methodology Flow
            </span>
            
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mt-4 mb-2">
              How the Tutoring Ecosystem Works
            </h2>
            <p className="text-sm text-gray-650 mb-8">
              Navigate the interactive slides to learn our high-conversion operational loops.
            </p>

            {/* Steps Carousel Grid */}
            <div className="grid grid-cols-1 gap-4">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  id={`sop-select-step-${idx}`}
                  onClick={() => setActiveStep(idx)}
                  className={`flex gap-4 p-4 rounded-xl text-left border transition-all ${
                    activeStep === idx 
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm' 
                      : 'border-transparent hover:border-gray-200 bg-gray-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activeStep === idx ? 'bg-orange-100' : 'bg-gray-150'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900">{s.title}</h4>
                    {activeStep === idx && (
                      <p className="text-xs text-gray-650 mt-1 leading-relaxed">{s.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs text-gray-500 font-mono">
              SOP v1.1.2 • Certified Academic Policy
            </span>
            <div className="flex items-center gap-2">
              <button
                id="sop-understand-btn"
                onClick={onClose}
                className="bg-orange-500 text-white font-medium hover:bg-orange-600 text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 transition-colors cursor-pointer"
              >
                Let's Start!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
