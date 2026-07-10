import React from 'react'

// Anatomical muscle map — highlights the muscle group an exercise trains.
// Lightweight, dependency-free (SVG). A GLB/three.js avatar can be swapped in
// later behind the same `muscle` prop.

type Muscle =
  | 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'BICEPS'
  | 'TRICEPS' | 'CORE' | 'GLUTES' | 'CALVES' | 'FOREARMS'

// Which body view best shows a given muscle.
const BACK_MUSCLES: Muscle[] = ['BACK', 'TRICEPS', 'GLUTES']

export function defaultViewFor(muscle?: string): 'front' | 'back' {
  return muscle && BACK_MUSCLES.includes(muscle as Muscle) ? 'back' : 'front'
}

const ACTIVE = '#ef4444'          // worked-muscle "heat" highlight
const ACTIVE_SOFT = '#f97316'

export default function MuscleMap({
  muscle,
  view = defaultViewFor(muscle),
  size = 220,
}: {
  muscle?: string
  view?: 'front' | 'back'
  size?: number
}) {
  const on = (m: Muscle) => muscle === m
  // fill for a region: highlighted vs. neutral body tone (theme-aware via CSS var)
  const fill = (m: Muscle) => (on(m) ? ACTIVE : 'var(--color-surface-hover)')
  const stroke = (m: Muscle) => (on(m) ? ACTIVE_SOFT : 'var(--color-border)')

  return (
    <svg
      viewBox="0 0 200 430"
      width={size}
      height={(size * 430) / 200}
      role="img"
      aria-label={muscle ? `${muscle.toLowerCase()} highlighted` : 'muscle map'}
      style={{ maxWidth: '100%' }}
    >
      <defs>
        <filter id="mm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Head + neck (neutral) */}
      <circle cx="100" cy="30" r="20" fill="var(--color-surface)" stroke="var(--color-border)" />
      <rect x="90" y="48" width="20" height="14" rx="5" fill="var(--color-surface)" stroke="var(--color-border)" />

      {view === 'front' ? (
        <>
          {/* Shoulders (deltoids) */}
          <ellipse cx="62" cy="80" rx="16" ry="13" fill={fill('SHOULDERS')} stroke={stroke('SHOULDERS')} filter={on('SHOULDERS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="138" cy="80" rx="16" ry="13" fill={fill('SHOULDERS')} stroke={stroke('SHOULDERS')} filter={on('SHOULDERS') ? 'url(#mm-glow)' : undefined} />

          {/* Chest (pecs) */}
          <path d="M72 74 Q100 66 100 66 L100 108 Q84 112 72 100 Z" fill={fill('CHEST')} stroke={stroke('CHEST')} filter={on('CHEST') ? 'url(#mm-glow)' : undefined} />
          <path d="M128 74 Q100 66 100 66 L100 108 Q116 112 128 100 Z" fill={fill('CHEST')} stroke={stroke('CHEST')} filter={on('CHEST') ? 'url(#mm-glow)' : undefined} />

          {/* Biceps (upper arms) */}
          <ellipse cx="54" cy="120" rx="10" ry="24" fill={fill('BICEPS')} stroke={stroke('BICEPS')} filter={on('BICEPS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="146" cy="120" rx="10" ry="24" fill={fill('BICEPS')} stroke={stroke('BICEPS')} filter={on('BICEPS') ? 'url(#mm-glow)' : undefined} />

          {/* Forearms */}
          <ellipse cx="48" cy="168" rx="8" ry="22" fill={fill('FOREARMS')} stroke={stroke('FOREARMS')} filter={on('FOREARMS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="152" cy="168" rx="8" ry="22" fill={fill('FOREARMS')} stroke={stroke('FOREARMS')} filter={on('FOREARMS') ? 'url(#mm-glow)' : undefined} />

          {/* Core (abs) */}
          <rect x="86" y="112" width="28" height="60" rx="9" fill={fill('CORE')} stroke={stroke('CORE')} filter={on('CORE') ? 'url(#mm-glow)' : undefined} />

          {/* Quads (LEGS) */}
          <path d="M82 182 Q84 240 88 268 L98 268 Q98 210 96 182 Z" fill={fill('LEGS')} stroke={stroke('LEGS')} filter={on('LEGS') ? 'url(#mm-glow)' : undefined} />
          <path d="M118 182 Q116 240 112 268 L102 268 Q102 210 104 182 Z" fill={fill('LEGS')} stroke={stroke('LEGS')} filter={on('LEGS') ? 'url(#mm-glow)' : undefined} />

          {/* Calves */}
          <ellipse cx="90" cy="330" rx="9" ry="34" fill={fill('CALVES')} stroke={stroke('CALVES')} filter={on('CALVES') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="110" cy="330" rx="9" ry="34" fill={fill('CALVES')} stroke={stroke('CALVES')} filter={on('CALVES') ? 'url(#mm-glow)' : undefined} />
        </>
      ) : (
        <>
          {/* Rear shoulders */}
          <ellipse cx="62" cy="80" rx="16" ry="13" fill={fill('SHOULDERS')} stroke={stroke('SHOULDERS')} filter={on('SHOULDERS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="138" cy="80" rx="16" ry="13" fill={fill('SHOULDERS')} stroke={stroke('SHOULDERS')} filter={on('SHOULDERS') ? 'url(#mm-glow)' : undefined} />

          {/* Back (traps + lats) */}
          <path d="M74 72 L126 72 L120 150 Q100 160 80 150 Z" fill={fill('BACK')} stroke={stroke('BACK')} filter={on('BACK') ? 'url(#mm-glow)' : undefined} />

          {/* Triceps */}
          <ellipse cx="54" cy="120" rx="10" ry="24" fill={fill('TRICEPS')} stroke={stroke('TRICEPS')} filter={on('TRICEPS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="146" cy="120" rx="10" ry="24" fill={fill('TRICEPS')} stroke={stroke('TRICEPS')} filter={on('TRICEPS') ? 'url(#mm-glow)' : undefined} />

          {/* Forearms */}
          <ellipse cx="48" cy="168" rx="8" ry="22" fill={fill('FOREARMS')} stroke={stroke('FOREARMS')} filter={on('FOREARMS') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="152" cy="168" rx="8" ry="22" fill={fill('FOREARMS')} stroke={stroke('FOREARMS')} filter={on('FOREARMS') ? 'url(#mm-glow)' : undefined} />

          {/* Glutes */}
          <path d="M84 178 Q84 210 100 210 Q100 178 100 178 Z" fill={fill('GLUTES')} stroke={stroke('GLUTES')} filter={on('GLUTES') ? 'url(#mm-glow)' : undefined} />
          <path d="M116 178 Q116 210 100 210 Q100 178 100 178 Z" fill={fill('GLUTES')} stroke={stroke('GLUTES')} filter={on('GLUTES') ? 'url(#mm-glow)' : undefined} />

          {/* Hamstrings (LEGS) */}
          <path d="M82 212 Q84 250 88 272 L98 272 Q98 232 96 212 Z" fill={fill('LEGS')} stroke={stroke('LEGS')} filter={on('LEGS') ? 'url(#mm-glow)' : undefined} />
          <path d="M118 212 Q116 250 112 272 L102 272 Q102 232 104 212 Z" fill={fill('LEGS')} stroke={stroke('LEGS')} filter={on('LEGS') ? 'url(#mm-glow)' : undefined} />

          {/* Calves */}
          <ellipse cx="90" cy="332" rx="9" ry="34" fill={fill('CALVES')} stroke={stroke('CALVES')} filter={on('CALVES') ? 'url(#mm-glow)' : undefined} />
          <ellipse cx="110" cy="332" rx="9" ry="34" fill={fill('CALVES')} stroke={stroke('CALVES')} filter={on('CALVES') ? 'url(#mm-glow)' : undefined} />
        </>
      )}
    </svg>
  )
}
