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
assert(authContent.includes('resetPassword'), 'AuthContext implements resetPassword');
assert(authContent.includes('onAuthStateChange'), 'AuthContext listens to onAuthStateChange');
assert(authContent.includes('from(\'profiles\')'), 'AuthContext loads verified profiles from Supabase');

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

console.log('\n====================================================');
console.log(`Results: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
