-- ==============================================================================
-- CampusOne Initial Database Seed Data (supabase/seed.sql)
-- Complete seed data for departments, faculty, notices, events, study materials, and facilities
-- ==============================================================================

-- 1. Seed Departments
INSERT INTO public.departments (name, code, hod_name, hod_email, established_year, total_students, total_faculty, description, vision, programs_offered, labs, banner_image)
VALUES
(
  'Architecture',
  'ARCH',
  'Prof. Sunita Deshmukh',
  'hod.arch@campusone.edu',
  2008,
  240,
  16,
  'Fostering creative and sustainable architectural design, urban planning, and heritage conservation.',
  'To lead in ecological spatial planning and smart architectural innovations.',
  ARRAY['B.Arch', 'M.Arch Urban Design'],
  ARRAY['Architectural Design Studio', 'Climatology & Environmental Lab', 'Model Making & Prototyping Workshop'],
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
),
(
  'Automation and Robotics',
  'ROBOTICS',
  'Dr. Aakash Kulkarni',
  'hod.robotics@campusone.edu',
  2018,
  320,
  18,
  'Interdisciplinary engineering advancing autonomous mobile robotics, industrial cobots, PLC/SCADA, and intelligent systems.',
  'Pioneering industrial automation 4.0 and intelligent autonomous machines.',
  ARRAY['B.Tech Automation and Robotics', 'M.Tech Industrial Robotics'],
  ARRAY['Industrial Robotics & Cobots Lab', 'Mechatronics & Sensorics Studio', 'Autonomous Navigation & ROS Lab'],
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80'
),
(
  'Automobile Engineering',
  'AUTO',
  'Dr. Rameshwar Patil',
  'hod.auto@campusone.edu',
  2010,
  300,
  18,
  'Vehicle dynamics, hybrid electric powertrains, battery management systems, and smart automotive electronics.',
  'Driving green mobility, electric vehicle technology, and smart transportation systems.',
  ARRAY['B.Tech Automobile Engineering', 'M.Tech EV Technology'],
  ARRAY['IC Engines & Dyno Testing Lab', 'EV Powertrain & Battery Testing Lab', 'Automotive Chassis & Aerodynamics Studio'],
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80'
),
(
  'Biomedical Engineering',
  'BIOMED',
  'Dr. Shalini Swaminathan',
  'hod.biomed@campusone.edu',
  2012,
  280,
  16,
  'Bridging engineering innovation with clinical medicine, medical imaging, prosthetics, and biosensors.',
  'Transforming global healthcare delivery through medical device innovation.',
  ARRAY['B.Tech Biomedical Engineering', 'M.Tech Medical Devices'],
  ARRAY['Biomedical Instrumentation Lab', 'Medical Imaging & Radiography Center', 'Biosignal Processing & Telemedicine Lab'],
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
),
(
  'Civil Engineering',
  'CIVIL',
  'Dr. Pradeep Verma',
  'hod.civil@campusone.edu',
  2000,
  450,
  24,
  'Pioneering sustainable infrastructure, earthquake-resistant design, green concrete, and geoinformatics.',
  'Building resilient, smart, and sustainable civil infrastructure.',
  ARRAY['B.Tech Civil Engineering', 'M.Tech Structural Engineering', 'Ph.D. in Civil'],
  ARRAY['Heavy Structures Testing Lab', 'Geotechnical & Soil Mechanics Lab', 'Environmental Engineering Studio', 'GIS & Remote Sensing Lab'],
  'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80'
),
(
  'Computer Engineering',
  'CE',
  'Dr. Rajeshwar Rao',
  'hod.ce@campusone.edu',
  2004,
  720,
  36,
  'Core computer architecture, operating systems, compiler construction, cloud systems, and high performance computing.',
  'Empowering technocrats with fundamental computing theory and state-of-the-art engineering practices.',
  ARRAY['B.Tech Computer Engineering', 'M.Tech Computer Engineering', 'Ph.D.'],
  ARRAY['Computer Architecture Lab', 'Operating Systems Studio', 'Embedded Computing Lab', 'Microprocessor & Interfacing Lab'],
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
),
(
  'Electrical Engineering',
  'EE',
  'Dr. Harish Chandra',
  'hod.ee@campusone.edu',
  2001,
  460,
  26,
  'Power systems engineering, smart microgrids, renewable solar/wind integration, and electrical machinery.',
  'To lead the clean energy transition through cutting-edge power electronic innovations.',
  ARRAY['B.Tech Electrical Engineering', 'M.Tech Power Systems'],
  ARRAY['High Voltage Engineering Lab', 'Electrical Machines & Drives Lab', 'Power Systems Simulation Lab', 'Smart Grid Technology Center'],
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
),
(
  'Electronics & Communication Engineering',
  'ECE',
  'Dr. Meenakshi Sundaram',
  'hod.ece@campusone.edu',
  2006,
  480,
  28,
  'Pioneering education in VLSI design, Embedded Systems, IoT, and high-frequency communication architectures.',
  'To excel in electronics design and wireless communication through collaborative research and industrial partnerships.',
  ARRAY['B.Tech ECE', 'M.Tech VLSI & Embedded Systems', 'Ph.D. in Communications'],
  ARRAY['VLSI CAD Laboratory', 'IoT & Sensors Research Lab', 'DSP & Microcontroller Studio', 'Microwave & Optical Comm Lab'],
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
),
(
  'Information & Communication Technology (ICT)',
  'ICT',
  'Dr. Arvind Natarajan',
  'hod.ict@campusone.edu',
  2014,
  360,
  20,
  'Integrating computing software with modern telecom protocols, 5G wireless broadband, and multimedia streaming architectures.',
  'Pioneering convergence in telecommunications and data processing.',
  ARRAY['B.Tech ICT', 'M.Tech Wireless Networks'],
  ARRAY['5G & Broadband Wireless Lab', 'Cloud & SDN Networking Lab', 'Multimedia Processing Studio'],
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80'
),
(
  'Information Technology (IT)',
  'IT',
  'Dr. Neha Bapat',
  'hod.it@campusone.edu',
  2005,
  600,
  30,
  'Applied enterprise software, web technologies, big data analytics, DevOps automation, and information security.',
  'Delivering agile information technologies and dependable enterprise systems.',
  ARRAY['B.Tech Information Technology', 'M.Tech Data Science'],
  ARRAY['Web Technologies & Full-Stack Lab', 'Big Data & Cloud Analytics Studio', 'Software Engineering & DevOps Lab'],
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
),
(
  'Instrumentation & Control Engineering',
  'ICE',
  'Dr. Sanjay Purohit',
  'hod.ice@campusone.edu',
  2009,
  260,
  16,
  'Precision sensor instrumentation, industrial automation, process control systems, and biomedical transducers.',
  'Excellence in process automation and precision instrumentation engineering.',
  ARRAY['B.Tech Instrumentation & Control', 'M.Tech Process Control'],
  ARRAY['Process Instrumentation & Control Lab', 'Virtual Instrumentation (LabVIEW) Studio', 'Transducers & Calibration Center'],
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
),
(
  'Mechanical Engineering',
  'MECH',
  'Dr. Vikram Singhania',
  'hod.mech@campusone.edu',
  2002,
  420,
  24,
  'Integrating fundamental mechanics with Robotics, Automation, Additive Manufacturing, and Smart Materials.',
  'To lead in sustainable engineering, green automotive solutions, and robotics innovation.',
  ARRAY['B.Tech Mechanical Engineering', 'M.Tech CAD/CAM & Robotics'],
  ARRAY['Robotics & Automation Center', 'CNC & Modern Machine Shop', 'Thermal Engineering Lab', 'Fluid Dynamics & Hydraulics Studio'],
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
),
(
  'Mechanical CAD/CAM',
  'CADCAM',
  'Prof. Nitin Bhavsar',
  'hod.cadcam@campusone.edu',
  2015,
  220,
  14,
  'Computer-aided design, finite element analysis (FEA), multi-axis CNC manufacturing, and rapid industrial prototyping.',
  'Excellence in precision design, computational analysis, and digital manufacturing.',
  ARRAY['B.Tech Mechanical CAD/CAM', 'M.Tech Advanced Manufacturing'],
  ARRAY['Advanced CAD Modeling Studio', 'FEA & Simulation Cluster', '5-Axis CNC & CAM Prototyping Workshop', '3D Additive Manufacturing Lab'],
  'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1200&q=80'
),
(
  'Plastic Engineering (Sandwich Pattern)',
  'PLASTIC',
  'Dr. Girish Mahajan',
  'hod.plastic@campusone.edu',
  2007,
  200,
  14,
  'Polymer science, plastic processing techniques, mold & die design, recycling technologies, and industry-embedded sandwich internships.',
  'Pioneering sustainable polymeric materials, bio-plastics, and industrial sandwich engineering training.',
  ARRAY['B.Tech Plastic Engineering (Sandwich Pattern)', 'M.Tech Polymer Nanotechnology'],
  ARRAY['Polymer Testing & Characterization Lab', 'Injection & Blow Molding Plant', 'Mold Design & Toolroom Studio', 'Plastics Recycling & Circularity Lab'],
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Faculty Directory
INSERT INTO public.faculty_directory (name, designation, department, qualification, experience_years, email, phone, cabin, consultation_hours, specialization, subjects_taught, avatar, research_papers_count)
VALUES
(
  'Dr. Radhika Sen',
  'Associate Professor & Academic Head',
  'Computer Science & Engineering',
  'Ph.D. (IIT Bombay), M.Tech (CSE)',
  14,
  'radhika.sen@campusone.edu',
  '+91 98765 43210',
  'Tech Block A - Cabin 304',
  'Mon, Wed 2:00 PM - 4:00 PM',
  ARRAY['Distributed Systems', 'Cloud Computing', 'Database Internals'],
  ARRAY['CS301: Database Management Systems', 'CS402: Cloud Architecture'],
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  24
),
(
  'Prof. Anand Joshi',
  'Assistant Professor',
  'Computer Science & Engineering',
  'M.Tech (BITS Pilani), B.Tech (CSE)',
  8,
  'anand.joshi@campusone.edu',
  '+91 98765 43211',
  'Tech Block A - Cabin 210',
  'Tue, Thu 3:00 PM - 5:00 PM',
  ARRAY['Algorithm Design', 'Machine Learning', 'Competitive Programming'],
  ARRAY['CS202: Data Structures & Algorithms', 'CS410: Machine Learning Fundamentals'],
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  12
),
(
  'Dr. Kavita Menon',
  'Professor & Head of Research',
  'Computer Science & Engineering',
  'Ph.D. (IISc Bangalore), PostDoc (NUS)',
  19,
  'kavita.menon@campusone.edu',
  '+91 98765 43212',
  'Research Center - Room 102',
  'Wed, Fri 10:00 AM - 12:00 PM',
  ARRAY['Cybersecurity', 'Cryptography', 'Blockchain Networks'],
  ARRAY['CS405: Cryptography & Network Security', 'CS502: Advanced Cryptosystems'],
  'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=400&q=80',
  45
),
(
  'Dr. Meenakshi Sundaram',
  'Professor & Head of Department',
  'Electronics & Communication Engineering',
  'Ph.D. (IIT Madras)',
  18,
  'meenakshi.sundaram@campusone.edu',
  '+91 98765 43213',
  'ECE Block - Cabin 101',
  'Mon to Fri 11:00 AM - 1:00 PM',
  ARRAY['VLSI Design', 'Digital Signal Processing'],
  ARRAY['EC301: Digital Signal Processing', 'EC401: VLSI Design'],
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  32
)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- 3. Seed Notices
INSERT INTO public.notices (title, category, department, semester, date, time, author, author_role, is_urgent, content, attachment_name, attachment_size, views)
VALUES
(
  'End-Semester Examination Schedule - Spring 2026',
  'Examination',
  'All',
  'All',
  CURRENT_DATE,
  '09:30 AM',
  'Office of the Controller of Examinations',
  'Controller of Examinations',
  TRUE,
  'The comprehensive timetable for the Spring 2026 End-Semester Examinations across all B.Tech, M.Tech, and Ph.D. programs has been officially ratified. Examinations will commence on May 15, 2026. Hall tickets will be issued through the student portal beginning May 5. Students with attendance below 75% are advised to check condonation guidelines with their department office immediately.',
  'Spring2026_Exam_Timetable_Official.pdf',
  '2.4 MB',
  1420
),
(
  'Google, Microsoft & Amazon On-Campus Placement Drive 2026',
  'Placement',
  'Computer Science & Engineering',
  '6',
  CURRENT_DATE - INTERVAL '1 day',
  '11:00 AM',
  'Central Training & Placement Cell',
  'T&P Officer',
  TRUE,
  'Central Placement Cell is pleased to announce joint campus hiring drives by premier tech firms for pre-final and final year students. Pre-placement talks will begin on Friday in the Main Auditorium. Eligibility criteria: CGPA 7.5 and above with no active backlogs. Submit your updated resume before midnight.',
  'Placement_Drive_Guidelines_2026.pdf',
  '1.8 MB',
  2180
),
(
  'Annual Technical Symposium "InnoQuest 2026" - Call for Papers',
  'Events',
  'All',
  'All',
  CURRENT_DATE - INTERVAL '3 days',
  '02:15 PM',
  'Institute Research Council',
  'Dean of Student Affairs',
  FALSE,
  'Submissions are invited for the 18th Annual National Technical Symposium. Themes include AI & Agentic Systems, Green Energy, Autonomous Vehicles, and Quantum Computing. Prize pool of INR 5,00,000 for top 3 student research prototypes.',
  'InnoQuest_Paper_Submission_Template.docx',
  '650 KB',
  890
);

-- 4. Seed Events
INSERT INTO public.events (title, category, date, end_date, time, venue, organizer, description, banner_image, registered_count, max_capacity, registration_open, registration_deadline, tags, contact_person, contact_email)
VALUES
(
  'Apex Hackathon 2026: 36-Hour National Innovation Sprint',
  'Technical',
  CURRENT_DATE + INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '14 days',
  '09:00 AM',
  'Central Innovation & Incubation Center (CIIC)',
  'CampusOne Developer Student Club & ACM Chapter',
  'Join over 500 top engineers in our marquee annual hackathon. Build solutions across AI/ML, Web3, Smart Cities, and Healthcare. Industry mentors from Google, AWS, and Microsoft on-site throughout the weekend.',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  184,
  300,
  TRUE,
  CURRENT_DATE + INTERVAL '10 days',
  ARRAY['Hackathon', 'AI', 'Coding', 'Cash Prize', 'Mentorship'],
  'Prof. Anand Joshi',
  'anand.joshi@campusone.edu'
),
(
  'National Conference on Emerging Distributed Systems (NCEDS 2026)',
  'Seminar',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '21 days',
  '10:00 AM',
  'Auditorium 1, Diamond Jubilee Block',
  'Department of CSE & IEEE Student Branch',
  'A flagship conference featuring keynote lectures from Turing Award laureates and distinguished scientists on the future of decentralized computing, consensus protocols, and resilient infrastructure.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
  95,
  250,
  TRUE,
  CURRENT_DATE + INTERVAL '18 days',
  ARRAY['Conference', 'IEEE', 'Research', 'Distributed Systems'],
  'Dr. Radhika Sen',
  'radhika.sen@campusone.edu'
);

-- 5. Seed Study Materials
INSERT INTO public.study_materials (title, subject_code, subject_name, department, semester, type, year, uploaded_by, upload_date, file_size, file_format, downloads_count, file_url)
VALUES
(
  'Database Management Systems - Complete Lecture Notes & SQL Cheatsheet',
  'CS301',
  'Database Management Systems',
  'Computer Science & Engineering',
  6,
  'Notes',
  '2025-2026',
  'Dr. Radhika Sen',
  CURRENT_DATE - INTERVAL '5 days',
  '8.4 MB',
  'PDF',
  342,
  'https://example.com/materials/CS301_Complete_Notes.pdf'
),
(
  'Previous 5-Year Solved End-Semester Question Papers (2020-2025)',
  'CS301',
  'Database Management Systems',
  'Computer Science & Engineering',
  6,
  'Question Paper',
  '2025-2026',
  'Examination Cell',
  CURRENT_DATE - INTERVAL '10 days',
  '12.1 MB',
  'PDF',
  589,
  'https://example.com/materials/CS301_Solved_Papers.pdf'
),
(
  'Design & Analysis of Algorithms - Advanced Dynamic Programming & Graph Theory',
  'CS302',
  'Design and Analysis of Algorithms',
  'Computer Science & Engineering',
  6,
  'Notes',
  '2025-2026',
  'Prof. Anand Joshi',
  CURRENT_DATE - INTERVAL '8 days',
  '6.2 MB',
  'PDF',
  418,
  'https://example.com/materials/CS302_DAA_Notes.pdf'
);

-- 6. Seed Facilities
INSERT INTO public.facilities (name, category, location, block, timings, description, features, image, in_charge)
VALUES
(
  'Central Digital Library & Knowledge Resource Center',
  'Academic',
  'Floors 1-3, Central Knowledge Complex',
  'Block A',
  'Open 24/7 (Reading Halls) | 8:00 AM - 10:00 PM (Lending)',
  'Spanning 45,000 sq ft, the Central Library houses over 120,000 print volumes, 40,000 e-journals (IEEE, Springer, ACM), silent reading carrels, and high-speed research terminals.',
  ARRAY['120,000+ Print Volumes', 'IEEE & ACM Digital Access', 'High-Speed Wi-Fi & Discussion Pods', 'Automated RFID Self-Checkout'],
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
  'Mr. S. K. Raman (Head Librarian)'
),
(
  'Advanced AI & Cloud Computing Supercomputing Lab',
  'Academic',
  'Room 401-404, Tech Tower',
  'Block B',
  '8:00 AM - 10:00 PM Daily',
  'Equipped with 64 NVIDIA RTX A6000 and H100 GPU clusters dedicated to deep learning research, distributed neural networks, and high-performance computing.',
  ARRAY['NVIDIA GPU Compute Clusters', '10 Gbps Fiber Backbone', 'Dual 4K Monitor Development Stations', 'Dedicated Cloud Cluster Access'],
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  'Dr. Radhika Sen (Lab Director)'
),
(
  'Olympic Sports Complex & Fitness Arena',
  'Sports',
  'South Campus Sports Pavilion',
  'Block F',
  '6:00 AM - 9:00 PM Daily',
  'World-class sports infrastructure featuring a heated indoor Olympic swimming pool, 8-lane synthetic athletics track, badminton arenas, and gymnasiums.',
  ARRAY['Indoor Olympic Size Pool', 'FIFA Standard Football Turf', 'Synthetic Basketball & Tennis Courts', 'Modern Gymnasium & Physio Unit'],
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'Capt. M. D. Pradhan (Sports Director)'
);
