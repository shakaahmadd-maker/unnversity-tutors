import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Briefcase, 
  Award, 
  Clock, 
  MapPin, 
  Heart, 
  CheckCircle2, 
  DollarSign, 
  Video,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import TutorImageUploader from './TutorImageUploader';

export interface BecomeTutorFormData {
  name: string;
  email: string;
  phoneNumber: string;
  bio: string;
  education: string;
  experiences: string;
  subjectExpertise: string;
  availabilities: string;
  canMeet: 'Online' | 'In-Person' | 'Hybrid';
  hobbies: string;
  hourlyRate: number;
  country: string;
  avatarUrl?: string;
}

interface BecomeTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BecomeTutorFormData) => Promise<boolean>;
}

export default function BecomeTutorModal({ isOpen, onClose, onSubmit }: BecomeTutorModalProps) {
  const [formData, setFormData] = useState<BecomeTutorFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    education: '',
    experiences: '',
    subjectExpertise: '',
    availabilities: '',
    canMeet: 'Online',
    hobbies: '',
    hourlyRate: 40,
    country: 'US',
    avatarUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof BecomeTutorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.bio.trim()) {
      setErrorMessage('Please fill in your Name, Email, and Bio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSubmit(formData);
      if (ok) {
        setSubmittedSuccess(true);
      } else {
        setErrorMessage('Failed to submit application. Please check your network and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedSuccess(false);
    setErrorMessage(null);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      bio: '',
      education: '',
      experiences: '',
      subjectExpertise: '',
      availabilities: '',
      canMeet: 'Online',
      hobbies: '',
      hourlyRate: 40,
      country: 'US',
      avatarUrl: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <button 
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-orange-500/20 border border-orange-500/30 rounded-2xl">
              <GraduationCap className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Join Our Global Faculty
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans">
            Become an Approved Tutor
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-lg">
            Share your academic expertise, mentor top university students worldwide, and manage your flexible schedule.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submittedSuccess ? (
            <div className="text-center py-8 px-4 space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 font-sans">
                  Application Received!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. Your tutor profile application has been successfully submitted to our review board.
                </p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200/60 rounded-2xl text-left text-xs text-orange-900 space-y-2 max-w-md mx-auto">
                <div className="flex items-start gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>Next Steps for Approval:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  <li>Our Admin team will review your qualifications & experience.</li>
                  <li>Once approved by admin, your profile will automatically go live on the webpage.</li>
                  <li>You will receive an email update at <span className="font-mono text-slate-900">{formData.email}</span>.</li>
                </ul>
              </div>

              <button
                onClick={handleResetAndClose}
                className="w-full max-w-xs bg-slate-900 text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-orange-600 transition-all cursor-pointer shadow-lg"
              >
                Close & Return to Site
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h3>

                {/* Tutor Profile Image Uploader */}
                <TutorImageUploader
                  currentImageUrl={formData.avatarUrl}
                  onImageChange={(url) => handleChange('avatarUrl', url)}
                  label="Tutor Profile Photo / Headshot"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Dr. Sarah Jenkins"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="email"
                        required
                        placeholder="sarah@university.edu"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="tel"
                        required
                        placeholder="+1 (555) 019-2834"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country / Region
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select
                        value={formData.country}
                        onChange={(e) => handleChange('country', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="US">United States (US)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="CA">Canada (CA)</option>
                        <option value="AU">Australia (AU)</option>
                        <option value="NZ">New Zealand (NZ)</option>
                        <option value="IE">Ireland (IE)</option>
                        <option value="SG">Singapore (SG)</option>
                        <option value="OTHER">Other International</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Bio <span className="text-rose-500">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Brief intro highlighting your academic background, teaching style, and passion for student success..."
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Educations & Experience */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <BookOpen className="w-4 h-4" />
                  Qualifications & Experience
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Educations (Degrees, Universities, Certifications) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <textarea 
                      required
                      rows={2}
                      placeholder="e.g. PhD in Pure Mathematics (Oxford, 2018), MSc in Applied Statistics (Imperial College, 2014)"
                      value={formData.education}
                      onChange={(e) => handleChange('education', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experiences (All Details) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <textarea 
                      required
                      rows={3}
                      placeholder="e.g. 7+ years university teaching assistant, 400+ dissertation reviews, research fellow at MIT..."
                      value={formData.experiences}
                      onChange={(e) => handleChange('experiences', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Expertise <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Advanced Calculus, Organic Chemistry, Python, Essay Editing"
                      value={formData.subjectExpertise}
                      onChange={(e) => handleChange('subjectExpertise', e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Separate topics with commas.</p>
                </div>
              </div>

              {/* Logistics & Preferences */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Clock className="w-4 h-4" />
                  Logistics & Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Availabilities <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Mon-Fri 9am-5pm EST, Weekends 1pm-4pm"
                      value={formData.availabilities}
                      onChange={(e) => handleChange('availabilities', e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Can Meet (Session Format) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Video className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select
                        value={formData.canMeet}
                        onChange={(e) => handleChange('canMeet', e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all cursor-pointer font-medium"
                      >
                        <option value="Online">Online Video Sessions Only</option>
                        <option value="In-Person">In-Person Campus Sessions</option>
                        <option value="Hybrid">Hybrid (Both Online & In-Person)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hobbies & Personal Interests <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Heart className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Chess, Classical Piano, Marathon Running, Photography"
                        value={formData.hobbies}
                        onChange={(e) => handleChange('hobbies', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Desired Hourly Rate ($ USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="number"
                        min={20}
                        max={150}
                        value={formData.hourlyRate}
                        onChange={(e) => handleChange('hourlyRate', Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profile Photo URL (Optional)
                  </label>
                  <input 
                    type="url"
                    placeholder="https://images.unsplash.com/your-photo.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leave blank to assign a professional default avatar.</p>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Tutor Application</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
