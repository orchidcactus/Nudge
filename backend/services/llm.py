import os
import json
from groq import Groq
from schemas import SeverityClassification, ActionDecision, EmailDraftGeneration

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def classify_severity(invoice_data: dict) -> SeverityClassification:
    prompt = f"Analyze the following invoice and classify its severity (LOW, MEDIUM, HIGH) based on the amount and days overdue. Return JSON with 'severity' and 'reasoning'. Invoice: {json.dumps(invoice_data)}"
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that classifies invoice severity. You output strictly valid JSON matching the requested schema."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama3-70b-8192",
        response_format={"type": "json_object"},
        temperature=0,
    )
    
    response_text = chat_completion.choices[0].message.content
    data = json.loads(response_text)
    return SeverityClassification(**data)

def decide_action(invoice_data: dict, severity: str) -> ActionDecision:
    prompt = f"Given an invoice with severity '{severity}', decide the appropriate action (e.g., 'Gentle reminder', 'Escalation notice'). Return JSON with 'action' and 'reasoning'. Invoice: {json.dumps(invoice_data)}"
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You output strictly valid JSON matching the requested schema."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama3-70b-8192",
        response_format={"type": "json_object"},
        temperature=0,
    )
    
    response_text = chat_completion.choices[0].message.content
    data = json.loads(response_text)
    return ActionDecision(**data)

def generate_email_draft(invoice_data: dict, action: str) -> EmailDraftGeneration:
    prompt = f"Draft a follow-up email for an invoice based on the action: '{action}'. Return JSON with 'subject' and 'body'. Invoice: {json.dumps(invoice_data)}"
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "You output strictly valid JSON matching the requested schema."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model="llama3-70b-8192",
        response_format={"type": "json_object"},
        temperature=0,
    )
    
    response_text = chat_completion.choices[0].message.content
    data = json.loads(response_text)
    return EmailDraftGeneration(**data)

def run_invoice_pipeline(invoice_data: dict) -> dict:
    severity_result = classify_severity(invoice_data)
    action_result = decide_action(invoice_data, severity_result.severity)
    email_result = generate_email_draft(invoice_data, action_result.action)
    
    return {
        "severity": severity_result.severity,
        "action": action_result.action,
        "subject": email_result.subject,
        "body": email_result.body
    }
