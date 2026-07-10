import React from 'react';
import { motion } from 'framer-motion';
import { PremiumCard } from './PremiumCard';
import { PremiumButton } from './PremiumButton';
import { Droplets, Plus } from 'lucide-react';

interface WaterVisualizerProps {
  currentML: number;
  goalML: number;
  onAddWater: (ml: number) => void;
}

export function WaterVisualizer({ currentML, goalML, onAddWater }: WaterVisualizerProps) {
  const percentage = Math.min(100, goalML > 0 ? (currentML / goalML) * 100 : 0);
  const remaining = Math.max(0, goalML - currentML);

  return (
    <PremiumCard className="relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-[#0EA5E9]/5 to-transparent border border-[#0EA5E9]/20">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9] shadow-sm">
            <Droplets size={16} />
          </div>
          <span className="font-semibold text-sm text-[var(--color-text-base-value)] font-heading">Hydration</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 min-h-[160px]">
        {/* Animated Water Bottle */}
        <div className="relative w-24 h-40 border-4 border-[var(--color-border-subtle-value)] rounded-b-3xl rounded-t-xl overflow-hidden bg-white/5 backdrop-blur-md shadow-inner">
          {/* Bottle neck detail */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-3 border-x-4 border-[var(--color-border-subtle-value)]" />
          
          {/* Water Fill */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0EA5E9] to-sky-400 opacity-90"
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Wave animation (simplified with pure CSS via tailwind classes) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 rounded-full blur-[1px] transform -translate-y-1/2"></div>
            
            {/* Bubbles */}
            <motion.div 
              className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/60 rounded-full"
              animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute bottom-4 right-4 w-2 h-2 bg-white/40 rounded-full"
              animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Stats next to bottle */}
        <div className="ml-6 space-y-3">
          <div>
            <div className="text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-wider mb-1">Drank</div>
            <div className="font-mono text-2xl font-bold tracking-tight text-[var(--color-text-base-value)]">
              {(currentML / 1000).toFixed(1)}L
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-[var(--color-text-muted-value)] uppercase tracking-wider mb-1">Left</div>
            <div className="font-mono text-lg font-bold tracking-tight text-[#0EA5E9]">
              {(remaining / 1000).toFixed(1)}L
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-6 relative z-10">
        {[250, 500, 750].map((ml) => (
          <PremiumButton 
            key={ml} 
            variant="water" 
            size="sm" 
            onClick={() => onAddWater(ml)}
          >
            <Plus size={12} /> {ml}ml
          </PremiumButton>
        ))}
      </div>
    </PremiumCard>
  );
}
