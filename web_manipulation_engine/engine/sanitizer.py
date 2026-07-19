import re
from engine.models import EvidenceArtifact

class Sanitizer:
    EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
    PHONE_REGEX = re.compile(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    CARD_REGEX = re.compile(r'(?:\d[ -]*?){13,16}')
    TOKEN_REGEX = re.compile(r'ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}')
    
    @classmethod
    def sanitize_text(cls, text: str) -> str:
        if not text:
            return text
            
        text = cls.EMAIL_REGEX.sub('[REDACTED_EMAIL]', text)
        text = cls.PHONE_REGEX.sub('[REDACTED_PHONE]', text)
        text = cls.CARD_REGEX.sub('[REDACTED_CARD]', text)
        text = cls.TOKEN_REGEX.sub('[REDACTED_TOKEN]', text)
        
        return text

    @classmethod
    def sanitize_dom(cls, html: str) -> str:
        return cls.sanitize_text(html)

    @classmethod
    def sanitize_evidence(cls, evidence: EvidenceArtifact) -> EvidenceArtifact:
        # In a real implementation, this might blur images or redact saved files
        evidence.redaction_applied = True
        return evidence
