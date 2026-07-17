import pytest
from engine.sanitizer import (
    sanitize_text,
    sanitize_dom
)

def test_sanitize_text():
    # Email
    text = "Contact me at user@example.com for info."
    sanitized = sanitize_text(text)
    assert "user@example.com" not in sanitized
    assert "[REDACTED_EMAIL]" in sanitized

    # Phone
    text = "My number is 555-123-4567."
    sanitized = sanitize_text(text)
    assert "555-123-4567" not in sanitized
    assert "[REDACTED_PHONE]" in sanitized

    # Credit Card
    text = "Card: 1234 5678 1234 5678"
    sanitized = sanitize_text(text)
    assert "1234 5678" not in sanitized
    assert "[REDACTED_CARD]" in sanitized

def test_sanitize_dom():
    html = """
    <html>
        <body>
            <p>Email: test@test.com</p>
            <input type="text" value="800-555-1234">
        </body>
    </html>
    """
    sanitized_html = sanitize_dom(html)
    assert "test@test.com" not in sanitized_html
    assert "[REDACTED_EMAIL]" in sanitized_html
    assert "800-555-1234" not in sanitized_html
    assert "[REDACTED_PHONE]" in sanitized_html
