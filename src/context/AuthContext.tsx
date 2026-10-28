import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getAuthRedirectUrl } from '../lib/authRedirect';
import { resolveAdminCandidateEmails } from '../lib/adminAuth';

export interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  isGuest: boolean;
  isPending: boolean;
  canManageContent: boolean;
  isLiveMode: boolean;
  loading: boolean;
  authError: string | null;
  // Live Supabase Auth Methods
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string, 
    password: string, 
    name: string, 
    department?: string,
    studentDetails?: { rollNumber?: string; prn?: string; division?: string }
  ) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  requestFacultyAccess: (
    email: string,
    password: string,
    name: string,
    department: string,
    designation: string,
    cabin?: string,
    specialization?: string
  ) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  signOut: (reason?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Compatibility & Demo mode methods
  switchRole: (newRole: UserRole) => void;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  setAuthenticatedProfile: (profile: UserProfile) => void;
  updateLocalUserProfile: (updates: Partial<UserProfile>) => void;
}

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Campus Visitor',
  email: 'guest@campusone.edu',
  role: 'guest',
  department: 'General Public',
};

// Convert DB row to UserProfile
export const mapDbProfile = (db: any): UserProfile => {
  const isPendingApproval = db.admin_level === 'pending_faculty' || db.role === 'pending';
  return {
    id: db.id,
    name: db.name || 'CampusOne User',
    email: db.email,
    role: isPendingApproval ? 'pending' : ((db.role as UserRole) || 'student'),
    avatar: db.avatar_url || undefined,
    phone: db.phone || undefined,
    department: db.department || undefined,
    rollNumber: db.roll_number || undefined,
    prn: db.prn || undefined,
    semester: db.semester || undefined,
    academicYear: db.academic_year || undefined,
    division: db.division || undefined,
    cgpa: db.cgpa ? Number(db.cgpa) : undefined,
    mentorName: db.mentor_name || undefined,
    mentorEmail: db.mentor_email || undefined,
    designation: db.designation || undefined,
    cabin: db.cabin || undefined,
    specialization: db.specialization || undefined,
    consultationHours: db.consultation_hours || undefined,
    adminLevel: db.admin_level || undefined,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveMode] = useState<boolean>(isSupabaseConfigured);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // In demo mode or initial state, use localStorage
  const [demoRole, setDemoRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('campusone_active_role') as UserRole;
      return saved && DEMO_USERS[saved] ? saved : 'student';
    } catch {
      return 'student';
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (!isSupabaseConfigured) {
      try {
        const savedUser = localStorage.getItem('campusone_user_profile');
        if (savedUser) {
          return JSON.parse(savedUser);
        }
      } catch {
        // ignore
      }
      return DEMO_USERS[demoRole] || DEMO_USERS.student;
    }
    return GUEST_USER;
  });

  // Fetch user profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      console.info('[CampusOne:Auth] fetchProfile starting query for userId:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[CampusOne:Auth] fetchProfile query error:', error.message, '(code:', error.code, ')');
        return null;
      }

      if (data) {
        console.info('[CampusOne:Auth] fetchProfile success. userId:', userId, 'role:', data.role, 'admin_level:', data.admin_level);
        return mapDbProfile(data);
      }

      console.warn('[CampusOne:Auth] fetchProfile: no profile row found in public.profiles for userId:', userId, '(retaining current session state)');
      return null;
    } catch (e: any) {
      console.error('[CampusOne:Auth] fetchProfile unexpected error:', e?.message);
      return null;
    }
  }, []);

  // Initialize and listen to Supabase Auth state
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;

    const initAuth = async () => {
      try {
        console.info('[CampusOne:Auth] initAuth: checking existing session...');
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          console.info('[CampusOne:Auth] initAuth: session active for userId:', session.user.id);
          let profile = await fetchProfile(session.user.id, session.user.email);
          if (!profile) {
            // Cold start retry
            await new Promise(r => setTimeout(r, 400));
            profile = await fetchProfile(session.user.id, session.user.email);
          }
          if (isMounted) {
            if (profile) {
              console.info('[CampusOne:Auth] initAuth: profile restored with role:', profile.role);
              setCurrentUser(profile);
            } else {
              console.warn('[CampusOne:Auth] initAuth: session active but profile row missing in public.profiles for', session.user.email);
              // Do NOT assign student role! Keep as guest so unauthenticated/guest guards handle gracefully
              setCurrentUser({
                id: session.user.id,
                email: session.user.email || '',
                name: (session.user.email || '').split('@')[0],
                role: 'guest',
              });
            }
          }
        } else if (isMounted) {
          console.info('[CampusOne:Auth] initAuth: no active session found.');
          setCurrentUser(GUEST_USER);
        }
      } catch (err: any) {
        console.warn('[CampusOne:Auth] initAuth session initialization error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: authListener } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.info('[CampusOne:Auth] onAuthStateChange event:', event, 'userId:', session?.user?.id);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id, session.user.email);
            if (isMounted && profile) {
              console.info('[CampusOne:Auth] onAuthStateChange: updated user profile to role:', profile.role);
              setCurrentUser(profile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            console.info('[CampusOne:Auth] onAuthStateChange: user signed out. Reverting to guest.');
            setCurrentUser(GUEST_USER);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  // Persist demo mode settings
  useEffect(() => {
    if (!isLiveMode) {
      localStorage.setItem('campusone_active_role', currentUser.role);
      localStorage.setItem('campusone_user_profile', JSON.stringify(currentUser));
    }
  }, [isLiveMode, currentUser]);

  // Live Supabase SignIn (Accepts email or administrative username)
  const signInWithPassword = async (emailOrUsername: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    const identifier = (emailOrUsername || '').trim();

    if (!identifier) {
      return { success: false, error: 'Username or email is required.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const candidateEmails = resolveAdminCandidateEmails(identifier);

    if (!isSupabaseConfigured || !supabase) {
      // In offline/demo mode, authenticate against demo personas
      const matched = Object.values(DEMO_USERS).find(u => {
        const userEmail = u.email.toLowerCase();
        const inputId = identifier.toLowerCase();
        if (userEmail === inputId) return true;
        if (candidateEmails.some(c => c === userEmail)) return true;
        if (u.role === 'admin' && (inputId === 'campusonegpa@gmail.com' || inputId === 'campusonegpa' || inputId === 'vibhusuvaliyacampusone' || inputId.startsWith('vibhusuvaliya'))) {
          return true;
        }
        return false;
      });

      if (matched) {
        setCurrentUser(matched);
        setDemoRole(matched.role);
        return { success: true };
      }

      // Or default to student with custom email
      const customStudent: UserProfile = {
        ...DEMO_USERS.student,
        email: candidateEmails[0] || identifier,
        name: identifier.split('@')[0],
      };
      setCurrentUser(customStudent);
      setDemoRole('student');
      return { success: true };
    }

    try {
      if (candidateEmails.length === 0) {
        const msg = 'Please enter a valid email address or registered administrator username.';
        setAuthError(msg);
        return { success: false, error: msg };
      }

      let lastError: string | undefined;

      // Attempt authentication for canonical candidate email
      for (const targetEmail of candidateEmails) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (!error && data.user) {
          console.info('[CampusOne:Auth] signInWithPassword GoTrue success. User ID:', data.user.id);
          let profile = await fetchProfile(data.user.id, data.user.email);
          if (!profile) {
            // Brief wait and retry in case of replication or propagation delay
            await new Promise(r => setTimeout(r, 350));
            profile = await fetchProfile(data.user.id, data.user.email);
          }
          if (profile) {
            console.info('[CampusOne:Auth] signInWithPassword profile loaded. Role:', profile.role);
            setCurrentUser(profile);
            setDemoRole(profile.role);
          } else {
            console.warn('[CampusOne:Auth] signInWithPassword: no profile row found in public.profiles for', data.user.email);
            // Retain session user identity without assigning student role
            setCurrentUser({
              id: data.user.id,
              email: data.user.email || '',
              name: (data.user.email || '').split('@')[0],
              role: 'guest',
            });
          }
          return { success: true };
        }

        if (error) {
          lastError = error.message;
          // If error is not invalid credentials (e.g. rate limit or unconfirmed email), do not retry next candidate
          if (error.message !== 'Invalid login credentials') {
            break;
          }
        }
      }

      const finalError = lastError || 'Invalid login credentials';
      setAuthError(finalError);
      return { success: false, error: finalError };
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Live Supabase SignUp (Security: student portal registrations receive exclusively student role)
  const signUp = async (
    email: string,
    password: string,
    name: string,
    department: string = 'Computer Science & Engineering',
    studentDetails?: { rollNumber?: string; prn?: string; division?: string }
  ): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Offline demo fallback
      const newUser: UserProfile = {
        ...DEMO_USERS.student,
        id: 'usr-' + Date.now(),
        email,
        name,
        department,
        rollNumber: studentDetails?.rollNumber || '21CS' + Math.floor(100 + Math.random() * 900),
        prn: studentDetails?.prn || '2025' + Date.now().toString().slice(-8),
        division: studentDetails?.division || 'A',
        role: 'student',
      };
      setCurrentUser(newUser);
      setDemoRole('student');
      return { success: true };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/confirm');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
            department,
            roll_number: studentDetails?.rollNumber || '',
            prn: studentDetails?.prn || '',
            division: studentDetails?.division || 'A',
            role: 'student', // Client can only request student; database trigger strictly validates this
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      const needsEmailConfirmation = !data.session;

      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              department,
              name: name.trim(),
              roll_number: studentDetails?.rollNumber || '',
              prn: studentDetails?.prn || '',
              division: studentDetails?.division || 'A'
            })
            .eq('id', data.user.id);
        } catch (e) {
          console.warn('Initial student profile sync non-blocking notice:', e);
        }
        if (data.session) {
          const profile = await fetchProfile(data.user.id, data.user.email);
          if (profile) setCurrentUser(profile);
        }
      }

      return { success: true, needsEmailConfirmation };
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Dedicated Faculty Access Request (Creates pending approval profile; requires institutional admin approval)
  const requestFacultyAccess = async (
    email: string,
    password: string,
    name: string,
    department: string,
    designation: string,
    cabin?: string,
    specialization?: string
  ): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      // Offline demo fallback - store pending request and set pending state
      const pendingProfile: UserProfile = {
        id: 'fac-req-' + Date.now(),
        name,
        email,
        role: 'pending',
        department,
        designation,
        cabin: cabin || 'Faculty Tower',
        adminLevel: 'pending_faculty',
      };
      try {
        const existing = JSON.parse(localStorage.getItem('campusone_pending_faculty_requests') || '[]');
        existing.push({
          id: pendingProfile.id,
          name,
          email,
          department,
          designation,
          cabin: cabin || 'Faculty Tower',
          specialization: specialization ? specialization.split(',').map(s => s.trim()) : [],
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
        localStorage.setItem('campusone_pending_faculty_requests', JSON.stringify(existing));
      } catch {
        // ignore
      }
      setCurrentUser(pendingProfile);
      return { success: true };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/confirm?role=faculty');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
            department,
            designation,
            cabin: cabin || 'Faculty Tower',
            specialization: specialization ? specialization.split(',').map(s => s.trim()) : [],
            role: 'student', // Initial database role default; elevated strictly upon admin approval
            requested_role: 'faculty',
            admin_level: 'pending_faculty',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      const needsEmailConfirmation = !data.session;

      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              department,
              name: name.trim(),
              designation,
              cabin: cabin || 'Faculty Tower',
              specialization: specialization ? specialization.split(',').map(s => s.trim()) : [],
              admin_level: 'pending_faculty'
            })
            .eq('id', data.user.id);
        } catch (e) {
          console.warn('Initial faculty profile sync non-blocking notice:', e);
        }
        if (data.session) {
          const profile = await fetchProfile(data.user.id, data.user.email);
          if (profile) setCurrentUser(profile);
        }
      }

      return { success: true, needsEmailConfirmation };
    } catch (err: any) {
      const msg = err.message || 'Faculty access request failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Live Supabase SignOut
  const signOut = async (reason?: string): Promise<void> => {
    console.info(`[CampusOne:Auth] signOut initiated${reason ? `: ${reason}` : ''}`);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[CampusOne:Auth] Supabase signOut error:', err);
      }
    }
    setCurrentUser(GUEST_USER);
    localStorage.removeItem('campusone_active_role');
    localStorage.removeItem('campusone_user_profile');
    localStorage.removeItem('campusone_auth_token');
  };

  // Live Supabase Password Reset
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: true,
        error: undefined,
      };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/login?mode=reset');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email.' };
    }
  };

  // Live Supabase Resend Confirmation Email
  const resendConfirmationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    try {
      const redirectUrl = getAuthRedirectUrl('/auth/confirm');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to dispatch confirmation email.' };
    }
  };

  // Role Switcher: In live mode, authorization is strictly bound to PostgreSQL profiles
  const switchRole = (newRole: UserRole) => {
    if (isSupabaseConfigured) {
      console.warn('Role escalation prevented. In live Supabase mode, role is resolved from public.profiles in PostgreSQL.');
      return;
    }
    setDemoRole(newRole);
    setCurrentUser(DEMO_USERS[newRole] || GUEST_USER);
  };

  const login = (email: string, chosenRole: UserRole, customName?: string) => {
    const base = DEMO_USERS[chosenRole] || DEMO_USERS.student;
    const newUser: UserProfile = {
      ...base,
      email,
      name: customName || base.name,
      role: chosenRole,
    };
    setDemoRole(chosenRole);
    setCurrentUser(newUser);
  };

  const logout = () => {
    signOut('User initiated logout');
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase && currentUser.id !== 'guest') {
      const updated = await fetchProfile(currentUser.id, currentUser.email);
      if (updated) {
        setCurrentUser(updated);
        return updated;
      }
    }
    return null;
  };

  const setAuthenticatedProfile = (profile: UserProfile) => {
    console.info(`[CampusOne:Auth] setAuthenticatedProfile explicitly called with role=${profile.role}, email=${profile.email}`);
    setCurrentUser(profile);
    setDemoRole(profile.role);
    try {
      localStorage.setItem('campusone_user_profile', JSON.stringify(profile));
      localStorage.setItem('campusone_active_role', profile.role);
    } catch {
      // ignore
    }
  };

  const updateLocalUserProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('campusone_user_profile', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const role = currentUser.role;
  const isPending = role === 'pending';
  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';
  const isStudent = role === 'student';
  const isGuest = role === 'guest';
  const isAuthenticated = role !== 'guest' && role !== 'pending';
  const canManageContent = isAdmin || isFaculty;

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role,
        isAuthenticated,
        isAdmin,
        isFaculty,
        isStudent,
        isGuest,
        isPending,
        canManageContent,
        isLiveMode,
        loading,
        authError,
        signInWithPassword,
        signUp,
        requestFacultyAccess,
        signOut,
        resetPassword,
        resendConfirmationEmail,
        switchRole,
        login,
        logout,
        refreshProfile,
        setAuthenticatedProfile,
        updateLocalUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
