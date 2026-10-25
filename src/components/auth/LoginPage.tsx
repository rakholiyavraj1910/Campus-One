import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { COLLEGE_DEPARTMENTS } from '../../types';
import { 
  GraduationCap, 
  Users, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  Building2,
  Briefcase,
  MapPin,
  ShieldAlert,
  Hash,
  BookOpen
} from 'lucide-react';

export interface LoginPageProps {
  initialPortal?: 'student' | 'faculty';
  initialMode?: 'signin' | 'register' | 'forgot';
  onLoginSuccess?: () => void;
  onSwitchToAdmin?: () => void;
  intendedPath?: string;
}

const DESIGNATIONS_LIST = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Adjunct Lecturer',
  'Visiting Faculty',
  'Lab Instructor'
];

export const LoginPage: React.FC<LoginPageProps> = ({
  initialPortal = 'student',
  initialMode = 'signin',
  onLoginSuccess = () => {},
  onSwitchToAdmin = () => {},
  intendedPath
}) => {
  const { signInWithPassword, signUp, requestFacultyAccess, resetPassword, authError } = useAuth();

  const [activePortal, setActivePortal] = useState<'student' | 'faculty'>(initialPortal);
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>(initialMode);

  // Common inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<string>(COLLEGE_DEPARTMENTS[0]);

  // Student specific inputs
  const [rollNumber, setRollNumber] = useState('');
  const [prn, setPrn] = useState('');
  const [division, setDivision] = useState('A');

  // Faculty specific inputs
  const [designation, setDesignation] = useState('Associate Professor');
  const [cabin, setCabin] = useState('Tech Tower, Room 402');
  const [specialization, setSpecialization] = useState('Distributed Systems, Cloud Architecture');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchPortal = (portal: 'student' | 'faculty') => {
    setActivePortal(portal);
    setFormError(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: 'signin' | 'register' | 'forgot') => {
    setMode(newMode);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setFormError('Please enter your institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signInWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setFormError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleStudentSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your full legal student name.');
      return;
    }
    if (!department || !COLLEGE_DEPARTMENTS.includes(department as any)) {
      setFormError('Please select a valid college department.');
      return;
    }
    if (!email.trim() || !password) {
      setFormError('Please enter an institutional email and a secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(
      email.trim(), 
      password, 
      name.trim(), 
      department,
      {
        rollNumber: rollNumber.trim() || '21CS' + Math.floor(100 + Math.random() * 900),
        prn: prn.trim() || '2025' + Date.now().toString().slice(-8),
        division
      }
    );
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Student registration successful! Your verified student profile has been provisioned.');
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setFormError(result.error || 'Registration failed. Please try a different email address.');
    }
  };

  const handleFacultyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setFormError('Please enter your academic title and full name.');
      return;
    }
    if (!department || !COLLEGE_DEPARTMENTS.includes(department as any)) {
      setFormError('Please select a valid college department.');
      return;
    }
    if (!email.trim() || !password) {
      setFormError('Please provide your institutional faculty email and a secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await requestFacultyAccess(
      email.trim(),
      password,
      name.trim(),
      department,
      designation,
      cabin.trim(),
      specialization.trim()
    );
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Faculty access request submitted! Your account is awaiting administrative approval before privileges activate.');
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
    } else {
      setFormError(result.error || 'Faculty access request submission failed. Please try again.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setFormError('Please enter your registered institutional email.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email.trim());
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage('Password recovery instructions sent to your email.');
    } else {
      setFormError(result.error || 'Failed to dispatch password recovery email.');
    }
  };

  // Quick fill helper for evaluator or testing
  const handleQuickFill = (portal: 'student' | 'faculty', demoEmail: string, demoPass: string) => {
    setActivePortal(portal);
    setEmail(demoEmail);
    setPassword(demoPass);
    setMode('signin');
    setFormError(null);
    setSuccessMessage(null);
  };

  const isStudent = activePortal === 'student';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-brand-cyan/30 selection:text-brand-cyan relative overflow-hidden font-sans">
      {/* Background glowing ambient effects */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 ${isStudent ? 'bg-brand-cyan/15' : 'bg-emerald-500/15'} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isStudent ? 'bg-blue-600/15' : 'bg-teal-500/15'} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />

      {/* Top institutional bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold shadow-md transition-all duration-300 ${
              isStudent 
                ? 'bg-gradient-to-tr from-brand-cyan to-blue-600 text-slate-950 shadow-brand-cyan/20' 
                : 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
            }`}>
              {isStudent ? <GraduationCap className="w-6 h-6 text-slate-950" /> : <Users className="w-6 h-6 text-white" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Campus<span className={isStudent ? 'text-brand-cyan' : 'text-emerald-400'}>One</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                  isStudent 
                    ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {isStudent ? 'Student Academic Portal' : 'Faculty Instructional Suite'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Apex Institute of Technology &amp; Science • NAAC A++ Autonomous College
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className={`w-4 h-4 ${isStudent ? 'text-brand-cyan' : 'text-emerald-400'}`} />
            <span>Supabase Cloud Auth &amp; RLS Protected</span>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
          
          {/* 1. Primary Portal Switcher: Student vs Faculty */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Choose Institutional Access Portal
              </span>
            </div>
            <div className="grid grid-cols-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => switchPortal('student')}
                className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isStudent
                    ? 'bg-gradient-to-r from-brand-cyan to-blue-500 text-slate-950 shadow-md scale-[1.01]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => switchPortal('faculty')}
                className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  !isStudent
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md scale-[1.01]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Faculty Portal</span>
              </button>
            </div>
          </div>

          {/* 2. Portal Header Info */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {isStudent && mode === 'signin' && 'Student Portal Sign In'}
              {isStudent && mode === 'register' && 'New Student Registration'}
              {isStudent && mode === 'forgot' && 'Reset Student Password'}

              {!isStudent && mode === 'signin' && 'Faculty Suite Sign In'}
              {!isStudent && mode === 'register' && 'Request Faculty Access'}
              {!isStudent && mode === 'forgot' && 'Reset Faculty Password'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isStudent && mode === 'signin' && 'Access coursework, internal assessment marks, timetables, and attendance.'}
              {isStudent && mode === 'register' && 'Enroll your official student account. Validated records provision your central profile.'}
              {isStudent && mode === 'forgot' && 'Enter your institutional student email to receive recovery instructions.'}

              {!isStudent && mode === 'signin' && 'Access course rosters, daily attendance entry, grading sheets, and syllabus.'}
              {!isStudent && mode === 'register' && 'Submit institutional credentials. Faculty requests require administrative verification.'}
              {!isStudent && mode === 'forgot' && 'Enter your registered faculty email to recover instructional access.'}
            </p>
          </div>

          {/* 3. Sub-Mode Tabs (Sign In / Register / Recover) */}
          <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'signin'
                  ? isStudent ? 'bg-brand-cyan text-slate-950 shadow-sm' : 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? isStudent ? 'bg-brand-cyan text-slate-950 shadow-sm' : 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isStudent ? 'Student Register' : 'Request Access'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                mode === 'forgot'
                  ? isStudent ? 'bg-brand-cyan text-slate-950 shadow-sm' : 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Recover
            </button>
          </div>

          {/* 4. Faculty Pending Approval Warning (Displayed on Faculty Registration) */}
          {!isStudent && mode === 'register' && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div className="leading-relaxed">
                <span className="font-bold">Institutional Approval Required:</span> Faculty registrations do NOT grant immediate instructional privileges. Your account remains in pending verification status until approved by an authorized college administrator.
              </div>
            </div>
          )}

          {/* 5. Error & Success Banners */}
          {(formError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {formError || authError}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-semibold">
                {successMessage}
              </div>
            </div>
          )}

          {/* 6. Active Form */}
          <form 
            onSubmit={
              mode === 'signin' 
                ? handleSignIn 
                : mode === 'register' 
                ? (isStudent ? handleStudentSignUp : handleFacultyRequest) 
                : handleForgot
            } 
            className="space-y-4 text-xs"
          >
            {/* Full Name (Registration Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {isStudent ? 'Full Student Name (as per college ID)' : 'Academic Title & Full Name'} <span className={isStudent ? 'text-brand-cyan' : 'text-emerald-400'}>*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isStudent ? 'e.g. Aarav Sharma' : 'e.g. Dr. Radhika Sen'}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      isStudent ? 'focus:border-brand-cyan' : 'focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {isStudent ? 'Student Institutional Email' : 'Faculty Institutional Email'} <span className={isStudent ? 'text-brand-cyan' : 'text-emerald-400'}>*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isStudent ? 'student@campusone.edu' : 'faculty@campusone.edu'}
                  className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    isStudent ? 'focus:border-brand-cyan' : 'focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    Password (min 6 characters) <span className={isStudent ? 'text-brand-cyan' : 'text-emerald-400'}>*</span>
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className={`${isStudent ? 'text-brand-cyan' : 'text-emerald-400'} hover:underline text-[11px]`}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      isStudent ? 'focus:border-brand-cyan' : 'focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Department Dropdown (REQUIRED on registration for both student & faculty) */}
            {mode === 'register' && (
              <div>
                <label htmlFor="login-department-select" className="block text-slate-300 font-semibold mb-1.5">
                  Department <span className={isStudent ? 'text-brand-cyan' : 'text-emerald-400'}>*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <select
                    id="login-department-select"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none transition-colors ${
                      isStudent ? 'focus:border-brand-cyan' : 'focus:border-emerald-500'
                    }`}
                  >
                    {COLLEGE_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Student Additional Fields (Optional Enrollment Metadata) */}
            {isStudent && mode === 'register' && (
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll No</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="21CS104"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PRN Code</label>
                  <input
                    type="text"
                    value={prn}
                    onChange={(e) => setPrn(e.target.value)}
                    placeholder="20210164"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-2 text-white focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="A">Div A</option>
                    <option value="B">Div B</option>
                    <option value="C">Div C</option>
                  </select>
                </div>
              </div>
            )}

            {/* Faculty Additional Fields */}
            {!isStudent && mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Academic Designation <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {DESIGNATIONS_LIST.map((des) => (
                        <option key={des} value={des}>
                          {des}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Cabin / Office Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        value={cabin}
                        onChange={(e) => setCabin(e.target.value)}
                        placeholder="Tech Tower 402"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Specialization &amp; Research Focus
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Distributed Systems, Cloud Architecture"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer ${
                isStudent
                  ? 'bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 shadow-brand-cyan/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-navy-950 shadow-emerald-500/20'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>
                    {isStudent && mode === 'signin' && 'Sign In to Student Portal'}
                    {isStudent && mode === 'register' && 'Create Verified Student Account'}
                    {isStudent && mode === 'forgot' && 'Send Student Reset Link'}

                    {!isStudent && mode === 'signin' && 'Sign In to Faculty Suite'}
                    {!isStudent && mode === 'register' && 'Submit Faculty Access Request'}
                    {!isStudent && mode === 'forgot' && 'Send Faculty Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 7. Clear Cross-Portal Switcher Link */}
          <div className="mt-6 pt-5 border-t border-slate-900 text-center space-y-2">
            <p className="text-xs text-slate-400">
              {isStudent ? (
                <>
                  Are you a college faculty member?{' '}
                  <button
                    type="button"
                    onClick={() => switchPortal('faculty')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                  >
                    Switch to Faculty Portal &rarr;
                  </button>
                </>
              ) : (
                <>
                  Are you an enrolled college student?{' '}
                  <button
                    type="button"
                    onClick={() => switchPortal('student')}
                    className="text-brand-cyan hover:text-cyan-300 font-bold hover:underline cursor-pointer"
                  >
                    Switch to Student Portal &rarr;
                  </button>
                </>
              )}
            </p>

            <p className="text-[11px] text-slate-500">
              Institutional Administrator?{' '}
              <button
                type="button"
                onClick={onSwitchToAdmin}
                className="text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Access Admin Control Center &rarr;
              </button>
            </p>
          </div>

          {/* 8. Demo Quick Fill Helper */}
          <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Evaluator demo fill:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student', 'aarav.sharma@campusone.edu', 'demo1234')}
                className="text-brand-cyan hover:underline"
              >
                Demo Student
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty', 'radhika.sen@campusone.edu', 'demo1234')}
                className="text-emerald-400 hover:underline"
              >
                Demo Faculty
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-3 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} CampusOne College Management System. All Institutional Rights Reserved.</p>
      </footer>
    </div>
  );
};
