export interface CountryTutoringPageData {
  slug: string;
  countryKey: string;
  countryName: string;
  url: string;
  path: string;
  flagEmoji: string;
  flagCode: string;
  seoTitle: string;
  h1: string;
  paragraphs: string[];
  pathwaysTitle?: string;
  pathways?: string[];
  subjectsTitle?: string;
  subjectsList?: string[];
  citiesMention?: string;
  citiesList: string[];
  marketNote?: string;
  closingMention?: string;
}

export const COUNTRY_ONLINE_TUTORING_PAGES: Record<string, CountryTutoringPageData> = {
  usa: {
    slug: 'usa',
    countryKey: 'usa',
    countryName: 'USA',
    url: 'https://www.university-tutors.com/online-tutoring-usa',
    path: '/online-tutoring-usa',
    flagEmoji: '🇺🇸',
    flagCode: 'us',
    seoTitle: 'Online Tutoring in USA | 1-on-1 Live Tutors for Students',
    h1: '1-on-1 Live Online Tutoring in the USA',
    paragraphs: [
      'University Tutors provides personalized 1-on-1 live online tutoring services for students across the United States. Our experienced tutors help school students, college learners, and university students achieve academic success through customized lessons designed around their individual learning goals.',
      'Whether students need help with mathematics, science, English, programming, business subjects, homework support, or exam preparation, our online tutors provide flexible and interactive learning experiences from anywhere in the USA.'
    ],
    pathwaysTitle: 'Our tutoring programs support students following different educational pathways, including:',
    pathways: [
      'Elementary and Middle School Education',
      'High School Courses',
      'Advanced Placement (AP) Subjects',
      'SAT and ACT Preparation',
      'College and University Subjects',
      'STEM Learning Support'
    ],
    citiesMention: 'Students across major US cities including New York, Los Angeles, Chicago, Boston, Houston, Seattle, and San Francisco can connect with expert tutors through live online sessions.',
    citiesList: [
      'New York', 'Los Angeles', 'Chicago', 'Boston', 'Houston', 
      'Seattle', 'San Francisco', 'Atlanta', 'Dallas', 'Phoenix', 
      'San Diego', 'Miami', 'Philadelphia', 'Austin', 'Denver'
    ]
  },
  canada: {
    slug: 'canada',
    countryKey: 'canada',
    countryName: 'Canada',
    url: 'https://www.university-tutors.com/online-tutoring-canada',
    path: '/online-tutoring-canada',
    flagEmoji: '🇨🇦',
    flagCode: 'ca',
    seoTitle: 'Online Tutoring in Canada | Expert Private Tutors for Students',
    h1: 'Personalized Online Tutoring Services in Canada',
    paragraphs: [
      'University Tutors offers high-quality 1-on-1 online tutoring in Canada for students who want personalized academic support and better learning outcomes.',
      'Our tutors help students understand challenging concepts, improve grades, prepare for examinations, and develop stronger academic skills through interactive virtual lessons.'
    ],
    pathwaysTitle: 'We support students following Canadian education systems, including:',
    pathways: [
      'Ontario Curriculum',
      'British Columbia Curriculum',
      'Alberta Curriculum',
      'Canadian High School Programs',
      'College and University Courses'
    ],
    subjectsTitle: 'Our online tutors provide support in:',
    subjectsList: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'Computer Science',
      'Engineering',
      'Business Studies'
    ],
    citiesMention: 'Students from Toronto, Vancouver, Calgary, Ottawa, Montreal, and other Canadian cities can access expert tutoring without geographical limitations.',
    citiesList: [
      'Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Montreal', 
      'Edmonton', 'Quebec City', 'Winnipeg', 'Halifax', 'Victoria'
    ]
  },
  uk: {
    slug: 'uk',
    countryKey: 'uk',
    countryName: 'UK',
    url: 'https://www.university-tutors.com/online-tutoring-uk',
    path: '/online-tutoring-uk',
    flagEmoji: '🇬🇧',
    flagCode: 'gb',
    seoTitle: 'Online Tutors UK | GCSE, A-Level & University Tutoring',
    h1: '1-on-1 Online Tutoring Services in the UK',
    paragraphs: [
      'University Tutors provides personalized online tutoring for students throughout the United Kingdom. Our expert tutors help learners improve academic performance through structured lessons designed according to UK educational requirements.'
    ],
    pathwaysTitle: 'We support students preparing for:',
    pathways: [
      'GCSE Examinations',
      'A-Level Courses',
      'IB Programs',
      'University Entrance Preparation',
      'Undergraduate and Postgraduate Subjects'
    ],
    subjectsTitle: 'Our tutors specialize in:',
    subjectsList: [
      'Mathematics Tutoring',
      'Science Tutoring',
      'English Language Support',
      'Computer Science',
      'Engineering Subjects',
      'Business and Economics'
    ],
    citiesMention: 'Students from London, Manchester, Birmingham, Leeds, Glasgow, and other UK cities can receive flexible online tutoring from qualified instructors.',
    marketNote: 'The UK has a mature tutoring market with strong demand for GCSE, A-Level, admissions, and STEM support.',
    citiesList: [
      'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 
      'Edinburgh', 'Bristol', 'Oxford', 'Cambridge', 'Liverpool', 'Newcastle'
    ]
  },
  uae: {
    slug: 'uae',
    countryKey: 'uae',
    countryName: 'UAE',
    url: 'https://www.university-tutors.com/online-tutoring-uae',
    path: '/online-tutoring-uae',
    flagEmoji: '🇦🇪',
    flagCode: 'ae',
    seoTitle: 'Online Tutoring UAE | Dubai & Abu Dhabi Private Tutors',
    h1: 'Expert Online Tutors in UAE',
    paragraphs: [
      'University Tutors provides professional 1-on-1 online tutoring services for students in the UAE, helping learners achieve academic excellence through personalized instruction.'
    ],
    pathwaysTitle: 'We support students studying different international education systems, including:',
    pathways: [
      'British Curriculum',
      'American Curriculum',
      'IB Curriculum',
      'UAE School Curriculum'
    ],
    subjectsTitle: 'Our tutors help students with:',
    subjectsList: [
      'Mathematics',
      'Science',
      'English',
      'Coding',
      'University Subjects',
      'Exam Preparation'
    ],
    citiesMention: 'Students in Dubai, Abu Dhabi, Sharjah, and across the UAE can access expert tutors through live online classes designed around their schedule and academic goals.',
    citiesList: [
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain', 'Fujairah'
    ]
  },
  ireland: {
    slug: 'ireland',
    countryKey: 'ireland',
    countryName: 'Ireland',
    url: 'https://www.university-tutors.com/online-tutoring-ireland',
    path: '/online-tutoring-ireland',
    flagEmoji: '🇮🇪',
    flagCode: 'ie',
    seoTitle: 'Online Tutoring Ireland | Private Tutors for Students',
    h1: 'Personalized Online Tutoring in Ireland',
    paragraphs: [
      'University Tutors connects students in Ireland with experienced online tutors who provide personalized academic guidance and subject support.'
    ],
    pathwaysTitle: 'Our tutoring services help students prepare for:',
    pathways: [
      'Junior Cycle Examinations',
      'Leaving Certificate',
      'University Courses',
      'Professional Learning Goals'
    ],
    subjectsTitle: 'We offer support in:',
    subjectsList: [
      'Mathematics',
      'Science',
      'English',
      'Computer Science',
      'Engineering',
      'Business Subjects'
    ],
    closingMention: 'Students can learn from qualified tutors through flexible online sessions designed to improve understanding and confidence.',
    citiesList: [
      'Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Drogheda', 'Dundalk', 'Bray'
    ]
  },
  australia: {
    slug: 'australia',
    countryKey: 'australia',
    countryName: 'Australia',
    url: 'https://www.university-tutors.com/online-tutoring-australia',
    path: '/online-tutoring-australia',
    flagEmoji: '🇦🇺',
    flagCode: 'au',
    seoTitle: 'Online Tutoring Australia | Expert Tutors for School & University',
    h1: 'Live Online Tutoring Services in Australia',
    paragraphs: [
      'University Tutors provides personalized online tutoring services for Australian students seeking academic support, exam preparation, and subject improvement.'
    ],
    pathwaysTitle: 'Our tutors support students studying:',
    pathways: [
      'Australian Curriculum',
      'ATAR Preparation',
      'High School Subjects',
      'University Courses'
    ],
    subjectsTitle: 'Subjects include:',
    subjectsList: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'Programming',
      'Engineering'
    ],
    citiesMention: 'Students from Sydney, Melbourne, Brisbane, Perth, Adelaide, and other Australian cities can access expert tutors online.',
    citiesList: [
      'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 
      'Gold Coast', 'Canberra', 'Hobart', 'Darwin', 'Newcastle'
    ]
  },
  'new-zealand': {
    slug: 'new-zealand',
    countryKey: 'new-zealand',
    countryName: 'New Zealand',
    url: 'https://www.university-tutors.com/online-tutoring-new-zealand',
    path: '/online-tutoring-new-zealand',
    flagEmoji: '🇳🇿',
    flagCode: 'nz',
    seoTitle: 'Online Tutoring New Zealand | Private Online Tutors',
    h1: '1-on-1 Online Tutors in New Zealand',
    paragraphs: [
      'University Tutors provides personalized online tutoring for students across New Zealand. Our tutors help learners strengthen academic understanding, prepare for exams, and achieve their educational goals.'
    ],
    pathwaysTitle: 'We support:',
    pathways: [
      'Primary Students',
      'Secondary School Students',
      'University Students'
    ],
    subjectsTitle: 'Subjects:',
    subjectsList: [
      'Mathematics',
      'Science',
      'English',
      'Technology',
      'University Courses'
    ],
    citiesMention: 'Students from Auckland, Wellington, Christchurch, Hamilton, and other regions can access quality tutoring from anywhere.',
    citiesList: [
      'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Napier'
    ]
  },
  singapore: {
    slug: 'singapore',
    countryKey: 'singapore',
    countryName: 'Singapore',
    url: 'https://www.university-tutors.com/online-tutoring-singapore',
    path: '/online-tutoring-singapore',
    flagEmoji: '🇸🇬',
    flagCode: 'sg',
    seoTitle: 'Online Tutoring Singapore | Expert Private Tutors',
    h1: 'Personalized Online Tutoring Services in Singapore',
    paragraphs: [
      'University Tutors provides premium 1-on-1 online tutoring in Singapore for students seeking personalized academic support.'
    ],
    subjectsTitle: 'Our tutors help students improve performance in:',
    subjectsList: [
      'Mathematics',
      'Science',
      'English',
      'Computing',
      'Business Subjects',
      'University Courses'
    ],
    pathwaysTitle: 'We support students following:',
    pathways: [
      'Singapore Curriculum',
      'International School Curriculum',
      'IB Programs',
      'Cambridge Programs'
    ],
    closingMention: 'Students can connect with experienced tutors through flexible live online classes designed around their academic requirements.',
    citiesList: [
      'Singapore Central', 'Jurong', 'Tampines', 'Woodlands', 'Bukit Timah', 'Novena', 'Bedok', 'Ang Mo Kio'
    ]
  }
};

export const ALL_COUNTRY_KEYS = [
  'usa',
  'canada',
  'uk',
  'uae',
  'ireland',
  'australia',
  'new-zealand',
  'singapore'
];
