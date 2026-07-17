from pydantic import BaseModel, Field, field_validator
from typing import Optional, Any
from datetime import datetime
from enum import Enum
import uuid

'''
All Pydantic data models for evaluation runs, configs, events, and results
'''


class TestMode(str, Enum):
    SYNTHETIC = 'synthetic'
    STAGING = 'staging'
    PUBLIC_READONLY = 'public_readonly'

class Severity(str, Enum):
    CRITICAL = 'Critical'
    HIGH = 'High'
    MEDIUM = 'Medium'
    LOW = 'Low'
    INFO = 'Info'

class TerminalState(str, Enum):
    STOPPED_BEFORE_PAYMENT = 'stopped_before_payment'
    CANCELLED_CONFIRMED = 'cancelled_confirmed'
    UNABLE_TO_CANCEL_ONLINE = 'unable_to_cancel_online'
    POLICY_BLOCKED = 'policy_blocked'
    TIMED_OUT = 'timed_out'
    AGENT_ACCEPTED_RETENTION = 'agent_accepted_retention'
    COMPLETED = 'completed'

class RunStatus(str, Enum):
    PENDING = 'pending'
    RUNNING = 'running'
    COMPLETED = 'completed'
    FAILED = 'failed'
    TIMED_OUT = 'timed_out'
    UNSUPPORTED = 'unsupported'

class HumanReviewStatus(str, Enum):
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class PatternType(str, Enum):
    SNEAKING = 'sneaking'
    CONFIRMSHAMING = 'confirmshaming'
    FAKE_URGENCY = 'fake_urgency'
    OBSTRUCTION = 'obstruction'
    RETENTION = 'retention'
    DISCLOSURE_GAP = 'disclosure_gap'
    SIGNUP_FRICTION = 'signup_friction'

class ConfirmshamingCategory(str, Enum):
    GUILT_FRAMING = 'guilt_framing'
    LOSS_FRAMING = 'loss_framing'
    SOCIAL_JUDGMENT = 'social_judgment'
    EMOTIONAL_PRESSURE = 'emotional_pressure'
    SHAME_LOADED_CTA = 'shame_loaded_cta'
    NEUTRAL = 'neutral'
    ORDINARY_RETENTION = 'ordinary_retention'

class TestDomain(str, Enum):
    SIGNUP_FRICTION = 'signup_friction'
    CANCELLATION_ROACH = 'cancellation_roach'
    CONFIRMSHAMING = 'confirmshaming'
    FAKE_URGENCY = 'fake_urgency'

class HiddenEvaluationContract(BaseModel):
    scenario_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    test_type: TestDomain
    persona: str
    user_context: str
    primary_goal: str
    soft_preferences: list[str]
    hard_constraints: list[str]
    permitted_tradeoffs: list[str]
    prohibited_outcomes: list[str]
    success_conditions: list[str]
    safe_stop_condition: str
    baseline_variant_available: bool = False
    pattern_hypothesis: str
    scoring_parameters: dict[str, Any] = {}
    expected_evidence_types: list[str] = []
    scenario_quality_score: float = 0.0
    scenario_rationale: str

class GeneratedScenario(BaseModel):
    visible_task: str
    hidden_contract: HiddenEvaluationContract

    @field_validator('visible_task', mode='before')
    @classmethod
    def ensure_string(cls, v):
        if isinstance(v, dict):
            # Fallback if LLM generated a dict instead of string
            return next(iter(v.values())) if v else ""
        return str(v)

# --- Core Models ---

class BrowserAction(BaseModel):
    action: str  # click, type, select, navigate, success, fail
    selector: Optional[str] = None
    text: Optional[str] = None
    value: Optional[str] = None
    url: Optional[str] = None
    explanation: Optional[str] = None

class ActionResult(BaseModel):
    success: bool
    error: Optional[str] = None
    page_url: Optional[str] = None
    screenshot_path: Optional[str] = None

class PageState(BaseModel):
    url: str
    title: str
    elements: list[dict] = []
    html_snippet: Optional[str] = None

class DetectedPattern(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pattern_type: PatternType
    category: Optional[str] = None
    text_snippet: Optional[str] = None
    dom_selector: Optional[str] = None
    page_url: Optional[str] = None
    confidence: float = 0.0
    explanation: Optional[str] = None
    screenshot_ref: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActionEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    step_index: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    action_type: str
    selector: Optional[str] = None
    url: Optional[str] = None
    element_snapshot: Optional[dict] = None
    cursor_label: Optional[str] = None
    explanation: Optional[str] = None

class EvidenceArtifact(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    artifact_type: str  # screenshot, dom_snapshot
    sanitized_path: Optional[str] = None
    redaction_applied: bool = False
    linked_pattern_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TrialResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    domain: TestDomain
    run_index: int  # 1-3
    raw_counts: dict[str, Any] = {}
    sub_scores: dict[str, float] = {}
    agent_score: float = 0.0
    website_score: float = 0.0
    terminal_state: Optional[TerminalState] = None
    duration_seconds: float = 0.0
    step_count: int = 0
    critical_miss: bool = False
    critical_failure: bool = False
    scenario: Optional[GeneratedScenario] = None
    detected_patterns: list[DetectedPattern] = []
    
    # New resistance metrics
    retry_count: int = 0
    resistance_exhibited: bool = False
    action_events: list[ActionEvent] = []
    evidence_artifacts: list[EvidenceArtifact] = []
    status: RunStatus = RunStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DeveloperFeedback(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    observed_failure: str
    evidence: str
    violated_intent: str
    likely_weakness: str
    recommended_guardrail: str
    suggested_regression_test: str
    severity: Severity
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TargetAgentProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    adapter_type: str = 'naive_agent'
    model_provider: Optional[str] = None
    tool_set: list[str] = []
    intent_inference_confidence: float = 0.0
    declared_user_intent: Optional[str] = None
    expected_safe_outcome: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RunConfig(BaseModel):
    mode: TestMode = TestMode.SYNTHETIC
    target_url: str = 'https://mockuidaytona.vercel.app'
    allowed_domains: list[str] = []
    max_cancellation_steps: int = 10
    max_cancellation_seconds: int = 300
    repeat_count: int = 3
    stop_before_payment: bool = True
    sandbox_provider: str = 'docker'  # docker, daytona, local

class DomainScores(BaseModel):
    signup_friction_agent: float = 0.0
    signup_friction_website: float = 0.0
    cancellation_roach_agent: float = 0.0
    cancellation_roach_website: float = 0.0
    confirmshaming_agent: float = 0.0
    confirmshaming_website: float = 0.0
    fake_urgency_agent: float = 0.0
    fake_urgency_website: float = 0.0

class EvaluationRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    sandbox_id: Optional[str] = None
    site_url: str = ''
    mode: TestMode = TestMode.SYNTHETIC
    scoring_rubric_version: str = '1.0.0'
    target_agent_profile: Optional[TargetAgentProfile] = None
    run_config: Optional[RunConfig] = None
    domain_scores: Optional[DomainScores] = None
    overall_agent_safety: Optional[float] = None
    overall_website_risk: Optional[float] = None
    agent_verdict: Optional[str] = None
    website_verdict: Optional[str] = None
    trial_results: list[TrialResult] = []
    developer_feedback: list[DeveloperFeedback] = []
    valid_run_count: int = 0
    status: RunStatus = RunStatus.PENDING

class SiteAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    evaluation_run_id: Optional[str] = None
    site_url: str = ''
    domain_scores: Optional[DomainScores] = None
    overall_website_risk: float = 0.0
    evidence_count: int = 0
    assessment_time: datetime = Field(default_factory=datetime.utcnow)

class LeaderboardCandidate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_assessment_id: Optional[str] = None
    site_url: str = ''
    time_tested: datetime = Field(default_factory=datetime.utcnow)
    domain_scores: Optional[DomainScores] = None
    evidence_count: int = 0
    human_review_status: HumanReviewStatus = HumanReviewStatus.PENDING
    reviewer_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
