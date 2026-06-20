// ─── Exercise & Workout Types ────────────────────────────────────────────────
export interface SetData {
  weight: string;
  reps: string;
  done: boolean;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetWeight: string;
  weightNote: string;
  repRange: string;
  defaultSets: number;
}

export interface Exercise extends ExerciseTemplate {
  sets: SetData[];
  notes: string;
}

export interface WorkoutSession {
  day: string;
  exercises: Exercise[];
}

export interface WorkoutRecord {
  date: string;
  day: string;
  exercises: Exercise[];
}

// ─── Auth Types ──────────────────────────────────────────────────────────────
export interface UserData {
  id: string;
  email: string;
  hasGoogleDrive: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

// ─── Drive Types ─────────────────────────────────────────────────────────────
export interface DriveFile {
  id: string;
  name: string;
  createdTime: string;
}

export interface DriveTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  scope: string;
  token_type: string;
}

// ─── Progress Types ──────────────────────────────────────────────────────────
export interface ProgressPoint {
  date: string;
  maxWeight: number;
  maxReps: number;
}

// ─── Default Data ────────────────────────────────────────────────────────────
export const DEFAULT_DAYS = ['Pierna'];

export const DEFAULT_TEMPLATE: ExerciseTemplate[] = [
  { id: 'prensa',             name: 'Prensa',                targetWeight: '130', weightNote: 'kg + máquina', repRange: '8-12', defaultSets: 2 },
  { id: 'peso-muerto-rumano', name: 'Peso muerto rumano',    targetWeight: '50',  weightNote: 'kg + barra',   repRange: '8-12', defaultSets: 2 },
  { id: 'curl-femoral',       name: 'Curl femoral',          targetWeight: '56.3',weightNote: 'kg',           repRange: '8-12', defaultSets: 2 },
  { id: 'extension-cuad',     name: 'Extensión Cuádriceps',  targetWeight: '72.3',weightNote: 'kg',           repRange: '8-12', defaultSets: 2 },
  { id: 'gemelos-prensa',     name: 'Gemelos en prensa',     targetWeight: '90',  weightNote: 'kg',           repRange: '8-12', defaultSets: 3 },
  { id: 'crunch-polea',       name: 'Crunch en polea',       targetWeight: '70',  weightNote: 'kg',           repRange: '8-12', defaultSets: 1 },
];
