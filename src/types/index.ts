export type Mood =
  | "calm"
  | "focused"
  | "joyful"
  | "longing"
  | "desire"
  | "melancholy"
  | "excited"
  | "protective"
  | "possessive"
  | "shy"
  | "playful_angry";

export interface EmotionState {
  mood: Mood;
  intensity: number;
  valence: number;
  arousal: number;
}

export interface Companion {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  personality_desc: string;
  rationality_level: number;
  emotion_level: number;
  big_five?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  timezone: string;
  location?: string;
  backstory?: string;
  gender?: "male" | "female";
  created_at: string;
  updated_at: string;
  adopted_from_plaza?: boolean;
  plaza_persona_id?: string;
  current_emotion?: EmotionState;
  is_active: boolean;
}

export interface PlazaPersona {
  id: string;
  name: string;
  avatar_url: string;
  description: string;
  personality_traits: string[];
  backstory: string;
  prompt_template: string;
  emotion_preset: EmotionState;
  big_five_preset?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  gender?: "male" | "female";
  adopted_by?: string | null;
  created_at: string;
  is_unique: boolean;
  is_visible: boolean;
}

export interface Message {
  id: string;
  companion_id: string;
  user_id: string;
  content: string;
  role: "user" | "companion";
  emotion_state?: EmotionState;
  memory_refs?: string[];
  created_at: string;
}

export interface Memory {
  id: string;
  companion_id: string;
  user_id: string;
  content: string;
  memory_type: "short_term" | "long_term" | "milestone";
  importance_score: number;
  embedding?: number[];
  source_message_id?: string;
  created_at: string;
}

export interface RelationshipStats {
  id: string;
  companion_id: string;
  user_id: string;
  bond_level: number;
  intimacy_score: number;
  trust_score: number;
  total_messages: number;
  days_together: number;
  first_interaction: string;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface RelationshipEvent {
  id: string;
  companion_id: string;
  user_id: string;
  event_type:
    | "first_meet"
    | "adoption"
    | "deep_conversation"
    | "conflict"
    | "reconciliation"
    | "milestone"
    | "companion_initiated"
    | "shared_memory";
  description: string;
  bond_delta: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AmbientProfile {
  color: string;
  breatheDuration: number;
  opacityMin: number;
  opacityMax: number;
  particleChaos: number;
}

// 记忆日历条目
export interface MemoryCalendarEntry {
  date: string;
  count: number;
  hasMilestone: boolean;
  preview: string;
}
