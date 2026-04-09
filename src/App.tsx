/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Zap, 
  Settings, 
  AlertTriangle, 
  Activity, 
  Power,
  Clock,
  ChevronRight,
  Wind,
  Camera,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  RefreshCw,
  Mail,
  Lock,
  User,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { analyzePoolPhoto, AnalysisResult, generateSmartNudges, SmartNudge } from './services/geminiService';
import { supabase } from './lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Mock Data
const USAGE_DATA = [
  { time: '08:00', power: 1.2, temp: 78 },
  { time: '10:00', power: 2.5, temp: 80 },
  { time: '12:00', power: 3.8, temp: 82 },
  { time: '14:00', power: 3.2, temp: 84 },
  { time: '16:00', power: 2.1, temp: 83 },
  { time: '18:00', power: 1.5, temp: 81 },
];

const EquipmentCard = ({ 
  title, 
  value, 
  unit, 
  status, 
  icon: Icon, 
  activeColor = "text-uom-maize",
  glowColor = "shadow-[0_0_15px_rgba(255,203,5,0.2)]"
}: { 
  title: string; 
  value: string | number; 
  unit?: string; 
  status: 'on' | 'off' | 'warning'; 
  icon: any;
  activeColor?: string;
  glowColor?: string;
}) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className={cn(
      "bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm transition-all duration-300",
      status === 'on' && glowColor
    )}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={cn(
        "p-2.5 rounded-xl bg-slate-900/50 border border-slate-700",
        status === 'on' ? activeColor : "text-slate-500"
      )}>
        <Icon size={20} />
      </div>
      <div className={cn(
        "w-2 h-2 rounded-full",
        status === 'on' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : 
        status === 'warning' ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-slate-600"
      )} />
    </div>
    
    <div className="space-y-1">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-mono text-white tracking-tight">{value}</span>
        {unit && <span className="text-xs font-mono text-slate-500">{unit}</span>}
      </div>
    </div>
  </motion.div>
);

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  icon: any;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Heater Run Time High',
      message: 'Heater active for 6+ hours. Check pool cover.',
      icon: AlertTriangle
    },
    {
      id: '2',
      type: 'warning',
      title: 'Schedule Update',
      message: 'Night filtration starts in 2 hours.',
      icon: Clock
    }
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    pH: '',
    orp: '',
    pumpTime: '',
    heaterTime: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [nudges, setNudges] = useState<SmartNudge[]>([
    {
      id: 'n1',
      type: 'weather',
      title: 'High Humidity Expected',
      message: 'Consider reducing heater runtime tomorrow to save energy.',
      actionLabel: 'Adjust Schedule'
    },
    {
      id: 'n2',
      type: 'event',
      title: 'Pool Party Planned?',
      message: 'Ensure chemical levels are optimal by 2 PM Saturday.',
      actionLabel: 'Check Levels'
    }
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    return pass.length >= 8 && hasLetter && hasNumber;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (authMode === 'signup') {
        if (!validatePassword(password)) {
          throw new Error("Password must be at least 8 characters and contain both letters and numbers.");
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setResetSent(true);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user && isLoaded) {
    return (
      <div className="min-h-screen bg-uom-blue flex items-center justify-center p-4 font-sans selection:bg-uom-maize/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-uom-maize/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-uom-maize/10 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-uom-maize/20 rounded-2xl flex items-center justify-center mb-4 border border-uom-maize/30">
              <Droplets className="text-uom-maize" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AquaSmart</h1>
            <p className="text-slate-400 text-sm mt-1">
              {authMode === 'login' ? 'Welcome back to your pool room' : 
               authMode === 'signup' ? 'Create your smart pool account' : 'Reset your password'}
            </p>
          </div>

          {resetSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-emerald-400 text-sm">Check your email for a reset link.</p>
              </div>
              <button 
                onClick={() => { setAuthMode('login'); setResetSent(false); }}
                className="text-uom-maize text-sm font-medium hover:text-uom-maize-dark transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-uom-maize/50 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {authMode !== 'reset' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-uom-maize/50 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                  {authMode === 'signup' && (
                    <p className="text-[10px] text-slate-500 ml-1">Min. 8 chars, letters & numbers</p>
                  )}
                </div>
              )}

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-rose-400 text-xs text-center">{authError}</p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthLoading}
                className="w-full bg-uom-maize hover:bg-uom-maize-dark disabled:bg-uom-maize/50 text-uom-blue font-bold py-4 rounded-2xl transition-all shadow-lg shadow-uom-maize/20 flex items-center justify-center gap-2 group"
              >
                {isAuthLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex flex-col items-center gap-3 mt-6">
                {authMode === 'login' ? (
                  <>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-slate-400 text-sm hover:text-white transition-colors"
                    >
                      Don't have an account? <span className="text-uom-maize font-medium">Sign Up</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthMode('reset')}
                      className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className="text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    Already have an account? <span className="text-uom-maize font-medium">Sign In</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  const calculateEstimatedRunTime = () => {
    // Simple logic: If ambient temp is low and water temp is low, heater needs more time.
    // If ambient is high, pump needs more time for circulation.
    const ambientTemp = 74;
    const waterTemp = 82;
    const targetTemp = 84;
    
    const tempDiff = targetTemp - waterTemp;
    const heaterHours = Math.max(0, tempDiff * 1.5); // 1.5 hours per degree diff
    const pumpHours = ambientTemp > 80 ? 10 : 8; // More circulation in heat
    
    return { heaterHours, pumpHours };
  };

  const { heaterHours, pumpHours } = calculateEstimatedRunTime();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlerts(prev => [
      {
        id: Date.now().toString(),
        type: 'info',
        title: 'Manual Data Updated',
        message: `pH: ${manualData.pH}, ORP: ${manualData.orp} updated manually.`,
        icon: CheckCircle2
      },
      ...prev
    ]);
    setShowManualEntry(false);
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
    setIsAnalyzing(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8);

    setIsAnalyzing(true);
    try {
      const result = await analyzePoolPhoto(base64Image);
      setAnalysisResult(result);
      
      // Add a new alert if confidence is high and recommendation is urgent
      if (result.confidence > 0.7) {
        setAlerts(prev => [
          {
            id: Date.now().toString(),
            type: 'info',
            title: 'Visual Calibration Success',
            message: `AI detected pH: ${result.pH || 'N/A'}, ORP: ${result.orp || 'N/A'}. Recommendation applied.`,
            icon: Sparkles
          },
          ...prev
        ]);
      }
      stopCamera();
    } catch (err) {
      console.error("Analysis failed:", err);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-uom-blue text-slate-200 font-sans selection:bg-uom-maize/30">
      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualEntry(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Manual Data Entry</h3>
                  <p className="text-xs text-slate-500 mt-1">Override automated sensor data</p>
                </div>
                <button onClick={() => setShowManualEntry(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">pH Level</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={manualData.pH}
                      onChange={(e) => setManualData({...manualData, pH: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-uom-maize/50 transition-colors"
                      placeholder="7.4"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">ORP (mV)</label>
                    <input 
                      type="number"
                      value={manualData.orp}
                      onChange={(e) => setManualData({...manualData, orp: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-uom-maize/50 transition-colors"
                      placeholder="650"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Pump Time (hrs)</label>
                    <input 
                      type="number"
                      value={manualData.pumpTime}
                      onChange={(e) => setManualData({...manualData, pumpTime: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-uom-maize/50 transition-colors"
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest ml-1">Heater Time (hrs)</label>
                    <input 
                      type="number"
                      value={manualData.heaterTime}
                      onChange={(e) => setManualData({...manualData, heaterTime: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-uom-maize/50 transition-colors"
                      placeholder="2"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-uom-maize text-uom-blue font-bold py-4 rounded-2xl transition-all shadow-lg shadow-uom-maize/20 hover:bg-uom-maize-dark"
                >
                  Save Manual Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Overlay */}
      <AnimatePresence>
        {showCamera && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <h3 className="text-white font-semibold">Visual Calibration</h3>
              <button onClick={stopCamera} className="p-2 rounded-full bg-white/10 text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanning Animation */}
              {isAnalyzing && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.8)] z-10"
                />
              )}

              {/* Camera Guide */}
              <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-dashed border-uom-maize/60 rounded-3xl" />
              </div>
              
              <div className="absolute bottom-12 text-center w-full px-6">
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md py-3 px-6 rounded-full inline-flex">
                    <Loader2 className="text-sky-400 animate-spin" size={20} />
                    <span className="text-white font-medium">AI Analyzing Test Strip...</span>
                  </div>
                ) : (
                  <p className="text-white/80 text-sm bg-black/40 backdrop-blur-md py-2 px-4 rounded-full inline-block">
                    Align your test strip or gauge within the frame
                  </p>
                )}
              </div>
            </div>

            <div className="p-12 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
              {!isAnalyzing && (
                <button 
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-white group-active:scale-90 transition-transform" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-uom-maize/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-uom-maize flex items-center justify-center">
                <Droplets className="text-uom-blue" size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">AquaSmart</h1>
            </div>
            <p className="text-slate-400 text-sm font-medium">System Intelligence Dashboard</p>
          </div>
          
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-2xl">
              <div className="w-8 h-8 rounded-full bg-uom-maize/20 flex items-center justify-center border border-uom-maize/30">
                <User size={16} className="text-uom-maize" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Operator</p>
                <p className="text-xs font-medium text-white truncate max-w-[120px]">{user?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            <button 
              onClick={() => setShowManualEntry(true)}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-slate-400"
              title="Manual Entry"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-uom-maize text-uom-blue hover:bg-uom-maize-dark transition-colors text-sm font-bold shadow-lg shadow-uom-maize/20"
            >
              <Camera size={18} />
              <span>Calibrate</span>
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Air Temp</span>
              <span className="text-lg font-mono text-white">74°F</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Water Temp</span>
              <span className="text-lg font-mono text-uom-maize">82°F</span>
            </div>
            <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
              <Settings size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Equipment & Stats */}
          <div className="lg:col-span-8 space-y-8">
            {/* Weather-Based Estimates */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-mono text-uom-maize uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Wind size={16} /> Weather Intelligence
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Estimated Heater Run</p>
                  <p className="text-xl font-mono text-white">{heaterHours.toFixed(1)} <span className="text-xs text-slate-500">hrs</span></p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Recommended Pump</p>
                  <p className="text-xl font-mono text-white">{pumpHours} <span className="text-xs text-slate-500">hrs</span></p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 italic">
                * Estimates based on 74°F ambient and 82°F water temp.
              </p>
            </div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <EquipmentCard 
                title="Filter Pump" 
                value="2450" 
                unit="RPM" 
                status="on" 
                icon={Activity} 
              />
              <EquipmentCard 
                title="Heater" 
                value="82" 
                unit="°F" 
                status="on" 
                icon={Thermometer} 
                activeColor="text-rose-400"
                glowColor="shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              />
              <EquipmentCard 
                title="Pool Lights" 
                value="Sky Blue" 
                status="on" 
                icon={Zap} 
                activeColor="text-amber-400"
                glowColor="shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              />
              <EquipmentCard 
                title="Cleaner" 
                value="Ready" 
                status="off" 
                icon={Wind} 
              />
            </div>

            {/* Main Chart Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Energy & Performance</h2>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Last 12 Hours Consumption</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-uom-maize" />
                    <span className="text-xs text-slate-400">Power (kW)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs text-slate-400">Temp (°F)</span>
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USAGE_DATA}>
                    <defs>
                      <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFCB05" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFCB05" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="power" 
                      stroke="#FFCB05" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorPower)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#f43f5e" 
                      strokeWidth={2} 
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Water Quality Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-uom-maize/10 border border-uom-maize/20 text-uom-maize">
                      <Droplets size={18} />
                    </div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">pH Level</h3>
                  </div>
                  <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                    Optimal
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-4xl font-mono text-white">7.4</div>
                    <p className="text-xs text-slate-500">Range: 7.2 — 7.6</p>
                  </div>
                  <div className="w-32 h-2 bg-slate-700 rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-[20%] right-[20%] bg-emerald-500/20" /> {/* Safe Zone */}
                    <motion.div 
                      initial={{ left: 0 }}
                      animate={{ left: '50%' }}
                      className="absolute top-[-4px] w-1 h-6 bg-white shadow-[0_0_8px_white]" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <Zap size={18} />
                    </div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">ORP</h3>
                  </div>
                  <div className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-mono text-rose-400 uppercase tracking-widest">
                    Low Alert
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-4xl font-mono text-rose-400">620</div>
                    <p className="text-xs text-slate-500">Target: 650+ mV</p>
                  </div>
                  <div className="w-32 h-2 bg-slate-700 rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 left-[40%] right-0 bg-emerald-500/20" /> {/* Safe Zone */}
                    <motion.div 
                      initial={{ left: 0 }}
                      animate={{ left: '30%' }}
                      className="absolute top-[-4px] w-1 h-6 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Insights & Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-uom-blue to-uom-blue/80 border border-uom-maize/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={80} className="text-uom-maize" />
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-uom-maize/20 border border-uom-maize/30">
                    <Zap size={16} className="text-uom-maize" />
                  </div>
                  <span className="text-xs font-bold text-uom-maize uppercase tracking-widest">
                    {analysisResult ? "Visual Intelligence" : "AI Prediction"}
                  </span>
                </div>
                {analysisResult && (
                  <button 
                    onClick={() => setAnalysisResult(null)}
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={10} /> Reset
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">
                {analysisResult ? "Calibration Insights" : "Predictive Maintenance"}
              </h3>
              
              <div className="space-y-4 mb-6">
                {analysisResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Detected pH</p>
                        <p className="text-lg font-mono text-white">{analysisResult.pH || "N/A"}</p>
                      </div>
                      <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 uppercase font-mono mb-1">Detected ORP</p>
                        <p className="text-lg font-mono text-white">{analysisResult.orp || "N/A"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic">
                      "{analysisResult.recommendation}"
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisResult.confidence * 100}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {Math.round(analysisResult.confidence * 100)}% Confidence
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Based on your pump speed and current pressure trends, your filter efficiency has dropped by <span className="text-uom-maize font-mono">12%</span>. We recommend a backwash cycle within the next 48 hours.
                  </p>
                )}
              </div>
              
              <button className="w-full py-3 px-4 bg-uom-maize hover:bg-uom-maize-dark text-uom-blue rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group">
                {analysisResult ? "Apply Calibration" : "Schedule Service"}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Alerts Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-2">Smart Nudges</h4>
              <div className="space-y-3">
                {nudges.map((nudge) => (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-uom-maize/50" />
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {nudge.type === 'weather' && <Wind size={14} className="text-uom-maize" />}
                        {nudge.type === 'event' && <Clock size={14} className="text-amber-400" />}
                        {nudge.type === 'maintenance' && <Activity size={14} className="text-rose-400" />}
                        {nudge.type === 'efficiency' && <Zap size={14} className="text-emerald-400" />}
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{nudge.type}</span>
                      </div>
                    </div>
                    <h5 className="text-sm font-medium text-white mb-1">{nudge.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{nudge.message}</p>
                    {nudge.actionLabel && (
                      <button className="text-[10px] font-bold text-uom-maize uppercase tracking-widest hover:text-uom-maize-dark transition-colors flex items-center gap-1">
                        {nudge.actionLabel} <ChevronRight size={10} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Alerts Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-2">System Alerts</h4>
              
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, x: 20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className={cn(
                        "group relative border rounded-2xl p-4 flex gap-4 items-start transition-all",
                        alert.type === 'critical' ? "bg-rose-500/5 border-rose-500/20" :
                        alert.type === 'warning' ? "bg-amber-500/5 border-amber-500/20" :
                        "bg-slate-800/30 border-slate-700/50"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg border",
                        alert.type === 'critical' ? "bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse" :
                        alert.type === 'warning' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                        "bg-uom-maize/10 border-uom-maize/20 text-uom-maize"
                      )}>
                        <alert.icon size={18} />
                      </div>
                      
                      <div className="flex-1 pr-6">
                        <p className="text-sm font-medium text-white mb-1">{alert.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{alert.message}</p>
                      </div>

                      <button 
                        onClick={() => dismissAlert(alert.id)}
                        className="absolute top-3 right-3 p-1 rounded-md text-slate-600 hover:text-slate-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {alerts.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">All systems nominal</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Power Summary */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Daily Power</span>
                <span className="text-xs text-emerald-400 font-mono">-4% vs avg</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono text-white">14.2</span>
                <span className="text-sm font-mono text-slate-500">kWh</span>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-uom-maize w-[65%]" />
              </div>
            </div>
          </div>
        </main>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              API Connected
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              Cloud Sync: 2m ago
            </div>
          </div>
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            AquaSmart v1.0.4 • Powered by Gemini
          </p>
        </footer>
      </div>
    </div>
  );
}
