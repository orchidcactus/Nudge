import os
import json
from typing import Type
import requests
from groq import Groq
from pydantic import BaseModel
from schemas import SeverityClassification, ActionDecision, EmailDraftGeneration

def _call_llm(system_instruction: str, prompt: str, response_model: Type[BaseModel]) -> BaseModel:
    # 1. Try Gemini primary
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}
        
        # Convert Pydantic model to JSON schema for structured output
        schema = response_model.model_json_schema()
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": schema,
                "temperature": 0.0
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            res_data = response.json()
            text_output = res_data["candidates"][0]["content"]["parts"][0]["text"]
            parsed_data = json.loads(text_output)
            return response_model(**parsed_data)
        except Exception as e:
            print(f"Gemini API call failed ({e}). Falling back to Groq...")
            
    # 2. Fallback to Groq
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("Neither GEMINI_API_KEY nor GROQ_API_KEY is available in the environment.")
        
    groq_client = Groq(api_key=groq_key)
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": system_instruction
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model=os.environ.get("GROQ_MODEL", "llama3-70b-8192"),
        response_format={"type": "json_object"},
        temperature=0,
    )
    
    response_text = chat_completion.choices[0].message.content
    data = json.loads(response_text)
    return response_model(**data)

def classify_severity(invoice_data: dict) -> SeverityClassification:
    system_instruction = "You are a helpful assistant that classifies invoice severity. You output strictly valid JSON matching the requested schema."
    prompt = f"Analyze the following invoice and classify its severity (LOW, MEDIUM, HIGH) based on the amount and days overdue. Return JSON with 'severity' and 'reasoning'. Invoice: {json.dumps(invoice_data)}"
    return _call_llm(system_instruction, prompt, SeverityClassification)

def decide_action(invoice_data: dict, severity: str) -> ActionDecision:
    system_instruction = "You are a helpful assistant that decides on the action to take for an invoice. You output strictly valid JSON matching the requested schema."
    prompt = f"Given an invoice with severity '{severity}', decide the appropriate action (e.g., 'Gentle reminder', 'Escalation notice'). Return JSON with 'action' and 'reasoning'. Invoice: {json.dumps(invoice_data)}"
    return _call_llm(system_instruction, prompt, ActionDecision)

def generate_email_draft(invoice_data: dict, action: str) -> EmailDraftGeneration:
    system_instruction = "You are a helpful assistant that drafts invoice emails. You output strictly valid JSON matching the requested schema."
    prompt = f"Draft a follow-up email for an invoice based on the action: '{action}'. Return JSON with 'subject' and 'body'. Invoice: {json.dumps(invoice_data)}"
    return _call_llm(system_instruction, prompt, EmailDraftGeneration)

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

