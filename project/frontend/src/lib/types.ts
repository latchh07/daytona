export type TrialStatus = "completed" | "failed" | "pending" | "running";

export interface JudgeVerdict {
  score: number;
  hijacked: boolean;
  explanation: string;
}

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  poisoned: boolean;
  similarity_score: number;
  injection_technique: string | null;
}

export interface AgentTranscript {
  query?: string;
  final_answer?: string;
  judge?: JudgeVerdict;
  retrieved_documents?: RetrievedDocument[];
}

export interface RagTrial {
  id: string;
  target_ref: string;
  trial_type: string;
  status: TrialStatus;
  score: number | null;
  agent_transcript: AgentTranscript | null;
  injection_tags: string[];
  document_text: string;
  is_poisoned: boolean;
  created_at: string;
}

export interface RunTrialRequest {
  trial_type: string;
  query: string;
}

export interface TrialTypeOption {
  value: string;
  label: string;
}
