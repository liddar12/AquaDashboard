/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Wind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  activeColor = "text-sky-400",
  glowColor = "shadow-[0_0_15px_rgba(56,189,248,0.3)]"
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

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-sky-500/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
                <Droplets className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">AquaSmart</h1>
            </div>
            <p className="text-slate-400 text-sm font-medium">System Intelligence Dashboard</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Air Temp</span>
              <span className="text-lg font-mono text-white">74°F</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Water Temp</span>
              <span className="text-lg font-mono text-sky-400">82°F</span>
            </div>
            <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors">
              <Settings size={20} className="text-slate-400" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Equipment & Stats */}
          <div className="lg:col-span-8 space-y-8">
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
                    <div className="w-2 h-2 rounded-full bg-sky-500" />
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
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
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
                      stroke="#0ea5e9" 
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
          </div>

          {/* Right Column: Insights & Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-sky-600/20 border border-sky-500/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={80} className="text-sky-400" />
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/30">
                  <Zap size={16} className="text-sky-400" />
                </div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">AI Prediction</span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-3">Predictive Maintenance</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Based on your pump speed and current pressure trends, your filter efficiency has dropped by <span className="text-sky-400 font-mono">12%</span>. We recommend a backwash cycle within the next 48 hours.
              </p>
              
              <button className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 group">
                Schedule Service
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Alerts Section */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] px-2">System Alerts</h4>
              
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Heater Run Time High</p>
                  <p className="text-xs text-slate-500">Heater has been active for 6+ hours. Check pool cover status.</p>
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex gap-4 items-start">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">Schedule Update</p>
                  <p className="text-xs text-slate-500">Night filtration cycle starts in 2 hours.</p>
                </div>
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
                <div className="h-full bg-sky-500 w-[65%]" />
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
