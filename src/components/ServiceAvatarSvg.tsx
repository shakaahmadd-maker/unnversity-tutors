import React from 'react';

export type ServiceAvatarKey =
  | '1-1-lesson'
  | 'assignment'
  | 'coursework'
  | 'writing'
  | 'online-assignments-homework-help'
  | 'online-quizzes-assessments'
  | 'online-exams-tests-midterms-finals'
  | 'online-coursework'
  | 'online-classes'
  | 'protected-exam'
  | 'writing-services'
  | 'it-project-assistance'
  | 'online-phd-classes-management'
  | 'Assignment Help'
  | 'Midterm / Final Prep'
  | '1-on-1 Live Tutoring'
  | 'Lab Report Review'
  | string;

export default function ServiceAvatarSvg({
  serviceKey,
  className = 'w-11 h-11 drop-shadow-xs',
}: {
  serviceKey: ServiceAvatarKey;
  className?: string;
}) {
  // Normalize labels / aliases to canonical avatar keys
  const normalized = (() => {
    switch (serviceKey) {
      case '1-on-1 Live Tutoring':
        return '1-1-lesson';
      case 'Assignment Help':
      case 'Assignment Tutoring':
        return 'assignment';
      case 'Coursework Tutoring':
        return 'coursework';
      case 'Academic Writing Coach':
        return 'writing';
      case 'Midterm / Final Prep':
      case 'Online exams/tests/midterms/finals':
        return 'online-exams-tests-midterms-finals';
      case 'Lab Report Review':
        return 'lab-report';
      case 'Online assignments/Homework HELP':
        return 'online-assignments-homework-help';
      case 'Online Quizzes/Assessments':
        return 'online-quizzes-assessments';
      case 'Online coursework':
        return 'online-coursework';
      case 'Online Classes':
        return 'online-classes';
      case 'Protected exam':
        return 'protected-exam';
      case 'Writing Services':
        return 'writing-services';
      case 'IT Project Assistance':
        return 'it-project-assistance';
      case 'Online PhD Classes/Online Classes Management':
        return 'online-phd-classes-management';
      default:
        return serviceKey;
    }
  })();

  // 1. 1-on-1 Live Tutoring (Headset + Live Play Badge)
  if (normalized === '1-1-lesson') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv1Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F5BA90" />
          </linearGradient>
          <linearGradient id="srvAv1Shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        <path d="M14 57 C14 45, 22 41, 32 41 C42 41, 50 45, 50 57 Z" fill="url(#srvAv1Shirt)" />
        <circle cx="32" cy="26" r="14.5" fill="#432818" />
        <circle cx="32" cy="27" r="11" fill="url(#srvAv1Skin)" />
        <path d="M21 25 C22 17, 42 16, 43 25 C39 20, 26 20, 21 25 Z" fill="#5A3722" />
        <circle cx="28" cy="27" r="1.4" fill="#1E293B" />
        <circle cx="36" cy="27" r="1.4" fill="#1E293B" />
        <path d="M28.5 32 Q32 34.8 35.5 32" stroke="#9A3412" strokeWidth="1.7" fill="none" strokeLinecap="round" />
        <path d="M19 27 C19 16, 45 16, 45 27" stroke="#1E293B" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <rect x="16.5" y="24" width="4.5" height="8" rx="2.2" fill="#0F172A" />
        <rect x="43" y="24" width="4.5" height="8" rx="2.2" fill="#0F172A" />
        <path d="M19 31 Q21 36 28 35" stroke="#334155" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="28.5" cy="35" r="1.6" fill="#F97316" />
        <circle cx="48" cy="46" r="8.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
        <polygon points="45.8,42.3 45.8,49.7 51.8,46" fill="#FFFFFF" />
      </svg>
    );
  }

  // 2. Assignment Tutoring (Graduation Cap + A+ Graded Paper)
  if (normalized === 'assignment') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv2Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAD6B8" />
            <stop offset="100%" stopColor="#E6A97A" />
          </linearGradient>
          <linearGradient id="srvAv2Coat" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path d="M13 57 C13 46, 20 42, 30 42 C40 42, 46 46, 46 57 Z" fill="url(#srvAv2Coat)" />
        <circle cx="29" cy="29" r="10.5" fill="url(#srvAv2Skin)" />
        <circle cx="25.5" cy="29" r="1.35" fill="#1E293B" />
        <circle cx="32.5" cy="29" r="1.35" fill="#1E293B" />
        <path d="M26 33.5 Q29 36 32 33.5" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <polygon points="29,11 45,17 29,23 13,17" fill="#0F172A" />
        <rect x="21" y="19" width="16" height="4.5" rx="1.5" fill="#1E293B" />
        <line x1="42" y1="18" x2="42" y2="26" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="42" cy="27" r="1.8" fill="#F59E0B" />
        <rect x="35" y="31" width="21" height="25" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <line x1="39" y1="45" x2="51" y2="45" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="39" y1="49.5" x2="49" y2="49.5" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
        <text x="45.5" y="40.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#EA580C">
          A+
        </text>
      </svg>
    );
  }

  // 3. Coursework Tutoring (Suit + Checklist Tablet)
  if (normalized === 'coursework') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv3Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#EBB080" />
          </linearGradient>
          <linearGradient id="srvAv3Suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv3Suit)" />
        <polygon points="29,41 25,48 29,55 33,48" fill="#FFFFFF" />
        <polygon points="29,43 27.2,51 29,54.5 30.8,51" fill="#F97316" />
        <path d="M19 25 C19 16, 39 16, 39 25 L39 27 L19 27 Z" fill="#334155" />
        <circle cx="29" cy="27.5" r="10.2" fill="url(#srvAv3Skin)" />
        <circle cx="25.5" cy="27.5" r="1.35" fill="#0F172A" />
        <circle cx="32.5" cy="27.5" r="1.35" fill="#0F172A" />
        <path d="M26 32 Q29 34.5 32 32" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <rect x="36" y="30" width="20" height="26" rx="3.5" fill="#0F172A" />
        <rect x="38.5" y="33" width="15" height="20" rx="2" fill="#FFFFFF" />
        <path d="M41 38 L42.8 39.8 L45.5 36.8" stroke="#16A34A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="47.5" y1="38.5" x2="51.5" y2="38.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M41 44 L42.8 45.8 L45.5 42.8" stroke="#16A34A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <line x1="47.5" y1="44.5" x2="51.5" y2="44.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="43" cy="49.5" r="1.5" fill="#F97316" />
        <line x1="47.5" y1="49.5" x2="51.5" y2="49.5" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. Academic Writing Coach (Glasses + Gold Quill Feather)
  if (normalized === 'writing') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv4Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F3B88C" />
          </linearGradient>
          <linearGradient id="srvAv4Sweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 46 45, 46 57 Z" fill="url(#srvAv4Sweater)" />
        <circle cx="29" cy="25" r="12" fill="#475569" />
        <circle cx="29" cy="27.5" r="10.2" fill="url(#srvAv4Skin)" />
        <rect x="21.5" y="24" width="6.5" height="5" rx="1.8" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="30" y="24" width="6.5" height="5" rx="1.8" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="28" y1="26.5" x2="30" y2="26.5" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="24.8" cy="26.5" r="1.1" fill="#0F172A" />
        <circle cx="33.2" cy="26.5" r="1.1" fill="#0F172A" />
        <path d="M26.5 32.5 Q29 34.8 31.5 32.5" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M40 50 C41 37, 47 26, 56 20 C55 31, 50 40, 42 48 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <line x1="38" y1="53" x2="54" y2="22" stroke="#FEF3C7" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  // 5. Online assignments / Homework HELP (Tutor with orange cardigan & homework notebook + pencil)
  if (normalized === 'online-assignments-homework-help') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv5Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F2B488" />
          </linearGradient>
          <linearGradient id="srvAv5Shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv5Shirt)" />
        <circle cx="28.5" cy="24" r="12.5" fill="#292524" />
        <circle cx="28.5" cy="27" r="10.2" fill="url(#srvAv5Skin)" />
        <path d="M18 24 C20 17, 37 16, 39 24 C34 20, 23 20, 18 24 Z" fill="#44403C" />
        <circle cx="25" cy="27.2" r="1.3" fill="#0F172A" />
        <circle cx="32" cy="27.2" r="1.3" fill="#0F172A" />
        <path d="M25.5 31.8 Q28.5 34.4 31.5 31.8" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Spiral Notebook */}
        <rect x="35" y="31" width="21" height="25" rx="3" fill="#FFFFFF" stroke="#FB923C" strokeWidth="1.6" />
        <line x1="39" y1="38" x2="52" y2="38" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="39" y1="43" x2="52" y2="43" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M39 48.5 L41.5 51 L46 46.5" stroke="#16A34A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Yellow Pencil */}
        <polygon points="48,25 56,19 58,21.5 50,27.5" fill="#F59E0B" />
        <polygon points="46.5,28.5 48,25 50,27.5" fill="#1E293B" />
      </svg>
    );
  }

  // 6. Online Quizzes / Assessments (Tutor with checkmark badge & quiz card)
  if (normalized === 'online-quizzes-assessments') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv6Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FAD5B5" />
            <stop offset="100%" stopColor="#E09E72" />
          </linearGradient>
          <linearGradient id="srvAv6Top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv6Top)" />
        <circle cx="29" cy="24" r="12" fill="#1E293B" />
        <circle cx="29" cy="27" r="10" fill="url(#srvAv6Skin)" />
        <circle cx="25.5" cy="27" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="27" r="1.3" fill="#0F172A" />
        <path d="M26 31.5 Q29 34 32 31.5" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Quiz Card */}
        <rect x="35" y="29" width="21" height="27" rx="3.5" fill="#FFFFFF" stroke="#0EA5E9" strokeWidth="1.5" />
        <circle cx="40.5" cy="36" r="2.2" fill="#F97316" />
        <line x1="45" y1="36" x2="52" y2="36" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="40.5" cy="43" r="2.2" fill="#16A34A" />
        <line x1="45" y1="43" x2="52" y2="43" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="40.5" cy="50" r="2.2" fill="#CBD5E1" />
        <line x1="45" y1="50" x2="52" y2="50" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        {/* 100% Check Badge */}
        <circle cx="48" cy="25" r="7.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M44.5 25 L47 27.5 L51.5 22.8" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // 7. Online exams/tests/midterms/finals (Academic mentor + Trophy / Exam Star)
  if (normalized === 'online-exams-tests-midterms-finals') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv7Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#E6AE83" />
          </linearGradient>
          <linearGradient id="srvAv7Jacket" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv7Jacket)" />
        <polygon points="29,12 43,17.5 29,23 15,17.5" fill="#1E293B" />
        <circle cx="29" cy="28" r="10.2" fill="url(#srvAv7Skin)" />
        <circle cx="25.5" cy="28" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="28" r="1.3" fill="#0F172A" />
        <path d="M26 32.5 Q29 35 32 32.5" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Exam Shield & Star Medal */}
        <path d="M38 30 H55 V42 C55 49 46.5 55 46.5 55 C46.5 55 38 49 38 42 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.8" />
        <polygon
          points="46.5,34 48.7,39 54,39.5 50,43 51.2,48.2 46.5,45.5 41.8,48.2 43,43 39,39.5 44.3,39"
          fill="#F97316"
        />
      </svg>
    );
  }

  // 8. Online coursework (Mentor with stacked syllabus modules)
  if (normalized === 'online-coursework') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv8Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#E9AF85" />
          </linearGradient>
          <linearGradient id="srvAv8Sweater" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv8Sweater)" />
        <circle cx="29" cy="24.5" r="12.5" fill="#57534E" />
        <circle cx="29" cy="27.5" r="10" fill="url(#srvAv8Skin)" />
        <circle cx="25.5" cy="27.5" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="27.5" r="1.3" fill="#0F172A" />
        <path d="M26 32 Q29 34.4 32 32" stroke="#9A3412" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* Stacked Course Books */}
        <rect x="35" y="47" width="21" height="8" rx="2" fill="#EA580C" />
        <rect x="37" y="38" width="19" height="8" rx="2" fill="#3B82F6" />
        <rect x="36" y="29" width="20" height="8" rx="2" fill="#F59E0B" />
        <line x1="40" y1="33" x2="51" y2="33" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="41" y1="42" x2="51" y2="42" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="40" y1="51" x2="51" y2="51" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  // 9. Online Classes (Mentor on live webcam laptop)
  if (normalized === 'online-classes') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv9Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F0B184" />
          </linearGradient>
          <linearGradient id="srvAv9Top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        <path d="M12 56 C12 45, 19 41, 29 41 C39 41, 46 45, 46 56 Z" fill="url(#srvAv9Top)" />
        <circle cx="29" cy="24" r="12" fill="#312E81" />
        <circle cx="29" cy="26.5" r="9.8" fill="url(#srvAv9Skin)" />
        <circle cx="25.5" cy="26.5" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="26.5" r="1.3" fill="#0F172A" />
        <path d="M26 31 Q29 33.4 32 31" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Laptop Screen Overlay */}
        <rect x="33" y="33" width="24" height="17" rx="3" fill="#0F172A" stroke="#F97316" strokeWidth="1.5" />
        <rect x="35.5" y="35.5" width="19" height="12" rx="1.5" fill="#FFF7ED" />
        <polygon points="42.5,38.5 42.5,44.5 48,41.5" fill="#EA580C" />
        <rect x="30" y="50" width="29" height="4" rx="2" fill="#334155" />
        <circle cx="54" cy="31" r="4" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
    );
  }

  // 10. Protected exam (Mentor + Proctored Security Shield)
  if (normalized === 'protected-exam') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv10Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#E6A97A" />
          </linearGradient>
          <linearGradient id="srvAv10Suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv10Suit)" />
        <circle cx="29" cy="24" r="12" fill="#3F3F46" />
        <circle cx="29" cy="27" r="10" fill="url(#srvAv10Skin)" />
        <rect x="21.5" y="24" width="6.2" height="4.8" rx="1.5" fill="#FFFFFF" fillOpacity="0.4" stroke="#0F172A" strokeWidth="1.4" />
        <rect x="30.2" y="24" width="6.2" height="4.8" rx="1.5" fill="#FFFFFF" fillOpacity="0.4" stroke="#0F172A" strokeWidth="1.4" />
        <line x1="27.7" y1="26.4" x2="30.2" y2="26.4" stroke="#0F172A" strokeWidth="1.4" />
        <circle cx="24.6" cy="26.4" r="1.05" fill="#0F172A" />
        <circle cx="33.3" cy="26.4" r="1.05" fill="#0F172A" />
        <path d="M26 31.8 Q29 34 32 31.8" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Emerald Security Shield */}
        <path d="M37 29 L47 25 L57 29 V41 C57 48.5 47 55 47 55 C47 55 37 48.5 37 41 Z" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.8" />
        <path d="M42.5 40.5 L45.8 43.8 L52 37" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 11. Writing Services (Editorial Tutor + Manuscript & Pen)
  if (normalized === 'writing-services') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv11Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#F0B184" />
          </linearGradient>
          <linearGradient id="srvAv11Shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv11Shirt)" />
        <circle cx="29" cy="24" r="12" fill="#78350F" />
        <circle cx="29" cy="27" r="10" fill="url(#srvAv11Skin)" />
        <circle cx="25.5" cy="27" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="27" r="1.3" fill="#0F172A" />
        <path d="M26 31.8 Q29 34.4 32 31.8" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Manuscript + Orange Fountain Pen */}
        <rect x="35" y="31" width="20" height="25" rx="3" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <line x1="39" y1="38" x2="51" y2="38" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="39" y1="43" x2="51" y2="43" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="39" y1="48" x2="47" y2="48" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M44 28 L54 18 L57 21 L47 31 Z" fill="#F97316" />
        <polygon points="43,32 44,28 47,31" fill="#1E293B" />
      </svg>
    );
  }

  // 12. IT Project Assistance (Developer Mentor + Code Terminal)
  if (normalized === 'it-project-assistance') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAv12Skin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#E6AE83" />
          </linearGradient>
          <linearGradient id="srvAv12Hoodie" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="url(#srvAv12Hoodie)" />
        <circle cx="29" cy="24" r="12" fill="#0F172A" />
        <circle cx="29" cy="27" r="10" fill="url(#srvAv12Skin)" />
        <circle cx="25.5" cy="27" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="27" r="1.3" fill="#0F172A" />
        <path d="M26 31.8 Q29 34 32 31.8" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Code Terminal Window */}
        <rect x="33" y="31" width="25" height="23" rx="3.5" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.4" />
        <circle cx="37.5" cy="35.2" r="1.2" fill="#EF4444" />
        <circle cx="41.2" cy="35.2" r="1.2" fill="#F59E0B" />
        <circle cx="44.9" cy="35.2" r="1.2" fill="#22C55E" />
        <text x="45.5" y="47" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#FB923C">
          &lt;/&gt;
        </text>
      </svg>
    );
  }

  // 13. Lab Report Review (Scientist Tutor + Flask)
  if (normalized === 'lab-report') {
    return (
      <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="srvAvLabSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE2C8" />
            <stop offset="100%" stopColor="#E6AE83" />
          </linearGradient>
        </defs>
        <path d="M12 57 C12 45, 19 41, 29 41 C39 41, 45 45, 45 57 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="29" cy="24" r="12" fill="#334155" />
        <circle cx="29" cy="27" r="10" fill="url(#srvAvLabSkin)" />
        <circle cx="25.5" cy="27" r="1.3" fill="#0F172A" />
        <circle cx="32.5" cy="27" r="1.3" fill="#0F172A" />
        <path d="M26 31.8 Q29 34 32 31.8" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Beaker Flask */}
        <path d="M43 29 H50 V37 L56 51 C57 53 55.5 55 53 55 H40 C37.5 55 36 53 37 51 L43 37 Z" fill="#FFF7ED" stroke="#EA580C" strokeWidth="1.8" />
        <path d="M38.5 47 H54.5 L55.5 51 C56.2 52.5 55 54 53 54 H40 C38 54 36.8 52.5 37.5 51 Z" fill="#F97316" />
      </svg>
    );
  }

  // 14. Online PhD Classes / Online Classes Management (Senior Doctoral Professor Avatar)
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="srvAv14Skin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE2C8" />
          <stop offset="100%" stopColor="#EBB080" />
        </linearGradient>
        <linearGradient id="srvAv14Robe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C2D12" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
      </defs>
      {/* Doctoral Gown & Orange Hood */}
      <path d="M11 57 C11 45, 19 41, 30 41 C41 41, 47 45, 47 57 Z" fill="url(#srvAv14Robe)" />
      <polygon points="24,41 30,53 36,41" fill="#F97316" />
      {/* Mortarboard Cap */}
      <polygon points="29,9 46,15 29,21 12,15" fill="#1E293B" />
      <rect x="21" y="17" width="16" height="4.5" rx="1.5" fill="#0F172A" />
      <line x1="43" y1="16" x2="43" y2="25" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="43" cy="26" r="2" fill="#F59E0B" />
      {/* Face & Glasses */}
      <circle cx="29" cy="28" r="10.2" fill="url(#srvAv14Skin)" />
      <rect x="21.5" y="25" width="6.5" height="5" rx="1.6" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.4" />
      <rect x="30" y="25" width="6.5" height="5" rx="1.6" fill="#FFFFFF" fillOpacity="0.45" stroke="#0F172A" strokeWidth="1.4" />
      <line x1="28" y1="27.5" x2="30" y2="27.5" stroke="#0F172A" strokeWidth="1.4" />
      <circle cx="24.8" cy="27.5" r="1.1" fill="#0F172A" />
      <circle cx="33.2" cy="27.5" r="1.1" fill="#0F172A" />
      <path d="M26 33 Q29 35.2 32 33" stroke="#9A3412" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* PhD Diploma Scroll Badge */}
      <circle cx="48" cy="46" r="9" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
      <text x="48" y="49" textAnchor="middle" fontSize="7.2" fontWeight="800" fill="#FFFFFF">
        PhD
      </text>
    </svg>
  );
}
