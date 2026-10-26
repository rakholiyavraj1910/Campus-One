-- ==============================================================================
-- CampusOne Forward Migration: 20261026020000_attendance_constraints_and_clean_schema.sql
-- 1. Adds unique constraints to prevent duplicate attendance records
-- 2. Expands attendance_sessions with department column
-- 3. Adds 'leave' to attendance_status_type enum if not present
-- 4. Seeds all 14 Government Polytechnic Ahmedabad departments
-- 5. Safe, forward-only, idempotent, and non-destructive.
-- ==============================================================================

-- 1. Ensure 'leave' is a valid status in attendance_status_type
DO $$
BEGIN
  ALTER TYPE public.attendance_status_type ADD VALUE IF NOT EXISTS 'leave';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Add department column to attendance_sessions if not present
ALTER TABLE public.attendance_sessions 
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Computer Engineering';

-- 3. Prevent duplicate attendance records for the same student in the same session
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_records_session_student 
  ON public.attendance_records(session_id, student_id);

-- 4. Index on student_id for high-performance student attendance summaries
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id 
  ON public.attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_dept_sem 
  ON public.attendance_sessions(department, semester, division);

-- 5. Insert all 14 Government Polytechnic Ahmedabad departments
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
  ARRAY['Diploma Architecture', 'Advance Diploma in Interior Design'],
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
  ARRAY['Diploma Automation and Robotics'],
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
  ARRAY['Diploma Automobile Engineering'],
  ARRAY['IC Engines & Dyno Testing Lab', 'EV Powertrain & Battery Testing Lab', 'Automotive Chassis Studio'],
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
  'Transforming healthcare delivery through medical instrumentation excellence.',
  ARRAY['Diploma Biomedical Engineering'],
  ARRAY['Biomedical Instrumentation Lab', 'Medical Imaging Center', 'Biosignal Processing Lab'],
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
),
(
  'Civil Engineering',
  'CIVIL',
  'Dr. Pradeep Verma',
  'hod.civil@campusone.edu',
  1962,
  450,
  24,
  'Pioneering sustainable infrastructure, earthquake-resistant design, green concrete, and geoinformatics.',
  'Building resilient, smart, and sustainable civil infrastructure.',
  ARRAY['Diploma Civil Engineering'],
  ARRAY['Heavy Structures Testing Lab', 'Geotechnical & Soil Mechanics Lab', 'GIS & Surveying Studio'],
  'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=1200&q=80'
),
(
  'Computer Engineering',
  'CE',
  'Dr. Rajeshwar Rao',
  'hod.ce@campusone.edu',
  1984,
  720,
  36,
  'Core computer architecture, operating systems, cloud systems, network engineering, and cybersecurity.',
  'Empowering technocrats with fundamental computing theory and state-of-the-art engineering practices.',
  ARRAY['Diploma Computer Engineering'],
  ARRAY['Advanced Computing Lab', 'Operating Systems Studio', 'Embedded Systems & IoT Lab'],
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'
),
(
  'Electrical Engineering',
  'EE',
  'Dr. Harish Chandra',
  'hod.ee@campusone.edu',
  1965,
  460,
  26,
  'Power systems, smart grid integration, renewable solar/wind generation, power electronics, and drives.',
  'Illuminating industry with clean power systems and smart electrical engineering.',
  ARRAY['Diploma Electrical Engineering'],
  ARRAY['High Voltage Engineering Lab', 'Power Systems & Smart Grid Lab', 'Electrical Machines Testing Lab'],
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80'
),
(
  'Electronics & Communication Engineering',
  'EC',
  'Dr. Meenakshi Sundaram',
  'hod.ec@campusone.edu',
  1978,
  480,
  28,
  'Wireless communications, RF and microwave engineering, 5G networks, and microelectronics.',
  'Pioneering communications technologies and edge signal intelligence.',
  ARRAY['Diploma Electronics & Communication Engineering'],
  ARRAY['RF & Microwave Lab', 'Embedded Systems & IoT Lab', 'Signal Processing Studio'],
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
),
(
  'Information & Communication Technology (ICT)',
  'ICT',
  'Dr. Nidhi Bhatt',
  'hod.ict@campusone.edu',
  2016,
  360,
  20,
  'Convergence of software systems, telecommunications, network infrastructure, and multimedia computing.',
  'Bridging digital software paradigms with modern broadband telecommunications.',
  ARRAY['Diploma Information & Communication Technology'],
  ARRAY['Network Switching & Routing Lab', 'Multimedia Technologies Studio', 'Cloud Virtualization Lab'],
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80'
),
(
  'Information Technology (IT)',
  'IT',
  'Dr. Bhavin Joshi',
  'hod.it@campusone.edu',
  2001,
  540,
  30,
  'Full-stack enterprise application engineering, database architectures, information security, and cloud DevOps.',
  'Architecting reliable enterprise software systems and data management solutions.',
  ARRAY['Diploma Information Technology'],
  ARRAY['Full-Stack Web & Mobile Lab', 'Database Architecture Center', 'Cybersecurity Testing Studio'],
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80'
),
(
  'Instrumentation & Control Engineering',
  'IC',
  'Dr. Ketan Parmar',
  'hod.ic@campusone.edu',
  1988,
  320,
  18,
  'Industrial process control, sensor design, PLC/SCADA automation, and biomedical telemetry.',
  'Leading industrial measurement accuracy and autonomous feedback control.',
  ARRAY['Diploma Instrumentation & Control Engineering'],
  ARRAY['Process Control & Loop Tuning Lab', 'Sensors & Transducers Studio', 'PLC & DCS Automation Lab'],
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80'
),
(
  'Mechanical Engineering',
  'MECH',
  'Dr. Vikram Solanki',
  'hod.mech@campusone.edu',
  1960,
  600,
  34,
  'Thermal engineering, finite element analysis, computational fluid dynamics, robotics, and advanced machining.',
  'Powering manufacturing, green thermal cycles, and machine intelligence.',
  ARRAY['Diploma Mechanical Engineering'],
  ARRAY['Thermal Engineering & Heat Transfer Lab', 'Fluid Mechanics & Turbomachinery Lab', 'Central CNC Machining Workshop'],
  'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&w=1200&q=80'
),
(
  'Mechanical CAD/CAM',
  'CADCAM',
  'Prof. Manish Vaghela',
  'hod.cadcam@campusone.edu',
  2014,
  240,
  16,
  'Computer-aided design, 3D parametric modeling, additive manufacturing, and multi-axis CNC programming.',
  'Excellence in digital manufacturing, generative mechanical design, and rapid prototyping.',
  ARRAY['Diploma Mechanical CAD/CAM'],
  ARRAY['Parametric 3D CAD Workstation Lab', 'Additive Manufacturing & 3D Printing Studio', '5-Axis CNC Tooling Lab'],
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
),
(
  'Plastic Engineering (Sandwich Pattern)',
  'PLASTIC',
  'Dr. Dilip Choksi',
  'hod.plastic@campusone.edu',
  1982,
  280,
  16,
  'Polymer chemistry, injection molding tooling, biodegradable plastics recycling, and dual industrial training.',
  'Pioneering sustainable polymeric materials, circular bioplastics, and industrial sandwich engineering training.',
  ARRAY['Diploma Plastic Engineering (Sandwich Pattern)'],
  ARRAY['Polymer Testing & Characterization Lab', 'Injection & Blow Molding Plant', 'Mold Design Studio'],
  'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  hod_name = EXCLUDED.hod_name,
  hod_email = EXCLUDED.hod_email,
  description = EXCLUDED.description,
  vision = EXCLUDED.vision,
  programs_offered = EXCLUDED.programs_offered,
  labs = EXCLUDED.labs,
  banner_image = EXCLUDED.banner_image;

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
