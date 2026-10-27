import { 
  UserProfile, 
  Notice, 
  EventItem, 
  FacultyMember, 
  DepartmentInfo, 
  CampusFacility, 
  TimetableSlot, 
  SubjectAttendance, 
  InternalMark, 
  AssignmentItem, 
  StudyMaterial, 
  LibraryBook, 
  PlacementDrive, 
  StudentClub, 
  AcademicHoliday,
  AppNotification,
  FacultyAssignedClass,
  StudentRosterEntry,
  AttendanceSession,
  AuditLog,
  FeedbackItem
} from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  student: {
    id: 'user-student-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campusone.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    phone: '+91 98201 54321',
    department: 'Computer Science & Engineering',
    rollNumber: '21CS104',
    prn: '2021016400987654',
    semester: 6,
    academicYear: '2025 - 2026',
    division: 'Div A',
    cgpa: 8.92,
    mentorName: 'Dr. Radhika Sen',
    mentorEmail: 'radhika.sen@campusone.edu'
  },
  faculty: {
    id: 'user-faculty-1',
    name: 'Dr. Radhika Sen',
    email: 'radhika.sen@campusone.edu',
    role: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    phone: '+91 98112 34567',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor & AI Lab Head',
    cabin: 'Tech Tower, Room 402',
    specialization: ['Artificial Intelligence', 'Distributed Systems'],
    consultationHours: 'Tue & Thu: 02:00 PM - 04:00 PM'
  },
  admin: {
    id: 'user-admin-1',
    name: 'Vibhu Suvaliya',
    email: 'vibhusuvaliyacampusone@gpahmedabad.ac.in',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    phone: '+91 99000 11223',
    department: 'Central Administration',
    designation: 'Chief Administrative Officer',
    cabin: 'Administrative Block, Suite 101',
    adminLevel: 'Super Administrator'
  },
  guest: {
    id: 'user-guest-1',
    name: 'Visitor / Prospective Student',
    email: 'visitor@campusone.edu',
    role: 'guest',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
    department: 'General Public'
  }
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Final Schedule for Mid-Semester Examinations (Even Sem 2026)',
    category: 'Examination',
    department: 'All',
    semester: 'All',
    date: '2026-10-24',
    time: '09:30 AM',
    author: 'Office of the Controller of Examinations',
    authorRole: 'Admin',
    isUrgent: true,
    content: 'All undergraduate and postgraduate students are hereby notified that the Mid-Semester Examinations for the Even Semester will commence on November 10, 2026. Hall tickets will be released on the portal 3 days prior. Ensure minimum 75% attendance to avoid debarment.',
    attachmentName: 'Mid_Sem_Exam_Schedule_Nov2026.pdf',
    attachmentSize: '1.4 MB',
    views: 1420
  },
  {
    id: 'not-2',
    title: 'Google Campus Placement Drive 2026 for SDE & Cloud Roles',
    category: 'Placement',
    department: 'Computer Science & Engineering',
    semester: 6,
    date: '2026-10-23',
    time: '02:15 PM',
    author: 'Training & Placement Cell',
    authorRole: 'Placement Officer',
    isUrgent: true,
    content: 'Google India has announced the campus hiring drive for 2026/2027 graduates. Roles offered: Software Development Engineer I & Cloud Associate Consultant. Package CTC: 38-44 LPA. Minimum CGPA required: 7.5 with no active backlogs. Register via the placement module before October 29.',
    attachmentName: 'Google_Hiring_Guidelines_JD.pdf',
    attachmentSize: '890 KB',
    views: 2890
  },
  {
    id: 'not-3',
    title: 'HackNova 2026: 36-Hour National Level Hackathon Registrations Open',
    category: 'Events',
    department: 'All',
    semester: 'All',
    date: '2026-10-22',
    time: '11:00 AM',
    author: 'Department of Computer Science & GDSC',
    authorRole: 'Faculty Coordinator',
    isUrgent: false,
    content: 'CampusOne is hosting HackNova 2026 on November 18-20, with prize pools exceeding ₹3,00,000. Themes include AI for Good, FinTech, Web3, and Smart Campus. Teams of 2 to 4 members may apply. Free meals, swags, and internship interviews guaranteed for top 10 finalists.',
    attachmentName: 'HackNova_Rulebook_Themes.pdf',
    attachmentSize: '2.1 MB',
    views: 1980
  },
  {
    id: 'not-4',
    title: 'Central Library Extended Hours During Examination Month',
    category: 'Academic',
    department: 'All',
    semester: 'All',
    date: '2026-10-20',
    time: '04:00 PM',
    author: 'Chief Librarian',
    authorRole: 'Staff',
    isUrgent: false,
    content: 'Starting November 1st, the Central Digital Library & Reading Rooms on the 3rd floor will operate 24x7 with high-speed Wi-Fi, air conditioning, and quiet study zones. Students must display valid Smart RFID Campus ID cards for entry past 10:00 PM.',
    attachmentName: 'Library_Rules_Extended_Hours.pdf',
    attachmentSize: '450 KB',
    views: 1120
  },
  {
    id: 'not-5',
    title: 'Inter-Department Annual Sports Meet: Fixtures & Team Registration',
    category: 'Sports',
    department: 'All',
    semester: 'All',
    date: '2026-10-18',
    time: '10:00 AM',
    author: 'Director of Physical Education',
    authorRole: 'Sports Dept',
    isUrgent: false,
    content: 'Registration is now live for Cricket, Football, Badminton, Table Tennis, Chess, and Athletics. Inter-department matches will kick off on November 25 at the Main Campus Sports Complex. Register with your department sports secretary.',
    attachmentName: 'Sports_Meet_Fixtures_2026.pdf',
    attachmentSize: '1.1 MB',
    views: 940
  },
  {
    id: 'not-6',
    title: 'Scheduled Campus Wi-Fi & Server Maintenance Downtime',
    category: 'General',
    department: 'All',
    semester: 'All',
    date: '2026-10-16',
    time: '06:00 PM',
    author: 'IT Infrastructure Center',
    authorRole: 'System Admin',
    isUrgent: false,
    content: 'Core campus network switches and server clusters will undergo a performance upgrade on Sunday from 02:00 AM to 06:00 AM. Campus Wi-Fi and online portal access might be intermittently disrupted during this window.',
    attachmentName: 'IT_Maintenance_Advisory.pdf',
    attachmentSize: '320 KB',
    views: 650
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    title: 'HackNova 2026: 36-Hour National Hackathon',
    category: 'Technical',
    date: '2026-11-18',
    endDate: '2026-11-20',
    time: '09:00 AM - 09:00 PM',
    venue: 'Campus Innovation Center, Block B',
    organizer: 'GDSC & ACM Student Chapter',
    description: 'The flagship hackathon bringing together over 600 coders, designers, and innovators to solve pressing challenges in Healthcare, Sustainable Tech, and AI.',
    bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    registeredCount: 412,
    maxCapacity: 600,
    registrationOpen: true,
    registrationDeadline: '2026-11-10',
    tags: ['Hackathon', 'AI', 'Coding', 'Prizes'],
    contactPerson: 'Aditya Roy (GDSC Lead)',
    contactEmail: 'gdsc@campusone.edu'
  },
  {
    id: 'evt-2',
    title: 'International Summit on Generative AI & Quantum Computing',
    category: 'Seminar',
    date: '2026-11-05',
    time: '10:00 AM - 04:30 PM',
    venue: 'Steve Jobs Auditorium, Main Block',
    organizer: 'Department of AI & Data Science',
    description: 'Keynote talks by leading scientists from MIT, Google DeepMind, and IISc exploring frontiers of LLMs, agentic systems, and quantum acceleration in engineering.',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    registeredCount: 380,
    maxCapacity: 450,
    registrationOpen: true,
    registrationDeadline: '2026-11-03',
    tags: ['AI', 'Quantum', 'Research', 'Keynote'],
    contactPerson: 'Dr. Radhika Sen',
    contactEmail: 'radhika.sen@campusone.edu'
  },
  {
    id: 'evt-3',
    title: 'Aura 2026: Annual Cultural & Arts Fest',
    category: 'Cultural',
    date: '2026-12-08',
    endDate: '2026-12-10',
    time: '05:00 PM - 11:00 PM',
    venue: 'Central Open Air Amphitheatre',
    organizer: 'Student Cultural Council',
    description: '3 days of non-stop music, celebrity pro-nights, battle of the bands, fashion shows, dance face-offs, street plays, and gourmet food stalls.',
    bannerImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    registeredCount: 1250,
    maxCapacity: 2000,
    registrationOpen: true,
    registrationDeadline: '2026-12-01',
    tags: ['Fest', 'Music', 'ProNight', 'Dance'],
    contactPerson: 'Sanya Malhotra (President)',
    contactEmail: 'cultural@campusone.edu'
  },
  {
    id: 'evt-4',
    title: 'Hands-on Workshop: Cloud Native Architecture with Kubernetes',
    category: 'Workshop',
    date: '2026-11-12',
    time: '01:30 PM - 05:30 PM',
    venue: 'Cloud Computing Lab, Tech Block Room 301',
    organizer: 'AWS & Cloud Club',
    description: 'Deep dive into microservices, containerization with Docker, Kubernetes clusters, Helm charts, and CI/CD pipelines with real AWS cloud credits provided.',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    registeredCount: 78,
    maxCapacity: 80,
    registrationOpen: true,
    registrationDeadline: '2026-11-09',
    tags: ['DevOps', 'Kubernetes', 'AWS', 'Hands-on'],
    contactPerson: 'Prof. Amit Joshi',
    contactEmail: 'amit.joshi@campusone.edu'
  }
];

export const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Dr. Radhika Sen',
    designation: 'Associate Professor & AI Lab Head',
    department: 'Computer Science & Engineering',
    qualification: 'Ph.D. in Computer Science (IIT Bombay), M.Tech (IISc Bangalore)',
    experienceYears: 14,
    email: 'radhika.sen@campusone.edu',
    phone: '+91 98112 34567',
    cabin: 'Tech Tower, Room 402',
    consultationHours: 'Tue & Thu: 02:00 PM - 04:00 PM',
    specialization: ['Deep Learning', 'Distributed Systems', 'Natural Language Processing'],
    subjectsTaught: ['Distributed Systems (CS601)', 'Artificial Intelligence (CS603)', 'Machine Learning Lab'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 28
  },
  {
    id: 'fac-2',
    name: 'Dr. Vikramaditya Rathore',
    designation: 'Professor & Head of Department',
    department: 'Computer Science & Engineering',
    qualification: 'Ph.D. (Carnegie Mellon University), B.Tech (IIT Delhi)',
    experienceYears: 21,
    email: 'rathore.v@campusone.edu',
    phone: '+91 98220 89101',
    cabin: 'Tech Tower, HOD Office 401',
    consultationHours: 'Mon & Wed: 11:00 AM - 01:00 PM',
    specialization: ['High Performance Computing', 'Computer Architecture', 'Quantum Algorithms'],
    subjectsTaught: ['Advanced Computer Architecture', 'Cloud Computing (CS602)'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 46
  },
  {
    id: 'fac-3',
    name: 'Prof. Amit Joshi',
    designation: 'Assistant Professor',
    department: 'Computer Science & Engineering',
    qualification: 'M.Tech (IIT Madras), B.E. (BITS Pilani)',
    experienceYears: 8,
    email: 'amit.joshi@campusone.edu',
    phone: '+91 97334 11223',
    cabin: 'Tech Tower, Room 315',
    consultationHours: 'Fri: 03:00 PM - 05:00 PM',
    specialization: ['DevOps & Cloud Systems', 'Web Engineering', 'Cybersecurity'],
    subjectsTaught: ['Web Technology & Frameworks (CS604)', 'Network Security (CS605)'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 12
  },
  {
    id: 'fac-4',
    name: 'Dr. Meenakshi Sundaram',
    designation: 'Professor & Dean of Research',
    department: 'Artificial Intelligence & Data Science',
    qualification: 'Ph.D. in Machine Learning (Stanford University)',
    experienceYears: 18,
    email: 'meenakshi.s@campusone.edu',
    phone: '+91 98450 77123',
    cabin: 'Innovation Center, Room 204',
    consultationHours: 'Wed: 02:00 PM - 04:00 PM',
    specialization: ['Computer Vision', 'Reinforcement Learning', 'Medical Imaging AI'],
    subjectsTaught: ['Computer Vision & Robotics', 'Deep Learning Architectures'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 52
  },
  {
    id: 'fac-5',
    name: 'Prof. Rajesh Kulkarni',
    designation: 'Associate Professor',
    department: 'Electronics & Telecommunications',
    qualification: 'Ph.D. (IIT Kharagpur)',
    experienceYears: 15,
    email: 'rajesh.k@campusone.edu',
    phone: '+91 98661 22345',
    cabin: 'ECE Block, Room 112',
    consultationHours: 'Mon & Thu: 10:00 AM - 12:00 PM',
    specialization: ['VLSI Design', 'Embedded Systems', 'IoT Edge Hardware'],
    subjectsTaught: ['VLSI Design Systems', 'Microcontrollers & Embedded C'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 22
  },
  {
    id: 'fac-6',
    name: 'Dr. Ananya Mukherjee',
    designation: 'Associate Professor & Placement Coordinator',
    department: 'Mechanical Engineering',
    qualification: 'Ph.D. (IIT Roorkee)',
    experienceYears: 12,
    email: 'ananya.m@campusone.edu',
    phone: '+91 98991 33445',
    cabin: 'Mechanical Complex, Room 208',
    consultationHours: 'Tue: 03:00 PM - 05:00 PM',
    specialization: ['Robotics & Mechatronics', 'Computational Fluid Dynamics', 'Renewable Energy'],
    subjectsTaught: ['Thermodynamics & Heat Transfer', 'Robotics Automation'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    researchPapersCount: 19
  }
];

export const INITIAL_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'dept-arch',
    name: 'Architecture',
    code: 'ARCH',
    hodName: 'Prof. Sunita Deshmukh',
    hodEmail: 'hod.arch@campusone.edu',
    establishedYear: 2008,
    totalStudents: 240,
    totalFaculty: 16,
    description: 'Fostering creative and sustainable architectural design, urban planning, and heritage conservation with state-of-the-art studios.',
    vision: 'To lead in ecological spatial planning, urban resilience, and smart architectural innovations.',
    programsOffered: ['B.Arch', 'M.Arch Urban Design'],
    labs: ['Architectural Design Studio', 'Climatology & Environmental Lab', 'Model Making & Prototyping Workshop'],
    bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-robotics',
    name: 'Automation and Robotics',
    code: 'ROBOTICS',
    hodName: 'Dr. Aakash Kulkarni',
    hodEmail: 'hod.robotics@campusone.edu',
    establishedYear: 2018,
    totalStudents: 320,
    totalFaculty: 18,
    description: 'Interdisciplinary engineering advancing autonomous mobile robotics, industrial cobots, PLC/SCADA, and intelligent control systems.',
    vision: 'Pioneering industrial automation 4.0 and intelligent autonomous machines.',
    programsOffered: ['B.Tech Automation and Robotics', 'M.Tech Industrial Robotics'],
    labs: ['Industrial Robotics & Cobots Lab', 'Mechatronics & Sensorics Studio', 'Autonomous Navigation & ROS Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-auto',
    name: 'Automobile Engineering',
    code: 'AUTO',
    hodName: 'Dr. Rameshwar Patil',
    hodEmail: 'hod.auto@campusone.edu',
    establishedYear: 2010,
    totalStudents: 300,
    totalFaculty: 18,
    description: 'Vehicle dynamics, hybrid electric powertrains, battery management systems, and smart automotive electronics.',
    vision: 'Driving green mobility, electric vehicle technology, and smart transportation systems.',
    programsOffered: ['B.Tech Automobile Engineering', 'M.Tech EV Technology'],
    labs: ['IC Engines & Dyno Testing Lab', 'EV Powertrain & Battery Testing Lab', 'Automotive Chassis & Aerodynamics Studio'],
    bannerImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-biomed',
    name: 'Biomedical Engineering',
    code: 'BIOMED',
    hodName: 'Dr. Shalini Swaminathan',
    hodEmail: 'hod.biomed@campusone.edu',
    establishedYear: 2012,
    totalStudents: 280,
    totalFaculty: 16,
    description: 'Bridging engineering innovation with clinical medicine, medical imaging, prosthetics, and biosensors.',
    vision: 'Transforming global healthcare delivery through medical device innovation.',
    programsOffered: ['B.Tech Biomedical Engineering', 'M.Tech Medical Devices'],
    labs: ['Biomedical Instrumentation Lab', 'Medical Imaging & Radiography Center', 'Biosignal Processing & Telemedicine Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-civil',
    name: 'Civil Engineering',
    code: 'CIVIL',
    hodName: 'Dr. Pradeep Verma',
    hodEmail: 'hod.civil@campusone.edu',
    establishedYear: 2000,
    totalStudents: 450,
    totalFaculty: 24,
    description: 'Pioneering sustainable infrastructure, earthquake-resistant design, green concrete, and geoinformatics.',
    vision: 'Building resilient, smart, and sustainable civil infrastructure.',
    programsOffered: ['B.Tech Civil Engineering', 'M.Tech Structural Engineering', 'Ph.D. in Civil'],
    labs: ['Heavy Structures Testing Lab', 'Geotechnical & Soil Mechanics Lab', 'Environmental Engineering Studio', 'GIS & Remote Sensing Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-ce',
    name: 'Computer Engineering',
    code: 'CE',
    hodName: 'Dr. Rajeshwar Rao',
    hodEmail: 'hod.ce@campusone.edu',
    establishedYear: 2004,
    totalStudents: 720,
    totalFaculty: 36,
    description: 'Core computer architecture, operating systems, compiler construction, cloud systems, and high performance computing.',
    vision: 'Empowering technocrats with fundamental computing theory and state-of-the-art engineering practices.',
    programsOffered: ['B.Tech Computer Engineering', 'M.Tech Computer Engineering', 'Ph.D.'],
    labs: ['Computer Architecture Lab', 'Operating Systems Studio', 'Embedded Computing Lab', 'Microprocessor & Interfacing Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-ee',
    name: 'Electrical Engineering',
    code: 'EE',
    hodName: 'Dr. Harish Chandra',
    hodEmail: 'hod.ee@campusone.edu',
    establishedYear: 2001,
    totalStudents: 460,
    totalFaculty: 26,
    description: 'Power systems engineering, smart microgrids, renewable solar/wind integration, and electrical machinery.',
    vision: 'To lead the clean energy transition through cutting-edge power electronic innovations.',
    programsOffered: ['B.Tech Electrical Engineering', 'M.Tech Power Systems'],
    labs: ['High Voltage Engineering Lab', 'Electrical Machines & Drives Lab', 'Power Systems Simulation Lab', 'Smart Grid Technology Center'],
    bannerImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-ece',
    name: 'Electronics & Communication Engineering',
    code: 'ECE',
    hodName: 'Dr. Meenakshi Sundaram',
    hodEmail: 'hod.ece@campusone.edu',
    establishedYear: 2006,
    totalStudents: 480,
    totalFaculty: 28,
    description: 'Pioneering education in VLSI design, Embedded Systems, IoT, and high-frequency communication architectures.',
    vision: 'To excel in electronics design and wireless communication through collaborative research and industrial partnerships.',
    programsOffered: ['B.Tech ECE', 'M.Tech VLSI & Embedded Systems', 'Ph.D. in Communications'],
    labs: ['VLSI CAD Laboratory', 'IoT & Sensors Research Lab', 'DSP & Microcontroller Studio', 'Microwave & Optical Comm Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-ict',
    name: 'Information & Communication Technology (ICT)',
    code: 'ICT',
    hodName: 'Dr. Arvind Natarajan',
    hodEmail: 'hod.ict@campusone.edu',
    establishedYear: 2014,
    totalStudents: 360,
    totalFaculty: 20,
    description: 'Integrating computing software with modern telecom protocols, 5G wireless broadband, and multimedia streaming architectures.',
    vision: 'Pioneering convergence in telecommunications and data processing.',
    programsOffered: ['B.Tech ICT', 'M.Tech Wireless Networks'],
    labs: ['5G & Broadband Wireless Lab', 'Cloud & SDN Networking Lab', 'Multimedia Processing Studio'],
    bannerImage: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-it',
    name: 'Information Technology (IT)',
    code: 'IT',
    hodName: 'Dr. Neha Bapat',
    hodEmail: 'hod.it@campusone.edu',
    establishedYear: 2005,
    totalStudents: 600,
    totalFaculty: 30,
    description: 'Applied enterprise software, web technologies, big data analytics, DevOps automation, and information security.',
    vision: 'Delivering agile information technologies and dependable enterprise systems.',
    programsOffered: ['B.Tech Information Technology', 'M.Tech Data Science'],
    labs: ['Web Technologies & Full-Stack Lab', 'Big Data & Cloud Analytics Studio', 'Software Engineering & DevOps Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-ice',
    name: 'Instrumentation & Control Engineering',
    code: 'ICE',
    hodName: 'Dr. Sanjay Purohit',
    hodEmail: 'hod.ice@campusone.edu',
    establishedYear: 2009,
    totalStudents: 260,
    totalFaculty: 16,
    description: 'Precision sensor instrumentation, industrial automation, process control systems, and biomedical transducers.',
    vision: 'Excellence in process automation and precision instrumentation engineering.',
    programsOffered: ['B.Tech Instrumentation & Control', 'M.Tech Process Control'],
    labs: ['Process Instrumentation & Control Lab', 'Virtual Instrumentation (LabVIEW) Studio', 'Transducers & Calibration Center'],
    bannerImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-mech',
    name: 'Mechanical Engineering',
    code: 'MECH',
    hodName: 'Dr. Vikram Singhania',
    hodEmail: 'hod.mech@campusone.edu',
    establishedYear: 2002,
    totalStudents: 420,
    totalFaculty: 24,
    description: 'Integrating fundamental mechanics with Robotics, Automation, Additive Manufacturing, and Smart Materials.',
    vision: 'To lead in sustainable engineering, green automotive solutions, and robotics innovation.',
    programsOffered: ['B.Tech Mechanical Engineering', 'M.Tech CAD/CAM & Robotics'],
    labs: ['Robotics & Automation Center', 'CNC & Modern Machine Shop', 'Thermal Engineering Lab', 'Fluid Dynamics & Hydraulics Studio'],
    bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-cadcam',
    name: 'Mechanical CAD/CAM',
    code: 'CADCAM',
    hodName: 'Prof. Nitin Bhavsar',
    hodEmail: 'hod.cadcam@campusone.edu',
    establishedYear: 2015,
    totalStudents: 220,
    totalFaculty: 14,
    description: 'Computer-aided design, finite element analysis (FEA), multi-axis CNC manufacturing, and rapid industrial prototyping.',
    vision: 'Excellence in precision design, computational analysis, and digital manufacturing.',
    programsOffered: ['B.Tech Mechanical CAD/CAM', 'M.Tech Advanced Manufacturing'],
    labs: ['Advanced CAD Modeling Studio', 'FEA & Simulation Cluster', '5-Axis CNC & CAM Prototyping Workshop', '3D Additive Manufacturing Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'dept-plastic',
    name: 'Plastic Engineering (Sandwich Pattern)',
    code: 'PLASTIC',
    hodName: 'Dr. Girish Mahajan',
    hodEmail: 'hod.plastic@campusone.edu',
    establishedYear: 2007,
    totalStudents: 200,
    totalFaculty: 14,
    description: 'Polymer science, plastic processing techniques, mold & die design, recycling technologies, and industry-embedded sandwich internships.',
    vision: 'Pioneering sustainable polymeric materials, bio-plastics, and industrial sandwich engineering training.',
    programsOffered: ['B.Tech Plastic Engineering (Sandwich Pattern)', 'M.Tech Polymer Nanotechnology'],
    labs: ['Polymer Testing & Characterization Lab', 'Injection & Blow Molding Plant', 'Mold Design & Toolroom Studio', 'Plastics Recycling & Circularity Lab'],
    bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80'
  }
];

export const INITIAL_FACILITIES: CampusFacility[] = [
  {
    id: 'fac-lib',
    name: 'Dr. APJ Abdul Kalam Central Digital Library',
    category: 'Academic',
    location: 'Central Academic Block, 2nd & 3rd Floor',
    block: 'Block A',
    timings: '08:00 AM - 11:00 PM (24x7 during exams)',
    description: 'Over 65,000 physical volumes, 120,000 IEEE/Springer/ACM digital journals, private group discussion pods, and quiet reading zones.',
    features: ['RFID Self-Checkout Kiosks', 'High-Speed Wi-Fi & Power Desks', 'Silent Research Floor', 'Kindle e-Reader Borrowing'],
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Mr. R. Srinivas (Chief Librarian)'
  },
  {
    id: 'fac-hpc',
    name: 'Supercomputing & AI Research Center',
    category: 'Academic',
    location: 'Tech Tower, 5th Floor',
    block: 'Block C',
    timings: '09:00 AM - 08:00 PM',
    description: 'Equipped with NVIDIA DGX A100 systems, 512-core computing clusters, and high-bandwidth interconnects for student research and thesis projects.',
    features: ['NVIDIA DGX A100 Clusters', 'Petabyte Storage Array', 'Dual Fiber Backhaul', 'Cooling System Precision'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Dr. Radhika Sen'
  },
  {
    id: 'fac-aud',
    name: 'Steve Jobs Convention Auditorium',
    category: 'Recreation',
    location: 'Main Administrative Quadrangle',
    block: 'Block B',
    timings: 'As per event schedule',
    description: '1,200-seat state-of-the-art acoustic auditorium with 4K laser projection, Dolby Atmos sound, and broadcast-ready multi-cam setup.',
    features: ['1200 Push-back Ergonomic Seats', 'Dolby Atmos Surround System', 'Green Rooms & VIP Lounge', '4K Projection Screen'],
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Prof. K. Verma'
  },
  {
    id: 'fac-sports',
    name: 'Olympic-Standard Sports Complex & Gym',
    category: 'Sports',
    location: 'South Campus Grounds',
    block: 'Sports Pavilion',
    timings: '06:00 AM - 09:30 PM',
    description: 'Olympic-size heated swimming pool, wooden indoor basketball courts, 4 badminton courts, synthetic athletic track, and modern fitness center.',
    features: ['Heated 50m Swimming Pool', 'Maplewood Basketball Court', 'CrossFit & Cardio Section', 'Full-time Certified Trainers'],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Coach Manpreet Singh'
  },
  {
    id: 'fac-canteen',
    name: 'The Hub: Central Food Court & Cafeteria',
    category: 'Canteen',
    location: 'Student Activity Center, Ground Level',
    block: 'Student Plaza',
    timings: '07:30 AM - 10:30 PM',
    description: 'Multi-cuisine hygiene-certified dining hub featuring North/South Indian thalis, artisan espresso bar, healthy salads, and live sandwich stations.',
    features: ['FSSAI 5-Star Hygiene Rated', 'Digital Token & Mobile Ordering', 'Subsidized Student Combos', 'Outdoor Garden Seating'],
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Mr. Deepak Mehta (Hospitality Manager)'
  },
  {
    id: 'fac-health',
    name: '24/7 Campus Health & Wellness Medical Center',
    category: 'Health',
    location: 'Residential Wing, Ground Floor',
    block: 'Block H',
    timings: '24 Hours Open',
    description: 'Full-time resident medical doctors, qualified nurses, emergency ambulance on campus, generic medicine dispensary, and mental health counseling.',
    features: ['24x7 Ambulance On Standby', 'Free Consultations & First Aid', 'Licensed Student Counselors', 'Pathology Sample Collection'],
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    inCharge: 'Dr. Shalini Deshpande (Chief Medical Officer)'
  }
];

export const STUDENT_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', time: '09:00 AM - 10:00 AM', subjectCode: 'CS601', subjectName: 'Distributed Systems', type: 'Lecture', facultyName: 'Dr. Radhika Sen', room: 'LH-302', color: 'blue' },
  { id: 'tt-2', day: 'Monday', time: '10:00 AM - 11:00 AM', subjectCode: 'CS602', subjectName: 'Cloud Computing & DevOps', type: 'Lecture', facultyName: 'Prof. Amit Joshi', room: 'LH-302', color: 'cyan' },
  { id: 'tt-3', day: 'Monday', time: '11:15 AM - 01:15 PM', subjectCode: 'CS606', subjectName: 'AI & Deep Learning Lab', type: 'Lab', facultyName: 'Dr. Meenakshi Sundaram', room: 'Lab 404 (NVIDIA)', color: 'emerald' },
  { id: 'tt-4', day: 'Monday', time: '02:00 PM - 03:00 PM', subjectCode: 'CS603', subjectName: 'Compiler Design', type: 'Lecture', facultyName: 'Dr. V. Rathore', room: 'LH-302', color: 'indigo' },
  { id: 'tt-5', day: 'Monday', time: '03:00 PM - 04:00 PM', subjectCode: 'CS604', subjectName: 'Network Security', type: 'Lecture', facultyName: 'Prof. Rajesh Kulkarni', room: 'LH-302', color: 'amber' },

  { id: 'tt-6', day: 'Tuesday', time: '09:00 AM - 10:00 AM', subjectCode: 'CS602', subjectName: 'Cloud Computing & DevOps', type: 'Lecture', facultyName: 'Prof. Amit Joshi', room: 'LH-302', color: 'cyan' },
  { id: 'tt-7', day: 'Tuesday', time: '10:00 AM - 11:00 AM', subjectCode: 'CS601', subjectName: 'Distributed Systems', type: 'Lecture', facultyName: 'Dr. Radhika Sen', room: 'LH-302', color: 'blue' },
  { id: 'tt-8', day: 'Tuesday', time: '11:15 AM - 01:15 PM', subjectCode: 'CS607', subjectName: 'Cloud & Kubernetes Lab', type: 'Lab', facultyName: 'Prof. Amit Joshi', room: 'Lab 301', color: 'purple' },
  { id: 'tt-9', day: 'Tuesday', time: '02:00 PM - 03:00 PM', subjectCode: 'CS605', subjectName: 'Software Engineering Principles', type: 'Lecture', facultyName: 'Dr. Ananya Mukherjee', room: 'LH-302', color: 'rose' },

  { id: 'tt-10', day: 'Wednesday', time: '09:00 AM - 10:00 AM', subjectCode: 'CS603', subjectName: 'Compiler Design', type: 'Lecture', facultyName: 'Dr. V. Rathore', room: 'LH-302', color: 'indigo' },
  { id: 'tt-11', day: 'Wednesday', time: '10:00 AM - 11:00 AM', subjectCode: 'CS604', subjectName: 'Network Security', type: 'Lecture', facultyName: 'Prof. Rajesh Kulkarni', room: 'LH-302', color: 'amber' },
  { id: 'tt-12', day: 'Wednesday', time: '11:15 AM - 12:15 PM', subjectCode: 'CS601', subjectName: 'Distributed Systems', type: 'Tutorial', facultyName: 'Dr. Radhika Sen', room: 'Tut Room 204', color: 'blue' },
  { id: 'tt-13', day: 'Wednesday', time: '02:00 PM - 04:00 PM', subjectCode: 'CS608', subjectName: 'Major Capstone Project Mentoring', type: 'Lab', facultyName: 'Dr. Radhika Sen & Team', room: 'Project Hub', color: 'teal' },

  { id: 'tt-14', day: 'Thursday', time: '09:00 AM - 10:00 AM', subjectCode: 'CS605', subjectName: 'Software Engineering Principles', type: 'Lecture', facultyName: 'Dr. Ananya Mukherjee', room: 'LH-302', color: 'rose' },
  { id: 'tt-15', day: 'Thursday', time: '10:00 AM - 11:00 AM', subjectCode: 'CS602', subjectName: 'Cloud Computing & DevOps', type: 'Lecture', facultyName: 'Prof. Amit Joshi', room: 'LH-302', color: 'cyan' },
  { id: 'tt-16', day: 'Thursday', time: '11:15 AM - 01:15 PM', subjectCode: 'CS609', subjectName: 'Compiler Optimization Lab', type: 'Lab', facultyName: 'Dr. V. Rathore', room: 'Lab 402', color: 'indigo' },
  { id: 'tt-17', day: 'Thursday', time: '02:00 PM - 03:00 PM', subjectCode: 'CS604', subjectName: 'Network Security', type: 'Lecture', facultyName: 'Prof. Rajesh Kulkarni', room: 'LH-302', color: 'amber' },

  { id: 'tt-18', day: 'Friday', time: '09:00 AM - 10:00 AM', subjectCode: 'CS601', subjectName: 'Distributed Systems', type: 'Lecture', facultyName: 'Dr. Radhika Sen', room: 'LH-302', color: 'blue' },
  { id: 'tt-19', day: 'Friday', time: '10:00 AM - 11:00 AM', subjectCode: 'CS603', subjectName: 'Compiler Design', type: 'Lecture', facultyName: 'Dr. V. Rathore', room: 'LH-302', color: 'indigo' },
  { id: 'tt-20', day: 'Friday', time: '11:15 AM - 01:00 PM', subjectCode: 'CS610', subjectName: 'Industry Seminar & Guest Lecture', type: 'Lecture', facultyName: 'Industry Experts', room: 'Auditorium', color: 'purple' },
  { id: 'tt-21', day: 'Friday', time: '02:00 PM - 04:00 PM', subjectCode: 'CS611', subjectName: 'Open Source Contribution Lab', type: 'Lab', facultyName: 'Prof. Amit Joshi', room: 'Innovation Lab', color: 'emerald' },

  { id: 'tt-22', day: 'Saturday', time: '10:00 AM - 12:00 PM', subjectCode: 'CLUB', subjectName: 'Clubs, Hackathons & Placement Prep', type: 'Tutorial', facultyName: 'Student Leads', room: 'Plaza & Labs', color: 'cyan' }
];

export const STUDENT_ATTENDANCE: SubjectAttendance[] = [
  {
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    facultyName: 'Dr. Radhika Sen',
    attendedClasses: 36,
    totalClasses: 40,
    percentage: 90.0,
    minimumRequired: 75,
    status: 'Safe'
  },
  {
    subjectCode: 'CS602',
    subjectName: 'Cloud Computing & DevOps',
    facultyName: 'Prof. Amit Joshi',
    attendedClasses: 32,
    totalClasses: 38,
    percentage: 84.2,
    minimumRequired: 75,
    status: 'Safe'
  },
  {
    subjectCode: 'CS603',
    subjectName: 'Compiler Design',
    facultyName: 'Dr. Vikramaditya Rathore',
    attendedClasses: 30,
    totalClasses: 40,
    percentage: 75.0,
    minimumRequired: 75,
    status: 'Warning'
  },
  {
    subjectCode: 'CS604',
    subjectName: 'Network Security',
    facultyName: 'Prof. Rajesh Kulkarni',
    attendedClasses: 27,
    totalClasses: 38,
    percentage: 71.1,
    minimumRequired: 75,
    status: 'Critical'
  },
  {
    subjectCode: 'CS605',
    subjectName: 'Software Engineering Principles',
    facultyName: 'Dr. Ananya Mukherjee',
    attendedClasses: 35,
    totalClasses: 36,
    percentage: 97.2,
    minimumRequired: 75,
    status: 'Safe'
  },
  {
    subjectCode: 'CS606',
    subjectName: 'AI & Deep Learning Lab',
    facultyName: 'Dr. Meenakshi Sundaram',
    attendedClasses: 18,
    totalClasses: 20,
    percentage: 90.0,
    minimumRequired: 75,
    status: 'Safe'
  }
];

export const STUDENT_MARKS: InternalMark[] = [
  {
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    internal1: 27,
    internal2: 28,
    quizAverage: 9.5,
    labAssignment: 19,
    attendanceMarks: 10,
    totalMarks: 93.5,
    grade: 'A+'
  },
  {
    subjectCode: 'CS602',
    subjectName: 'Cloud Computing & DevOps',
    internal1: 25,
    internal2: 26,
    quizAverage: 8.5,
    labAssignment: 18,
    attendanceMarks: 9,
    totalMarks: 86.5,
    grade: 'A'
  },
  {
    subjectCode: 'CS603',
    subjectName: 'Compiler Design',
    internal1: 22,
    internal2: 24,
    quizAverage: 8.0,
    labAssignment: 16,
    attendanceMarks: 8,
    totalMarks: 78.0,
    grade: 'B+'
  },
  {
    subjectCode: 'CS604',
    subjectName: 'Network Security',
    internal1: 21,
    internal2: 23,
    quizAverage: 7.5,
    labAssignment: 15,
    attendanceMarks: 7,
    totalMarks: 73.5,
    grade: 'B'
  },
  {
    subjectCode: 'CS605',
    subjectName: 'Software Engineering Principles',
    internal1: 29,
    internal2: 29,
    quizAverage: 10.0,
    labAssignment: 20,
    attendanceMarks: 10,
    totalMarks: 98.0,
    grade: 'O (Outstanding)'
  }
];

export const INITIAL_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'Raft Consensus Algorithm Implementation in Go or Python',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    assignedDate: '2026-10-18',
    dueDate: '2026-10-30',
    status: 'Pending',
    instructions: 'Implement leader election, log replication, and heartbeats as per Raft paper. Provide unit test suite with simulated network partition.'
  },
  {
    id: 'asg-2',
    title: 'Deploy Multi-Tier App on Kubernetes with Helm & Ingress',
    subjectCode: 'CS602',
    subjectName: 'Cloud Computing & DevOps',
    assignedDate: '2026-10-15',
    dueDate: '2026-11-04',
    status: 'Pending',
    instructions: 'Package React frontend, Express API, and Postgres database into Helm charts. Implement Horizontal Pod Autoscaler (HPA) and cert-manager TLS.'
  },
  {
    id: 'asg-3',
    title: 'Lexical Analyzer & LL(1) Grammar Parser in C++',
    subjectCode: 'CS603',
    subjectName: 'Compiler Design',
    assignedDate: '2026-10-05',
    dueDate: '2026-10-22',
    status: 'Submitted',
    score: '18 / 20',
    instructions: 'Build tokenizer and top-down recursive descent parser with error recovery.',
    submittedFile: 'Aarav_21CS104_Compiler_Assign1.zip'
  },
  {
    id: 'asg-4',
    title: 'RSA & Elliptic Curve Cryptography Simulation',
    subjectCode: 'CS604',
    subjectName: 'Network Security',
    assignedDate: '2026-10-10',
    dueDate: '2026-10-26',
    status: 'Submitted',
    score: 'Evaluation Pending',
    instructions: 'Demonstrate key generation, message encryption, digital signatures, and timing attack vulnerability test.',
    submittedFile: 'Aarav_Crypto_Lab_Report.pdf'
  }
];

export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Complete Distributed Systems Comprehensive Lecture Notes (Prof. Sen)',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    department: 'Computer Science & Engineering',
    semester: 6,
    type: 'Notes',
    year: '2026',
    uploadedBy: 'Dr. Radhika Sen',
    uploadDate: '2026-10-15',
    fileSize: '4.8 MB',
    fileFormat: 'PDF',
    downloadsCount: 540,
    fileUrl: '#'
  },
  {
    id: 'mat-2',
    title: 'Cloud Computing & DevOps Official University Syllabus 2026 Revision',
    subjectCode: 'CS602',
    subjectName: 'Cloud Computing & DevOps',
    department: 'Computer Science & Engineering',
    semester: 6,
    type: 'Syllabus',
    year: '2026',
    uploadedBy: 'Academic Cell',
    uploadDate: '2026-08-01',
    fileSize: '820 KB',
    fileFormat: 'PDF',
    downloadsCount: 1290,
    fileUrl: '#'
  },
  {
    id: 'mat-3',
    title: 'End-Semester Exam Question Paper CS603 (Nov 2025 with Solutions)',
    subjectCode: 'CS603',
    subjectName: 'Compiler Design',
    department: 'Computer Science & Engineering',
    semester: 6,
    type: 'Question Paper',
    year: '2025',
    uploadedBy: 'Examination Cell',
    uploadDate: '2026-01-10',
    fileSize: '2.1 MB',
    fileFormat: 'PDF',
    downloadsCount: 890,
    fileUrl: '#'
  },
  {
    id: 'mat-4',
    title: 'Network Security Cryptography Lab Manual & Kali Linux Guide',
    subjectCode: 'CS604',
    subjectName: 'Network Security',
    department: 'Computer Science & Engineering',
    semester: 6,
    type: 'Lab Manual',
    year: '2026',
    uploadedBy: 'Prof. Rajesh Kulkarni',
    uploadDate: '2026-09-02',
    fileSize: '3.4 MB',
    fileFormat: 'PDF',
    downloadsCount: 410,
    fileUrl: '#'
  },
  {
    id: 'mat-5',
    title: 'Previous 5-Year Solved Question Papers Compilation for CSE Sem 6',
    subjectCode: 'CS600',
    subjectName: 'All CSE Subjects',
    department: 'Computer Science & Engineering',
    semester: 6,
    type: 'Question Paper',
    year: '2021-2025',
    uploadedBy: 'Student Academic Council',
    uploadDate: '2026-09-15',
    fileSize: '12.8 MB',
    fileFormat: 'ZIP',
    downloadsCount: 2150,
    fileUrl: '#'
  },
  {
    id: 'mat-6',
    title: 'Deep Learning & Neural Networks Quick Reference Formula Cheat Sheet',
    subjectCode: 'AI501',
    subjectName: 'Deep Learning',
    department: 'Artificial Intelligence & Data Science',
    semester: 6,
    type: 'Reference',
    year: '2026',
    uploadedBy: 'Dr. Meenakshi Sundaram',
    uploadDate: '2026-10-10',
    fileSize: '1.2 MB',
    fileFormat: 'PDF',
    downloadsCount: 970,
    fileUrl: '#'
  }
];

export const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'bk-1',
    isbn: '978-0133594140',
    title: 'Distributed Systems: Concepts and Design (5th Edition)',
    author: 'George Coulouris, Jean Dollimore',
    category: 'Computer Science',
    availableCopies: 5,
    totalCopies: 12,
    shelfLocation: 'Stack 4B, Shelf 12',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'bk-2',
    isbn: '978-0134685991',
    title: 'Effective Java (3rd Edition)',
    author: 'Joshua Bloch',
    category: 'Software Engineering',
    availableCopies: 3,
    totalCopies: 8,
    shelfLocation: 'Stack 3A, Shelf 04',
    coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'bk-3',
    isbn: '978-0262035613',
    title: 'Deep Learning (Adaptive Computation and Machine Learning)',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    category: 'Artificial Intelligence',
    availableCopies: 2,
    totalCopies: 10,
    shelfLocation: 'Stack 5C, Shelf 08',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'bk-4',
    isbn: '978-0131103627',
    title: 'The C Programming Language (2nd Edition ANSI C)',
    author: 'Brian W. Kernighan, Dennis M. Ritchie',
    category: 'Programming Languages',
    availableCopies: 7,
    totalCopies: 15,
    shelfLocation: 'Stack 2A, Shelf 01',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'bk-5',
    isbn: '978-1491950357',
    title: 'Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable Systems',
    author: 'Martin Kleppmann',
    category: 'Distributed Systems',
    availableCopies: 1,
    totalCopies: 6,
    shelfLocation: 'Stack 4B, Shelf 18',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=300&q=80'
  }
];

export const INITIAL_PLACEMENT_DRIVES: PlacementDrive[] = [
  {
    id: 'plc-1',
    companyName: 'Google India',
    logo: 'https://www.google.com/favicon.ico',
    role: 'Software Development Engineer I (SDE 1)',
    packageLPA: '₹38.5 - ₹44.0 LPA',
    eligibleBranches: ['CSE', 'AI&DS', 'ECE'],
    minCGPA: 7.5,
    lastDateToApply: '2026-10-29',
    driveDate: '2026-11-08',
    location: 'Campus Auditorium & Virtual',
    status: 'Open',
    description: 'On-campus recruitment drive for 2026/27 graduating students. Coding round on HackerEarth followed by 3 technical rounds and Googliness interview.'
  },
  {
    id: 'plc-2',
    companyName: 'Microsoft',
    logo: 'https://www.microsoft.com/favicon.ico',
    role: 'Software Engineer - Azure Cloud Team',
    packageLPA: '₹42.0 LPA',
    eligibleBranches: ['CSE', 'AI&DS', 'ECE'],
    minCGPA: 8.0,
    lastDateToApply: '2026-11-05',
    driveDate: '2026-11-15',
    location: 'Bangalore / Hyderabad / Remote',
    status: 'Upcoming',
    description: 'Hiring software engineers for Azure distributed storage, Kubernetes infrastructure, and AI copilots.'
  },
  {
    id: 'plc-3',
    companyName: 'Texas Instruments',
    logo: 'https://www.ti.com/favicon.ico',
    role: 'Analog / Digital VLSI Design Engineer',
    packageLPA: '₹28.0 LPA',
    eligibleBranches: ['ECE', 'CSE'],
    minCGPA: 7.0,
    lastDateToApply: '2026-11-12',
    driveDate: '2026-11-22',
    location: 'Bangalore Design Center',
    status: 'Upcoming',
    description: 'Premier hardware and mixed-signal design engineer recruitment with 6-month pre-placement internship.'
  },
  {
    id: 'plc-4',
    companyName: 'Larsen & Toubro (L&T Technology Services)',
    logo: 'https://www.ltts.com/favicon.ico',
    role: 'Graduate Engineer Trainee (GET)',
    packageLPA: '₹12.5 LPA',
    eligibleBranches: ['MECH', 'CIVIL', 'ECE', 'CSE'],
    minCGPA: 6.5,
    lastDateToApply: '2026-11-02',
    driveDate: '2026-11-10',
    location: 'Mumbai / Pune / Chennai',
    status: 'Open',
    description: 'Core engineering design, smart robotics manufacturing, and infrastructure modernization.'
  }
];

export const INITIAL_CLUBS: StudentClub[] = [
  {
    id: 'club-1',
    name: 'Google Developer Student Club (GDSC)',
    category: 'Technical',
    leadName: 'Aditya Roy (President)',
    membersCount: 420,
    tagline: 'Bridging theory and industry with open source, cloud & AI.',
    description: 'Community for university students interested in Google developer technologies. Organizes workshops, hackathons, and Google Solution Challenge mentorship.',
    weeklyMeeting: 'Every Friday 04:30 PM @ Tech Lab 4',
    email: 'gdsc@campusone.edu',
    logo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'club-2',
    name: 'RoboCrafters Robotics & Drone Society',
    category: 'Technical',
    leadName: 'Kunal Verma (Lead Engineer)',
    membersCount: 180,
    tagline: 'Designing autonomous rovers, battlebots, and quadcopters.',
    description: 'Flagship hardware engineering club participating in Robocon and international aerial drone competitions. Hands-on fabrication and PCB design.',
    weeklyMeeting: 'Every Saturday 02:00 PM @ Mechatronics Hub',
    email: 'robocrafters@campusone.edu',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'club-3',
    name: 'Rhythm & Notes: Music & Performing Arts Society',
    category: 'Cultural',
    leadName: 'Sanya Malhotra (Secretary)',
    membersCount: 260,
    tagline: 'Creating campus symphonies, jamming sessions, and theatrical drama.',
    description: 'Home for singers, instrumentalists, sound engineers, and theatre actors. Hosts open mics, battle of bands, and the annual cultural fest concert.',
    weeklyMeeting: 'Every Wednesday 05:30 PM @ Music Room 201',
    email: 'rhythm@campusone.edu',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'club-4',
    name: 'Ignite: Entrepreneurship & Start-up Cell (E-Cell)',
    category: 'Entrepreneurship',
    leadName: 'Rohan Mehra (Chief Convener)',
    membersCount: 310,
    tagline: 'Transforming dorm room ideas into venture-backed startups.',
    description: 'Connected with top angel investors and venture funds. Offers seed grant mentoring, legal incorporation support, and the annual E-Summit.',
    weeklyMeeting: 'Every Thursday 05:00 PM @ Incubation Pod',
    email: 'ecell@campusone.edu',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=200&q=80'
  }
];

export const INITIAL_HOLIDAYS: AcademicHoliday[] = [
  { id: 'hol-1', date: '2026-11-01', name: 'Diwali Deepawali Festival Break', type: 'College Holiday', description: 'Campus closed for 5-day festive celebration.' },
  { id: 'hol-2', date: '2026-11-10', name: 'Commencement of Mid-Semester Examinations', type: 'Exam Period', description: 'Written & laboratory mid-term assessments.' },
  { id: 'hol-3', date: '2026-11-26', name: 'Constitution Day Observance & Seminar', type: 'College Holiday', description: 'Special lecture on constitutional democracy.' },
  { id: 'hol-4', date: '2026-12-24', name: 'Winter Break & Christmas Holiday Begins', type: 'Semester Break', description: 'Winter vacation for all batches.' },
  { id: 'hol-5', date: '2027-01-26', name: 'Republic Day Celebrations & Flag Hoisting', type: 'National Holiday', description: 'Mandatory morning ceremony at Main Grounds.' }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Urgent: Mid-Sem Exam Schedule Published',
    message: 'Check dates and venues for CS601, CS602, CS603. Hall tickets available Nov 7.',
    timestamp: '15 mins ago',
    type: 'alert',
    read: false,
    link: 'notices'
  },
  {
    id: 'notif-2',
    title: 'Google SDE Drive: Registrations Closing Soon',
    message: 'Register your candidacy before Oct 29 to receive the online assessment link.',
    timestamp: '2 hours ago',
    type: 'notice',
    read: false,
    link: 'campus/placement'
  },
  {
    id: 'notif-3',
    title: 'Assignment CS601 Due in 5 Days',
    message: 'Raft Consensus Algorithm implementation submission deadline is Oct 30.',
    timestamp: '5 hours ago',
    type: 'assignment',
    read: true,
    link: 'student/assignments'
  },
  {
    id: 'notif-4',
    title: 'Attendance Warning in Network Security (CS604)',
    message: 'Your current attendance is 71.1%. You need to attend the next 3 lectures to reach 75%.',
    timestamp: '1 day ago',
    type: 'academic',
    read: true,
    link: 'student/attendance'
  }
];

export const CAMPUS_OFFICES = [
  {
    title: 'Principal & Administrative Office',
    head: 'Office of the Principal',
    email: 'principal@gpahmedabad.ac.in',
    phone: '+91 (079) 2630-0490',
    location: 'Main Admin Building, Ground Floor',
    hours: 'Mon - Fri: 10:30 AM - 05:30 PM'
  },
  {
    title: 'Student Section & Admissions',
    head: 'Student Section In-Charge',
    email: 'studentsection@gpahmedabad.ac.in',
    phone: '+91 (079) 2630-5516',
    location: 'Admin Block, Counters 1-4',
    hours: 'Mon - Fri: 11:00 AM - 04:30 PM'
  },
  {
    title: 'Examination Section (GTU Coordinator)',
    head: 'GTU Exam Coordinator',
    email: 'exam@gpahmedabad.ac.in',
    phone: '+91 (079) 2630-5516',
    location: 'Examination Wing, 1st Floor',
    hours: 'Mon - Fri: 10:30 AM - 05:00 PM'
  },
  {
    title: 'Training & Placement Cell (TPO)',
    head: 'Training & Placement Officer',
    email: 'tpo@gpahmedabad.ac.in',
    phone: '+91 (079) 2630-0490',
    location: 'Placement & Industry Liaison Wing',
    hours: 'Mon - Fri: 10:30 AM - 05:30 PM'
  },
  {
    title: 'Student Grievance & Anti-Ragging Committee',
    head: 'Institutional Redressal Committee',
    email: 'grievance@gpahmedabad.ac.in',
    phone: '1800-180-5522 (National AICTE Toll Free)',
    location: 'Student Welfare Cell, Ambawadi Campus',
    hours: 'Working Hours & 24x7 National Helpline'
  },
  {
    title: 'Scholarships & Accounts Section',
    head: 'Accounts Officer (Digital Gujarat / MYSY)',
    email: 'accounts@gpahmedabad.ac.in',
    phone: '+91 (079) 2630-5516',
    location: 'Main Building, Counters 5-6',
    hours: 'Mon - Fri: 11:00 AM - 03:30 PM'
  }
];

export const FREQUENT_FAQS = [
  {
    q: 'What is the minimum attendance threshold required to appear for semester end exams?',
    a: 'As per university academic regulations, every student must maintain a minimum of 75% aggregate attendance in each individual theory and practical subject. If attendance drops below 75%, the student may be detained from appearing in the term-end exam unless an approved medical leave certificate is submitted within 7 days of absence.'
  },
  {
    q: 'How can I download my official grade card, transcripts, and provisional certificates?',
    a: 'Students can download their digitized semester grade cards directly from the Student Portal under the "Marks & Results" section. For stamped hard-copy transcripts, apply via the Exam Cell portal; verified copies are issued within 3 working days.'
  },
  {
    q: 'How do I apply for on-campus placements and internship drives?',
    a: 'Navigate to the "Placement Cell" module in CampusOne. Check the eligible criteria for open drives (minimum CGPA and permitted departments) and click "Register Application". Make sure your student profile has an updated resume link.'
  },
  {
    q: 'How do I borrow and reserve books from the Central Digital Library?',
    a: 'Visit the "Library Portal" tab in CampusHub, search the catalog by title, author, or ISBN, and click "Reserve Copy". You can pick up the book within 24 hours from the RFID self-service counter using your smart student ID card.'
  },
  {
    q: 'Who should I contact in case of a medical emergency on campus?',
    a: 'Call the 24/7 Campus Emergency Medical Center at +91 98200 99999 or proceed to Block H Residential Wing Ground Floor. An ambulance and resident duty doctor are on campus at all times.'
  }
];

// ----------------- PHASE 6: FACULTY PORTAL DATA -----------------

export const FACULTY_ASSIGNED_CLASSES: FacultyAssignedClass[] = [
  {
    id: 'fac-cls-1',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    semester: 6,
    division: 'Div A',
    enrolledStudentsCount: 64,
    room: 'LH-302',
    schedule: 'Mon, Tue, Fri: 09:00 AM - 10:00 AM',
    averageAttendancePct: 88.4
  },
  {
    id: 'fac-cls-2',
    subjectCode: 'CS606',
    subjectName: 'AI & Deep Learning Lab',
    semester: 6,
    division: 'Div A',
    enrolledStudentsCount: 32,
    room: 'Lab 404 (NVIDIA)',
    schedule: 'Mon: 11:15 AM - 01:15 PM',
    averageAttendancePct: 92.1
  },
  {
    id: 'fac-cls-3',
    subjectCode: 'CS608',
    subjectName: 'Major Capstone Project Mentoring',
    semester: 6,
    division: 'Div A',
    enrolledStudentsCount: 16,
    room: 'Project Hub',
    schedule: 'Wed: 02:00 PM - 04:00 PM',
    averageAttendancePct: 96.0
  }
];

export const INITIAL_STUDENT_ROSTER: StudentRosterEntry[] = [
  { id: 'st-1', rollNumber: '21CS101', name: 'Aarav Sharma', email: 'aarav.sharma@campusone.edu', status: 'present', currentAttendancePct: 90.0 },
  { id: 'st-2', rollNumber: '21CS102', name: 'Pooja Iyer', email: 'pooja.iyer@campusone.edu', status: 'present', currentAttendancePct: 94.5 },
  { id: 'st-3', rollNumber: '21CS103', name: 'Rohan Mehra', email: 'rohan.mehra@campusone.edu', status: 'present', currentAttendancePct: 82.0 },
  { id: 'st-4', rollNumber: '21CS104', name: 'Sneha Kulkarni', email: 'sneha.k@campusone.edu', status: 'present', currentAttendancePct: 87.5 },
  { id: 'st-5', rollNumber: '21CS105', name: 'Vikram Patel', email: 'vikram.p@campusone.edu', status: 'absent', currentAttendancePct: 71.0 },
  { id: 'st-6', rollNumber: '21CS106', name: 'Ananya Deshmukh', email: 'ananya.d@campusone.edu', status: 'present', currentAttendancePct: 96.0 },
  { id: 'st-7', rollNumber: '21CS107', name: 'Deepak Verma', email: 'deepak.v@campusone.edu', status: 'present', currentAttendancePct: 89.2 },
  { id: 'st-8', rollNumber: '21CS108', name: 'Kavita Nair', email: 'kavita.n@campusone.edu', status: 'late', currentAttendancePct: 78.4 }
];

export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'ses-1',
    facultyName: 'Dr. Radhika Sen',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    date: '2026-10-24',
    slot: '09:00 AM - 10:00 AM',
    topic: 'Chandy-Lamport Distributed Snapshot Algorithm',
    presentCount: 60,
    totalCount: 64
  },
  {
    id: 'ses-2',
    facultyName: 'Dr. Radhika Sen',
    subjectCode: 'CS601',
    subjectName: 'Distributed Systems',
    date: '2026-10-21',
    slot: '09:00 AM - 10:00 AM',
    topic: 'Lamport Logical Clocks & Vector Time Proofs',
    presentCount: 58,
    totalCount: 64
  },
  {
    id: 'ses-3',
    facultyName: 'Dr. Radhika Sen',
    subjectCode: 'CS606',
    subjectName: 'AI & Deep Learning Lab',
    date: '2026-10-20',
    slot: '11:15 AM - 01:15 PM',
    topic: 'Convolutional Filters & Transfer Learning with PyTorch',
    presentCount: 31,
    totalCount: 32
  }
];

// ----------------- AUDIT LOGS -----------------
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    actorName: 'Prof. K. Verma',
    actorRole: 'admin',
    action: 'PUBLISH_NOTICE',
    targetType: 'notices',
    targetId: 'not-1',
    details: 'Published Mid-Semester Exam Schedule to all university portals',
    timestamp: '2026-10-24 09:30:12'
  },
  {
    id: 'log-2',
    actorName: 'Dr. Radhika Sen',
    actorRole: 'faculty',
    action: 'MARK_ATTENDANCE',
    targetType: 'attendance_sessions',
    targetId: 'ses-1',
    details: 'Recorded attendance session for CS601 (60 present / 64 total)',
    timestamp: '2026-10-24 10:05:00'
  },
  {
    id: 'log-3',
    actorName: 'Dr. Radhika Sen',
    actorRole: 'faculty',
    action: 'CREATE_ASSIGNMENT',
    targetType: 'assignments',
    targetId: 'asg-1',
    details: 'Created Assignment: Raft Consensus Algorithm Implementation',
    timestamp: '2026-10-18 14:20:45'
  },
  {
    id: 'log-4',
    actorName: 'Prof. K. Verma',
    actorRole: 'admin',
    action: 'UPDATE_FACULTY',
    targetType: 'faculty',
    targetId: 'fac-1',
    details: 'Updated consultation hours and cabin information for Dr. Radhika Sen',
    timestamp: '2026-10-15 11:10:00'
  }
];

// ----------------- FEEDBACK ENTRIES -----------------
export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@campusone.edu',
    category: 'Facilities',
    message: 'Could we have more charging ports installed in the Central Library 3rd floor quiet study zone?',
    status: 'In Review',
    createdAt: '2026-10-22'
  },
  {
    id: 'fb-2',
    userName: 'Pooja Iyer',
    userEmail: 'pooja.iyer@campusone.edu',
    category: 'Academic',
    message: 'Request to arrange an extra tutorial session for Compiler Design syntax-directed translation.',
    status: 'Resolved',
    createdAt: '2026-10-19'
  },
  {
    id: 'fb-3',
    userName: 'Rohan Mehra',
    userEmail: 'rohan.mehra@campusone.edu',
    category: 'Hostel/Canteen',
    message: 'Food court night token counter should extend closing time by 30 mins during exam weeks.',
    status: 'Pending',
    createdAt: '2026-10-24'
  }
];
