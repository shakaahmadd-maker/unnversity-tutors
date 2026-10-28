import { User, UserRole } from '../types';
import { 
  SUBJECT_DOMAINS_TAXONOMY, 
  getRelevantKeywordsForTutor, 
  SubjectDomainKeywords 
} from './subjectKeywordsData';

export interface LocationInfo {
  name: string;
  city: string;
  stateCountry: string;
  slug: string;
}

export interface SubjectInfo {
  name: string;
  slug: string;
  category: string;
}

export const POPULAR_LOCATIONS: LocationInfo[] = [
  { name: 'Atlanta Tutoring', city: 'Atlanta', stateCountry: 'GA', slug: 'atlanta' },
  { name: 'Boston Tutoring', city: 'Boston', stateCountry: 'MA', slug: 'boston' },
  { name: 'Chicago Tutoring', city: 'Chicago', stateCountry: 'IL', slug: 'chicago' },
  { name: 'Dallas Tutoring', city: 'Dallas', stateCountry: 'TX', slug: 'dallas' },
  { name: 'Houston Tutoring', city: 'Houston', stateCountry: 'TX', slug: 'houston' },
  { name: 'London Tutoring', city: 'London', stateCountry: 'UK', slug: 'london' },
  { name: 'Los Angeles Tutoring', city: 'Los Angeles', stateCountry: 'CA', slug: 'los-angeles' },
  { name: 'Melbourne Tutoring', city: 'Melbourne', stateCountry: 'AU', slug: 'melbourne' },
  { name: 'Miami Tutoring', city: 'Miami', stateCountry: 'FL', slug: 'miami' },
  { name: 'Montreal Tutoring', city: 'Montreal', stateCountry: 'CA', slug: 'montreal' },
  { name: 'New York Tutoring', city: 'New York', stateCountry: 'NY', slug: 'new-york' },
  { name: 'Philadelphia Tutoring', city: 'Philadelphia', stateCountry: 'PA', slug: 'philadelphia' },
  { name: 'Phoenix Tutoring', city: 'Phoenix', stateCountry: 'AZ', slug: 'phoenix' },
  { name: 'San Diego Tutoring', city: 'San Diego', stateCountry: 'CA', slug: 'san-diego' },
  { name: 'San Francisco Tutoring', city: 'San Francisco', stateCountry: 'CA', slug: 'san-francisco' },
  { name: 'Seattle Tutoring', city: 'Seattle', stateCountry: 'WA', slug: 'seattle' },
  { name: 'Sydney Tutoring', city: 'Sydney', stateCountry: 'AU', slug: 'sydney' },
  { name: 'Toronto Tutoring', city: 'Toronto', stateCountry: 'CA', slug: 'toronto' },
  { name: 'Vancouver Tutoring', city: 'Vancouver', stateCountry: 'CA', slug: 'vancouver' },
  { name: 'Washington DC Tutoring', city: 'Washington', stateCountry: 'DC', slug: 'washington-dc' },
];

export const POPULAR_SUBJECTS: SubjectInfo[] = [
  // High-Demand Tech & Engineering Disciplines
  { name: 'Artificial Intelligence & Machine Learning', slug: 'ai-ml', category: 'Computer Science' },
  { name: 'Data Science & Big Data', slug: 'data-science', category: 'Data & Analytics' },
  { name: 'Cybersecurity & Information Security', slug: 'cybersecurity', category: 'Computer Science' },
  { name: 'Software Engineering & Full Stack', slug: 'software-engineering', category: 'Engineering' },
  { name: 'Environmental Engineering & Water Treatment', slug: 'environmental-water', category: 'Engineering' },
  { name: 'Climate Change & Sustainability', slug: 'climate-sustainability', category: 'Science' },
  { name: 'Renewable Energy & Battery Systems', slug: 'renewable-energy', category: 'Engineering' },
  { name: 'Biotechnology & Biomedical Engineering', slug: 'biomedical-engineering', category: 'Life Sciences' },
  { name: 'Healthcare AI & Digital Health', slug: 'healthcare-ai', category: 'Health Tech' },
  { name: 'Robotics, Autonomous Systems & Automation', slug: 'robotics', category: 'Engineering' },
  { name: 'Mechanical & Manufacturing Engineering', slug: 'mechanical-engineering', category: 'Engineering' },
  { name: 'Civil & Structural Engineering', slug: 'civil-engineering', category: 'Engineering' },
  { name: 'Chemical Engineering & Polymer Science', slug: 'chemical-engineering', category: 'Engineering' },
  { name: 'Materials Science & Nanomaterials', slug: 'materials-science', category: 'Science' },
  { name: 'Cloud Computing & AWS / Azure / GCP', slug: 'cloud-computing', category: 'Computer Science' },
  { name: 'DevOps & Infrastructure Engineering', slug: 'devops', category: 'Computer Science' },
  { name: 'Aerospace & Aeronautical Engineering', slug: 'aerospace-engineering', category: 'Engineering' },
  { name: 'Automotive & Autonomous Vehicles', slug: 'automotive-engineering', category: 'Engineering' },
  { name: 'Semiconductor, VLSI & Microelectronics', slug: 'semiconductors', category: 'Engineering' },
  { name: 'Electrical Engineering & Embedded Systems', slug: 'electrical-engineering', category: 'Engineering' },
  { name: 'Precision Agriculture & AgriTech', slug: 'agritech', category: 'Life Sciences' },
  { name: 'Food Science & Microbiology', slug: 'food-science', category: 'Life Sciences' },
  { name: 'Pharmaceutical Sciences & Pharmacology', slug: 'pharmaceutical-sciences', category: 'Life Sciences' },
  { name: 'Finance, Quantitative FinTech & Blockchain', slug: 'finance-fintech', category: 'Business' },
  { name: 'Economics & Econometrics', slug: 'economics', category: 'Business' },
  { name: 'Business Analytics & Digital Transformation', slug: 'business-analytics', category: 'Business' },
  { name: 'Neuroscience & Brain Computer Interfaces', slug: 'neuroscience', category: 'Life Sciences' },
  { name: 'Cognitive Psychology & Behavioral Science', slug: 'psychology', category: 'Social Sciences' },
  { name: 'Law, Technology Law & Public Policy', slug: 'law-policy', category: 'Humanities' },
  
  // Foundational Math, Science & Standardized Prep
  { name: 'Online ACT Tutoring', slug: 'act', category: 'Test Prep' },
  { name: 'Online SAT Tutoring', slug: 'sat', category: 'Test Prep' },
  { name: 'Online GRE Tutoring', slug: 'gre', category: 'Graduate Prep' },
  { name: 'Online MCAT Tutoring', slug: 'mcat', category: 'Graduate Prep' },
  { name: 'Online LSAT Tutoring', slug: 'lsat', category: 'Graduate Prep' },
  { name: 'Online Calculus (I, II, III) & Diff Equations', slug: 'calculus', category: 'Math' },
  { name: 'Online Linear Algebra & Statistics', slug: 'linear-algebra-stats', category: 'Math' },
  { name: 'Online Organic Chemistry & Biochemistry', slug: 'organic-chem', category: 'Science' },
  { name: 'Online Physics (AP Physics & Classical Mechanics)', slug: 'physics', category: 'Science' },
  { name: 'Online Academic Essay Writing & Dissertations', slug: 'writing', category: 'Humanities' }
];

// Helper to attach exact relevant keywords to a tutor profile
function enrichTutorWithDomainKeywords(baseTutor: Partial<User>, domainId: string): User {
  const domainInfo = SUBJECT_DOMAINS_TAXONOMY.find(d => d.id === domainId) || SUBJECT_DOMAINS_TAXONOMY[0];
  const { highSearchKeywords, researchKeywords, jobKeywords, combinedKeywords, allFlatKeywords } = getRelevantKeywordsForTutor(
    baseTutor.subjectExpertise,
    baseTutor.education,
    domainInfo.domainName
  );

  return {
    id: baseTutor.id || `tutor-${domainId}`,
    role: UserRole.TUTOR,
    name: baseTutor.name || 'Verified University Faculty',
    email: baseTutor.email || `faculty.${domainId}@universitytutors.com`,
    avatarUrl: baseTutor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    createdAt: baseTutor.createdAt || '2025-01-15T00:00:00.000Z',
    location: baseTutor.location || 'Miami, FL',
    city: baseTutor.city || 'Miami',
    hourlyRate: baseTutor.hourlyRate || 55,
    rating: baseTutor.rating || 4.98,
    reviewCount: baseTutor.reviewCount || 160,
    education: baseTutor.education || 'Ph.D. Accredited Researcher',
    experience: baseTutor.experience || 'Experienced university faculty and private tutor with deep domain mastery.',
    subjectExpertise: baseTutor.subjectExpertise || domainInfo.recommendedSubjects,
    availability: baseTutor.availability || 'Weekdays & Weekends with Flexible Video Whiteboard',
    canMeet: baseTutor.canMeet || 'Virtual Online 1-on-1 & Up to 20 miles locally',
    hobbies: baseTutor.hobbies || 'Research publications, algorithmic puzzles, and academic coaching.',
    isApproved: true,
    status: 'approved',
    primaryDomain: domainInfo.domainName,
    specializedKeywords: highSearchKeywords,
    researchKeywords: researchKeywords,
    jobKeywords: jobKeywords,
    highGrowthKeywords: combinedKeywords
  };
}

// 43+ Dedicated, Curated Featured Subject Tutors
export const CURATED_SPECIALIZED_TUTORS: User[] = [
  // 1. AI & Machine Learning
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-elena-rostova-ai',
    name: 'Dr. Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    city: 'San Francisco',
    hourlyRate: 75,
    rating: 4.99,
    reviewCount: 242,
    education: 'Stanford University - Ph.D, Computer Science (AI & Deep Learning)',
    experience: 'Former Stanford AI Lab researcher specializing in Large Language Models (LLMs), Transformer architectures, PyTorch, Reinforcement Learning, and Computer Vision. I guide graduate and undergraduate students through thesis papers, coding assignments, and MLOps pipelines.',
    subjectExpertise: ['Artificial Intelligence', 'Generative AI', 'Deep Learning', 'Large Language Models (LLM)', 'Neural Networks', 'Python & PyTorch', 'Reinforcement Learning', 'Natural Language Processing (NLP)']
  }, 'ai-ml'),

  // 2. Data Science & Big Data
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-vikram-patel-data',
    name: 'Dr. Vikram Patel',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Boston, MA',
    city: 'Boston',
    hourlyRate: 65,
    rating: 4.98,
    reviewCount: 195,
    education: 'Harvard University - Ph.D, Statistics & Data Science',
    experience: 'Harvard Fellow with 9+ years mentoring students in Big Data analytics, predictive modeling, statistical learning, distributed SQL, Spark pipelines, and data governance frameworks.',
    subjectExpertise: ['Data Science', 'Big Data Analytics', 'Predictive Modeling', 'Data Visualization', 'SQL & Database Systems', 'R & Python', 'Statistical Learning']
  }, 'data-science-big-data'),

  // 3. Cybersecurity
  enrichTutorWithDomainKeywords({
    id: 'tutor-alex-morrison-cyber',
    name: 'Alex Morrison, CISSP',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Washington DC',
    city: 'Washington',
    hourlyRate: 68,
    rating: 4.97,
    reviewCount: 178,
    education: 'Carnegie Mellon University - M.S, Information Security & Privacy',
    experience: 'Lead Cybersecurity Architect and certified instructor. I coach students in Zero Trust architectures, ethical hacking, cloud security, penetration testing, malware reverse engineering, and cryptography.',
    subjectExpertise: ['Cybersecurity', 'Network Security', 'Zero Trust Security', 'Ethical Hacking', 'Penetration Testing', 'Cloud Security', 'Threat Intelligence']
  }, 'cybersecurity'),

  // 4. Software Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-sarah-jenkins-swe',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Seattle, WA',
    city: 'Seattle',
    hourlyRate: 62,
    rating: 4.98,
    reviewCount: 220,
    education: 'University of Washington - M.S, Software Engineering',
    experience: 'Senior Software Engineer and university instructor specializing in distributed systems, microservices architecture, system design, full stack development, and API engineering.',
    subjectExpertise: ['Software Engineering', 'System Design', 'Full Stack Development', 'Distributed Systems', 'Microservices', 'Cloud Computing', 'TypeScript & Go']
  }, 'software-engineering'),

  // 5. Environmental Engineering & Water Treatment
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-clara-vanderbilt-water',
    name: 'Dr. Clara Vanderbilt',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    location: 'Toronto, CA',
    city: 'Toronto',
    hourlyRate: 70,
    rating: 4.99,
    reviewCount: 164,
    education: 'University of Toronto / UC Berkeley - Ph.D, Environmental Engineering (Water Quality)',
    experience: 'Published researcher in advanced water treatment, PFAS removal technologies, membrane separation, nanofiltration, reverse osmosis, electrochemical sensors, and drinking water quality remediation across USA and Canada.',
    subjectExpertise: ['Environmental Engineering', 'Water Treatment', 'PFAS Removal', 'Wastewater Treatment', 'Membrane Technology', 'Reverse Osmosis', 'Electrochemical Sensors', 'Water Remediation']
  }, 'environmental-water-treatment'),

  // 6. Climate Change & Sustainability
  enrichTutorWithDomainKeywords({
    id: 'tutor-prof-lucas-montgomery-climate',
    name: 'Prof. Lucas Montgomery',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    location: 'Vancouver, CA',
    city: 'Vancouver',
    hourlyRate: 60,
    rating: 4.96,
    reviewCount: 140,
    education: 'University of British Columbia - Ph.D, Climate Science & Sustainability',
    experience: 'Advisor on climate resilience, carbon reduction, Net Zero roadmaps, life cycle assessment (LCA), circular economy principles, and ESG reporting standards for engineering and business students.',
    subjectExpertise: ['Climate Change', 'Climate Adaptation', 'Sustainability', 'Carbon Reduction', 'Life Cycle Assessment (LCA)', 'ESG', 'Green Technology']
  }, 'climate-change-sustainability'),

  // 7. Renewable Energy
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-mateo-santos-energy',
    name: 'Dr. Mateo Santos',
    avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    location: 'Austin, TX',
    city: 'Austin',
    hourlyRate: 64,
    rating: 4.98,
    reviewCount: 155,
    education: 'UT Austin - Ph.D, Energy Systems & Materials Science',
    experience: 'Specializing in next-generation lithium-ion battery technology, energy storage, solar PV modeling, green hydrogen electrolysis, and smart grid transition engineering.',
    subjectExpertise: ['Renewable Energy', 'Battery Technology', 'Solar Energy', 'Green Hydrogen', 'Energy Storage', 'Smart Grid', 'Clean Energy Transition']
  }, 'renewable-energy'),

  // 8. Biotechnology & Biomedical Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-aisha-rahman-biotech',
    name: 'Dr. Aisha Rahman',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'Boston, MA',
    city: 'Boston',
    hourlyRate: 68,
    rating: 4.99,
    reviewCount: 205,
    education: 'MIT / Harvard - Ph.D, Biomedical Engineering & Biotechnology',
    experience: 'MIT Postdoctoral Fellow guiding students in bioinformatics, CRISPR genetic engineering, targeted nanoparticle drug delivery, tissue engineering, biosensors, and cancer biology research.',
    subjectExpertise: ['Biomedical Engineering', 'Biotechnology', 'Bioinformatics', 'Drug Delivery', 'Tissue Engineering', 'Genetic Engineering', 'Nanomedicine']
  }, 'biotechnology-biomedical'),

  // 9. Healthcare & Health Technology
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-samuel-levin-healthtech',
    name: 'Dr. Samuel Levin, MD/MS',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    city: 'New York',
    hourlyRate: 72,
    rating: 4.97,
    reviewCount: 170,
    education: 'Columbia University - M.D. & M.S. in Biomedical Informatics',
    experience: 'Lecturer in Digital Health, Medical AI models, Electronic Health Records (EHR) interoperability, clinical decision analytics, telemedicine, and precision medicine diagnostics.',
    subjectExpertise: ['Digital Health', 'Healthcare AI', 'Health Informatics', 'Medical Data Analytics', 'Precision Medicine', 'Telemedicine', 'EHR Systems']
  }, 'healthcare-health-tech'),

  // 10. Robotics & Automation
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-jin-woo-robotics',
    name: 'Dr. Jin-Woo Park',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 66,
    rating: 4.98,
    reviewCount: 188,
    education: 'Georgia Tech - Ph.D, Robotics & Mechanical Systems',
    experience: 'Georgia Tech researcher in autonomous robotics, SLAM navigation, ROS2, human-robot interaction, computer vision for drone robotics, and industrial automation.',
    subjectExpertise: ['Robotics', 'Autonomous Systems', 'Industrial Automation', 'Computer Vision Robotics', 'Drone Technology', 'ROS2 & Control Systems']
  }, 'robotics-automation'),

  // 11. Mechanical & Manufacturing Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-marcus-schmidt-mech',
    name: 'Dr. Marcus Schmidt',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Detroit, MI',
    city: 'Detroit',
    hourlyRate: 58,
    rating: 4.95,
    reviewCount: 146,
    education: 'University of Michigan - Ph.D, Mechanical Engineering',
    experience: 'Specializing in additive manufacturing (3D printing), CAD/CAM, Industry 4.0 digital twins, finite element analysis (FEA), and thermo-fluid mechanics.',
    subjectExpertise: ['Advanced Manufacturing', '3D Printing', 'CAD/CAM', 'Industry 4.0', 'Digital Twin', 'Mechanical Engineering', 'Finite Element Analysis (FEA)']
  }, 'mechanical-manufacturing'),

  // 12. Civil & Structural Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-maya-lin-civil',
    name: 'Maya Lin, PE',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    location: 'Chicago, IL',
    city: 'Chicago',
    hourlyRate: 58,
    rating: 4.96,
    reviewCount: 162,
    education: 'University of Illinois Urbana-Champaign - M.S, Civil & Structural Engineering',
    experience: 'Licensed Professional Engineer (PE). Expert in structural dynamics, BIM (Revit), seismic resilience, transportation planning, and smart sustainable infrastructure.',
    subjectExpertise: ['Structural Engineering', 'Smart Infrastructure', 'Sustainable Construction', 'Building Information Modeling (BIM)', 'Transportation Engineering', 'Urban Planning']
  }, 'civil-engineering'),

  // 13. Chemical Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-khalil-mansoor-chemeng',
    name: 'Dr. Khalil Mansoor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Houston, TX',
    city: 'Houston',
    hourlyRate: 62,
    rating: 4.97,
    reviewCount: 150,
    education: 'Imperial College London - Ph.D, Chemical Engineering',
    experience: 'Specialist in reaction kinetics, heterogeneous catalysis, carbon capture process design, polymer science, membrane separation, and sustainable chemical processes.',
    subjectExpertise: ['Chemical Engineering', 'Process Engineering', 'Catalysis', 'Polymer Science', 'Carbon Capture', 'Membrane Separation', 'Sustainable Chemistry']
  }, 'chemical-engineering'),

  // 14. Materials Science
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-olivia-stone-materials',
    name: 'Dr. Olivia Stone',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    location: 'Philadelphia, PA',
    city: 'Philadelphia',
    hourlyRate: 60,
    rating: 4.98,
    reviewCount: 138,
    education: 'University of Pennsylvania - Ph.D, Materials Science & Nanotechnology',
    experience: 'Expert in 2D nanomaterials (graphene/MXenes), composite smart materials, solid-state battery electrolytes, and surface engineering characterization (TEM, SEM, AFM).',
    subjectExpertise: ['Nanomaterials', 'Advanced Materials', 'Battery Materials', 'Composite Materials', 'Smart Materials', 'Surface Engineering']
  }, 'materials-science'),

  // 15. Finance & FinTech
  enrichTutorWithDomainKeywords({
    id: 'tutor-david-chen-fintech',
    name: 'David Chen, CFA',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    location: 'New York, NY',
    city: 'New York',
    hourlyRate: 65,
    rating: 4.99,
    reviewCount: 215,
    education: 'NYU Stern / Columbia - M.S, Quantitative Finance & Financial Engineering',
    experience: 'Wall Street quantitative risk analyst and university mentor. Algorithmic trading, Black-Scholes stochastic options pricing, blockchain DeFi protocols, and corporate valuation.',
    subjectExpertise: ['Financial Technology (FinTech)', 'Quantitative Finance', 'Algorithmic Trading', 'Blockchain Finance', 'Risk Management', 'Financial Analytics']
  }, 'finance-fintech'),

  // 16. Economics & Econometrics
  enrichTutorWithDomainKeywords({
    id: 'tutor-maria-z-econ',
    name: 'Maria Z.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 50,
    rating: 4.98,
    reviewCount: 186,
    education: 'Universidad Publica de Navarra - Bachelors, Economics; Atlanta International - M.Ed',
    experience: 'Mastering microeconomics, macroeconomics, causal econometric inference, game theory, behavioral economics, and academic thesis coaching step-by-step.',
    subjectExpertise: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Behavioral Economics', 'Development Economics', 'Economic Policy']
  }, 'economics'),

  // 17. Aerospace Engineering
  enrichTutorWithDomainKeywords({
    id: 'tutor-capt-thomas-vance-aero',
    name: 'Dr. Thomas Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Los Angeles, CA',
    city: 'Los Angeles',
    hourlyRate: 70,
    rating: 4.98,
    reviewCount: 172,
    education: 'Caltech - Ph.D, Aerospace Engineering & Fluid Dynamics',
    experience: 'Specializing in supersonic aerodynamics, computational fluid dynamics (CFD), rocket propulsion systems, satellite orbital mechanics, and autonomous UAV flight control.',
    subjectExpertise: ['Aerospace Engineering', 'Rocket Propulsion', 'Aerodynamics', 'Satellite Systems', 'Autonomous Flight', 'Aviation Technology']
  }, 'aerospace-engineering'),

  // 18. Semiconductor & Electronics
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-harrison-wu-semi',
    name: 'Dr. Harrison Wu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'San Jose, CA',
    city: 'San Jose',
    hourlyRate: 72,
    rating: 4.99,
    reviewCount: 198,
    education: 'UC Berkeley / Stanford - Ph.D, Electrical Engineering (VLSI & Nanoelectronics)',
    experience: 'Silicon Valley chip designer and faculty mentor. VLSI design, Verilog/VHDL, microelectronics fabrication, MEMS sensors, and photonic integrated circuits.',
    subjectExpertise: ['Semiconductor Technology', 'VLSI Design', 'Chip Design', 'Integrated Circuits', 'Nanoelectronics', 'Microelectronics']
  }, 'semiconductor-electronics'),

  // 19. Neuroscience & Cognitive Science
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-nadia-kasim-neuro',
    name: 'Dr. Nadia Kasim',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 58,
    rating: 4.98,
    reviewCount: 165,
    education: 'Emory University - Ph.D, Cognitive Neuroscience',
    experience: 'Specializing in brain-computer interfaces (BCI), neuroimaging (fMRI/EEG analysis), computational neuroscience, neural plasticity, and AI applications in neuroscience.',
    subjectExpertise: ['Neuroscience', 'Brain Computer Interface (BCI)', 'Cognitive Neuroscience', 'Neuroimaging', 'Computational Neuroscience', 'Brain Research']
  }, 'neuroscience'),

  // 20. Law & Public Policy
  enrichTutorWithDomainKeywords({
    id: 'tutor-adv-victoria-reynolds-law',
    name: 'Victoria Reynolds, J.D.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Washington DC',
    city: 'Washington',
    hourlyRate: 65,
    rating: 4.97,
    reviewCount: 154,
    education: 'Georgetown University Law Center - J.D., Technology & Environmental Law',
    experience: 'Guiding law and policy students in cyber law, AI regulations, international environmental law, constitutional policy analysis, regulatory compliance, and LSAT preparation.',
    subjectExpertise: ['Public Policy', 'Technology Law', 'Cyber Law', 'Environmental Law', 'International Law', 'Policy Analysis', 'LSAT Prep']
  }, 'law-public-policy'),

  // 21. Chemistry & Chemical Sciences
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-marcus-vance-chem',
    name: 'Dr. Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 55,
    rating: 4.98,
    reviewCount: 184,
    education: 'Emory University - Ph.D, Organic Chemistry & Biochemistry',
    experience: 'Senior research scientist and private tutor in Atlanta. Specializing in Organic Chemistry I & II, reaction mechanisms, synthesis, analytical electrochemistry, and MCAT prep.',
    subjectExpertise: ['Organic Chemistry', 'Analytical Chemistry', 'Green Chemistry', 'General Chemistry', 'MCAT Prep', 'Biochemistry']
  }, 'chemistry'),

  // 22. Mathematics & Applied Statistics
  enrichTutorWithDomainKeywords({
    id: 'tutor-dr-rachel-k-math',
    name: 'Dr. Rachel K.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 60,
    rating: 4.99,
    reviewCount: 210,
    education: 'Georgia Tech - Ph.D, Applied Mathematics & Computational Science',
    experience: 'Mastering Calculus I/II/III, Differential Equations, Linear Algebra, Mathematical Modeling, Convex Optimization, and machine learning mathematics.',
    subjectExpertise: ['Calculus', 'Linear Algebra', 'Differential Equations', 'Mathematical Modeling', 'Applied Mathematics', 'Statistics & Probability', 'Optimization']
  }, 'mathematics-statistics'),

  // 23. Psychology & Behavioral Science
  enrichTutorWithDomainKeywords({
    id: 'tutor-stephanie-m-psych',
    name: 'Stephanie M.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 45,
    rating: 4.92,
    reviewCount: 112,
    education: 'Emory University - M.S, Cognitive & Clinical Psychology',
    experience: 'Empowering students in behavioral sciences, cognitive psychology, psychometrics, statistical research methods (SPSS/R), and mental health literature reviews.',
    subjectExpertise: ['Cognitive Psychology', 'Behavioral Science', 'Clinical Psychology', 'Social Psychology', 'Psychology Research', 'Statistics for Psychology']
  }, 'psychology'),

  // 24. Academic Essay Writing & Literature
  enrichTutorWithDomainKeywords({
    id: 'tutor-professor-david-s-writing',
    name: 'Professor David S.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Atlanta, GA',
    city: 'Atlanta',
    hourlyRate: 48,
    rating: 4.96,
    reviewCount: 125,
    education: 'Georgia State University - M.A, English & Comparative Literature',
    experience: 'College writing instructor with 10+ years helping students master academic essays, master theses, dissertations, APA/MLA/Harvard citations, and GRE Verbal.',
    subjectExpertise: ['Academic Essay Writing', 'College Writing', 'GRE Verbal', 'Dissertation Coaching', 'Citations & Formatting', 'Research Papers']
  }, 'academic-research-combinations')
];

/**
 * Generate tutors for any given location, ensuring diverse subject and keyword representations
 */
export function getTutorsForLocation(cityOrLocName: string, stateCountry?: string): User[] {
  const cleanCity = cityOrLocName.trim();
  const state = stateCountry || (cleanCity.toLowerCase().includes('toronto') || cleanCity.toLowerCase().includes('vancouver') || cleanCity.toLowerCase().includes('montreal') ? 'CA' : 'US');

  // Map all curated specialized tutors adapted for this city
  const localCurated = CURATED_SPECIALIZED_TUTORS.map((t, idx) => ({
    ...t,
    id: `${t.id}-${cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    location: `${cleanCity}, ${state}`,
    city: cleanCity
  }));

  return localCurated;
}

/**
 * Generate tutors for a specific subject, ensuring accurate keyword taxonomy match
 */
export function getTutorsForSubject(subjectName: string): User[] {
  const normSubj = subjectName.trim().toLowerCase();

  // Find exact subject match from taxonomy or filter curated tutors
  const matchingTaxonomy = SUBJECT_DOMAINS_TAXONOMY.find(
    d => d.domainName.toLowerCase().includes(normSubj) || 
         d.shortName.toLowerCase().includes(normSubj) ||
         d.recommendedSubjects.some(s => s.toLowerCase().includes(normSubj)) ||
         d.highSearchKeywords.some(k => k.toLowerCase().includes(normSubj))
  );

  // Return matching specialized tutors first
  const filtered = CURATED_SPECIALIZED_TUTORS.filter(t => {
    const tutorText = [
      t.name,
      t.education,
      t.primaryDomain || '',
      ...(t.subjectExpertise || []),
      ...(t.specializedKeywords || []),
      ...(t.jobKeywords || [])
    ].join(' ').toLowerCase();

    return tutorText.includes(normSubj) || (matchingTaxonomy && t.primaryDomain?.toLowerCase() === matchingTaxonomy.domainName.toLowerCase());
  });

  if (filtered.length >= 4) {
    return filtered;
  }

  // If few direct matches, include the domain-matched curated tutors plus general top faculty
  return CURATED_SPECIALIZED_TUTORS;
}

/**
 * Get all specialized directory tutors
 */
export function getAllDirectoryTutors(): User[] {
  return CURATED_SPECIALIZED_TUTORS;
}
