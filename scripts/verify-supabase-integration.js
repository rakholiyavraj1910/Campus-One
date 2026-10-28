import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('CampusOne Supabase Integration & Security Verification');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// 1. Verify Environment Files
console.log('1. Checking Environment & Security Configuration:');
const envExamplePath = path.join(rootDir, '.env.example');
const gitignorePath = path.join(rootDir, '.gitignore');

assert(fs.existsSync(envExamplePath), '.env.example exists');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
assert(envExampleContent.includes('VITE_SUPABASE_URL'), '.env.example contains VITE_SUPABASE_URL');
assert(envExampleContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), '.env.example contains VITE_SUPABASE_PUBLISHABLE_KEY');
assert(envExampleContent.includes('VITE_SUPABASE_ANON_KEY'), '.env.example contains backwards-compatible VITE_SUPABASE_ANON_KEY');
assert(!envExampleContent.includes('service_role'), '.env.example NEVER exposes service_role key');

assert(fs.existsSync(gitignorePath), '.gitignore exists');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
assert(gitignoreContent.includes('.env.local'), '.gitignore ignores .env.local');
assert(gitignoreContent.includes('!.env.example'), '.gitignore preserves .env.example');

// 2. Verify SQL Schema & Migrations
console.log('\n2. Checking SQL Schema & RLS Migrations:');
const migrationDir = path.join(rootDir, 'supabase', 'migrations');
const schemaSqlPath = path.join(rootDir, 'supabase', 'schema.sql');
const seedSqlPath = path.join(rootDir, 'supabase', 'seed.sql');

assert(fs.existsSync(migrationDir), 'supabase/migrations directory exists');
assert(fs.existsSync(schemaSqlPath), 'supabase/schema.sql exists');
assert(fs.existsSync(seedSqlPath), 'supabase/seed.sql exists');

const migrationFiles = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
assert(migrationFiles.length > 0, `Found version-controlled migrations: ${migrationFiles.join(', ')}`);

const migrationSql = fs.readFileSync(path.join(migrationDir, migrationFiles[0]), 'utf8');

// Check Required Tables
const requiredTables = [
  'profiles',
  'departments',
  'faculty_directory',
  'notices',
  'events',
  'event_registrations',
  'study_materials',
  'attendance_sessions',
  'attendance_records',
  'marks',
  'assignments',
  'assignment_submissions',
  'feedback',
  'audit_logs'
];

requiredTables.forEach(table => {
  assert(migrationSql.includes(`TABLE IF NOT EXISTS public.${table}`), `Schema declares table: ${table}`);
  assert(migrationSql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`), `RLS enabled on table: ${table}`);
});

// Check Security Triggers
assert(migrationSql.includes('handle_new_user()'), 'Contains handle_new_user trigger function');
assert(migrationSql.includes("assigned_role := 'student'"), 'handle_new_user forces default student role');
assert(migrationSql.includes('prevent_role_escalation()'), 'Contains prevent_role_escalation trigger function');
assert(migrationSql.includes("RAISE EXCEPTION 'Unauthorized: Only institutional administrators"), 'Prevents unauthorized role changes');

// Check Migration 2 (fix_user_role_type_and_signup)
const forwardMigrationPath = path.join(migrationDir, '20261026010000_fix_user_role_type_and_signup.sql');
assert(fs.existsSync(forwardMigrationPath), '20261026010000_fix_user_role_type_and_signup.sql exists');
const forwardSql = fs.readFileSync(forwardMigrationPath, 'utf8');
assert(forwardSql.includes("SET search_path = ''") || forwardSql.includes('SET search_path = public, pg_temp'), 'Forward migration sets search_path on security definer functions');
assert(forwardSql.includes('public.user_role_type'), 'Forward migration schema-qualifies public.user_role_type');
assert(forwardSql.includes('ON CONFLICT (id) DO NOTHING'), 'Forward migration prevents overwriting existing profile data on conflict');
assert(forwardSql.includes("assigned_role := 'student'::public.user_role_type"), 'Forward migration strictly assigns student role to all public signups');

// Check Storage Buckets
assert(migrationSql.includes("('avatars'"), 'Configures avatars storage bucket');
assert(migrationSql.includes("('study_materials'"), 'Configures study_materials storage bucket');
assert(migrationSql.includes("('notice_attachments'"), 'Configures notice_attachments storage bucket');
assert(migrationSql.includes("('assignment_submissions'"), 'Configures assignment_submissions storage bucket');

// 3. Verify Supabase Client & Truthful Mode
console.log('\n3. Checking Supabase Client & Backend Status Architecture:');
const clientPath = path.join(rootDir, 'src', 'lib', 'supabaseClient.ts');
assert(fs.existsSync(clientPath), 'src/lib/supabaseClient.ts exists');
const clientContent = fs.readFileSync(clientPath, 'utf8');
assert(clientContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), 'Client inspects VITE_SUPABASE_PUBLISHABLE_KEY');
assert(clientContent.includes('VITE_SUPABASE_ANON_KEY'), 'Client inspects fallback VITE_SUPABASE_ANON_KEY');
assert(clientContent.includes('cleanSupabaseUrl'), 'Client exports cleanSupabaseUrl');
assert(clientContent.includes('testSupabaseConnection'), 'Client exports testSupabaseConnection ping utility');
assert(clientContent.includes('getBackendStatus'), 'Client exports getBackendStatus helper');
assert(clientContent.includes('schema_missing'), 'Client distinguishes schema_missing (PGRST205) from live connected');

// Dynamic test of cleanSupabaseUrl
const testCleanUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    let u = trimmed;
    while (u.endsWith('/') || u.endsWith('/rest/v1')) {
      if (u.endsWith('/')) u = u.slice(0, -1);
      else if (u.endsWith('/rest/v1')) u = u.slice(0, -8);
    }
    return u;
  }
};
assert(testCleanUrl('https://xyz.supabase.co/rest/v1/') === 'https://xyz.supabase.co', 'cleanSupabaseUrl strips trailing /rest/v1/');
assert(testCleanUrl('https://xyz.supabase.co/rest/v1') === 'https://xyz.supabase.co', 'cleanSupabaseUrl strips /rest/v1');
assert(testCleanUrl('https://xyz.supabase.co/rest/v1/rest/v1/') === 'https://xyz.supabase.co', 'cleanSupabaseUrl strips duplicate /rest/v1/rest/v1/');
assert(testCleanUrl('https://xyz.supabase.co') === 'https://xyz.supabase.co', 'cleanSupabaseUrl preserves clean URL');

// 4. Verify AuthContext & Secure Authentication:
console.log('\n4. Checking AuthContext & Secure Authentication:');
const authContextPath = path.join(rootDir, 'src', 'context', 'AuthContext.tsx');
assert(fs.existsSync(authContextPath), 'src/context/AuthContext.tsx exists');
const authContent = fs.readFileSync(authContextPath, 'utf8');
assert(authContent.includes('signInWithPassword'), 'AuthContext implements signInWithPassword');
assert(authContent.includes('signUp'), 'AuthContext implements signUp');
assert(authContent.includes('emailRedirectTo: redirectUrl'), 'AuthContext passes emailRedirectTo in signUp');
assert(authContent.includes('resetPassword'), 'AuthContext implements resetPassword');
assert(authContent.includes('onAuthStateChange'), 'AuthContext listens to onAuthStateChange');
assert(authContent.includes('from(\'profiles\')'), 'AuthContext loads verified profiles from Supabase');

// Check Email Redirect & Auth Callback Helper
const authRedirectPath = path.join(rootDir, 'src', 'lib', 'authRedirect.ts');
assert(fs.existsSync(authRedirectPath), 'src/lib/authRedirect.ts exists');
const authRedirectContent = fs.readFileSync(authRedirectPath, 'utf8');
assert(authRedirectContent.includes('getSiteUrl'), 'authRedirect exports getSiteUrl');
assert(authRedirectContent.includes('getAuthRedirectUrl'), 'authRedirect exports getAuthRedirectUrl');
assert(authRedirectContent.includes('parseAuthUrlState'), 'authRedirect exports parseAuthUrlState');
assert(authRedirectContent.includes('cleanAuthUrlParams'), 'authRedirect exports cleanAuthUrlParams');
assert(authRedirectContent.includes('https://campus-oneweb.vercel.app'), 'authRedirect defaults to https://campus-oneweb.vercel.app canonical URL');
assert(!authRedirectContent.includes('localhost:3000'), 'authRedirect NEVER hardcodes localhost:3000');

// 5. Verify Storage Service & Real Database CRUD
console.log('\n5. Checking Storage Service CRUD Operations & Guest Security:');
const storagePath = path.join(rootDir, 'src', 'lib', 'storageService.ts');
assert(fs.existsSync(storagePath), 'src/lib/storageService.ts exists');
const storageContent = fs.readFileSync(storagePath, 'utf8');
assert(storageContent.includes('assertCanMutateContent'), 'Storage service enforces assertCanMutateContent security gate');
assert(storageContent.includes("from('notices')"), 'Storage service queries notices table');
assert(storageContent.includes("from('events')"), 'Storage service queries events table');
assert(storageContent.includes("from('faculty_directory')"), 'Storage service queries faculty_directory table');
assert(storageContent.includes("from('study_materials')"), 'Storage service queries study_materials table');
assert(storageContent.includes("from('feedback')"), 'Storage service queries feedback table');
assert(storageContent.includes("from('audit_logs')"), 'Storage service queries audit_logs table');
assert(storageContent.includes("from('attendance_sessions')"), 'Storage service queries attendance_sessions table');

// 6. Verify Guest Protection & Route Guards
console.log('\n6. Checking Guest Protection & Admin Security Guards:');
const accessDeniedPath = path.join(rootDir, 'src', 'components', 'common', 'AdminAccessDenied.tsx');
assert(fs.existsSync(accessDeniedPath), 'AdminAccessDenied.tsx component exists');
const adminDashboardPath = path.join(rootDir, 'src', 'components', 'admin', 'AdminDashboard.tsx');
const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
assert(adminDashboardContent.includes("role !== 'admin'"), 'AdminDashboard blocks non-admin users');
assert(adminDashboardContent.includes('AdminAccessDenied'), 'AdminDashboard renders AdminAccessDenied for guests');
const sidebarPath = path.join(rootDir, 'src', 'components', 'common', 'Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes("role === 'admin' ? 'Authorized' : 'Admin Only'"), 'Sidebar marks Administration as Admin Only for non-admins');

// 7. Verify Dual-Portal Login & 14 College Departments
console.log('\n7. Checking Dual-Portal Login & College Departments:');
const typesPath = path.join(rootDir, 'src', 'types', 'index.ts');
assert(fs.existsSync(typesPath), 'src/types/index.ts exists');
const typesContent = fs.readFileSync(typesPath, 'utf8');

const expectedDepartments = [
  'Architecture',
  'Automation and Robotics',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Electronics & Communication Engineering',
  'Information & Communication Technology (ICT)',
  'Information Technology (IT)',
  'Instrumentation & Control Engineering',
  'Mechanical Engineering',
  'Mechanical CAD/CAM',
  'Plastic Engineering (Sandwich Pattern)'
];

assert(typesContent.includes('COLLEGE_DEPARTMENTS'), 'types/index.ts exports COLLEGE_DEPARTMENTS');
expectedDepartments.forEach(dept => {
  assert(typesContent.includes(`'${dept}'`), `COLLEGE_DEPARTMENTS contains: ${dept}`);
});

const loginPagePath = path.join(rootDir, 'src', 'components', 'auth', 'LoginPage.tsx');
assert(fs.existsSync(loginPagePath), 'src/components/auth/LoginPage.tsx exists');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');
assert(loginPageContent.includes('Student Portal'), 'LoginPage contains Student Portal option');
assert(loginPageContent.includes('Faculty Portal'), 'LoginPage contains Faculty Portal option');
assert(loginPageContent.includes('COLLEGE_DEPARTMENTS'), 'LoginPage imports COLLEGE_DEPARTMENTS');
assert(loginPageContent.includes('id="login-department-select"'), 'LoginPage has required Department select dropdown');
assert(loginPageContent.includes('requestFacultyAccess'), 'LoginPage implements pending faculty approval request');
assert(loginPageContent.includes('Institutional Approval Required'), 'LoginPage alerts that faculty access requires admin approval');

const studentAuthPath = path.join(rootDir, 'src', 'components', 'auth', 'StudentAuthPage.tsx');
const studentAuthContent = fs.readFileSync(studentAuthPath, 'utf8');
assert(studentAuthContent.includes('COLLEGE_DEPARTMENTS'), 'StudentAuthPage imports and utilizes COLLEGE_DEPARTMENTS');
assert(studentAuthContent.includes('Department'), 'StudentAuthPage has Department dropdown');

const facultyAuthPath = path.join(rootDir, 'src', 'components', 'auth', 'FacultyAuthPage.tsx');
const facultyAuthContent = fs.readFileSync(facultyAuthPath, 'utf8');
assert(facultyAuthContent.includes('COLLEGE_DEPARTMENTS'), 'FacultyAuthPage imports and utilizes COLLEGE_DEPARTMENTS');

const profileCardPath = path.join(rootDir, 'src', 'components', 'student', 'ProfileCard.tsx');
const profileCardContent = fs.readFileSync(profileCardPath, 'utf8');
assert(profileCardContent.includes('user.department'), 'Student profile displays student department');

const manageStudentsPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageStudents.tsx');
const manageStudentsContent = fs.readFileSync(manageStudentsPath, 'utf8');
assert(manageStudentsContent.includes('s.department'), 'Admin ManageStudents displays student department');

// 8. Verify Department Directory & Storage Service
console.log('\n8. Checking Department Directory & All 14 Departments:');
const mockDataPath = path.join(rootDir, 'src', 'lib', 'mockData.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
expectedDepartments.forEach(dept => {
  assert(mockDataContent.includes(`name: '${dept}'`), `INITIAL_DEPARTMENTS contains complete profile for: ${dept}`);
});

assert(storageContent.includes('getDepartments'), 'storageService exports getDepartments');
assert(storageContent.includes("from('departments')"), 'storageService queries departments table in Supabase');

const deptDirectoryPath = path.join(rootDir, 'src', 'components', 'campus', 'DepartmentDirectory.tsx');
const deptDirectoryContent = fs.readFileSync(deptDirectoryPath, 'utf8');
assert(deptDirectoryContent.includes('getDepartments'), 'DepartmentDirectory loads departments via storageService');


console.log('\n9. Checking CampusOne Dual-Colour Brand Identity & Logo System:');
const logoPath = path.join(rootDir, 'src', 'components', 'common', 'CampusOneLogo.tsx');
assert(fs.existsSync(logoPath), 'CampusOneLogo.tsx exists');
const logoContent = fs.readFileSync(logoPath, 'utf8');
assert(logoContent.includes('export const CampusOneLogo'), 'CampusOneLogo exports CampusOneLogo component');
assert(logoContent.includes('export const CampusOneIcon'), 'CampusOneLogo exports CampusOneIcon mark');
assert(logoContent.includes('#0B192C') || logoContent.includes('fill-navy-900'), 'CampusOneLogo uses Midnight Navy (#0B192C) brand color');
assert(logoContent.includes('#00ADB5') || logoContent.includes('fill-brand-cyan'), 'CampusOneLogo uses Vibrant Turquoise (#00ADB5) brand color');
assert(logoContent.includes('withBadge'), 'CampusOneLogo supports squircle badge mode');

const faviconPath = path.join(rootDir, 'public', 'favicon.svg');
assert(fs.existsSync(faviconPath), 'public/favicon.svg exists');
const faviconContent = fs.readFileSync(faviconPath, 'utf8');
assert(faviconContent.includes('<svg') && faviconContent.includes('#00ADB5'), 'favicon.svg contains valid dual-colour SVG markup');

const indexHtmlPath = path.join(rootDir, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexHtmlContent.includes('href="/favicon.svg"'), 'index.html references /favicon.svg');

const manifestPath = path.join(rootDir, 'public', 'manifest.json');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
assert(manifestContent.includes('/favicon.svg'), 'manifest.json references /favicon.svg');

const navbarBrandPath = path.join(rootDir, 'src', 'components', 'common', 'Navbar.tsx');
const navbarBrandContent = fs.readFileSync(navbarBrandPath, 'utf8');
assert(navbarBrandContent.includes('CampusOneLogo'), 'Navbar.tsx integrates CampusOneLogo');

const sidebarLogoPath = path.join(rootDir, 'src', 'components', 'common', 'Sidebar.tsx');
const sidebarLogoContent = fs.readFileSync(sidebarLogoPath, 'utf8');
assert(sidebarLogoContent.includes('CampusOneLogo'), 'Sidebar.tsx integrates CampusOneLogo');

const loginLogoPagePath = path.join(rootDir, 'src', 'components', 'auth', 'LoginPage.tsx');
const loginLogoPageContent = fs.readFileSync(loginLogoPagePath, 'utf8');
assert(loginLogoPageContent.includes('CampusOneIcon'), 'LoginPage.tsx integrates CampusOneIcon');

console.log('\n10. Checking Desktop White-Screen Resilience & Error Recovery:');
const errorBoundaryPath = path.join(rootDir, 'src', 'components', 'common', 'ErrorBoundary.tsx');
assert(fs.existsSync(errorBoundaryPath), 'ErrorBoundary.tsx exists');
const errorBoundaryContent = fs.readFileSync(errorBoundaryPath, 'utf8');
assert(errorBoundaryContent.includes('class ErrorBoundary extends Component'), 'ErrorBoundary exports class component');
assert(errorBoundaryContent.includes('handleClearCacheAndReset'), 'ErrorBoundary implements emergency cache & session reset');

const mainTsxPath = path.join(rootDir, 'src', 'main.tsx');
const mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');
assert(mainTsxContent.includes('<ErrorBoundary>'), 'main.tsx wraps App in ErrorBoundary');

const vercelJsonPath = path.join(rootDir, 'vercel.json');
const vercelJsonContent = fs.readFileSync(vercelJsonPath, 'utf8');
assert(vercelJsonContent.includes('(?!assets/|favicon.svg|manifest.json|sw.js)'), 'vercel.json prevents rewriting assets/ to index.html');

const swPath = path.join(rootDir, 'public', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('skipWaiting') && !swContent.includes("return cached || fetch"), 'public/sw.js never does stale cache-first on index.html');

const indexHtmlPath2 = path.join(rootDir, 'index.html');
const indexHtmlContent2 = fs.readFileSync(indexHtmlPath2, 'utf8');
assert(indexHtmlContent2.includes('serviceWorker.getRegistrations'), 'index.html includes legacy serviceWorker purge script');

// 11. Checking Government Polytechnic Ahmedabad Branding & Supabase Email Templates:
console.log('\n11. Checking Institutional Branding (Government Polytechnic Ahmedabad) & Email Templates:');
assert(logoContent.includes("subtext = 'FOR GOVERNMENT POLYTECHNIC AHMEDABAD'"), 'CampusOneLogo defaults subtext to FOR GOVERNMENT POLYTECHNIC AHMEDABAD');
assert(navbarBrandContent.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'Navbar features FOR GOVERNMENT POLYTECHNIC AHMEDABAD subtitle');

const portalSelectPath = path.join(rootDir, 'src', 'components', 'auth', 'PortalSelectHub.tsx');
const portalSelectContent = fs.readFileSync(portalSelectPath, 'utf8');
assert(portalSelectContent.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'PortalSelectHub features FOR GOVERNMENT POLYTECHNIC AHMEDABAD subtitle');
assert(portalSelectContent.includes('Government Polytechnic Ahmedabad'), 'PortalSelectHub footer attributes Government Polytechnic Ahmedabad');

const loginPagePath2 = path.join(rootDir, 'src', 'components', 'auth', 'LoginPage.tsx');
const loginPageContent2 = fs.readFileSync(loginPagePath2, 'utf8');
assert(loginPageContent2.includes('Government Polytechnic Ahmedabad'), 'LoginPage features Government Polytechnic Ahmedabad');

const loadingScreenPath = path.join(rootDir, 'src', 'components', 'common', 'LoadingScreen.tsx');
const loadingScreenContent = fs.readFileSync(loadingScreenPath, 'utf8');
assert(loadingScreenContent.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'LoadingScreen displays FOR GOVERNMENT POLYTECHNIC AHMEDABAD');

const appTsxPath = path.join(rootDir, 'src', 'App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
assert(appTsxContent.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'App footer features FOR GOVERNMENT POLYTECHNIC AHMEDABAD');
assert(appTsxContent.includes('Government Polytechnic Ahmedabad'), 'App footer copyright references Government Polytechnic Ahmedabad');

// Supabase Email Templates
const emailHtmlPath = path.join(rootDir, 'supabase', 'templates', 'confirm_signup.html');
const emailTxtPath = path.join(rootDir, 'supabase', 'templates', 'confirm_signup.txt');
assert(fs.existsSync(emailHtmlPath), 'supabase/templates/confirm_signup.html exists');
assert(fs.existsSync(emailTxtPath), 'supabase/templates/confirm_signup.txt exists');

const emailHtml = fs.readFileSync(emailHtmlPath, 'utf8');
assert(emailHtml.includes('{{ .ConfirmationURL }}'), 'Email HTML template preserves {{ .ConfirmationURL }} for Supabase Auth verification');
assert(emailHtml.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'Email HTML template includes FOR GOVERNMENT POLYTECHNIC AHMEDABAD subtitle');
assert(emailHtml.includes('#0B192C'), 'Email HTML template uses deep midnight navy brand colour (#0B192C)');
assert(emailHtml.includes('#00ADB5'), 'Email HTML template uses vibrant turquoise brand colour (#00ADB5)');
assert(emailHtml.includes('Verify Your CampusOne Account'), 'Email HTML template includes heading Verify Your CampusOne Account');

const emailTxt = fs.readFileSync(emailTxtPath, 'utf8');
assert(emailTxt.includes('{{ .ConfirmationURL }}'), 'Email text template preserves {{ .ConfirmationURL }}');
assert(emailTxt.includes('Government Polytechnic Ahmedabad'), 'Email text template references Government Polytechnic Ahmedabad');

console.log('\n12. Checking Real College Workflows, Student Directory & Demo Cleanup:');
const studentDirectoryPath = path.join(rootDir, 'src', 'components', 'faculty', 'StudentDirectory.tsx');
assert(fs.existsSync(studentDirectoryPath), 'StudentDirectory.tsx exists');
const studentDirectoryContent = fs.readFileSync(studentDirectoryPath, 'utf8');
assert(studentDirectoryContent.includes('getStudents'), 'StudentDirectory uses getStudents for real Supabase profiles');

const studentProfileViewPath = path.join(rootDir, 'src', 'components', 'faculty', 'StudentProfileView.tsx');
assert(fs.existsSync(studentProfileViewPath), 'StudentProfileView.tsx exists');
const studentProfileViewContent = fs.readFileSync(studentProfileViewPath, 'utf8');
assert(studentProfileViewContent.includes('getStudentAttendanceSummary'), 'StudentProfileView fetches real attendance summary');
assert(studentProfileViewContent.includes('getStudentMarks'), 'StudentProfileView fetches real student marks');

const facultyPortalPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyPortal.tsx');
assert(fs.existsSync(facultyPortalPath), 'FacultyPortal.tsx exists');
const facultyPortalContent = fs.readFileSync(facultyPortalPath, 'utf8');
assert(facultyPortalContent.includes('StudentDirectory'), 'FacultyPortal integrates StudentDirectory');
assert(facultyPortalContent.includes('saveAttendanceSession'), 'FacultyPortal uses saveAttendanceSession for real attendance');

assert(storageContent.includes('export const saveAttendanceSession'), 'storageService exports saveAttendanceSession');
assert(storageContent.includes('export const getAttendanceSessions'), 'storageService exports getAttendanceSessions');
assert(storageContent.includes('export const getAttendanceRecordsForSession'), 'storageService exports getAttendanceRecordsForSession');
assert(storageContent.includes('export const getStudentAttendanceSummary'), 'storageService exports getStudentAttendanceSummary');
assert(storageContent.includes('export const getStudentMarks'), 'storageService exports getStudentMarks');
assert(storageContent.includes('export const saveStudentMarks'), 'storageService exports saveStudentMarks');
assert(storageContent.includes('export const getPendingFacultyRequests'), 'storageService exports getPendingFacultyRequests');
assert(storageContent.includes('export const approveFacultyRequest'), 'storageService exports approveFacultyRequest');
assert(storageContent.includes('export const rejectFacultyRequest'), 'storageService exports rejectFacultyRequest');

const migration2Path = path.join(rootDir, 'supabase', 'migrations', '20261026020000_attendance_constraints_and_clean_schema.sql');
assert(fs.existsSync(migration2Path), '20261026020000_attendance_constraints_and_clean_schema.sql exists');
const migration2Content = fs.readFileSync(migration2Path, 'utf8');
assert(migration2Content.includes('idx_attendance_records_session_student'), 'Migration ensures unique constraint on session and student');
assert(migration2Content.includes('attendance_status_type'), 'Migration updates attendance status enum');

assert(!appTsxContent.includes('<RoleSwitcherBanner'), 'App.tsx does NOT render RoleSwitcherBanner');
const authModalPath = path.join(rootDir, 'src', 'components', 'common', 'AuthModal.tsx');
const authModalContent = fs.readFileSync(authModalPath, 'utf8');
assert(!authModalContent.includes('Instant Persona Preview'), 'AuthModal does NOT show demo persona switchers');

const adminAccessDeniedPath = path.join(rootDir, 'src', 'components', 'common', 'AdminAccessDenied.tsx');
const adminAccessDeniedContent = fs.readFileSync(adminAccessDeniedPath, 'utf8');
assert(!adminAccessDeniedContent.includes('Simulate Admin Persona'), 'AdminAccessDenied does NOT show simulate role button');

const updatedManageStudentsContent = fs.readFileSync(manageStudentsPath, 'utf8');
assert(!updatedManageStudentsContent.includes('DEFAULT_STUDENTS'), 'ManageStudents removed DEFAULT_STUDENTS mock array');
assert(updatedManageStudentsContent.includes('getStudents'), 'ManageStudents fetches real students from storageService');

const manageFacultyReqPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageFacultyRequests.tsx');
const manageFacultyReqContent = fs.readFileSync(manageFacultyReqPath, 'utf8');
assert(!manageFacultyReqContent.includes('SAMPLE_PENDING_REQUESTS'), 'ManageFacultyRequests removed SAMPLE_PENDING_REQUESTS mock array');
assert(manageFacultyReqContent.includes('getPendingFacultyRequests'), 'ManageFacultyRequests fetches real pending faculty requests');

const heroBannerPath = path.join(rootDir, 'src', 'components', 'home', 'HeroBanner.tsx');
const heroBannerContent = fs.readFileSync(heroBannerPath, 'utf8');
assert(!heroBannerContent.includes('84.6%'), 'HeroBanner removed hardcoded 84.6% fake attendance');

const attendanceTrackerPath = path.join(rootDir, 'src', 'components', 'student', 'AttendanceTracker.tsx');
const attendanceTrackerContent = fs.readFileSync(attendanceTrackerPath, 'utf8');
assert(attendanceTrackerContent.includes('getStudentAttendanceSummary'), 'AttendanceTracker connects to real Supabase attendance summary');

const marksAndResultsPath = path.join(rootDir, 'src', 'components', 'student', 'MarksAndResults.tsx');
const marksAndResultsContent = fs.readFileSync(marksAndResultsPath, 'utf8');
assert(marksAndResultsContent.includes('getStudentMarks'), 'MarksAndResults connects to real Supabase marks');

const assignmentTrackerPath = path.join(rootDir, 'src', 'components', 'student', 'AssignmentTracker.tsx');
const assignmentTrackerContent = fs.readFileSync(assignmentTrackerPath, 'utf8');
assert(assignmentTrackerContent.includes('getAssignments'), 'AssignmentTracker fetches real assignments');

console.log('\n13. Checking Dedicated Email Confirmation Page & Absolute Production URLs:');
const confirmPagePath = path.join(rootDir, 'src', 'components', 'auth', 'EmailConfirmationPage.tsx');
assert(fs.existsSync(confirmPagePath), 'EmailConfirmationPage.tsx exists');
const confirmPageContent = fs.readFileSync(confirmPagePath, 'utf8');
assert(confirmPageContent.includes('verifyOtp'), 'EmailConfirmationPage implements token_hash verification via verifyOtp');
assert(confirmPageContent.includes('exchangeCodeForSession'), 'EmailConfirmationPage implements PKCE code exchange');
assert(confirmPageContent.includes('resend'), 'EmailConfirmationPage implements resend confirmation action');
assert(confirmPageContent.includes('FOR GOVERNMENT POLYTECHNIC AHMEDABAD'), 'EmailConfirmationPage features institutional subtitle');
assert(confirmPageContent.includes('Email Verified Successfully'), 'EmailConfirmationPage has verified success state');
assert(confirmPageContent.includes('Faculty Request Under Review'), 'EmailConfirmationPage has faculty pending approval state');

const freshAppContent = fs.readFileSync(appTsxPath, 'utf8');
assert(freshAppContent.includes('auth/confirm') || freshAppContent.includes('auth-confirm'), 'App.tsx parses and routes /auth/confirm');
assert(freshAppContent.includes('EmailConfirmationPage'), 'App.tsx renders EmailConfirmationPage');

const freshAuthRedirectContent = fs.readFileSync(authRedirectPath, 'utf8');
assert(freshAuthRedirectContent.includes('/auth/confirm'), 'authRedirect defaults to /auth/confirm route');

const updatedAuthContent = fs.readFileSync(authContextPath, 'utf8');
assert(updatedAuthContent.includes('/auth/confirm'), 'AuthContext sets emailRedirectTo to /auth/confirm');
assert(updatedAuthContent.includes('resendConfirmationEmail'), 'AuthContext implements resendConfirmationEmail');

const freshEmailHtml = fs.readFileSync(emailHtmlPath, 'utf8');
const freshEmailTxt = fs.readFileSync(emailTxtPath, 'utf8');
assert(freshEmailHtml.includes('/auth/confirm?token_hash={{ .TokenHash }}&type=signup'), 'Email HTML template links directly to production /auth/confirm with token_hash');
assert(freshEmailTxt.includes('/auth/confirm?token_hash={{ .TokenHash }}&type=signup'), 'Email text template links directly to production /auth/confirm with token_hash');

console.log('\n14. Checking Security Audit Remediation & Hardening:');
const migration3Path = path.join(rootDir, 'supabase', 'migrations', '20261026030000_security_audit_remediation_and_hardening.sql');
assert(fs.existsSync(migration3Path), '20261026030000_security_audit_remediation_and_hardening.sql exists');
const migration3Content = fs.readFileSync(migration3Path, 'utf8');

assert(migration3Content.includes('OLD.admin_level IS DISTINCT FROM NEW.admin_level'), 'Migration blocks unauthorized admin_level changes');
assert(migration3Content.includes('OLD.cgpa IS DISTINCT FROM NEW.cgpa'), 'Migration blocks unauthorized student CGPA tampering');
assert(migration3Content.includes('OLD.email IS DISTINCT FROM NEW.email'), 'Migration blocks unauthorized profile email modification');
assert(migration3Content.includes("NOT IN ('pending_faculty', 'rejected')"), 'Migration ensures pending or rejected faculty cannot access faculty resources');
assert(migration3Content.includes('class_sections_read_policy'), 'Migration declares read policy on class_sections');
assert(migration3Content.includes('class_sections_write_policy'), 'Migration declares admin write policy on class_sections');
assert(migration3Content.includes('student_sub_attend_manage'), 'Migration declares manage policy on student_subject_attendance');
assert(migration3Content.includes('auth.uid() IS NOT NULL'), 'Migration denies unauthenticated audit log insertion');
assert(migration3Content.includes('user_id = auth.uid()'), 'Migration enforces user_id matching on event registrations');
assert(migration3Content.includes('(storage.foldername(name))[1]'), 'Migration prevents folder injection in assignment submissions storage');
assert(migration3Content.includes('increment_notice_views'), 'Migration defines secure increment_notice_views RPC');

assert(freshAuthRedirectContent.includes("path.startsWith('//')"), 'authRedirect sanitizes protocol-relative open redirect attacks');

const freshVercelJsonContent = fs.readFileSync(vercelJsonPath, 'utf8');
assert(freshVercelJsonContent.includes('Strict-Transport-Security'), 'vercel.json configures Strict-Transport-Security header');
assert(freshVercelJsonContent.includes('Referrer-Policy'), 'vercel.json configures Referrer-Policy header');
assert(freshVercelJsonContent.includes('Permissions-Policy'), 'vercel.json configures Permissions-Policy header');
assert(freshVercelJsonContent.includes('X-XSS-Protection'), 'vercel.json configures X-XSS-Protection header');

const freshLoginPageContent = fs.readFileSync(loginPagePath, 'utf8');
assert(!freshLoginPageContent.includes('Evaluator demo fill'), 'LoginPage does not expose demo passwords or credentials');

console.log('\n15. Checking Dedicated Admin Login & Security Hardening:');
const adminAuthLibPath = path.join(rootDir, 'src', 'lib', 'adminAuth.ts');
assert(fs.existsSync(adminAuthLibPath), 'src/lib/adminAuth.ts exists');
const adminAuthLibContent = fs.readFileSync(adminAuthLibPath, 'utf8');
assert(adminAuthLibContent.includes('campusonegpa@gmail.com'), 'adminAuth.ts defines DEFAULT_ADMIN_EMAIL canonical address');
assert(adminAuthLibContent.includes('DEFAULT_ADMIN_EMAIL'), 'adminAuth.ts defines DEFAULT_ADMIN_EMAIL');
assert(!adminAuthLibContent.includes('FALLBACK_ADMIN_EMAIL'), 'adminAuth.ts does not define fallback non-canonical admin emails');
assert(!adminAuthLibContent.includes('@campusone.edu'), 'adminAuth.ts enforces single canonical institutional domain');
assert(adminAuthLibContent.includes('resolveAdminCandidateEmails'), 'adminAuth.ts exports resolveAdminCandidateEmails');
assert(adminAuthLibContent.includes('validateAdminInput'), 'adminAuth.ts exports validateAdminInput');

// Ensure password is NEVER hardcoded anywhere in src or supabase directories
function scanDirForSecret(dir, secret) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDirForSecret(fullPath, secret);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.sql') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(!content.includes(secret), `No hardcoded secret in ${path.relative(rootDir, fullPath)}`);
    }
  }
}
scanDirForSecret(path.join(rootDir, 'src'), 'vibhu1411');
scanDirForSecret(path.join(rootDir, 'supabase'), 'vibhu1411');

const adminAuthPagePath = path.join(rootDir, 'src', 'components', 'auth', 'AdminAuthPage.tsx');
const adminAuthPageContent = fs.readFileSync(adminAuthPagePath, 'utf8');
assert(adminAuthPageContent.includes('DEFAULT_ADMIN_EMAIL'), 'AdminAuthPage references DEFAULT_ADMIN_EMAIL');
assert(adminAuthPageContent.includes('Administrator Email Address'), 'AdminAuthPage uses Administrator Email Address label');
assert(adminAuthPageContent.includes('showPassword'), 'AdminAuthPage implements password visibility toggle state');
assert(adminAuthPageContent.includes('Eye') && adminAuthPageContent.includes('EyeOff'), 'AdminAuthPage renders Eye/EyeOff toggle buttons');
assert(adminAuthPageContent.includes('isSubmitting'), 'AdminAuthPage implements loading indicator state');
assert(adminAuthPageContent.includes('if (isSubmitting) return'), 'AdminAuthPage prevents repeated submissions');
assert(adminAuthPageContent.includes('validateAdminInput'), 'AdminAuthPage validates inputs before submission');
assert(adminAuthPageContent.includes("profile.role !== 'admin'"), 'AdminAuthPage verifies public.profiles.role === admin');
assert(adminAuthPageContent.includes('await signOut()'), 'AdminAuthPage revokes session for confirmed unauthorized roles');
// Verify improved error handling: profileErr alone no longer causes silent signOut + redirect
assert(adminAuthPageContent.includes('profileErr.message'), 'AdminAuthPage shows DB error message instead of silently logging out on query failure');
assert(adminAuthPageContent.includes('no administrator profile row') || adminAuthPageContent.includes('no profile row'), 'AdminAuthPage gives explicit guidance when profile row missing');

assert(adminDashboardContent.includes("role !== 'admin'"), 'AdminDashboard checks role !== admin');
assert(adminDashboardContent.includes('AdminAccessDenied'), 'AdminDashboard renders AdminAccessDenied for non-admin users');

// Verify RLS fix migration exists
const migrationRlsFixPath = path.join(rootDir, 'supabase', 'migrations', '20261028050000_fix_admin_login_rls_and_profile.sql');
assert(fs.existsSync(migrationRlsFixPath), '20261028050000_fix_admin_login_rls_and_profile.sql exists');
const migrationRlsFixContent = fs.readFileSync(migrationRlsFixPath, 'utf8');
assert(migrationRlsFixContent.includes('is_admin()'), 'RLS fix migration adds is_admin() to profiles_select_policy');
assert(migrationRlsFixContent.includes('campusonegpa@gmail.com'), 'RLS fix migration promotes campusonegpa@gmail.com');
assert(!migrationRlsFixContent.includes('INSERT INTO auth.users'), 'RLS fix migration omits direct auth.users INSERTs');
assert(!migrationRlsFixContent.includes('extensions.crypt'), 'RLS fix migration does not store encrypted passwords');

// Verify AuthContext fetchProfile no longer defaults missing profiles to role='pending'
const freshAuthContextContent = fs.readFileSync(authContextPath, 'utf8');
assert(!freshAuthContextContent.includes("assign 'pending' role to prevent premature"), 'AuthContext does not downgrade to pending role when profile row is missing');
assert(freshAuthContextContent.includes('retaining current session state'), 'AuthContext logs warning instead of downgrading on missing profile');

// Verify App.tsx does not redirect admin-auth during login flow
const freshAppTsxContent = fs.readFileSync(appTsxPath, 'utf8');
assert(freshAppTsxContent.includes('admin-auth') && freshAppTsxContent.includes('return'), 'App.tsx includes admin-auth page routing');
assert(freshAppTsxContent.includes('Do NOT redirect away from admin-auth'), 'App.tsx guards against premature redirect during admin login');

const migrationAdminPath = path.join(rootDir, 'supabase', 'migrations', '20261028040000_configure_campusone_admin_email.sql');
assert(fs.existsSync(migrationAdminPath), '20261028040000_configure_campusone_admin_email.sql exists');
const migrationAdminContent = fs.readFileSync(migrationAdminPath, 'utf8');
assert(migrationAdminContent.includes('campusonegpa@gmail.com'), 'Admin migration provisions campusonegpa@gmail.com');
assert(migrationAdminContent.includes("'admin'::public.user_role_type"), 'Admin migration strictly assigns admin user_role_type');
assert(migrationAdminContent.includes('auth.uid() IS NOT NULL AND NOT public.is_admin()'), 'Admin migration updates prevent_role_escalation for database operations');
assert(!migrationAdminContent.includes('INSERT INTO auth.users'), 'Admin migration omits direct manual auth.users INSERTs');
assert(!migrationAdminContent.includes('INSERT INTO auth.identities'), 'Admin migration omits direct manual auth.identities INSERTs');
assert(!migrationAdminContent.includes('extensions.crypt'), 'Admin migration does not store encrypted passwords in SQL');
assert(migrationAdminContent.includes('handle_new_user()'), 'Admin migration updates handle_new_user for unprivileged default assignments');
assert(!migrationAdminContent.includes("IF lower(NEW.email) ="), 'handle_new_user does not grant admin role based on signup email matching');

const freshMockDataContent = fs.readFileSync(mockDataPath, 'utf8');
assert(freshMockDataContent.includes('campusonegpa@gmail.com'), 'DEMO_USERS.admin configured with campusonegpa@gmail.com');

console.log('\n16. Checking Super Admin Dashboard & Governance Architecture:');
const confirmationModalPath = path.join(rootDir, 'src', 'components', 'admin', 'ConfirmationModal.tsx');
assert(fs.existsSync(confirmationModalPath), 'ConfirmationModal.tsx exists');
const confirmationModalContent = fs.readFileSync(confirmationModalPath, 'utf8');
assert(confirmationModalContent.includes('onConfirm') && confirmationModalContent.includes('onCancel'), 'ConfirmationModal supports onConfirm and onCancel');

const manageDepartmentsPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageDepartments.tsx');
assert(fs.existsSync(manageDepartmentsPath), 'ManageDepartments.tsx exists');
const manageDepartmentsContent = fs.readFileSync(manageDepartmentsPath, 'utf8');
assert(manageDepartmentsContent.includes('COLLEGE_DEPARTMENTS'), 'ManageDepartments references official COLLEGE_DEPARTMENTS');
assert(manageDepartmentsContent.includes('onFilterStudents'), 'ManageDepartments provides student filtering link');
assert(manageDepartmentsContent.includes('onFilterFaculty'), 'ManageDepartments provides faculty filtering link');

const manageFacilitiesPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageFacilities.tsx');
assert(fs.existsSync(manageFacilitiesPath), 'ManageFacilities.tsx exists');
const manageFacilitiesContent = fs.readFileSync(manageFacilitiesPath, 'utf8');
assert(manageFacilitiesContent.includes('getFacilities'), 'ManageFacilities fetches facilities');
assert(manageFacilitiesContent.includes('addFacility'), 'ManageFacilities supports adding facility');
assert(manageFacilitiesContent.includes('deleteFacility'), 'ManageFacilities supports deleting facility');

const databaseOverviewPath = path.join(rootDir, 'src', 'components', 'admin', 'DatabaseOverview.tsx');
assert(fs.existsSync(databaseOverviewPath), 'DatabaseOverview.tsx exists');
const databaseOverviewContent = fs.readFileSync(databaseOverviewPath, 'utf8');
assert(databaseOverviewContent.includes('getDatabaseOverviewStats'), 'DatabaseOverview reads safe telemetry stats');
assert(!databaseOverviewContent.includes('service_role'), 'DatabaseOverview NEVER references service_role');
assert(!databaseOverviewContent.includes('DROP TABLE'), 'DatabaseOverview does not contain arbitrary SQL consoles');

assert(fs.existsSync(manageStudentsPath), 'ManageStudents.tsx exists');
const superAdminManageStudentsContent = fs.readFileSync(manageStudentsPath, 'utf8');
assert(superAdminManageStudentsContent.includes('updateStudentProfile'), 'ManageStudents supports updating student profiles');
assert(superAdminManageStudentsContent.includes('updateUserStatus'), 'ManageStudents supports account suspension toggle');
assert(superAdminManageStudentsContent.includes('pageSize = 10'), 'ManageStudents implements 10-per-page pagination');

const manageFacultyPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageFaculty.tsx');
assert(fs.existsSync(manageFacultyPath), 'ManageFaculty.tsx exists');
const manageFacultyContent = fs.readFileSync(manageFacultyPath, 'utf8');
assert(manageFacultyContent.includes('addFacultyMember'), 'ManageFaculty supports adding faculty');
assert(manageFacultyContent.includes('updateFacultyMember'), 'ManageFaculty supports updating faculty');
assert(manageFacultyContent.includes('deleteFacultyMember'), 'ManageFaculty supports deactivating faculty');

const updatedAdminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
assert(updatedAdminDashboardContent.includes('ManageDepartments'), 'AdminDashboard imports ManageDepartments');
assert(updatedAdminDashboardContent.includes('ManageFacilities'), 'AdminDashboard imports ManageFacilities');
assert(updatedAdminDashboardContent.includes('DatabaseOverview'), 'AdminDashboard imports DatabaseOverview');
assert(updatedAdminDashboardContent.includes('studentDeptFilter'), 'AdminDashboard coordinates student department filter');
assert(updatedAdminDashboardContent.includes('facultyDeptFilter'), 'AdminDashboard coordinates faculty department filter');

const updatedStorageContent = fs.readFileSync(storagePath, 'utf8');
assert(updatedStorageContent.includes('getSuperAdminDashboardMetrics'), 'storageService exports getSuperAdminDashboardMetrics');
assert(updatedStorageContent.includes('getDatabaseOverviewStats'), 'storageService exports getDatabaseOverviewStats');
assert(updatedStorageContent.includes('getFacilities'), 'storageService exports getFacilities');
assert(updatedStorageContent.includes('addFacility'), 'storageService exports addFacility');
assert(updatedStorageContent.includes('updateFacility'), 'storageService exports updateFacility');
assert(updatedStorageContent.includes('deleteFacility'), 'storageService exports deleteFacility');

console.log('\n17. Checking Student & Faculty Profile Management & Avatar Security:');
const profileMigrationPath = path.join(rootDir, 'supabase', 'migrations', '20261028020000_profile_management_security_and_storage.sql');
assert(fs.existsSync(profileMigrationPath), '20261028020000_profile_management_security_and_storage.sql exists');
const profileMigrationContent = fs.readFileSync(profileMigrationPath, 'utf8');
assert(profileMigrationContent.includes("bucket_id = 'avatars'"), 'Migration configures avatars bucket policies');
assert(profileMigrationContent.includes('(storage.foldername(name))[1]'), 'Migration enforces user folder isolation for avatars');
assert(profileMigrationContent.includes('avatars_user_upload'), 'Migration defines avatars_user_upload policy');
assert(profileMigrationContent.includes('avatars_user_update'), 'Migration defines avatars_user_update policy');
assert(profileMigrationContent.includes('avatars_user_delete'), 'Migration defines avatars_user_delete policy');

const editableProfileMigrationPath = path.join(rootDir, 'supabase', 'migrations', '20261028030000_make_all_profile_fields_editable.sql');
assert(fs.existsSync(editableProfileMigrationPath), '20261028030000_make_all_profile_fields_editable.sql exists');
const editableProfileMigrationContent = fs.readFileSync(editableProfileMigrationPath, 'utf8');
assert(editableProfileMigrationContent.includes('prevent_role_escalation'), 'Migration defines updated prevent_role_escalation');
assert(editableProfileMigrationContent.includes('OLD.role IS DISTINCT FROM NEW.role'), 'prevent_role_escalation prevents unauthorized role changes');
assert(editableProfileMigrationContent.includes('OLD.id IS DISTINCT FROM NEW.id'), 'prevent_role_escalation protects immutable account ID');
assert(editableProfileMigrationContent.includes('OLD.email IS DISTINCT FROM NEW.email'), 'prevent_role_escalation protects immutable account email');
assert(editableProfileMigrationContent.includes('NEW.cgpa < 0.00 OR NEW.cgpa > 10.00'), 'prevent_role_escalation enforces database-level CGPA validation');
assert(editableProfileMigrationContent.includes('NEW.semester < 1 OR NEW.semester > 12'), 'prevent_role_escalation enforces database-level semester validation');
assert(editableProfileMigrationContent.includes('profiles_update_policy'), 'Migration configures profiles_update_policy');

const userAvatarPath = path.join(rootDir, 'src', 'components', 'common', 'UserAvatar.tsx');
assert(fs.existsSync(userAvatarPath), 'UserAvatar.tsx exists');
const userAvatarContent = fs.readFileSync(userAvatarPath, 'utf8');
assert(userAvatarContent.includes('getInitials'), 'UserAvatar computes fallback initials');

const imageCropModalPath = path.join(rootDir, 'src', 'components', 'common', 'ImageCropModal.tsx');
assert(fs.existsSync(imageCropModalPath), 'ImageCropModal.tsx exists');
const imageCropModalContent = fs.readFileSync(imageCropModalPath, 'utf8');
assert(imageCropModalContent.includes('image/webp'), 'ImageCropModal supports WebP format');
assert(imageCropModalContent.includes('5 * 1024 * 1024'), 'ImageCropModal enforces 5MB file limit');

assert(fs.existsSync(profileCardPath), 'ProfileCard.tsx exists');
const updatedProfileCardContent = fs.readFileSync(profileCardPath, 'utf8');
assert(updatedProfileCardContent.includes('calculateCompletion'), 'ProfileCard calculates profile completion percentage');
assert(updatedProfileCardContent.includes('updateStudentPersonalProfile'), 'ProfileCard updates personal and academic profile in database');
assert(updatedProfileCardContent.includes('ImageCropModal'), 'ProfileCard integrates ImageCropModal');
assert(updatedProfileCardContent.includes('beforeunload'), 'ProfileCard guards against unsaved form modifications');
assert(!updatedProfileCardContent.includes('Institution-Controlled Academic Fields (Locked)'), 'ProfileCard removes locked academic fields section');
assert(!updatedProfileCardContent.includes('cannot be self-edited'), 'ProfileCard removes cannot be self-edited messages');
assert(updatedProfileCardContent.includes('COLLEGE_DEPARTMENTS'), 'ProfileCard provides department dropdown');
assert(updatedProfileCardContent.includes('rollNumber'), 'ProfileCard allows editing roll number');
assert(updatedProfileCardContent.includes('prn'), 'ProfileCard allows editing PRN');
assert(updatedProfileCardContent.includes('semester'), 'ProfileCard allows editing semester');
assert(updatedProfileCardContent.includes('division'), 'ProfileCard allows editing division');
assert(updatedProfileCardContent.includes('academicYear'), 'ProfileCard allows editing academic year');
assert(updatedProfileCardContent.includes('cgpa'), 'ProfileCard allows editing CGPA');
assert(updatedProfileCardContent.includes('mentorName'), 'ProfileCard allows editing mentor name');
assert(updatedProfileCardContent.includes('mentorEmail'), 'ProfileCard allows editing mentor email');
assert(updatedProfileCardContent.includes('handleCancelEdit'), 'ProfileCard implements Cancel action restoring values');

const facultyProfilePagePath = path.join(rootDir, 'src', 'components', 'profile', 'FacultyProfilePage.tsx');
assert(fs.existsSync(facultyProfilePagePath), 'FacultyProfilePage.tsx exists');
const facultyProfilePageContent = fs.readFileSync(facultyProfilePagePath, 'utf8');
assert(facultyProfilePageContent.includes('updateFacultyPersonalProfile'), 'FacultyProfilePage updates faculty details in database');
assert(facultyProfilePageContent.includes('consultationHours'), 'FacultyProfilePage manages consultation hours');
assert(facultyProfilePageContent.includes('specialization'), 'FacultyProfilePage manages academic specializations');
assert(!facultyProfilePageContent.includes('Institution-Controlled Appointment Fields (Locked)'), 'FacultyProfilePage removes locked appointment notice');
assert(facultyProfilePageContent.includes('COLLEGE_DEPARTMENTS'), 'FacultyProfilePage allows editing department');
assert(facultyProfilePageContent.includes('FACULTY_DESIGNATIONS'), 'FacultyProfilePage allows editing designation');

const updatedFacultyPortalContent = fs.readFileSync(facultyPortalPath, 'utf8');
assert(updatedFacultyPortalContent.includes('FacultyProfilePage'), 'FacultyPortal integrates FacultyProfilePage');
assert(updatedFacultyPortalContent.includes("id: 'profile', label: 'Faculty Profile'"), 'FacultyPortal includes Faculty Profile tab');

assert(updatedStorageContent.includes('uploadProfileAvatar'), 'storageService exports uploadProfileAvatar');
assert(updatedStorageContent.includes('removeProfileAvatar'), 'storageService exports removeProfileAvatar');
assert(updatedStorageContent.includes('updateStudentPersonalProfile'), 'storageService exports updateStudentPersonalProfile');
assert(updatedStorageContent.includes('updateFacultyPersonalProfile'), 'storageService exports updateFacultyPersonalProfile');

const navbarPath = path.join(rootDir, 'src', 'components', 'common', 'Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
assert(navbarContent.includes('UserAvatar'), 'Navbar renders UserAvatar component');
assert(navbarContent.includes("onNavigate('student', 'profile')"), 'Navbar navigates to student profile');
assert(navbarContent.includes("onNavigate('faculty-portal', 'profile')"), 'Navbar navigates to faculty profile');

const updatedSidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(updatedSidebarContent.includes('UserAvatar'), 'Sidebar renders UserAvatar component');
assert(updatedSidebarContent.includes("{ id: 'profile', label: 'Faculty Profile' }"), 'Sidebar provides Faculty Profile navigation item');

console.log('\n18. Checking Fees Management & GTU/GPA Payment Options:');
const feesManagementPath = path.join(rootDir, 'src', 'components', 'student', 'FeesManagement.tsx');
assert(fs.existsSync(feesManagementPath), 'FeesManagement.tsx exists');
const feesManagementContent = fs.readFileSync(feesManagementPath, 'utf8');
assert(feesManagementContent.includes('Gujarat Technological University (GTU) Fees'), 'FeesManagement displays Option A: GTU Fees');
assert(feesManagementContent.includes('Government Polytechnic Ahmedabad (GPA) Fees'), 'FeesManagement displays Option B: GPA Fees');
assert(feesManagementContent.includes('https://student.gtu.ac.in/Login.aspx'), 'FeesManagement links to official GTU portal URL');
assert(feesManagementContent.includes('target="_blank"'), 'GTU link opens in a new tab');
assert(feesManagementContent.includes('rel="noopener noreferrer"'), 'GTU link secures target with rel noopener noreferrer');
assert(feesManagementContent.includes('GPA fee payment details will be available soon'), 'FeesManagement displays GPA fee notice');

const studentDashboardPath = path.join(rootDir, 'src', 'components', 'student', 'StudentDashboard.tsx');
const studentDashboardContent = fs.readFileSync(studentDashboardPath, 'utf8');
assert(studentDashboardContent.includes('FeesManagement'), 'StudentDashboard imports FeesManagement');
assert(studentDashboardContent.includes("id: 'fees'"), 'StudentDashboard includes fees sub-tab');

assert(updatedSidebarContent.includes("{ id: 'fees', label: 'Fees & Payment' }"), 'Sidebar includes Fees & Payment sub-item');

const freshStorageContent = fs.readFileSync(storagePath, 'utf8');
assert(freshStorageContent.includes('getStudentFeeRecords'), 'storageService exports getStudentFeeRecords');

console.log('\n19. Checking Super Admin User & Role Management & Safeguards:');
const userMgmtMigrationPath = path.join(rootDir, 'supabase', 'migrations', '20261028070000_user_role_management_and_safeguards.sql');
assert(fs.existsSync(userMgmtMigrationPath), '20261028070000_user_role_management_and_safeguards.sql exists');
const userMgmtMigrationSql = fs.readFileSync(userMgmtMigrationPath, 'utf8');
assert(userMgmtMigrationSql.includes('campusonegpa@gmail.com'), 'Migration protects primary admin campusonegpa@gmail.com');
assert(userMgmtMigrationSql.includes('The primary institutional administrator account (campusonegpa@gmail.com) cannot be demoted'), 'Migration triggers explicit primary admin demotion guard');
assert(userMgmtMigrationSql.includes('auth.uid() = OLD.id'), 'Migration triggers self-demotion lockout guard');
assert(userMgmtMigrationSql.includes('Mohini Mishra'), 'Migration defines idempotent faculty reclassification for Mohini Mishra');

const manageUsersPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageUsers.tsx');
assert(fs.existsSync(manageUsersPath), 'ManageUsers.tsx exists');
const manageUsersContent = fs.readFileSync(manageUsersPath, 'utf8');
assert(manageUsersContent.includes('getAllManageableUsers'), 'ManageUsers imports getAllManageableUsers');
assert(manageUsersContent.includes('updateAnyUserProfile'), 'ManageUsers imports updateAnyUserProfile');
assert(manageUsersContent.includes('changeUserRole'), 'ManageUsers imports changeUserRole');
assert(manageUsersContent.includes('sendUserPasswordReset'), 'ManageUsers imports sendUserPasswordReset');
assert(manageUsersContent.includes('findMohiniMishraAccounts'), 'ManageUsers imports findMohiniMishraAccounts');
assert(manageUsersContent.includes('Mohini Mishra is currently cataloged with role'), 'ManageUsers displays Mohini Mishra spotlight banner');
assert(manageUsersContent.includes('handlePromoteMohini'), 'ManageUsers provides 1-click Mohini Mishra faculty restoration');
assert(manageUsersContent.includes('adminPromotionConfirmed'), 'ManageUsers implements 2-step confirmation for Super Admin promotion');
assert(manageUsersContent.includes('campusonegpa@gmail.com'), 'ManageUsers guards primary admin against demotion');
assert(manageUsersContent.includes('currentAdmin?.id'), 'ManageUsers guards logged-in admin against self-demotion');
assert(manageUsersContent.includes('pageSize'), 'ManageUsers implements configurable pagination');

const userMgmtAdminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
assert(userMgmtAdminDashboardContent.includes('ManageUsers'), 'AdminDashboard imports ManageUsers');
assert(userMgmtAdminDashboardContent.includes("id: 'users'"), 'AdminDashboard includes users tab in navigation');
assert(userMgmtAdminDashboardContent.includes('User & Role Management'), 'AdminDashboard displays User & Role Management label');

assert(freshStorageContent.includes('export const getAllManageableUsers'), 'storageService exports getAllManageableUsers');
assert(freshStorageContent.includes('export const updateAnyUserProfile'), 'storageService exports updateAnyUserProfile');
assert(freshStorageContent.includes('export const changeUserRole'), 'storageService exports changeUserRole');
assert(freshStorageContent.includes('export const sendUserPasswordReset'), 'storageService exports sendUserPasswordReset');
assert(freshStorageContent.includes('export const findMohiniMishraAccounts'), 'storageService exports findMohiniMishraAccounts');

console.log('\n20. Checking Completely Separate Super Admin Panel Architecture:');
const adminLayoutPath = path.join(rootDir, 'src', 'components', 'admin', 'AdminLayout.tsx');
assert(fs.existsSync(adminLayoutPath), 'AdminLayout.tsx exists');
const adminLayoutContent = fs.readFileSync(adminLayoutPath, 'utf8');
assert(adminLayoutContent.includes('AdminSidebar'), 'AdminLayout imports AdminSidebar');
assert(adminLayoutContent.includes('AdminHeader'), 'AdminLayout imports AdminHeader');
assert(adminLayoutContent.includes('PlatformAnalytics'), 'AdminLayout renders PlatformAnalytics for overview');
assert(adminLayoutContent.includes('ManageUsers'), 'AdminLayout renders ManageUsers');
assert(adminLayoutContent.includes('ManageStudents'), 'AdminLayout renders ManageStudents');
assert(adminLayoutContent.includes('ManageFaculty'), 'AdminLayout renders ManageFaculty');
assert(adminLayoutContent.includes('ManageRolesAndPermissions'), 'AdminLayout renders ManageRolesAndPermissions');
assert(adminLayoutContent.includes('ManageFacultyRequests'), 'AdminLayout renders ManageFacultyRequests');
assert(adminLayoutContent.includes('ManageDepartments'), 'AdminLayout renders ManageDepartments');
assert(adminLayoutContent.includes('ManageNoticesAndEvents'), 'AdminLayout renders ManageNoticesAndEvents');
assert(adminLayoutContent.includes('ManageAcademicRecords'), 'AdminLayout renders ManageAcademicRecords');
assert(adminLayoutContent.includes('AuditLogsViewer'), 'AdminLayout renders AuditLogsViewer');
assert(adminLayoutContent.includes('SystemSettings'), 'AdminLayout renders SystemSettings');

const adminSidebarPath = path.join(rootDir, 'src', 'components', 'admin', 'AdminSidebar.tsx');
assert(fs.existsSync(adminSidebarPath), 'AdminSidebar.tsx exists');
const adminSidebarContent = fs.readFileSync(adminSidebarPath, 'utf8');
assert(adminSidebarContent.includes("'overview'"), 'AdminSidebar includes overview navigation');
assert(adminSidebarContent.includes("'users'"), 'AdminSidebar includes users navigation');
assert(adminSidebarContent.includes("'students'"), 'AdminSidebar includes students navigation');
assert(adminSidebarContent.includes("'faculty'"), 'AdminSidebar includes faculty navigation');
assert(adminSidebarContent.includes("'roles'"), 'AdminSidebar includes roles navigation');
assert(adminSidebarContent.includes("'approvals'"), 'AdminSidebar includes approvals navigation');
assert(adminSidebarContent.includes("'departments'"), 'AdminSidebar includes departments navigation');
assert(adminSidebarContent.includes("'notices-events'"), 'AdminSidebar includes notices-events navigation');
assert(adminSidebarContent.includes("'academic'"), 'AdminSidebar includes academic navigation');
assert(adminSidebarContent.includes("'audit'"), 'AdminSidebar includes audit navigation');
assert(adminSidebarContent.includes("'settings'"), 'AdminSidebar includes settings navigation');
assert(adminSidebarContent.includes('onSignOut'), 'AdminSidebar includes dedicated onSignOut handler');

const adminHeaderPath = path.join(rootDir, 'src', 'components', 'admin', 'AdminHeader.tsx');
assert(fs.existsSync(adminHeaderPath), 'AdminHeader.tsx exists');
const adminHeaderContent = fs.readFileSync(adminHeaderPath, 'utf8');
assert(adminHeaderContent.includes('bbtjbazbeyedxjfgnfcm'), 'AdminHeader displays Supabase project ref');
assert(adminHeaderContent.includes('SUPER ADMIN'), 'AdminHeader displays SUPER ADMIN clearance');
assert(adminHeaderContent.includes('onSignOut'), 'AdminHeader provides Sign Out action');

const dedicatedAccessDeniedPath = path.join(rootDir, 'src', 'components', 'admin', 'AdminAccessDenied.tsx');
assert(fs.existsSync(dedicatedAccessDeniedPath), 'AdminAccessDenied.tsx exists');
const dedicatedAccessDeniedContent = fs.readFileSync(dedicatedAccessDeniedPath, 'utf8');
assert(dedicatedAccessDeniedContent.includes('Administrative Clearance Required'), 'AdminAccessDenied informs non-admins of required clearance');
assert(dedicatedAccessDeniedContent.includes('onNavigateLogin'), 'AdminAccessDenied provides login navigation');
assert(dedicatedAccessDeniedContent.includes('onNavigatePortal'), 'AdminAccessDenied provides return to portal navigation');

const manageRolesPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageRolesAndPermissions.tsx');
assert(fs.existsSync(manageRolesPath), 'ManageRolesAndPermissions.tsx exists');
const manageRolesContent = fs.readFileSync(manageRolesPath, 'utf8');
assert(manageRolesContent.includes('campusonegpa@gmail.com'), 'ManageRolesAndPermissions safeguards primary admin');
assert(manageRolesContent.includes('prevent_role_escalation'), 'ManageRolesAndPermissions details trigger protections');
assert(manageRolesContent.includes('confirmAdminElevation'), 'ManageRolesAndPermissions enforces 2-step confirmation');

const manageNoticesEventsPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageNoticesAndEvents.tsx');
assert(fs.existsSync(manageNoticesEventsPath), 'ManageNoticesAndEvents.tsx exists');

const manageAcademicPath = path.join(rootDir, 'src', 'components', 'admin', 'ManageAcademicRecords.tsx');
assert(fs.existsSync(manageAcademicPath), 'ManageAcademicRecords.tsx exists');
const manageAcademicContent = fs.readFileSync(manageAcademicPath, 'utf8');
assert(manageAcademicContent.includes('getAttendanceSessions'), 'ManageAcademicRecords fetches authentic attendance sessions');
assert(manageAcademicContent.includes('getStudyMaterials'), 'ManageAcademicRecords inspects study materials');

const appPath = path.join(rootDir, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(appContent.includes("currentPage === 'admin'"), 'App.tsx inspects dedicated admin route');
assert(appContent.includes("currentPage === 'admin-auth'"), 'App.tsx inspects dedicated admin-auth route');
assert(appContent.includes('<AdminLayout'), 'App.tsx renders standalone AdminLayout without student UI');
assert(appContent.includes("role !== 'admin'"), 'App.tsx guards admin route against unauthorized roles');

console.log('\n21. Checking Fully Functional Faculty Portal & Supabase Integration:');
const facultyMigrationPath = path.join(rootDir, 'supabase', 'migrations', '20261028080000_faculty_portal_permissions_and_storage.sql');
assert(fs.existsSync(facultyMigrationPath), '20261028080000_faculty_portal_permissions_and_storage.sql exists');
const facultyMigrationContent = fs.readFileSync(facultyMigrationPath, 'utf8');
assert(facultyMigrationContent.includes('created_by UUID REFERENCES public.profiles(id)'), 'Migration extends notices with created_by UUID foreign key');
assert(facultyMigrationContent.includes('target_audience TEXT'), 'Migration extends notices with target_audience');
assert(facultyMigrationContent.includes('storage_path TEXT'), 'Migration adds storage_path to study_materials');
assert(facultyMigrationContent.includes('department TEXT'), 'Migration adds department to events');
assert(facultyMigrationContent.includes('notices_update_policy'), 'Migration defines faculty ownership update policy for notices');
assert(facultyMigrationContent.includes('materials_update_policy'), 'Migration defines faculty ownership update policy for study materials');
assert(facultyMigrationContent.includes('events_update_policy'), 'Migration defines faculty ownership update policy for events');
assert(facultyMigrationContent.includes('study_materials_faculty_insert'), 'Migration configures storage INSERT policy for study_materials bucket');
assert(facultyMigrationContent.includes('notices_faculty_insert'), 'Migration configures storage INSERT policy for notice_attachments bucket');

assert(storageContent.includes('export const uploadStudyMaterialFile'), 'storageService exports uploadStudyMaterialFile');
assert(storageContent.includes('export const uploadNoticeAttachment'), 'storageService exports uploadNoticeAttachment');
assert(storageContent.includes('export const getFacultyDashboardMetrics'), 'storageService exports getFacultyDashboardMetrics');
assert(storageContent.includes('export const updateStudyMaterial'), 'storageService exports updateStudyMaterial');

const facultyDashboardPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyDashboard.tsx');
assert(fs.existsSync(facultyDashboardPath), 'FacultyDashboard.tsx exists');
const facultyDashboardContent = fs.readFileSync(facultyDashboardPath, 'utf8');
assert(facultyDashboardContent.includes('getFacultyDashboardMetrics'), 'FacultyDashboard queries real metrics from Supabase');
assert(facultyDashboardContent.includes('Dept Students'), 'FacultyDashboard displays departmental students metric');
assert(facultyDashboardContent.includes('Circulars &amp; Notices'), 'FacultyDashboard displays notices metric');
assert(facultyDashboardContent.includes('Study Materials'), 'FacultyDashboard displays study materials metric');

const facultyNoticesPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyNotices.tsx');
assert(fs.existsSync(facultyNoticesPath), 'FacultyNotices.tsx exists');
const facultyNoticesContent = fs.readFileSync(facultyNoticesPath, 'utf8');
assert(facultyNoticesContent.includes('uploadNoticeAttachment'), 'FacultyNotices integrates Supabase Storage attachment upload');
assert(facultyNoticesContent.includes('isDraft'), 'FacultyNotices supports draft vs published state');
assert(facultyNoticesContent.includes('addNotice'), 'FacultyNotices calls addNotice with authenticated faculty UID');

const facultyMaterialsPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyStudyMaterials.tsx');
assert(fs.existsSync(facultyMaterialsPath), 'FacultyStudyMaterials.tsx exists');
const facultyMaterialsContent = fs.readFileSync(facultyMaterialsPath, 'utf8');
assert(facultyMaterialsContent.includes('uploadStudyMaterialFile'), 'FacultyStudyMaterials uploads authentic files to Supabase Storage');
assert(facultyMaterialsContent.includes('addStudyMaterial'), 'FacultyStudyMaterials persists metadata to database');
assert(facultyMaterialsContent.includes('updateStudyMaterial'), 'FacultyStudyMaterials supports updating file title & metadata');

const facultyEventsPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyEvents.tsx');
assert(fs.existsSync(facultyEventsPath), 'FacultyEvents.tsx exists');
const facultyEventsContent = fs.readFileSync(facultyEventsPath, 'utf8');
assert(facultyEventsContent.includes('addEvent'), 'FacultyEvents persists new workshops and seminars to Supabase');
assert(facultyEventsContent.includes('updateEvent'), 'FacultyEvents supports editing scheduled events');
assert(facultyEventsContent.includes('deleteEvent'), 'FacultyEvents supports cancelling/deleting events');

const facultyAcademicPath = path.join(rootDir, 'src', 'components', 'faculty', 'FacultyAcademicResources.tsx');
assert(fs.existsSync(facultyAcademicPath), 'FacultyAcademicResources.tsx exists');
const facultyAcademicContent = fs.readFileSync(facultyAcademicPath, 'utf8');
assert(facultyAcademicContent.includes('saveAttendanceSession'), 'FacultyAcademicResources records class attendance to Supabase');
assert(facultyAcademicContent.includes('saveStudentMarks'), 'FacultyAcademicResources commits internal marks to Supabase');

assert(facultyPortalContent.includes('FacultyDashboard'), 'FacultyPortal integrates FacultyDashboard');
assert(facultyPortalContent.includes('FacultyNotices'), 'FacultyPortal integrates FacultyNotices');
assert(facultyPortalContent.includes('FacultyStudyMaterials'), 'FacultyPortal integrates FacultyStudyMaterials');
assert(facultyPortalContent.includes('FacultyEvents'), 'FacultyPortal integrates FacultyEvents');
assert(facultyPortalContent.includes('FacultyAcademicResources'), 'FacultyPortal integrates FacultyAcademicResources');

const facultySidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(facultySidebarContent.includes("{ id: 'dashboard', label: 'Faculty Dashboard' }"), 'Sidebar includes Faculty Dashboard item');
assert(facultySidebarContent.includes("{ id: 'students', label: 'Student Directory' }"), 'Sidebar includes Student Directory item');
assert(facultySidebarContent.includes("{ id: 'notices', label: 'Notice Management' }"), 'Sidebar includes Notice Management item');
assert(facultySidebarContent.includes("{ id: 'materials', label: 'Study Materials' }"), 'Sidebar includes Study Materials item');
assert(facultySidebarContent.includes("{ id: 'events', label: 'Department Events' }"), 'Sidebar includes Department Events item');
assert(facultySidebarContent.includes("{ id: 'academic', label: 'Academic Resources' }"), 'Sidebar includes Academic Resources item');
assert(facultySidebarContent.includes("{ id: 'profile', label: 'Faculty Profile' }"), 'Sidebar includes Faculty Profile item');

console.log('\n====================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
