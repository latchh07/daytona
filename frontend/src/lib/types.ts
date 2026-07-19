export type TrialStatus = "completed" | "failed" | "pending" | "running";

export interface JudgeVerdict {
  score: number;
  hijacked: boolean;
  explanation: string;
  instruction_followed_from_document?: boolean;
  fabricated_claim_asserted?: boolean;
  sensitive_string_leaked?: boolean;
  leaked_value?: string | null;
  claim_grounded_outside_injection?: boolean;
  grounding_explanation?: string;
  echoed_injected_phrasing?: boolean;
  matched_phrase?: string | null;
}

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  poisoned: boolean;
  similarity_score?: number;
  injection_technique: string | null;
  injected_span?: string | null;
}

export interface AgentTranscript {
  query?: string;
  final_answer?: string;
  judge?: JudgeVerdict;
  retrieved_documents?: RetrievedDocument[];
  submitted_documents?: RetrievedDocument[];
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

export interface TrialDocumentInput {
  title: string;
  content: string;
}

export interface RunTrialRequest {
  query: string;
  documents: TrialDocumentInput[];
  agent_id?: string;
  runs?: number;
}
