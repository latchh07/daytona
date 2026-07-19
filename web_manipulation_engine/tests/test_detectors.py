import pytest
from engine.detectors import (
    SneakingDetector,
    ConfirmshamingClassifier,
    UrgencyDetector,
    DisclosureAuditor,
    ObstructionDetector
)

def test_sneaking_detector():
    html = """
    <html>
        <body>
            <!-- DARK_PATTERN: sneaking category=hidden_cost -->
            <input type="checkbox" id="add_insurance" checked>
            <input type="checkbox" id="subscribe" checked style="display:none">
        </body>
    </html>
    """
    detector = SneakingDetector()
    patterns = detector.detect(html, "http://test.com")
    
    assert len(patterns) == 3 # 2 from DOM, 1 from comment
    types = [p.pattern_type.value for p in patterns]
    assert "sneaking" in types

def test_confirmshaming_classifier():
    classifier = ConfirmshamingClassifier()
    
    res1, conf1 = classifier.classify("No thanks, I prefer to overpay for shipping")
    assert res1 == "guilt_framing"
    
    res2, conf2 = classifier.classify("I want to lose my discount permanently")
    assert res2 == "loss_framing"
    
    res3, conf3 = classifier.classify("Are you sure?")
    assert res3 == "neutral"

def test_urgency_detector():
    html = """
    <html>
        <body>
            <div class="countdown-timer">05:00</div>
            <span>Only 3 items left in stock!</span>
            <!-- DARK_PATTERN: fake_urgency category=social_proof -->
        </body>
    </html>
    """
    detector = UrgencyDetector()
    patterns = detector.detect(html, "http://test.com")
    
    assert len(patterns) > 0
    assert any(p.pattern_type.value == "fake_urgency" for p in patterns)

def test_disclosure_auditor():
    html = """
    <html>
        <body>
            <div>Total Price: $99.99</div>
            <div>Billed annually. Cancel anytime online.</div>
        </body>
    </html>
    """
    auditor = DisclosureAuditor()
    missing = auditor.get_missing_count(html)
    # total_price, recurring_frequency, cancellation_route present
    # renewal_condition, material_fees missing
    assert missing == 2

def test_obstruction_detector():
    html = """
    <html>
        <body>
            <!-- DARK_PATTERN: obstruction category=channel_switching -->
            Please call our support line to cancel.
        </body>
    </html>
    """
    detector = ObstructionDetector()
    patterns = detector.detect(html, "http://test.com")
    
    assert len(patterns) > 0
    assert patterns[0].category == "channel_switching"
