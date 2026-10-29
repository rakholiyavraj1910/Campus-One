import React, { useState } from 'react';
import { 
  usePreferences, 
  ACCENT_PALETTE 
} from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { AccentColor, InterfaceDensity, ThemeMode } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Layout, 
  Sliders, 
  Bell, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  User, 
  ArrowUp, 
  ArrowDown, 
  Maximize2, 
  Minimize2, 
  Flame,
  CheckCircle2,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface SettingsPersonalizationPageProps {
  onNavigateTab?: (page: string, subTab?: string) => void;
}

export const SettingsPersonalizationPage: React.FC<SettingsPersonalizationPageProps> = ({
  onNavigateTab = () => {}
}) => {
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();
  const {
    preferences,
    resolvedTheme,
    setThemeMode,
    setAccentColor,
    setDensity,
    setReducedMotion,
    toggleWidget,
    reorderWidgets,
    resetWidgets,
    updateNotificationPref,
    resetAllPreferences,
  } = usePreferences();

  const [activeSettingsSection, setActiveSettingsSection] = useState<'appearance' | 'dashboard' | 'profile' | 'notifications'>('appearance');

  const currentRole: 'student' | 'faculty' | 'admin' = 
    role === 'faculty' ? 'faculty' : role === 'admin' ? 'admin' : 'student';

  const widgetsList = 
    currentRole === 'student' 
      ? preferences.studentWidgets 
      : currentRole === 'faculty' 
      ? preferences.facultyWidgets 
      : preferences.adminWidgets;

  const handleResetDefaults = () => {
    resetAllPreferences();
    addNotification('Preferences Restored', 'All appearance, widget, and notification settings reset to defaults.', 'notice');
  };

  const currentAccentObj = ACCENT_PALETTE.find(a => a.id === preferences.accentColor) || ACCENT_PALETTE[0];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-[#0e2744] text-white p-6 sm:p-8 border border-navy-700/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-cyan/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center space-x-1">
                <Sliders className="w-3 h-3" />
                <span>Customization &amp; Workspace Hub</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-slate-300 border border-white/20">
                Role: {role.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Settings &amp; Personalization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Fine-tune your visual theme, custom accent palette, interface density, and role-specific dashboard widgets. Preferences persist automatically across your browser sessions.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer btn-tactile"
              title="Reset all preferences to original factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Secondary Navigation Tabs */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-1.5 border border-slate-200/80 dark:border-navy-800 shadow-xs flex items-center space-x-1 overflow-x-auto scrollbar-none momentum-scroll">
        <button
          onClick={() => setActiveSettingsSection('appearance')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
            activeSettingsSection === 'appearance'
              ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance &amp; Theme</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('dashboard')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
            activeSettingsSection === 'dashboard'
              ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Dashboard Customization</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
            activeSettingsSection === 'profile'
              ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile &amp; Identity</span>
        </button>

        <button
          onClick={() => setActiveSettingsSection('notifications')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
            activeSettingsSection === 'notifications'
              ? 'bg-navy-900 text-white dark:bg-brand-cyan dark:text-navy-950 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>
      </div>

      {/* 3. Section Content */}

      {/* SECTION A: APPEARANCE & THEME */}
      {activeSettingsSection === 'appearance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Theme Mode Selector */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Interface Theme</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Select light mode, dark mode, or follow your operating system default.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                    Active: {resolvedTheme}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  {/* Light */}
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-2 btn-tactile ${
                      preferences.themeMode === 'light'
                        ? 'border-brand-cyan bg-brand-cyan/10 text-navy-950 dark:text-white shadow-sm ring-2 ring-brand-cyan/20'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <Sun className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Light</span>
                  </button>

                  {/* Dark */}
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-2 btn-tactile ${
                      preferences.themeMode === 'dark'
                        ? 'border-brand-cyan bg-brand-cyan/10 text-navy-950 dark:text-white shadow-sm ring-2 ring-brand-cyan/20'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Dark</span>
                  </button>

                  {/* System */}
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center space-y-2 btn-tactile ${
                      preferences.themeMode === 'system'
                        ? 'border-brand-cyan bg-brand-cyan/10 text-navy-950 dark:text-white shadow-sm ring-2 ring-brand-cyan/20'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">System</span>
                  </button>
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
                      <Palette className="w-4 h-4 text-brand-cyan" />
                      <span>Collegiate Accent Color</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Personalize primary buttons, badge borders, and highlight tones.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {currentAccentObj.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {ACCENT_PALETTE.map((accent) => {
                    const isSelected = preferences.accentColor === accent.id;
                    return (
                      <button
                        key={accent.id}
                        onClick={() => setAccentColor(accent.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 btn-tactile ${
                          isSelected
                            ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-navy-800/80 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-navy-950'
                            : 'border-slate-200 dark:border-navy-800 hover:border-slate-300 dark:hover:border-navy-700 bg-white dark:bg-navy-900'
                        }`}
                      >
                        <span
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white"
                          style={{ backgroundColor: accent.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {accent.label}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {accent.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Density & Reduced Motion */}
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
                    <Maximize2 className="w-4 h-4 text-teal-500" />
                    <span>Interface Density &amp; Accessibility</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust information density and disable heavy transitions.
                  </p>
                </div>

                {/* Density Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDensity('comfortable')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 btn-tactile ${
                      preferences.density === 'comfortable'
                        ? 'border-brand-cyan bg-brand-cyan/10 ring-2 ring-brand-cyan/20'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4 text-brand-cyan shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">Comfortable</p>
                      <p className="text-[10px] text-slate-500">Spacious padding and breathing room</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setDensity('compact')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-3 btn-tactile ${
                      preferences.density === 'compact'
                        ? 'border-brand-cyan bg-brand-cyan/10 ring-2 ring-brand-cyan/20'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300'
                    }`}
                  >
                    <Minimize2 className="w-4 h-4 text-brand-cyan shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">Compact</p>
                      <p className="text-[10px] text-slate-500">Tighter layout for fast scanning</p>
                    </div>
                  </button>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-navy-950 dark:text-white block">
                      Reduced Motion &amp; Instant Navigation
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Disables complex card flips, spring physics, and scroll parallax
                    </span>
                  </div>

                  <button
                    onClick={() => setReducedMotion(!preferences.reducedMotion)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      preferences.reducedMotion ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                    }`}
                    role="switch"
                    aria-checked={preferences.reducedMotion}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        preferences.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Interactive Preview Card (5 cols) */}
            <div className="lg:col-span-5 sticky top-20">
              <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                      Live Dashboard Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: currentAccentObj.hex + '25', color: currentAccentObj.hex }}>
                    Active Accent
                  </span>
                </div>

                {/* Mock Card Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sample Academic Metric
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentAccentObj.hex }} />
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-black text-navy-950 dark:text-white">88.4%</p>
                    <span className="text-xs font-semibold" style={{ color: currentAccentObj.hex }}>
                      Good Standing
                    </span>
                  </div>

                  {/* Sample Progress Bar with Live Accent */}
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: '88.4%', backgroundColor: currentAccentObj.hex }}
                    />
                  </div>

                  {/* Sample Action Button with Live Accent */}
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-transform active:scale-95"
                      style={{ backgroundColor: currentAccentObj.hex }}
                    >
                      Primary Action
                    </button>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300"
                    >
                      Secondary
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-navy-800/50 border border-slate-200/60 dark:border-navy-700/60 text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time CSS Binding</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Changing these controls applies instantly to all portal sections without requiring page refreshes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION B: DASHBOARD WIDGETS */}
      {activeSettingsSection === 'dashboard' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-navy-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
                <Layout className="w-4 h-4 text-brand-cyan" />
                <span>Personalized {currentRole.toUpperCase()} Dashboard Layout</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable, disable, or reorganize components visible on your personal dashboard overview.
              </p>
            </div>

            <button
              onClick={() => resetWidgets(currentRole)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>
          </div>

          {/* Widget list */}
          <div className="space-y-3">
            {widgetsList.map((widget, idx) => (
              <div
                key={widget.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  widget.visible
                    ? 'bg-slate-50/80 dark:bg-navy-950 border-slate-200 dark:border-navy-800'
                    : 'bg-slate-100/50 dark:bg-navy-950/40 border-dashed border-slate-300 dark:border-navy-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => reorderWidgets(currentRole, idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3 text-slate-500" />
                    </button>
                    <button
                      onClick={() => reorderWidgets(currentRole, idx, idx + 1)}
                      disabled={idx === widgetsList.length - 1}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-navy-800 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {widget.label}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full ${
                        widget.visible 
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                      }`}>
                        {widget.visible ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {widget.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-3">
                  <button
                    onClick={() => toggleWidget(currentRole, widget.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      widget.visible ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                    }`}
                    role="switch"
                    aria-checked={widget.visible}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        widget.visible ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: PROFILE & IDENTITY PREFERENCES */}
      {activeSettingsSection === 'profile' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
            <h3 className="text-base font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-cyan" />
              <span>Personal Identity &amp; Profile Summary</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify your institutional identity details and jump directly to your full dedicated profile manager.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              <UserAvatar
                name={user.name}
                src={user.avatar}
                role={user.role}
                size="xl"
                className="ring-4 ring-brand-cyan/20 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                    {role.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    Government Polytechnic Ahmedabad
                  </span>
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {user.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  {user.email}
                </p>
                {user.department && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Department of {user.department}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (role === 'admin') onNavigateTab('admin', 'profile');
                else if (role === 'faculty') onNavigateTab('faculty-portal', 'profile');
                else onNavigateTab('student', 'profile');
              }}
              className="px-4 py-2.5 rounded-2xl bg-brand-cyan hover:bg-brand-cyan-hover text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-sm transition-all btn-tactile cursor-pointer shrink-0"
            >
              <span>Edit Profile Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION D: NOTIFICATIONS */}
      {activeSettingsSection === 'notifications' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-navy-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-navy-800 pb-4">
            <h3 className="text-base font-extrabold text-navy-950 dark:text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-brand-cyan" />
              <span>Campus Notification Preferences</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose which institutional alerts and event broadcasts trigger in-app notification toasts.
            </p>
          </div>

          <div className="space-y-4">
            {/* Academic alerts */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Academic &amp; Examination Notices</p>
                <p className="text-[11px] text-slate-500">Hall tickets, internal marks submissions, timetable amendments</p>
              </div>
              <button
                onClick={() => updateNotificationPref('academicAlerts', !preferences.notifications.academicAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.notifications.academicAlerts ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                }`}
                role="switch"
                aria-checked={preferences.notifications.academicAlerts}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications.academicAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Department notices */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Department Circulars</p>
                <p className="text-[11px] text-slate-500">Direct notices issued by your Head of Department or faculty mentors</p>
              </div>
              <button
                onClick={() => updateNotificationPref('noticeUpdates', !preferences.notifications.noticeUpdates)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.notifications.noticeUpdates ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                }`}
                role="switch"
                aria-checked={preferences.notifications.noticeUpdates}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications.noticeUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Campus events */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Campus Events &amp; Workshops</p>
                <p className="text-[11px] text-slate-500">Guest lectures, tech symposia, sports registrations, and cultural fests</p>
              </div>
              <button
                onClick={() => updateNotificationPref('eventReminders', !preferences.notifications.eventReminders)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.notifications.eventReminders ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                }`}
                role="switch"
                aria-checked={preferences.notifications.eventReminders}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications.eventReminders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Administrative announcements */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Institutional Administrative Circulars</p>
                <p className="text-[11px] text-slate-500">Principal directives, holiday schedules, and campus facility notices</p>
              </div>
              <button
                onClick={() => updateNotificationPref('adminAnnouncements', !preferences.notifications.adminAnnouncements)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  preferences.notifications.adminAnnouncements ? 'bg-brand-cyan' : 'bg-slate-300 dark:bg-navy-700'
                }`}
                role="switch"
                aria-checked={preferences.notifications.adminAnnouncements}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    preferences.notifications.adminAnnouncements ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
