import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Copy, 
  Check, 
  FileText,
  UserX,
  Lock,
  Globe,
  Clock
} from 'lucide-react';
import { User } from '../types';
import { store } from '../lib/store';

interface DataDeletionPageProps {
  currentUser?: User | null;
  onNavigate: (view: string) => void;
}

export default function DataDeletionPage({ currentUser, onNavigate }: DataDeletionPageProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('privacy@university-tutors.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleExecuteAutomatedDeletion = async () => {
    if (!currentUser) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await store.deleteUser(currentUser.id);
      store.logout();
      setDeletionSuccess(true);
      setIsConfirmingDelete(false);
    } catch (e: any) {
      console.error('Data deletion error:', e);
      setDeleteError(e.message || 'An error occurred during account deletion. Please use Method 2 via email.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 pb-20" id="data-deletion-page-root">
      
      {/* Top Breadcrumb & Header Banner */}
      <section className="bg-white border-b border-orange-150/70 pt-8 pb-10 shadow-xs">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-4">
            <button 
              onClick={() => onNavigate('home')}
              className="hover:text-orange-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-orange-600 font-bold">User Data Deletion Instructions</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Meta &amp; GDPR Data Compliance Standard
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Last Updated: November 11, 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight font-display">
                User Data Deletion Instructions
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                At University Tutors (<a href="https://university-tutors.com" className="text-orange-600 font-semibold hover:underline">https://university-tutors.com</a>), we value and respect your privacy. In accordance with platform guidelines (including Meta, Google, and global data privacy standards such as GDPR and CCPA), we provide users with full transparency and control over their personal data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container mx-auto px-4 md:px-8 max-w-5xl mt-10 space-y-8">
        
        {/* Notice Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <p className="text-sm text-slate-700 leading-relaxed">
            If you have created an account or signed in using third-party services (such as Google, Facebook, or Instagram) and wish to permanently delete your account and associated personal data from our platform, you can do so by following the instructions below.
          </p>
        </div>

        {/* Section 1: What Data We Collect */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-950 font-display">
              What Data We Collect
            </h2>
          </div>
          
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            When you use University Tutors via social authentication or registration, we collect minimal profile information necessary to provide our tutoring services, which may include:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {[
              { title: 'Full Name', desc: 'Identifies you for scheduled sessions and academic correspondence.' },
              { title: 'Email Address', desc: 'Used for account confirmation, booking milestone updates, and escrow alerts.' },
              { title: 'Profile Identifier', desc: 'Provided by OAuth identity providers such as Google or Meta.' },
              { title: 'Platform Usage Data', desc: 'Tutorial bookings, inquiry chat records, and user preferences.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: How to Request Account and Data Deletion */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-950 font-display">
              How to Request Account and Data Deletion
            </h2>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-6">
            You can request the permanent deletion of your data through either of the following two methods:
          </p>

          <div className="space-y-6">
            
            {/* Method 1 */}
            <div className="bg-orange-50/40 rounded-2xl p-5 sm:p-6 border border-orange-200/80">
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-700 uppercase tracking-wider bg-orange-100 px-2.5 py-0.5 rounded-full">
                    Method 1
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Automated Deletion via Your Account Settings (Recommended)
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Logged in as {currentUser.name}
                  </span>
                )}
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
                <li>Log into your account at <a href="https://university-tutors.com" className="font-semibold text-orange-600 hover:underline">university-tutors.com</a>.</li>
                <li>Go to <strong>Dashboard &gt; Account Settings</strong>.</li>
                <li>Scroll to the <strong>Privacy &amp; Security</strong> or <strong>Danger Zone</strong> section.</li>
                <li>Click <strong>Delete Account and Data</strong>.</li>
                <li>Confirm your request when prompted. Your account, session data, and profile records will be permanently removed.</li>
              </ol>

              {/* Direct In-App Interactive Trigger */}
              <div className="mt-5 pt-4 border-t border-orange-200/60 flex flex-wrap items-center gap-3">
                {currentUser ? (
                  !deletionSuccess ? (
                    <div>
                      {!isConfirmingDelete ? (
                        <button
                          id="trigger-delete-account-btn"
                          onClick={() => setIsConfirmingDelete(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete My Account &amp; Data Now</span>
                        </button>
                      ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 max-w-lg">
                          <p className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>Are you sure you want to permanently erase your account ({currentUser.email})?</span>
                          </p>
                          <p className="text-[11px] text-red-700">This action cannot be undone. All active sessions, records, and preferences will be permanently wiped.</p>
                          <div className="flex items-center gap-2">
                            <button
                              id="confirm-delete-account-execute-btn"
                              onClick={handleExecuteAutomatedDeletion}
                              disabled={isDeleting}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
                            </button>
                            <button
                              onClick={() => setIsConfirmingDelete(false)}
                              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                          {deleteError && (
                            <p className="text-xs text-red-700 mt-1">{deleteError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your account and associated records have been successfully purged from the platform.</span>
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => onNavigate('auth')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-orange-700 bg-white hover:bg-orange-100 border border-orange-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Sign In to Access Automated Account Deletion</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Method 2 */}
            <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-200 px-2.5 py-0.5 rounded-full">
                  Method 2
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Manual Request via Email
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 mb-3 leading-relaxed">
                If you are unable to access your account or prefer manual assistance:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
                <li>
                  Send an email to <span className="font-semibold text-slate-900 font-mono">privacy@university-tutors.com</span> (or <span className="font-semibold text-slate-900 font-mono">shaka.ahmadd@gmail.com</span>) from the email address linked to your account.
                </li>
                <li>
                  Use the subject line: <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">Data Deletion Request - [Your Name / Email]</code>.
                </li>
                <li>
                  State in the body that you are requesting the permanent deletion of your University Tutors account and all associated personal data.
                </li>
                <li>
                  Our data protection team will process your request within <strong>48 to 72 business hours</strong> and send you a confirmation email once completed.
                </li>
              </ol>

              {/* Email helper buttons */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:privacy@university-tutors.com?subject=Data%20Deletion%20Request%20-%20[Your%20Name%20/%20Email]&body=Hello%20University%20Tutors%20Privacy%20Team,%0A%0AI%20am%20requesting%20the%20permanent%20deletion%20of%20my%20University%20Tutors%20account%20and%20all%20associated%20personal%20data%20in%20accordance%20with%20your%20User%20Data%20Deletion%20Policy.%0A%0AAccount%20Email:%20%0AFull%20Name:%20%0A%0AThank%20you."
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-orange-400" />
                  <span>Send Pre-filled Deletion Request Email</span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Email Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: How to Remove Platform Access from Meta / Facebook Directly */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-950 font-display">
              How to Remove Platform Access from Meta / Facebook Directly
            </h2>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            If you authenticated using Facebook or Instagram and wish to revoke application access directly from Meta:
          </p>

          <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
            <li>Log into your Facebook or Instagram account.</li>
            <li>Go to <strong>Settings &amp; Privacy &gt; Settings</strong>.</li>
            <li>Under the <strong>Permissions</strong> section, click <strong>Apps and Websites</strong>.</li>
            <li>Find <strong>university-tutors</strong> in the list of active apps.</li>
            <li>Click <strong>Remove</strong>.</li>
            <li>Check the box to remove all posts, photos, or videos associated with the app, and click <strong>Remove</strong> again.</li>
            <li>You may also click <strong>View Removed Apps and Websites</strong>, select <strong>university-tutors</strong>, and click <strong>Send Request</strong> to trigger an automated notification.</li>
          </ol>
        </div>

        {/* Section 4: What Happens After Data Deletion? */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-950 font-display">
              What Happens After Data Deletion?
            </h2>
          </div>

          <div className="space-y-3.5 mt-4">
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Immediate Removal</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your personal profile, contact information, credentials, and active sessions are permanently erased from our active database.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Residual Logs</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Routine server backups and transactional records required by law (such as completed billing receipts) are maintained only for the legally mandated period and are systematically purged.
              </p>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Irreversibility</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once completed, this action cannot be undone. To use University Tutors again in the future, you will need to create a new account.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Contact Us */}
        <div className="bg-[#fff9f3] rounded-3xl border border-orange-200/90 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 font-display mb-2">
            Contact Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
            If you have questions regarding this deletion policy or data protection, please contact us:
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>Website:</span>
              <a href="https://university-tutors.com" className="font-semibold text-orange-600 hover:underline">
                https://university-tutors.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-600" />
              <span>Email:</span>
              <a href="mailto:privacy@university-tutors.com" className="font-semibold text-orange-600 hover:underline">
                privacy@university-tutors.com
              </a>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
