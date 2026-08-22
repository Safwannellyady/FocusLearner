"""
FocusLearner Pro - Email Service

Minimal SMTP-based email sending, built on the MAIL_* config values that
already existed in config.py but were never wired up to anything.

Uses stdlib smtplib/email — no new dependency needed. If you'd rather use
a transactional provider (Resend, SendGrid, etc.) later, swap the body of
send_email() for their API call; callers don't need to change.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


class EmailNotConfiguredError(Exception):
    """Raised when MAIL_* settings are missing, so callers can decide how to degrade."""
    pass


def send_email(to_email: str, subject: str, html_body: str, text_body: str = "") -> None:
    cfg = current_app.config
    server = cfg.get("MAIL_SERVER")
    username = cfg.get("MAIL_USERNAME")
    password = cfg.get("MAIL_PASSWORD")

    if not server or not username or not password:
        raise EmailNotConfiguredError(
            "MAIL_SERVER / MAIL_USERNAME / MAIL_PASSWORD are not set — "
            "set them as environment variables to enable outgoing email."
        )

    port = cfg.get("MAIL_PORT", 587)
    use_tls = cfg.get("MAIL_USE_TLS", True)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = username
    msg["To"] = to_email
    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(server, port) as smtp:
        if use_tls:
            smtp.starttls()
        smtp.login(username, password)
        smtp.sendmail(username, [to_email], msg.as_string())


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    subject = "Reset your FocusLearner Pro password"
    text_body = (
        f"We received a request to reset your FocusLearner Pro password.\n\n"
        f"Reset it here (valid for 1 hour): {reset_link}\n\n"
        f"If you didn't request this, you can safely ignore this email."
    )
    html_body = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">Reset your password</h2>
        <p>We received a request to reset your FocusLearner Pro password.
           This link is valid for <strong>1 hour</strong>.</p>
        <p style="margin: 24px 0;">
            <a href="{reset_link}"
               style="background:#000; color:#fff; padding:12px 20px;
                      text-decoration:none; border-radius:6px;">
                Reset Password
            </a>
        </p>
        <p style="color:#666; font-size: 13px;">
            If you didn't request this, you can safely ignore this email —
            your password won't be changed.
        </p>
    </div>
    """
    send_email(to_email, subject, html_body, text_body)
