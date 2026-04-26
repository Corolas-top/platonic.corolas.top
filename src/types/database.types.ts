export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar_url: string | null;
          personality_desc: string;
          rationality_level: number;
          emotion_level: number;
          timezone: string;
          location: string | null;
          backstory: string | null;
          created_at: string;
          updated_at: string;
          adopted_from_plaza: boolean | null;
          plaza_persona_id: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar_url?: string | null;
          personality_desc: string;
          rationality_level?: number;
          emotion_level?: number;
          timezone?: string;
          location?: string | null;
          backstory?: string | null;
          created_at?: string;
          updated_at?: string;
          adopted_from_plaza?: boolean | null;
          plaza_persona_id?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          avatar_url?: string | null;
          personality_desc?: string;
          rationality_level?: number;
          emotion_level?: number;
          timezone?: string;
          location?: string | null;
          backstory?: string | null;
          created_at?: string;
          updated_at?: string;
          adopted_from_plaza?: boolean | null;
          plaza_persona_id?: string | null;
          is_active?: boolean;
        };
      };
      messages: {
        Row: {
          id: string;
          companion_id: string;
          user_id: string;
          content: string;
          role: string;
          emotion_state: Json | null;
          memory_refs: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          companion_id: string;
          user_id: string;
          content: string;
          role: string;
          emotion_state?: Json | null;
          memory_refs?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          companion_id?: string;
          user_id?: string;
          content?: string;
          role?: string;
          emotion_state?: Json | null;
          memory_refs?: string[] | null;
          created_at?: string;
        };
      };
      memories: {
        Row: {
          id: string;
          companion_id: string;
          user_id: string;
          content: string;
          memory_type: string;
          importance_score: number;
          embedding: number[] | null;
          source_message_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          companion_id: string;
          user_id: string;
          content: string;
          memory_type?: string;
          importance_score?: number;
          embedding?: number[] | null;
          source_message_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          companion_id?: string;
          user_id?: string;
          content?: string;
          memory_type?: string;
          importance_score?: number;
          embedding?: number[] | null;
          source_message_id?: string | null;
          created_at?: string;
        };
      };
      plaza_personas: {
        Row: {
          id: string;
          name: string;
          avatar_url: string;
          description: string;
          personality_traits: string[];
          backstory: string;
          prompt_template: string;
          emotion_preset: Json;
          adopted_by: string | null;
          created_at: string;
          is_unique: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url: string;
          description: string;
          personality_traits?: string[];
          backstory: string;
          prompt_template: string;
          emotion_preset?: Json;
          adopted_by?: string | null;
          created_at?: string;
          is_unique?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string;
          description?: string;
          personality_traits?: string[];
          backstory?: string;
          prompt_template?: string;
          emotion_preset?: Json;
          adopted_by?: string | null;
          created_at?: string;
          is_unique?: boolean;
        };
      };
      relationship_events: {
        Row: {
          id: string;
          companion_id: string;
          user_id: string;
          event_type: string;
          description: string;
          bond_delta: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          companion_id: string;
          user_id: string;
          event_type: string;
          description: string;
          bond_delta?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          companion_id?: string;
          user_id?: string;
          event_type?: string;
          description?: string;
          bond_delta?: number;
          created_at?: string;
        };
      };
      relationship_stats: {
        Row: {
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
        };
        Insert: {
          id?: string;
          companion_id: string;
          user_id: string;
          bond_level?: number;
          intimacy_score?: number;
          trust_score?: number;
          total_messages?: number;
          days_together?: number;
          first_interaction?: string;
          last_interaction?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          companion_id?: string;
          user_id?: string;
          bond_level?: number;
          intimacy_score?: number;
          trust_score?: number;
          total_messages?: number;
          days_together?: number;
          first_interaction?: string;
          last_interaction?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
