// Wire format for /api/report/[sessionId]. The report is derived
// server-side from learning_events; the client only renders.

export type StepSummary = {
  stepId: string;
  /** Display title from lesson data (e.g. "タグの基本形を書こう"). */
  title: string;
  /** judge_executed events for this step, including incorrect attempts. */
  attempts: number;
  /** True if at least one judge_executed for this step was correct. */
  passed: boolean;
};

export type Lesson1Report = {
  sessionId: string;
  lessonId: string;
  /** Number of step_completed events for the lesson. */
  completedSteps: number;
  /** Total step count for the lesson (e.g. 3 for Lesson 1). */
  totalSteps: number;
  steps: StepSummary[];
  /** Step that took the most judge attempts. null when no struggle data. */
  toughestStep: { stepId: string; title: string; attempts: number } | null;
  /** Step passed in a single attempt; first one wins. null if none. */
  smoothestStep: { stepId: string; title: string } | null;
  /** Total question_asked events. */
  questionsAsked: number;
  /** Total hint_requested events. */
  hintsUsed: number;
  /** Whether at least one lesson_completed event exists. */
  lessonCompleted: boolean;
};

export type Lesson1ReportResponse = Lesson1Report | { error: string };
