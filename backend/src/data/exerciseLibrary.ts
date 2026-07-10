// LifeOS Gym — Curated exercise library + default weekly split.
// Each exercise carries the primary muscle group (matches the MuscleGroup enum),
// programming defaults, and step-by-step "how to perform" guidance used by the
// guided-workout player and the muscle map on the frontend.

export interface LibraryExercise {
  name: string;
  muscleGroup: string; // MuscleGroup enum value
  sets: number;
  reps: string;
  restSeconds: number;
  steps: string[];
  tips?: string;
}

export interface LibraryDay {
  weekday: number; // 1=Mon ... 7=Sun
  title: string;
  focus: string;
  isRest?: boolean;
  exercises?: string[]; // references EXERCISES keys
}

// ─── Exercise definitions (keyed by name) ────────────────────────────────────
export const EXERCISES: Record<string, LibraryExercise> = {
  'Barbell Bench Press': {
    name: 'Barbell Bench Press',
    muscleGroup: 'CHEST',
    sets: 4, reps: '6-10', restSeconds: 120,
    steps: [
      'Lie flat on the bench, eyes under the bar, feet planted firmly.',
      'Grip the bar slightly wider than shoulder-width, wrists stacked over elbows.',
      'Unrack and hold the bar over your chest with arms locked.',
      'Lower the bar under control to mid-chest, elbows ~45° from your body.',
      'Press explosively back up until arms are straight. That is one rep.',
    ],
    tips: 'Keep shoulder blades pinched back and glutes on the bench the whole set.',
  },
  'Incline Dumbbell Press': {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'CHEST',
    sets: 3, reps: '8-12', restSeconds: 90,
    steps: [
      'Set the bench to a 30–45° incline and sit with a dumbbell on each thigh.',
      'Kick the weights up as you lie back, holding them at shoulder level.',
      'Press both dumbbells up and slightly together until arms are extended.',
      'Lower slowly until you feel a stretch across the upper chest.',
    ],
    tips: 'Do not clank the dumbbells at the top — keep tension on the chest.',
  },
  'Overhead Shoulder Press': {
    name: 'Overhead Shoulder Press',
    muscleGroup: 'SHOULDERS',
    sets: 4, reps: '8-10', restSeconds: 90,
    steps: [
      'Stand or sit tall with a dumbbell in each hand at shoulder height.',
      'Brace your core and keep your ribs down (no arching).',
      'Press the weights overhead until your arms are straight.',
      'Lower under control back to your shoulders.',
    ],
    tips: 'Squeeze your glutes to protect your lower back when standing.',
  },
  'Lateral Raise': {
    name: 'Lateral Raise',
    muscleGroup: 'SHOULDERS',
    sets: 3, reps: '12-15', restSeconds: 60,
    steps: [
      'Hold a light dumbbell in each hand at your sides, slight elbow bend.',
      'Raise both arms out to the sides until they reach shoulder height.',
      'Lead with your elbows, not your hands.',
      'Lower slowly — resist the weight on the way down.',
    ],
    tips: 'Go lighter than you think; this is about control, not weight.',
  },
  'Triceps Pushdown': {
    name: 'Triceps Pushdown',
    muscleGroup: 'TRICEPS',
    sets: 3, reps: '10-15', restSeconds: 60,
    steps: [
      'Attach a rope/bar to a high cable and grip it with elbows tucked.',
      'Keep your upper arms pinned to your sides.',
      'Extend your forearms down until your arms are fully straight.',
      'Slowly let the weight return without letting your elbows flare.',
    ],
  },
  'Bent-Over Barbell Row': {
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'BACK',
    sets: 4, reps: '6-10', restSeconds: 120,
    steps: [
      'Hold the bar with an overhand grip, hinge at the hips to ~45°.',
      'Keep your back flat and core braced, bar hanging at arm’s length.',
      'Pull the bar to your lower ribs, driving your elbows back.',
      'Squeeze your shoulder blades, then lower under control.',
    ],
    tips: 'Do not use momentum — your torso should stay still.',
  },
  'Lat Pulldown': {
    name: 'Lat Pulldown',
    muscleGroup: 'BACK',
    sets: 3, reps: '8-12', restSeconds: 90,
    steps: [
      'Sit at the machine and grip the bar wider than shoulder width.',
      'Pull your shoulders down and back to start.',
      'Drive your elbows down and pull the bar to your upper chest.',
      'Control the bar back up until arms are fully extended.',
    ],
  },
  'Seated Cable Row': {
    name: 'Seated Cable Row',
    muscleGroup: 'BACK',
    sets: 3, reps: '10-12', restSeconds: 90,
    steps: [
      'Sit with feet on the platform and a slight bend in the knees.',
      'Grab the handle, sit tall with a flat back.',
      'Pull the handle to your belly, squeezing your shoulder blades.',
      'Extend your arms back out slowly under control.',
    ],
  },
  'Barbell Bicep Curl': {
    name: 'Barbell Bicep Curl',
    muscleGroup: 'BICEPS',
    sets: 3, reps: '8-12', restSeconds: 60,
    steps: [
      'Stand holding a barbell with an underhand, shoulder-width grip.',
      'Keep your elbows pinned to your sides.',
      'Curl the bar up toward your shoulders by bending the elbows.',
      'Lower slowly until arms are fully extended.',
    ],
    tips: 'No swinging — if you need to swing, the weight is too heavy.',
  },
  'Hammer Curl': {
    name: 'Hammer Curl',
    muscleGroup: 'BICEPS',
    sets: 3, reps: '10-12', restSeconds: 60,
    steps: [
      'Hold a dumbbell in each hand with palms facing your body.',
      'Keeping elbows tucked, curl the weights up.',
      'Pause briefly at the top, thumbs pointing to the ceiling.',
      'Lower under control to the start.',
    ],
  },
  'Barbell Back Squat': {
    name: 'Barbell Back Squat',
    muscleGroup: 'LEGS',
    sets: 4, reps: '6-10', restSeconds: 150,
    steps: [
      'Set the bar across your upper back (not your neck) and unrack it.',
      'Step back, feet shoulder-width, toes slightly out.',
      'Brace your core and sit down and back, knees tracking over toes.',
      'Descend until thighs are at least parallel, then drive up through your heels.',
    ],
    tips: 'Keep your chest up and knees pushing out throughout the rep.',
  },
  'Romanian Deadlift': {
    name: 'Romanian Deadlift',
    muscleGroup: 'GLUTES',
    sets: 3, reps: '8-12', restSeconds: 120,
    steps: [
      'Hold a barbell at hip level with a shoulder-width grip.',
      'With a soft knee bend, push your hips straight back.',
      'Lower the bar along your legs until you feel a hamstring stretch.',
      'Drive your hips forward to stand tall and squeeze your glutes.',
    ],
    tips: 'Keep the bar close to your body and your back flat, not rounded.',
  },
  'Leg Press': {
    name: 'Leg Press',
    muscleGroup: 'LEGS',
    sets: 3, reps: '10-15', restSeconds: 90,
    steps: [
      'Sit in the machine with feet shoulder-width on the platform.',
      'Release the safety and lower the platform by bending your knees.',
      'Go until your knees reach ~90°, keeping your lower back on the pad.',
      'Press back up without locking your knees at the top.',
    ],
  },
  'Leg Curl': {
    name: 'Leg Curl',
    muscleGroup: 'LEGS',
    sets: 3, reps: '10-15', restSeconds: 60,
    steps: [
      'Lie or sit on the machine with the pad against your lower calves.',
      'Curl your heels toward your glutes by bending the knees.',
      'Squeeze your hamstrings at the top.',
      'Return slowly to the start position.',
    ],
  },
  'Standing Calf Raise': {
    name: 'Standing Calf Raise',
    muscleGroup: 'CALVES',
    sets: 4, reps: '12-20', restSeconds: 45,
    steps: [
      'Stand with the balls of your feet on a raised edge, heels hanging.',
      'Let your heels drop for a deep stretch.',
      'Push through the balls of your feet to rise as high as possible.',
      'Pause at the top, then lower slowly.',
    ],
  },
  'Plank': {
    name: 'Plank',
    muscleGroup: 'CORE',
    sets: 3, reps: '30-60s', restSeconds: 45,
    steps: [
      'Rest on your forearms and toes, elbows under your shoulders.',
      'Form a straight line from head to heels.',
      'Squeeze your glutes and brace your abs — do not let hips sag.',
      'Hold for the target time, breathing steadily.',
    ],
  },
  'Hanging Leg Raise': {
    name: 'Hanging Leg Raise',
    muscleGroup: 'CORE',
    sets: 3, reps: '10-15', restSeconds: 60,
    steps: [
      'Hang from a pull-up bar with arms straight.',
      'Keep a slight hollow-body position, no swinging.',
      'Raise your legs until they are parallel to the floor (or higher).',
      'Lower slowly under control.',
    ],
  },
  'Cable Crunch': {
    name: 'Cable Crunch',
    muscleGroup: 'CORE',
    sets: 3, reps: '12-15', restSeconds: 45,
    steps: [
      'Kneel below a high cable holding a rope by your head.',
      'Hinge at the abs, crunching your ribcage toward your pelvis.',
      'Keep your hips fixed — the movement is only your spine flexing.',
      'Return slowly to the top.',
    ],
  },
};

// ─── Default weekly split (Mon–Sat train, Sun rest) ──────────────────────────
export const DEFAULT_WEEK: LibraryDay[] = [
  { weekday: 1, title: 'Push Day', focus: 'Chest · Shoulders · Triceps',
    exercises: ['Barbell Bench Press', 'Incline Dumbbell Press', 'Overhead Shoulder Press', 'Lateral Raise', 'Triceps Pushdown'] },
  { weekday: 2, title: 'Pull Day', focus: 'Back · Biceps',
    exercises: ['Bent-Over Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Barbell Bicep Curl', 'Hammer Curl'] },
  { weekday: 3, title: 'Leg Day', focus: 'Quads · Hamstrings · Glutes · Calves',
    exercises: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curl', 'Standing Calf Raise'] },
  { weekday: 4, title: 'Push Day', focus: 'Chest · Shoulders · Triceps',
    exercises: ['Incline Dumbbell Press', 'Barbell Bench Press', 'Overhead Shoulder Press', 'Lateral Raise', 'Triceps Pushdown'] },
  { weekday: 5, title: 'Pull Day', focus: 'Back · Biceps',
    exercises: ['Lat Pulldown', 'Bent-Over Barbell Row', 'Seated Cable Row', 'Hammer Curl', 'Barbell Bicep Curl'] },
  { weekday: 6, title: 'Legs & Core', focus: 'Legs · Abs',
    exercises: ['Barbell Back Squat', 'Leg Press', 'Standing Calf Raise', 'Hanging Leg Raise', 'Plank', 'Cable Crunch'] },
  { weekday: 7, title: 'Rest Day', focus: 'Recovery · Mobility · Walk', isRest: true, exercises: [] },
];

// Expand a LibraryDay reference list into full embedded PlanExercise objects.
export function buildDefaultPlanDays() {
  return DEFAULT_WEEK.map((day) => ({
    weekday: day.weekday,
    title: day.title,
    focus: day.focus,
    isRest: !!day.isRest,
    exercises: (day.exercises || []).map((key) => {
      const ex = EXERCISES[key];
      return {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        steps: ex.steps,
        tips: ex.tips ?? null,
      };
    }),
  }));
}
