// Hand-rolled snapshot of the public schema. Kept narrow on purpose —
// we'll regenerate via `supabase gen types typescript` once the schema
// stabilizes past the MVP. The migration that owns this shape lives at
// supabase/migrations/<timestamp>_create_learning_events.sql.

export type LearningEventType =
  | "lesson_started"
  | "step_started"
  | "step_completed"
  | "judge_executed"
  | "hint_requested"
  | "question_asked"
  | "code_changed"
  | "lesson_completed";

export type LearningEventMetadata = Record<string, unknown>;

export type Database = {
  public: {
    Tables: {
      learning_events: {
        Row: {
          id: string;
          session_id: string;
          lesson_id: string;
          step_id: string | null;
          event_type: LearningEventType;
          metadata: LearningEventMetadata;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          lesson_id: string;
          step_id?: string | null;
          event_type: LearningEventType;
          metadata?: LearningEventMetadata;
          created_at?: string;
        };
        Update: Partial<{
          session_id: string;
          lesson_id: string;
          step_id: string | null;
          event_type: LearningEventType;
          metadata: LearningEventMetadata;
        }>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
