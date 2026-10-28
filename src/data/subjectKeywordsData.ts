export interface SubjectDomainKeywords {
  id: string;
  categoryNumber: number;
  domainName: string;
  shortName: string;
  highSearchKeywords: string[];
  researchKeywords: string[];
  jobKeywords: string[];
  combinedKeywords?: string[];
  recommendedSubjects: string[];
}

export const SUBJECT_DOMAINS_TAXONOMY: SubjectDomainKeywords[] = [
  {
    id: 'ai-ml',
    categoryNumber: 1,
    domainName: 'Artificial Intelligence (AI) & Machine Learning',
    shortName: 'AI & Machine Learning',
    highSearchKeywords: [
      'Artificial Intelligence', 'Generative AI', 'Machine Learning', 'Deep Learning', 
      'Large Language Models (LLM)', 'AI Engineering', 'AI Applications', 'Responsible AI', 
      'Explainable AI (XAI)', 'AI Automation', 'AI Ethics', 'AI Governance', 'AI Systems', 
      'Neural Networks', 'Natural Language Processing (NLP)', 'Computer Vision', 
      'Reinforcement Learning', 'Predictive Analytics', 'AI Agents', 'Foundation Models'
    ],
    researchKeywords: [
      'Neural Network Architectures', 'LLM Alignment & RLHF', 'Multimodal Deep Learning',
      'Computer Vision Object Detection', 'Transformer Mechanisms', 'Probabilistic AI'
    ],
    jobKeywords: [
      'AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'AI Research Scientist', 
      'NLP Engineer', 'Computer Vision Engineer', 'MLOps Engineer', 'Data Analyst', 'AI Product Manager'
    ],
    combinedKeywords: [
      'AI + Healthcare', 'AI + Climate Change', 'AI + Water Treatment', 'Reinforcement Learning + Robotics',
      'Cybersecurity + AI', 'Deep Learning Applications'
    ],
    recommendedSubjects: ['Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Science', 'Python Programming', 'Data Science']
  },
  {
    id: 'data-science-big-data',
    categoryNumber: 2,
    domainName: 'Data Science & Big Data',
    shortName: 'Data Science & Big Data',
    highSearchKeywords: [
      'Data Science', 'Big Data Analytics', 'Data Mining', 'Data Visualization', 'Statistical Learning', 
      'Predictive Modeling', 'Data Engineering', 'Cloud Data Platforms', 'Database Systems', 
      'Data Security', 'Data Quality', 'Data Pipeline', 'Data Governance'
    ],
    researchKeywords: [
      'Big Data Analytics', 'Data Mining', 'Statistical Learning', 'Predictive Modeling', 
      'Distributed Query Engines', 'High-Dimensional Data Analysis'
    ],
    jobKeywords: [
      'Data Scientist', 'Data Engineer', 'Business Intelligence Analyst', 'Analytics Engineer', 'Database Administrator'
    ],
    combinedKeywords: [
      'Data Science + Healthcare', 'Machine Learning + Environmental Monitoring', 'Predictive Analytics'
    ],
    recommendedSubjects: ['Data Science', 'Big Data', 'Statistics & Probability', 'SQL & Databases', 'Python Programming', 'R Programming']
  },
  {
    id: 'cybersecurity',
    categoryNumber: 3,
    domainName: 'Cybersecurity',
    shortName: 'Cybersecurity',
    highSearchKeywords: [
      'Cybersecurity', 'Information Security', 'Network Security', 'Cloud Security', 'Zero Trust Security', 
      'Ethical Hacking', 'Penetration Testing', 'Threat Intelligence', 'Malware Analysis', 
      'Digital Forensics', 'Security Operations Center (SOC)', 'Vulnerability Assessment', 
      'Identity Access Management (IAM)', 'Blockchain Security'
    ],
    researchKeywords: [
      'Zero Trust Architectures', 'Threat Intelligence & Cryptography', 'Malware Reverse Engineering',
      'Quantum-Resistant Cryptography', 'AI Threat Modeling'
    ],
    jobKeywords: [
      'Cybersecurity Analyst', 'Information Security Officer', 'Penetration Tester', 'Cloud Security Architect', 'SOC Analyst'
    ],
    combinedKeywords: [
      'Cybersecurity + AI', 'Cybersecurity Threat Detection Using AI', 'Zero Trust Security'
    ],
    recommendedSubjects: ['Cybersecurity', 'Network Security', 'Ethical Hacking', 'Computer Science', 'Information Systems']
  },
  {
    id: 'software-engineering',
    categoryNumber: 4,
    domainName: 'Software Engineering',
    shortName: 'Software Engineering',
    highSearchKeywords: [
      'Software Engineering', 'Full Stack Development', 'Web Development', 'Cloud Computing', 
      'DevOps', 'Microservices Architecture', 'Software Architecture', 'API Development', 
      'Distributed Systems', 'Mobile Application Development', 'Database Management', 'System Design'
    ],
    researchKeywords: [
      'Distributed Consensus Algorithms', 'Microservices Scalability', 'Formal Verification', 'Software Reliability'
    ],
    jobKeywords: [
      'Software Engineer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'Cloud Engineer', 'DevOps Engineer'
    ],
    combinedKeywords: [
      'System Design', 'Microservices Architecture', 'Distributed Systems'
    ],
    recommendedSubjects: ['Software Engineering', 'Computer Science', 'Full Stack Development', 'System Design', 'Java / C++ / Python']
  },
  {
    id: 'environmental-water-treatment',
    categoryNumber: 5,
    domainName: 'Environmental Engineering & Water Treatment',
    shortName: 'Environmental & Water Treatment',
    highSearchKeywords: [
      'Environmental Engineering', 'Water Treatment', 'Wastewater Treatment', 'Drinking Water Quality', 
      'Emerging Contaminants', 'PFAS Removal', 'Microplastic Removal', 'Pharmaceutical Removal', 
      'Heavy Metal Removal', 'Advanced Oxidation Processes', 'Membrane Technology', 'Polymeric Membranes', 
      'Nanofiltration', 'Reverse Osmosis', 'Adsorption Technology', 'Electrochemical Sensors', 
      'Biosensors', 'Water Remediation', 'Sustainable Water Treatment', 'Environmental Monitoring'
    ],
    researchKeywords: [
      'Advanced Oxidation Processes', 'Membrane Technology', 'Polymeric Membranes', 'Nanofiltration', 
      'Reverse Osmosis', 'PFAS Removal Technologies', 'Adsorption Technology', 'Electrochemical Sensors'
    ],
    jobKeywords: [
      'Environmental Engineer', 'Water Resources Engineer', 'Wastewater Engineer', 'Sustainability Engineer', 'Environmental Consultant'
    ],
    combinedKeywords: [
      'AI + Water Treatment', 'AI Based Water Quality Detection', 'Sustainable Water Treatment Technologies', 
      'Nanomaterials for Environmental Remediation', 'Electrochemical Sensors for Pollutant Detection'
    ],
    recommendedSubjects: ['Environmental Engineering', 'Water Quality & Treatment', 'Civil & Environmental Engineering', 'Chemical Engineering', 'Chemistry']
  },
  {
    id: 'climate-change-sustainability',
    categoryNumber: 6,
    domainName: 'Climate Change & Sustainability',
    shortName: 'Climate & Sustainability',
    highSearchKeywords: [
      'Climate Change', 'Climate Adaptation', 'Climate Resilience', 'Sustainable Development', 
      'Environmental Sustainability', 'Carbon Reduction', 'Net Zero', 'Renewable Energy', 
      'Green Technology', 'Circular Economy', 'Life Cycle Assessment (LCA)', 'Environmental Policy', 
      'ESG', 'Green Infrastructure'
    ],
    researchKeywords: [
      'Climate Adaptation', 'Climate Resilience', 'Carbon Capture & Sequestration', 
      'Life Cycle Assessment (LCA)', 'Circular Economy Modeling', 'ESG Reporting Frameworks'
    ],
    jobKeywords: [
      'Sustainability Specialist', 'Climate Risk Analyst', 'ESG Consultant', 'Environmental Policy Advisor', 'Carbon Accounting Analyst'
    ],
    combinedKeywords: [
      'AI + Climate Change', 'Sustainable Technology', 'Clean Energy', 'Green Technology'
    ],
    recommendedSubjects: ['Climate Science', 'Sustainability Studies', 'Environmental Economics', 'Earth & Climate Systems']
  },
  {
    id: 'renewable-energy',
    categoryNumber: 7,
    domainName: 'Renewable Energy',
    shortName: 'Renewable Energy',
    highSearchKeywords: [
      'Renewable Energy', 'Solar Energy', 'Wind Energy', 'Energy Storage', 'Battery Technology', 
      'Lithium-ion Batteries', 'Hydrogen Energy', 'Green Hydrogen', 'Smart Grid', 
      'Energy Efficiency', 'Clean Energy Transition'
    ],
    researchKeywords: [
      'Battery Technology & Solid-State Electrolytes', 'Green Hydrogen Electrolysis', 
      'Photovoltaic Efficiency Optimization', 'Smart Grid Load Balancing'
    ],
    jobKeywords: [
      'Renewable Energy Engineer', 'Battery Engineer', 'Solar Energy Specialist', 'Grid Integration Engineer', 'Energy Analyst'
    ],
    combinedKeywords: [
      'Renewable Energy + AI', 'Renewable Energy Storage Materials', 'Clean Energy Transition'
    ],
    recommendedSubjects: ['Renewable Energy Systems', 'Electrical Engineering', 'Materials Science', 'Energy Engineering', 'Physics']
  },
  {
    id: 'biotechnology-biomedical',
    categoryNumber: 8,
    domainName: 'Biotechnology & Biomedical Engineering',
    shortName: 'Biotech & Biomedical',
    highSearchKeywords: [
      'Biomedical Engineering', 'Biotechnology', 'Bioinformatics', 'Medical Imaging', 'Drug Delivery', 
      'Tissue Engineering', 'Regenerative Medicine', 'Genetic Engineering', 'Cancer Research', 
      'Biosensors', 'Biomaterials', 'Nanomedicine', 'Pharmaceutical Engineering'
    ],
    researchKeywords: [
      'CRISPR & Genetic Engineering', 'Tissue Engineering Scaffolds', 'Targeted Drug Delivery Systems', 
      'Bioinformatics Genomics Pipelines', 'Nanomedicine Oncology'
    ],
    jobKeywords: [
      'Biomedical Engineer', 'Bioinformatics Scientist', 'Biotech Research Associate', 'Biomaterials Engineer', 'Geneticist'
    ],
    combinedKeywords: [
      'Biotechnology + AI', 'Biomedical Innovation', 'Precision Medicine'
    ],
    recommendedSubjects: ['Biomedical Engineering', 'Biotechnology', 'Bioinformatics', 'Cell Biology', 'Genetics', 'Organic Chemistry']
  },
  {
    id: 'healthcare-health-tech',
    categoryNumber: 9,
    domainName: 'Healthcare & Health Technology',
    shortName: 'Healthcare & Health Tech',
    highSearchKeywords: [
      'Digital Health', 'Health Informatics', 'Healthcare AI', 'Medical AI', 'Telemedicine', 
      'Electronic Health Records (EHR)', 'Medical Data Analytics', 'Healthcare Technology', 
      'Precision Medicine', 'Personalized Medicine'
    ],
    researchKeywords: [
      'Clinical Decision Support Systems', 'Medical Data Analytics', 'Personalized Genomics & Therapeutics', 'EHR Interoperability'
    ],
    jobKeywords: [
      'Healthcare Data Analyst', 'Health Informatics Specialist', 'Clinical AI Engineer', 'Digital Health Product Manager'
    ],
    combinedKeywords: [
      'Artificial Intelligence for Healthcare', 'AI + Healthcare', 'Precision Medicine'
    ],
    recommendedSubjects: ['Health Informatics', 'Public Health', 'Biomedical Sciences', 'Medical Data Analytics', 'Biology']
  },
  {
    id: 'robotics-automation',
    categoryNumber: 10,
    domainName: 'Robotics & Automation',
    shortName: 'Robotics & Automation',
    highSearchKeywords: [
      'Robotics', 'Autonomous Systems', 'Industrial Automation', 'Artificial Intelligence Robotics', 
      'Human Robot Interaction', 'Computer Vision Robotics', 'Autonomous Vehicles', 'Drone Technology', 'Smart Manufacturing'
    ],
    researchKeywords: [
      'Kinematics & Dynamics', 'SLAM Navigation Algorithms', 'Human Robot Interaction', 'Autonomous Path Planning'
    ],
    jobKeywords: [
      'Robotics Engineer', 'Automation Engineer', 'Control Systems Engineer', 'Autonomous Flight Engineer'
    ],
    combinedKeywords: [
      'Robotics + AI', 'Computer Vision Robotics', 'Autonomous Systems'
    ],
    recommendedSubjects: ['Robotics Engineering', 'Mechanical Engineering', 'Control Systems', 'Computer Science']
  },
  {
    id: 'mechanical-manufacturing',
    categoryNumber: 11,
    domainName: 'Mechanical & Manufacturing Engineering',
    shortName: 'Mechanical & Manufacturing',
    highSearchKeywords: [
      'Advanced Manufacturing', 'Additive Manufacturing', '3D Printing', 'Industry 4.0', 
      'Smart Manufacturing', 'Digital Twin', 'Automation Systems', 'Robotics Engineering', 
      'CAD/CAM', 'Manufacturing Optimization'
    ],
    researchKeywords: [
      'Additive Manufacturing Metallurgy', 'Finite Element Analysis (FEA)', 'Digital Twin Simulation', 'Thermal Fluid Dynamics'
    ],
    jobKeywords: [
      'Mechanical Engineer', 'Manufacturing Engineer', 'CAD Design Specialist', 'Process Optimization Engineer'
    ],
    combinedKeywords: [
      'Industry 4.0', 'Digital Twin', 'Additive Manufacturing'
    ],
    recommendedSubjects: ['Mechanical Engineering', 'Thermodynamics', 'Fluid Mechanics', 'CAD/CAM', 'Statics & Dynamics']
  },
  {
    id: 'civil-engineering',
    categoryNumber: 12,
    domainName: 'Civil Engineering',
    shortName: 'Civil Engineering',
    highSearchKeywords: [
      'Structural Engineering', 'Smart Infrastructure', 'Sustainable Construction', 'Transportation Engineering', 
      'Urban Planning', 'Smart Cities', 'Building Information Modeling (BIM)', 'Construction Management', 'Infrastructure Resilience'
    ],
    researchKeywords: [
      'Structural Dynamics & Seismic Design', 'Smart Cities Transportation Modeling', 'Sustainable Concrete Geopolymers', 'Infrastructure Resilience'
    ],
    jobKeywords: [
      'Civil Engineer', 'Structural Engineer', 'Transportation Planner', 'BIM Coordinator', 'Construction Project Manager'
    ],
    combinedKeywords: [
      'Smart Cities', 'AI Enabled Smart Cities', 'Smart Infrastructure'
    ],
    recommendedSubjects: ['Civil Engineering', 'Structural Analysis', 'Geotechnical Engineering', 'Urban Planning']
  },
  {
    id: 'chemical-engineering',
    categoryNumber: 13,
    domainName: 'Chemical Engineering',
    shortName: 'Chemical Engineering',
    highSearchKeywords: [
      'Chemical Engineering', 'Process Engineering', 'Catalysis', 'Nanotechnology', 'Polymer Science', 
      'Membrane Separation', 'Materials Engineering', 'Sustainable Chemistry', 'Carbon Capture', 'Hydrogen Production'
    ],
    researchKeywords: [
      'Heterogeneous Catalysis', 'Membrane Separation Thermodynamics', 'Carbon Capture Reactor Design', 'Polymer Synthesis'
    ],
    jobKeywords: [
      'Chemical Process Engineer', 'Refinery Optimization Engineer', 'Catalysis Researcher', 'Polymer Scientist'
    ],
    combinedKeywords: [
      'Sustainable Chemistry', 'Advanced Membrane Technology', 'Hydrogen Production'
    ],
    recommendedSubjects: ['Chemical Engineering', 'Thermodynamics', 'Transport Phenomena', 'Organic Chemistry', 'Reaction Kinetics']
  },
  {
    id: 'materials-science',
    categoryNumber: 14,
    domainName: 'Materials Science',
    shortName: 'Materials Science',
    highSearchKeywords: [
      'Nanomaterials', 'Advanced Materials', 'Polymer Materials', 'Composite Materials', 'Smart Materials', 
      'Functional Materials', 'Energy Materials', 'Battery Materials', 'Surface Engineering'
    ],
    researchKeywords: [
      '2D Nanomaterials (Graphene/MXenes)', 'Solid-State Battery Materials', 'High-Entropy Alloys', 'Smart Stimuli-Responsive Polymers'
    ],
    jobKeywords: [
      'Materials Scientist', 'Metallurgical Engineer', 'Nanotechnology Researcher', 'Battery Materials Scientist'
    ],
    combinedKeywords: [
      'Advanced Materials', 'Nanotechnology', 'Renewable Energy Storage Materials'
    ],
    recommendedSubjects: ['Materials Science & Engineering', 'Solid State Physics', 'Nanotechnology', 'Chemistry']
  },
  {
    id: 'business-management',
    categoryNumber: 15,
    domainName: 'Business & Management',
    shortName: 'Business & Management',
    highSearchKeywords: [
      'Business Analytics', 'Digital Transformation', 'Supply Chain Management', 'Project Management', 
      'Entrepreneurship', 'Innovation Management', 'Financial Technology (FinTech)', 'Operations Management'
    ],
    researchKeywords: [
      'Supply Chain Resilience Modeling', 'Digital Transformation Frameworks', 'Strategic Operations Optimization'
    ],
    jobKeywords: [
      'Product Manager', 'Business Analyst', 'Operations Manager', 'Management Consultant', 'Supply Chain Director'
    ],
    combinedKeywords: [
      'Digital Transformation in Business', 'Business Analytics + AI', 'FinTech'
    ],
    recommendedSubjects: ['Business Administration', 'Finance', 'Supply Chain Management', 'Marketing', 'Economics']
  },
  {
    id: 'education-technology',
    categoryNumber: 16,
    domainName: 'Education Technology',
    shortName: 'EdTech',
    highSearchKeywords: [
      'EdTech', 'Online Learning', 'Artificial Intelligence in Education', 'Learning Analytics', 
      'Personalized Learning', 'Educational Technology', 'Digital Education'
    ],
    researchKeywords: [
      'Learning Analytics Predictive Models', 'Adaptive Learning Algorithms', 'Instructional Design Efficacy'
    ],
    jobKeywords: [
      'EdTech Specialist', 'Instructional Designer', 'Learning Experience Designer', 'Curriculum Director'
    ],
    combinedKeywords: [
      'Artificial Intelligence in Education', 'Personalized Learning', 'EdTech Innovation'
    ],
    recommendedSubjects: ['Education', 'Instructional Design', 'Learning Analytics', 'Psychology']
  },
  {
    id: 'computer-science-emerging-tech',
    categoryNumber: 17,
    domainName: 'Computer Science & Emerging Technologies',
    shortName: 'CS & Emerging Tech',
    highSearchKeywords: [
      'Computer Science', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Quantum Computing', 
      'Edge Computing', 'Cloud Computing', 'Distributed Computing', 'High Performance Computing', 
      'Internet of Things (IoT)', 'Internet of Everything (IoE)', 'Blockchain Technology', 'Web3', 
      'Digital Twins', 'Extended Reality (XR)', 'Virtual Reality (VR)', 'Augmented Reality (AR)', 
      'Human Computer Interaction (HCI)', 'Natural Language Processing', 'Speech Recognition', 
      'Autonomous Systems', 'Intelligent Systems'
    ],
    researchKeywords: [
      'Quantum Algorithms & Qubits', 'Edge AI Acceleration', 'Decentralized Consensus Protocols', 'HCI Spatial Computing'
    ],
    jobKeywords: [
      'Computer Scientist', 'Quantum Software Engineer', 'IoT Solutions Architect', 'Blockchain Developer'
    ],
    combinedKeywords: [
      'Quantum Computing', 'Distributed Systems', 'Extended Reality (XR)'
    ],
    recommendedSubjects: ['Computer Science', 'Algorithms & Data Structures', 'Quantum Computing', 'Operating Systems']
  },
  {
    id: 'cloud-computing',
    categoryNumber: 18,
    domainName: 'Cloud Computing',
    shortName: 'Cloud Computing',
    highSearchKeywords: [
      'Cloud Computing', 'AWS Cloud', 'Microsoft Azure', 'Google Cloud Platform', 'Cloud Architecture', 
      'Cloud Security', 'Cloud Migration', 'Serverless Computing', 'Cloud Infrastructure', 
      'Kubernetes', 'Docker', 'Containerization', 'Infrastructure as Code', 'Terraform', 
      'Cloud DevOps', 'Multi Cloud Strategy'
    ],
    researchKeywords: [
      'Serverless Cold-Start Optimization', 'Multi-Cloud Orchestration', 'Hybrid Cloud Security Topology'
    ],
    jobKeywords: [
      'Cloud Engineer', 'Cloud Architect', 'AWS Solutions Architect', 'DevOps Cloud Specialist'
    ],
    combinedKeywords: [
      'Cloud Infrastructure', 'Kubernetes Orchestration', 'Serverless Architecture'
    ],
    recommendedSubjects: ['Cloud Architecture', 'Distributed Systems', 'Computer Networks', 'Software Engineering']
  },
  {
    id: 'devops-software-infrastructure',
    categoryNumber: 19,
    domainName: 'DevOps & Software Infrastructure',
    shortName: 'DevOps & Infrastructure',
    highSearchKeywords: [
      'DevOps Engineer', 'CI/CD Pipeline', 'Continuous Integration', 'Continuous Deployment', 
      'Software Automation', 'GitHub Actions', 'Jenkins', 'Kubernetes', 'Docker', 
      'Linux Administration', 'Site Reliability Engineering (SRE)', 'Infrastructure Engineering', 'Platform Engineering'
    ],
    researchKeywords: [
      'Chaos Engineering & Fault Injection', 'Immutable Infrastructure Automation', 'GitOps Workflows'
    ],
    jobKeywords: [
      'DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Platform Engineer', 'Build & Release Engineer'
    ],
    combinedKeywords: [
      'CI/CD Pipeline', 'Site Reliability Engineering (SRE)', 'Platform Engineering'
    ],
    recommendedSubjects: ['DevOps', 'Linux System Administration', 'Computer Networks', 'Cloud Infrastructure']
  },
  {
    id: 'web-development',
    categoryNumber: 20,
    domainName: 'Web Development',
    shortName: 'Web Development',
    highSearchKeywords: [
      'Frontend Development', 'Backend Development', 'Full Stack Development', 'React Developer', 
      'Next.js Developer', 'Angular Development', 'Vue.js Development', 'TypeScript', 'JavaScript', 
      'Node.js', 'API Development', 'REST API', 'GraphQL', 'Web Performance Optimization', 
      'Responsive Web Design', 'Progressive Web Apps (PWA)'
    ],
    researchKeywords: [
      'WebAssembly High Performance Modules', 'Server-Side Rendering (SSR) Hydration', 'Edge Routing'
    ],
    jobKeywords: [
      'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'React / Next.js Engineer'
    ],
    combinedKeywords: [
      'Full Stack Development', 'TypeScript & Next.js', 'Progressive Web Apps'
    ],
    recommendedSubjects: ['Web Development', 'JavaScript & TypeScript', 'Full Stack Engineering', 'Database Design']
  },
  {
    id: 'mobile-app-development',
    categoryNumber: 21,
    domainName: 'Mobile Application Development',
    shortName: 'Mobile App Dev',
    highSearchKeywords: [
      'Mobile App Development', 'iOS Development', 'Android Development', 'Flutter Development', 
      'React Native', 'Swift Programming', 'Kotlin Development', 'Cross Platform Apps', 'Mobile UI/UX', 'App Security'
    ],
    researchKeywords: [
      'Cross-Platform Native Bridge Optimization', 'Mobile On-Device Neural Processing', 'Mobile Security Enclaves'
    ],
    jobKeywords: [
      'Mobile App Developer', 'iOS Engineer', 'Android Engineer', 'Flutter / React Native Developer'
    ],
    combinedKeywords: [
      'Cross Platform Mobile Development', 'iOS & Android Architecture'
    ],
    recommendedSubjects: ['Mobile Application Development', 'Swift & iOS', 'Kotlin & Android', 'React Native']
  },
  {
    id: 'ux-ui-design',
    categoryNumber: 22,
    domainName: 'UX/UI Design',
    shortName: 'UX/UI Design',
    highSearchKeywords: [
      'User Experience Design', 'UI Design', 'UX Research', 'Product Design', 'Interaction Design', 
      'Design Thinking', 'Figma Design', 'Accessibility Design', 'Human Centered Design', 
      'Digital Product Design', 'Design Systems'
    ],
    researchKeywords: [
      'Cognitive Usability Heuristics', 'Design Systems Token Architecture', 'Accessibility WCAG AAA Standards'
    ],
    jobKeywords: [
      'UX/UI Designer', 'Product Designer', 'UX Researcher', 'Interaction Designer', 'Design Systems Lead'
    ],
    combinedKeywords: [
      'Design Systems', 'Human Centered Design', 'Accessibility Design'
    ],
    recommendedSubjects: ['UX/UI Design', 'Human-Computer Interaction', 'Graphic & Product Design', 'Psychology']
  },
  {
    id: 'semiconductor-electronics',
    categoryNumber: 23,
    domainName: 'Semiconductor & Electronics',
    shortName: 'Semiconductor & Electronics',
    highSearchKeywords: [
      'Semiconductor Technology', 'Microelectronics', 'Integrated Circuits', 'Chip Design', 
      'VLSI Design', 'Semiconductor Manufacturing', 'Electronic Devices', 'Nanoelectronics', 
      'Photonics', 'Quantum Electronics', 'Embedded Systems', 'Sensors Technology', 'MEMS Technology'
    ],
    researchKeywords: [
      'FinFET & Gate-All-Around (GAA) Transistors', 'Photonic Integrated Circuits', 'VLSI Physical Synthesis', 'MEMS Fabrication'
    ],
    jobKeywords: [
      'Semiconductor Engineer', 'VLSI Design Engineer', 'Chip Layout Specialist', 'Nanoelectronics Researcher'
    ],
    combinedKeywords: [
      'Semiconductor Technology', 'Chip Design & VLSI', 'Nanoelectronics'
    ],
    recommendedSubjects: ['Electrical Engineering', 'VLSI Design', 'Solid-State Devices', 'Semiconductor Physics']
  },
  {
    id: 'electrical-engineering',
    categoryNumber: 24,
    domainName: 'Electrical Engineering',
    shortName: 'Electrical Engineering',
    highSearchKeywords: [
      'Electrical Engineering', 'Power Systems', 'Smart Grid Technology', 'Renewable Energy Systems', 
      'Control Systems', 'Embedded Systems', 'Signal Processing', 'Communication Systems', 
      'Wireless Networks', '5G Technology', '6G Networks', 'Internet of Things'
    ],
    researchKeywords: [
      'High-Voltage Power Distribution', '5G/6G Beamforming & MIMO', 'Digital Signal Processing (DSP)'
    ],
    jobKeywords: [
      'Electrical Engineer', 'Power Systems Engineer', 'RF / Telecommunications Engineer', 'Control Systems Engineer'
    ],
    combinedKeywords: [
      'Power Systems & Smart Grid', '5G / 6G Wireless Networks', 'Signal Processing'
    ],
    recommendedSubjects: ['Electrical Engineering', 'Circuits & Power', 'Signals & Systems', 'Electromagnetics']
  },
  {
    id: 'electronics-embedded-systems',
    categoryNumber: 25,
    domainName: 'Electronics & Embedded Systems',
    shortName: 'Embedded Systems',
    highSearchKeywords: [
      'Embedded Systems', 'Microcontrollers', 'Arduino', 'Raspberry Pi', 'Firmware Development', 
      'Hardware Design', 'PCB Design', 'IoT Devices', 'Real Time Systems', 'Sensor Networks'
    ],
    researchKeywords: [
      'Real-Time Operating Systems (RTOS)', 'Embedded C/C++ Optimization', 'Low-Power Sensor Network Topologies'
    ],
    jobKeywords: [
      'Embedded Systems Engineer', 'Firmware Developer', 'Hardware / PCB Design Engineer', 'IoT Device Architect'
    ],
    combinedKeywords: [
      'Firmware Development', 'PCB Design & Microcontrollers', 'Real Time Systems'
    ],
    recommendedSubjects: ['Embedded Systems', 'Computer Engineering', 'Microcontroller Programming', 'Circuit Design']
  },
  {
    id: 'aerospace-engineering',
    categoryNumber: 26,
    domainName: 'Aerospace Engineering',
    shortName: 'Aerospace Engineering',
    highSearchKeywords: [
      'Aerospace Engineering', 'Aircraft Design', 'Space Technology', 'Satellite Systems', 
      'Rocket Propulsion', 'Autonomous Flight', 'Drone Technology', 'UAV Systems', 
      'Aerodynamics', 'Aviation Technology', 'Space Exploration'
    ],
    researchKeywords: [
      'Supersonic Aerodynamics & CFD', 'Orbital Mechanics & Astrodynamics', 'Cryogenic Rocket Propulsion'
    ],
    jobKeywords: [
      'Aerospace Engineer', 'Propulsion Specialist', 'Flight Dynamics Engineer', 'UAV Systems Architect'
    ],
    combinedKeywords: [
      'Aerodynamics & CFD', 'Rocket Propulsion', 'Autonomous Flight'
    ],
    recommendedSubjects: ['Aerospace Engineering', 'Fluid Dynamics', 'Orbital Mechanics', 'Propulsion Systems']
  },
  {
    id: 'automotive-engineering',
    categoryNumber: 27,
    domainName: 'Automotive Engineering',
    shortName: 'Automotive Engineering',
    highSearchKeywords: [
      'Electric Vehicles (EV)', 'Autonomous Vehicles', 'Automotive Engineering', 'Battery Technology', 
      'Vehicle Automation', 'Connected Vehicles', 'Advanced Driver Assistance Systems (ADAS)', 
      'Self Driving Cars', 'Automotive AI'
    ],
    researchKeywords: [
      'EV Powertrain Thermal Management', 'ADAS Sensor Fusion & LiDAR', 'Drive-by-Wire Control Logic'
    ],
    jobKeywords: [
      'Automotive Engineer', 'EV Powertrain Engineer', 'ADAS Systems Engineer', 'Autonomous Vehicle Researcher'
    ],
    combinedKeywords: [
      'Autonomous Vehicles + AI', 'Electric Vehicles (EV) Battery Systems', 'ADAS'
    ],
    recommendedSubjects: ['Automotive Engineering', 'Mechanical Engineering', 'Control Systems', 'Robotics']
  },
  {
    id: 'agriculture-technology',
    categoryNumber: 28,
    domainName: 'Agriculture Technology',
    shortName: 'AgriTech',
    highSearchKeywords: [
      'Smart Agriculture', 'Precision Agriculture', 'Agricultural Technology', 'AgriTech', 
      'AI in Agriculture', 'Crop Monitoring', 'Remote Sensing', 'Sustainable Farming', 
      'Vertical Farming', 'Food Security', 'Climate Smart Agriculture'
    ],
    researchKeywords: [
      'Satellite Remote Sensing Crop Phenotyping', 'Precision Irrigation IoT Controls', 'Vertical Farming Hydroponics'
    ],
    jobKeywords: [
      'AgriTech Engineer', 'Precision Agriculture Specialist', 'Crop Data Analyst', 'Sustainable Farming Consultant'
    ],
    combinedKeywords: [
      'AI in Agriculture', 'Precision Agriculture', 'Climate Smart Agriculture'
    ],
    recommendedSubjects: ['Agricultural Science', 'Biological Systems Engineering', 'Remote Sensing', 'Environmental Science']
  },
  {
    id: 'food-science-technology',
    categoryNumber: 29,
    domainName: 'Food Science & Technology',
    shortName: 'Food Science & Tech',
    highSearchKeywords: [
      'Food Technology', 'Food Safety', 'Food Engineering', 'Food Microbiology', 
      'Food Processing', 'Functional Foods', 'Nutraceuticals', 'Food Packaging', 'Sustainable Food Systems'
    ],
    researchKeywords: [
      'Novel Protein Extraction & Formulation', 'Biodegradable Active Food Packaging', 'Thermal & Non-Thermal Processing'
    ],
    jobKeywords: [
      'Food Scientist', 'Food Safety & QA Director', 'Product Development Food Technologist', 'Microbiology Specialist'
    ],
    combinedKeywords: [
      'Sustainable Food Systems', 'Food Microbiology & Safety', 'Functional Foods'
    ],
    recommendedSubjects: ['Food Science', 'Biochemistry', 'Microbiology', 'Chemical & Food Engineering']
  },
  {
    id: 'pharmaceutical-sciences',
    categoryNumber: 30,
    domainName: 'Pharmaceutical Sciences',
    shortName: 'Pharmaceutical Sciences',
    highSearchKeywords: [
      'Pharmaceutical Research', 'Drug Discovery', 'Drug Development', 'Pharmacology', 
      'Pharmaceutical Technology', 'Drug Delivery Systems', 'Nanomedicine', 'Personalized Medicine', 
      'Clinical Research', 'Biomedical Innovation'
    ],
    researchKeywords: [
      'Structure-Based Drug Design', 'Liposomal Drug Delivery Mechanisms', 'Pharmacokinetics & Pharmacodynamics (PK/PD)'
    ],
    jobKeywords: [
      'Pharmaceutical Scientist', 'Pharmacologist', 'Clinical Research Associate (CRA)', 'Drug Formulation Chemist'
    ],
    combinedKeywords: [
      'Drug Discovery & Development', 'Nanomedicine & Targeted Delivery', 'Clinical Research'
    ],
    recommendedSubjects: ['Pharmacology', 'Pharmaceutical Chemistry', 'Biochemistry', 'Organic Chemistry']
  },
  {
    id: 'chemistry',
    categoryNumber: 31,
    domainName: 'Chemistry',
    shortName: 'Chemistry',
    highSearchKeywords: [
      'Chemistry Research', 'Analytical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 
      'Physical Chemistry', 'Green Chemistry', 'Computational Chemistry', 'Nanochemistry', 
      'Polymer Chemistry', 'Materials Chemistry', 'Electrochemistry'
    ],
    researchKeywords: [
      'Asymmetric Organic Synthesis', 'Electrochemical Redox Kinetics', 'Density Functional Theory (DFT) Quantum Chemistry'
    ],
    jobKeywords: [
      'Chemist', 'Analytical Chemist', 'Synthetic Organic Chemist', 'Materials Chemist', 'QC Chemist'
    ],
    combinedKeywords: [
      'Green Chemistry', 'Computational Chemistry', 'Electrochemistry'
    ],
    recommendedSubjects: ['Organic Chemistry', 'General Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry']
  },
  {
    id: 'physics',
    categoryNumber: 32,
    domainName: 'Physics',
    shortName: 'Physics',
    highSearchKeywords: [
      'Applied Physics', 'Quantum Physics', 'Condensed Matter Physics', 'Nanophysics', 
      'Computational Physics', 'Photonics', 'Quantum Technology', 'Semiconductor Physics', 'Energy Physics'
    ],
    researchKeywords: [
      'Topological Insulators & Superconductivity', 'Quantum Coherence & Entanglement', 'Nonlinear Optics & Photonics'
    ],
    jobKeywords: [
      'Physicist', 'Quantum Research Scientist', 'Optical Engineer', 'Computational Modeling Scientist'
    ],
    combinedKeywords: [
      'Quantum Physics & Technology', 'Computational Physics', 'Semiconductor Physics'
    ],
    recommendedSubjects: ['Physics I & II', 'AP Physics C', 'Quantum Mechanics', 'Thermodynamics', 'Electromagnetism']
  },
  {
    id: 'mathematics-statistics',
    categoryNumber: 33,
    domainName: 'Mathematics & Statistics',
    shortName: 'Math & Statistics',
    highSearchKeywords: [
      'Applied Mathematics', 'Statistics', 'Data Analytics', 'Mathematical Modeling', 
      'Computational Mathematics', 'Probability Theory', 'Optimization', 'Numerical Analysis', 
      'Statistical Modeling', 'Machine Learning Mathematics'
    ],
    researchKeywords: [
      'Stochastic Differential Equations', 'Convex Optimization Algorithms', 'Bayesian Inference & Markov Chain Monte Carlo'
    ],
    jobKeywords: [
      'Mathematician', 'Statistician', 'Quantitative Analyst', 'Operations Research Analyst'
    ],
    combinedKeywords: [
      'Machine Learning Mathematics', 'Mathematical Modeling', 'Statistical Inference'
    ],
    recommendedSubjects: ['Calculus I, II, III', 'Linear Algebra', 'Differential Equations', 'Statistics & Probability', 'Discrete Mathematics']
  },
  {
    id: 'finance-fintech',
    categoryNumber: 34,
    domainName: 'Finance & FinTech',
    shortName: 'Finance & FinTech',
    highSearchKeywords: [
      'Financial Technology', 'FinTech', 'Digital Banking', 'Blockchain Finance', 
      'Cryptocurrency Research', 'Algorithmic Trading', 'Quantitative Finance', 'Risk Management', 
      'Financial Analytics', 'Investment Technology'
    ],
    researchKeywords: [
      'Black-Scholes & Stochastic Volatility Models', 'High-Frequency Algorithmic Execution', 'Decentralized Finance (DeFi) Protocols'
    ],
    jobKeywords: [
      'Quantitative Financial Analyst', 'FinTech Developer', 'Risk Management Analyst', 'Investment Banker'
    ],
    combinedKeywords: [
      'Financial Technology (FinTech)', 'Quantitative Finance', 'Algorithmic Trading'
    ],
    recommendedSubjects: ['Corporate Finance', 'Investment Analysis', 'Financial Accounting', 'Econometrics']
  },
  {
    id: 'economics',
    categoryNumber: 35,
    domainName: 'Economics',
    shortName: 'Economics',
    highSearchKeywords: [
      'Economics Research', 'Development Economics', 'Behavioral Economics', 'Environmental Economics', 
      'Digital Economy', 'Labor Economics', 'International Economics', 'Economic Policy', 'Public Finance'
    ],
    researchKeywords: [
      'Econometric Causal Inference', 'Game Theory & Mechanism Design', 'Macroeconomic Dynamic Stochastic General Equilibrium (DSGE)'
    ],
    jobKeywords: [
      'Economist', 'Economic Consultant', 'Policy Analyst', 'Market Research Economist'
    ],
    combinedKeywords: [
      'Environmental Economics', 'Behavioral Economics', 'Economic Policy Analysis'
    ],
    recommendedSubjects: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'AP Economics', 'International Trade']
  },
  {
    id: 'marketing-digital-business',
    categoryNumber: 36,
    domainName: 'Marketing & Digital Business',
    shortName: 'Marketing & Digital',
    highSearchKeywords: [
      'Digital Marketing', 'Social Media Marketing', 'Marketing Analytics', 'Consumer Behavior', 
      'E-commerce', 'Growth Marketing', 'SEO', 'Content Marketing', 'Brand Management', 'Customer Experience'
    ],
    researchKeywords: [
      'Attribution Modeling & Customer Lifetime Value', 'Neuromarketing Consumer Psychology', 'Conversion Rate Optimization (CRO)'
    ],
    jobKeywords: [
      'Marketing Director', 'Growth Marketing Manager', 'SEO Specialist', 'Brand Strategist'
    ],
    combinedKeywords: [
      'Marketing Analytics & SEO', 'Digital Business Growth', 'E-commerce Optimization'
    ],
    recommendedSubjects: ['Marketing Management', 'Digital Marketing', 'Consumer Behavior', 'Business Strategy']
  },
  {
    id: 'psychology',
    categoryNumber: 37,
    domainName: 'Psychology',
    shortName: 'Psychology',
    highSearchKeywords: [
      'Psychology Research', 'Cognitive Psychology', 'Behavioral Science', 'Clinical Psychology', 
      'Mental Health', 'Neuroscience', 'Human Behavior', 'Social Psychology', 'Organizational Psychology'
    ],
    researchKeywords: [
      'Cognitive Behavioral Therapeutics', 'Psychometric Evaluation Validity', 'Neuropsychological Assessment Protocols'
    ],
    jobKeywords: [
      'Psychologist', 'Behavioral Science Researcher', 'Clinical Counselor', 'Organizational Psychologist'
    ],
    combinedKeywords: [
      'Cognitive Psychology', 'Behavioral Science', 'Clinical Psychology'
    ],
    recommendedSubjects: ['General Psychology', 'AP Psychology', 'Cognitive Psychology', 'Social Psychology', 'Statistics for Psychology']
  },
  {
    id: 'neuroscience',
    categoryNumber: 38,
    domainName: 'Neuroscience',
    shortName: 'Neuroscience',
    highSearchKeywords: [
      'Neuroscience', 'Brain Research', 'Cognitive Neuroscience', 'Neurotechnology', 
      'Brain Computer Interface (BCI)', 'Artificial Intelligence Neuroscience', 'Neuroimaging', 'Computational Neuroscience'
    ],
    researchKeywords: [
      'fMRI & EEG Neural Signal Decoding', 'Neural Plasticity & Synaptic Transmission', 'Brain-Computer Interface Hardware'
    ],
    jobKeywords: [
      'Neuroscientist', 'Neural Engineer', 'Neuroimaging Analyst', 'Cognitive Researcher'
    ],
    combinedKeywords: [
      'Artificial Intelligence Neuroscience', 'Brain Computer Interface (BCI)', 'Computational Neuroscience'
    ],
    recommendedSubjects: ['Neuroscience', 'Neurobiology', 'Cognitive Science', 'Physiology']
  },
  {
    id: 'law-public-policy',
    categoryNumber: 39,
    domainName: 'Law & Public Policy',
    shortName: 'Law & Public Policy',
    highSearchKeywords: [
      'Public Policy', 'International Law', 'Environmental Law', 'Cyber Law', 
      'Technology Law', 'Human Rights Law', 'Governance', 'Policy Analysis', 'Regulatory Affairs'
    ],
    researchKeywords: [
      'Constitutional Jurisprudence', 'AI & Algorithmic Regulatory Policy', 'International Treaty Compliance'
    ],
    jobKeywords: [
      'Legal Analyst', 'Public Policy Advisor', 'Regulatory Affairs Specialist', 'Compliance Counsel'
    ],
    combinedKeywords: [
      'Cyber Law & Technology Law', 'Environmental Law & Policy', 'Regulatory Affairs'
    ],
    recommendedSubjects: ['Constitutional Law', 'Legal Studies', 'LSAT Prep', 'Public Policy Analysis', 'Ethics']
  },
  {
    id: 'social-sciences',
    categoryNumber: 40,
    domainName: 'Social Sciences',
    shortName: 'Social Sciences',
    highSearchKeywords: [
      'Sociology', 'Political Science', 'International Relations', 'Global Studies', 
      'Migration Studies', 'Gender Studies', 'Development Studies', 'Human Security', 'Social Policy'
    ],
    researchKeywords: [
      'Qualitative & Quantitative Ethnography', 'Comparative Political Systems', 'Global Migration Flow Models'
    ],
    jobKeywords: [
      'Social Science Researcher', 'Political Analyst', 'International Relations Officer', 'Nonprofit Program Director'
    ],
    combinedKeywords: [
      'Political Science & International Relations', 'Social Policy Analysis', 'Global Studies'
    ],
    recommendedSubjects: ['Sociology', 'Political Science', 'International Relations', 'Anthropology', 'History']
  },
  {
    id: 'environmental-climate-expanded',
    categoryNumber: 41,
    domainName: 'Environmental & Climate Research (Expanded)',
    shortName: 'Environmental & Climate Research',
    highSearchKeywords: [
      'Climate Change Adaptation', 'Climate Risk Assessment', 'Environmental Pollution', 
      'Air Pollution Monitoring', 'Water Pollution', 'Waste Management', 'Plastic Pollution', 
      'Microplastics', 'PFAS Contamination', 'Emerging Contaminants', 'Environmental Toxicology', 
      'Carbon Capture and Storage (CCS)', 'Green Hydrogen', 'Circular Economy', 'Sustainable Materials', 
      'Environmental Sensors', 'Biosensors', 'Electrochemical Detection', 'Smart Environmental Monitoring'
    ],
    researchKeywords: [
      'PFAS Contamination Degradation Mechanisms', 'Microplastics Bioaccumulation', 
      'Carbon Capture and Storage (CCS) Mineralization', 'Electrochemical Detection for Emerging Contaminants'
    ],
    jobKeywords: [
      'Environmental Toxicologist', 'Pollution Remediation Engineer', 'Climate Risk Consultant', 'Sensor Development Specialist'
    ],
    combinedKeywords: [
      'Machine Learning for Environmental Monitoring', 'AI Based Water Quality Detection', 
      'Sustainable Water Treatment Technologies', 'Nanomaterials for Environmental Remediation', 
      'Electrochemical Sensors for Pollutant Detection', 'PFAS Removal Technologies'
    ],
    recommendedSubjects: ['Environmental Science', 'Environmental Chemistry', 'Ecology', 'Toxicology', 'Earth Sciences']
  },
  {
    id: 'usa-canada-high-growth-jobs',
    categoryNumber: 42,
    domainName: 'High-Growth Keywords for USA & Canada Jobs (2026)',
    shortName: 'Top Job Search (USA & Canada)',
    highSearchKeywords: [
      'Artificial Intelligence Engineer', 'Machine Learning Engineer', 'Data Scientist', 
      'Cybersecurity Analyst', 'Cloud Engineer', 'DevOps Engineer', 'Software Engineer', 
      'Full Stack Developer', 'Robotics Engineer', 'Automation Engineer', 'Renewable Energy Engineer', 
      'Environmental Engineer', 'Sustainability Specialist', 'Biomedical Engineer', 'Research Scientist', 
      'Healthcare Data Analyst', 'Battery Engineer', 'Semiconductor Engineer', 'Product Manager', 'Business Analyst'
    ],
    researchKeywords: [
      'Industry 4.0 Workforce Analytics', 'High-Growth Tech Employment Pathways', 'STEM Career Transition'
    ],
    jobKeywords: [
      'AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Cybersecurity Analyst', 'Cloud Engineer', 
      'DevOps Engineer', 'Software Engineer', 'Full Stack Developer', 'Robotics Engineer', 'Automation Engineer', 
      'Renewable Energy Engineer', 'Environmental Engineer', 'Sustainability Specialist', 'Biomedical Engineer', 
      'Research Scientist', 'Healthcare Data Analyst', 'Battery Engineer', 'Semiconductor Engineer', 'Product Manager', 'Business Analyst'
    ],
    combinedKeywords: [
      'High-Growth STEM Careers', 'Career Transition Coaching', 'Portfolio & Interview Prep'
    ],
    recommendedSubjects: ['Career Coaching', 'Interview Prep', 'Resume & Portfolio Review', 'Technical Interviewing']
  },
  {
    id: 'academic-research-combinations',
    categoryNumber: 43,
    domainName: 'High-Search Academic Research Combinations',
    shortName: 'Academic Research Combinations',
    highSearchKeywords: [
      'Artificial Intelligence for Healthcare', 'Machine Learning for Environmental Monitoring', 
      'AI Based Water Quality Detection', 'Sustainable Water Treatment Technologies', 
      'Advanced Membrane Technology', 'Nanomaterials for Environmental Remediation', 
      'Electrochemical Sensors for Pollutant Detection', 'PFAS Removal Technologies', 
      'Renewable Energy Storage Materials', 'AI Enabled Smart Cities', 'Digital Transformation in Business', 
      'Cybersecurity Threat Detection Using AI', 'Deep Learning Applications'
    ],
    researchKeywords: [
      'Cross-Disciplinary AI & Material Innovations', 'Multi-Scale Computational Environmental Modeling', 'Interdisciplinary Biosensing'
    ],
    jobKeywords: [
      'Interdisciplinary Research Scientist', 'AI Applications Specialist', 'Environmental Tech Consultant'
    ],
    combinedKeywords: [
      'Artificial Intelligence for Healthcare', 'Machine Learning for Environmental Monitoring', 
      'AI Based Water Quality Detection', 'Sustainable Water Treatment Technologies', 
      'Advanced Membrane Technology', 'Nanomaterials for Environmental Remediation', 
      'Electrochemical Sensors for Pollutant Detection', 'PFAS Removal Technologies', 
      'Renewable Energy Storage Materials', 'AI Enabled Smart Cities', 'Digital Transformation in Business', 
      'Cybersecurity Threat Detection Using AI', 'Deep Learning Applications'
    ],
    recommendedSubjects: ['Academic Research', 'Master Thesis Guidance', 'PhD Dissertation Mentorship', 'Interdisciplinary Studies']
  }
];

/**
 * Helper to get all combined keywords for a given subject domain
 */
export function getKeywordsForDomain(domainIdOrName: string): SubjectDomainKeywords | undefined {
  const norm = domainIdOrName.toLowerCase();
  return SUBJECT_DOMAINS_TAXONOMY.find(
    d => d.id === norm || d.domainName.toLowerCase() === norm || d.shortName.toLowerCase() === norm
  );
}

/**
 * Match a tutor's subject or expertise against the taxonomy to extract relevant keywords
 */
export function getRelevantKeywordsForTutor(tutorSubjects: string[] | string | undefined, tutorEducation?: string, primaryDomain?: string): {
  primaryDomain: string;
  highSearchKeywords: string[];
  researchKeywords: string[];
  jobKeywords: string[];
  combinedKeywords: string[];
  allFlatKeywords: string[];
} {
  const subjectList: string[] = Array.isArray(tutorSubjects) 
    ? tutorSubjects 
    : typeof tutorSubjects === 'string' 
    ? tutorSubjects.split(',').map(s => s.trim()) 
    : [];

  const combinedText = [
    primaryDomain || '',
    ...subjectList,
    tutorEducation || ''
  ].join(' ').toLowerCase();

  // Find best matching domain
  let bestDomain: SubjectDomainKeywords = SUBJECT_DOMAINS_TAXONOMY[0];
  let maxScore = -1;

  for (const domain of SUBJECT_DOMAINS_TAXONOMY) {
    let score = 0;
    
    // Check direct domain name match
    if (primaryDomain && domain.domainName.toLowerCase().includes(primaryDomain.toLowerCase())) {
      score += 10;
    }
    if (primaryDomain && domain.id === primaryDomain.toLowerCase()) {
      score += 15;
    }

    // Check subjects match
    for (const subj of domain.recommendedSubjects) {
      if (combinedText.includes(subj.toLowerCase())) {
        score += 3;
      }
    }

    // Check keywords match
    for (const kw of domain.highSearchKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 2;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestDomain = domain;
    }
  }

  // Extract unique sets
  const highSearch = Array.from(new Set(bestDomain.highSearchKeywords));
  const research = Array.from(new Set(bestDomain.researchKeywords));
  const job = Array.from(new Set(bestDomain.jobKeywords));
  const combined = Array.from(new Set(bestDomain.combinedKeywords || []));

  const allFlat = Array.from(new Set([
    ...highSearch,
    ...research,
    ...job,
    ...combined
  ]));

  return {
    primaryDomain: bestDomain.domainName,
    highSearchKeywords: highSearch,
    researchKeywords: research,
    jobKeywords: job,
    combinedKeywords: combined,
    allFlatKeywords: allFlat
  };
}
