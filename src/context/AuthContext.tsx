import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../lib/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getAuthRedirectUrl } from '../lib/authRedirect';

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
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  // Compatibility & Demo mode methods
  switchRole: (newRole: UserRole) => void;
  login: (email: string, role: UserRole, name?: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Campus Visitor',
  email: 'guest@campusone.edu',
  role: 'guest',
  department: 'General Public',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveMode] = useState<boolean>(isSupabaseConfigured);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // In demo mode or initial state, use localStorage
  const [demoRole, setDemoRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('campusone_active_role') as UserRole;
    return saved && DEMO_USERS[saved] ? saved : 'student';
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (!isSupabaseConfigured) {
      const savedUser = localStorage.getItem('campusone_user_profile');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // ignore
        }
      }
      return DEMO_USERS[demoRole] || DEMO_USERS.student;
    }
    return GUEST_USER;
  });

  // Convert DB row to UserProfile
  const mapDbProfile = (db: any): UserProfile => {
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

  // Fetch user profile from Supabase profiles table
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch profile from Supabase:', error.message);
        return null;
      }

      if (data) {
        return mapDbProfile(data);
      }

      // If user is authenticated in GoTrue but has no row in public.profiles yet,
      // assign 'pending' role to prevent premature authorization elevation
      return {
        id: userId,
        email: userEmail || '',
        name: userEmail ? userEmail.split('@')[0] : 'CampusOne User',
        role: 'pending',
      };
    } catch (e: any) {
      console.error('Error fetching Supabase profile:', e);
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
        const { data: { session }, error } = await client.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          const profile = await fetchProfile(session.user.id, session.user.email);
          if (profile && isMounted) {
            setCurrentUser(profile);
          }
        } else if (isMounted) {
          setCurrentUser(GUEST_USER);
        }
      } catch (err: any) {
        console.warn('Supabase session initialization error:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: authListener } = client.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (session?.user) {
            const profile = await fetchProfile(session.user.id, session.user.email);
            if (profile && isMounted) {
              setCurrentUser(profile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
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

  // Live Supabase SignIn
  const signInWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      // In demo mode, sign in with demo user
      const matched = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        setDemoRole(matched.role);
        return { success: true };
      }
      // Or default to student with custom email
      const customStudent: UserProfile = {
        ...DEMO_USERS.student,
        email,
        name: email.split('@')[0],
      };
      setCurrentUser(customStudent);
      setDemoRole('student');
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email);
        if (profile) setCurrentUser(profile);
      }

      return { success: true };
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
      const redirectUrl = getAuthRedirectUrl('/student/login?confirmed=true');
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
      const redirectUrl = getAuthRedirectUrl('/faculty/login?confirmed=true');
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
  const signOut = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
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
    signOut();
  };

  const refreshProfile = async () => {
    if (isSupabaseConfigured && supabase && currentUser.id !== 'guest') {
      const updated = await fetchProfile(currentUser.id, currentUser.email);
      if (updated) setCurrentUser(updated);
    }
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
        switchRole,
        login,
        logout,
        refreshProfile,
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
