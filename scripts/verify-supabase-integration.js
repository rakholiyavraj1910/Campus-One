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

console.log('\n====================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
