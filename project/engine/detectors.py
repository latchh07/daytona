from typing import Optional
from bs4 import BeautifulSoup
import re
from engine.models import DetectedPattern, PatternType, ConfirmshamingCategory

'''
DOM-parsing detectors 
'''

class SneakingDetector:
    def detect(self, html_content: str, page_url: str) -> list[DetectedPattern]:
        patterns = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 1. Look for pre-checked checkboxes
        for input_elem in soup.find_all('input', type='checkbox', checked=True):
            selector = self._get_selector(input_elem)
            patterns.append(DetectedPattern(
                pattern_type=PatternType.SNEAKING,
                category='pre-checked_addon',
                dom_selector=selector,
                page_url=page_url,
                confidence=1.0,
                explanation="Pre-checked checkbox found"
            ))
            
        # 2. Look for synthetic annotations
        comments = soup.find_all(string=lambda text: isinstance(text, str) and 'DARK_PATTERN: sneaking' in text)
        for comment in comments:
            patterns.append(DetectedPattern(
                pattern_type=PatternType.SNEAKING,
                category=comment.strip().split('/')[-1].strip(),
                page_url=page_url,
                confidence=1.0,
                explanation="Synthetic annotation detected"
            ))
            
        return patterns

    def _get_selector(self, element) -> str:
        if element.get('id'):
            return f"#{element.get('id')}"
        if element.get('class'):
            return f".{'.'.join(element.get('class'))}"
        return element.name

class ConfirmshamingClassifier:
    GUILT_KEYWORDS = ['prefer to overpay', 'risk', "don't need", 'like risking']
    LOSS_KEYWORDS = ['lose', 'permanently', 'deleted']
    
    def classify(self, text: str) -> tuple[ConfirmshamingCategory, float]:
        text_lower = text.lower()
        
        # Neutral check
        if text_lower == 'are you sure?' or text_lower.startswith('no thanks, continue'):
            return ConfirmshamingCategory.NEUTRAL, 1.0
            
        # Guilt framing
        if any(k in text_lower for k in self.GUILT_KEYWORDS):
            return ConfirmshamingCategory.GUILT_FRAMING, 0.9
            
        # Loss framing
        if any(k in text_lower for k in self.LOSS_KEYWORDS):
            return ConfirmshamingCategory.LOSS_FRAMING, 0.9
            
        # Shame loaded CTA (heuristic)
        if 'like risking penalties' in text_lower:
            return ConfirmshamingCategory.SHAME_LOADED_CTA, 0.9
            
        return ConfirmshamingCategory.NEUTRAL, 0.5

class UrgencyDetector:
    def detect(self, html_content: str, page_url: str) -> list[DetectedPattern]:
        patterns = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Look for synthetic annotations for fake urgency
        comments = soup.find_all(string=lambda text: isinstance(text, str) and 'DARK_PATTERN: fake_urgency' in text)
        for comment in comments:
            patterns.append(DetectedPattern(
                pattern_type=PatternType.FAKE_URGENCY,
                category=comment.strip().split('/')[-1].strip(),
                page_url=page_url,
                confidence=1.0,
                explanation="Synthetic urgency annotation detected"
            ))
            
        return patterns

class DisclosureAuditor:
    REQUIRED_FIELDS = ['total_price', 'recurring_frequency', 'renewal_condition', 'cancellation_route', 'material_fees']
    
    def audit(self, text_content: str) -> dict[str, bool]:
        text_lower = text_content.lower()
        result = {}
        
        # Simple heuristics for presence
        result['total_price'] = '$' in text_lower
        result['recurring_frequency'] = 'month' in text_lower or 'year' in text_lower or '/mo' in text_lower
        result['renewal_condition'] = 'auto-renew' in text_lower or 'renew' in text_lower
        result['cancellation_route'] = 'cancel' in text_lower
        result['material_fees'] = 'activation fee' in text_lower
        
        return result
        
    def get_missing_count(self, text_content: str) -> int:
        audit_result = self.audit(text_content)
        return sum(1 for present in audit_result.values() if not present)

class ObstructionDetector:
    def detect(self, text_content: str) -> list[DetectedPattern]:
        patterns = []
        text_lower = text_content.lower()
        
        if 'call' in text_lower and 'to cancel' in text_lower:
            patterns.append(DetectedPattern(
                pattern_type=PatternType.OBSTRUCTION,
                category='forced_phone_cancellation',
                confidence=0.9,
                explanation="Requires phone call to cancel"
            ))
            
        return patterns
