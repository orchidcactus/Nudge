import os
import resend

resend.api_key = os.environ.get("RESEND_API_KEY")

def send_email(to: str, subject: str, body: str):
    try:
        r = resend.Emails.send({
            "from": "Acme <onboarding@resend.dev>",
            "to": to,
            "subject": subject,
            "html": body
        })
        return r
    except Exception as e:
        print(f"Failed to send email: {e}")
        return None
