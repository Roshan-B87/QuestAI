"""
Messaging Platform Integrations for QuestAI
Supports: WhatsApp (via Twilio), Telegram, Slack

Setup Instructions:
1. WhatsApp: Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER in .env
2. Telegram: Set TELEGRAM_BOT_TOKEN in .env, register webhook at /webhook/telegram
3. Slack: Set SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET in .env
"""

import os
import hmac
import hashlib
import time
from typing import Optional
from fastapi import APIRouter, Request, HTTPException, Header
from pydantic import BaseModel
import httpx

from nlp.detect import detect_language
from nlp.translate import translate_to_english, translate_from_english
from nlp.intent import classify_intent
from rag.embedder import embed_query
from rag.retriever import retrieve_context
from rag.generator import generate_answer
from data.logger import log_conversation

router = APIRouter(prefix="/webhook", tags=["Integrations"])


# ============== WhatsApp (Twilio) ==============

class TwilioWebhook(BaseModel):
    From: str
    Body: str
    ProfileName: Optional[str] = None


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request):
    """
    WhatsApp webhook via Twilio
    Configure Twilio webhook URL: https://your-domain.com/webhook/whatsapp
    """
    try:
        form_data = await request.form()
        from_number = form_data.get("From", "").replace("whatsapp:", "")
        message_body = form_data.get("Body", "").strip()
        profile_name = form_data.get("ProfileName", "Student")

        if not message_body:
            return {"status": "ignored", "reason": "empty message"}

        # Process with QuestAI
        response = await process_message(
            message=message_body,
            session_id=f"whatsapp_{from_number}",
            platform="whatsapp"
        )

        # Send response via Twilio
        await send_whatsapp_reply(from_number, response)

        return {"status": "ok"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


async def send_whatsapp_reply(to_number: str, message: str):
    """Send WhatsApp message via Twilio API"""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER")

    if not all([account_sid, auth_token, from_number]):
        print("Twilio credentials not configured")
        return

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"

    async with httpx.AsyncClient() as client:
        await client.post(
            url,
            auth=(account_sid, auth_token),
            data={
                "From": f"whatsapp:{from_number}",
                "To": f"whatsapp:{to_number}",
                "Body": message
            }
        )


# ============== Telegram ==============

@router.post("/telegram")
async def telegram_webhook(request: Request):
    """
    Telegram Bot webhook
    Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/webhook/telegram
    """
    try:
        data = await request.json()

        # Handle message updates
        if "message" in data:
            chat_id = data["message"]["chat"]["id"]
            text = data["message"].get("text", "").strip()
            user_name = data["message"]["from"].get("first_name", "Student")

            if not text or text.startswith("/start"):
                await send_telegram_message(
                    chat_id,
                    "Hello! I'm QuestAI. Ask me anything about fees, scholarships, exams, library, and more!"
                )
                return {"status": "ok"}

            # Process with QuestAI
            response = await process_message(
                message=text,
                session_id=f"telegram_{chat_id}",
                platform="telegram"
            )

            await send_telegram_message(chat_id, response)

        return {"status": "ok"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


async def send_telegram_message(chat_id: int, message: str):
    """Send message via Telegram Bot API"""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("Telegram bot token not configured")
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"

    async with httpx.AsyncClient() as client:
        await client.post(url, json={
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        })


# ============== Slack ==============

@router.post("/slack/events")
async def slack_events(
    request: Request,
    x_slack_signature: str = Header(None),
    x_slack_request_timestamp: str = Header(None)
):
    """
    Slack Events API webhook
    Set Event Subscriptions URL: https://your-domain.com/webhook/slack/events
    Subscribe to: message.im, app_mention
    """
    body = await request.body()
    data = await request.json()

    # Verify Slack signature
    if not verify_slack_signature(body, x_slack_signature, x_slack_request_timestamp):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Handle URL verification challenge
    if data.get("type") == "url_verification":
        return {"challenge": data.get("challenge")}

    # Handle events
    if data.get("type") == "event_callback":
        event = data.get("event", {})
        event_type = event.get("type")

        # Ignore bot messages
        if event.get("bot_id"):
            return {"status": "ignored"}

        if event_type in ["message", "app_mention"]:
            channel = event.get("channel")
            text = event.get("text", "").strip()
            user = event.get("user")

            # Remove bot mention from text
            text = text.split(">")[-1].strip() if ">" in text else text

            if not text:
                return {"status": "ignored"}

            # Process with QuestAI
            response = await process_message(
                message=text,
                session_id=f"slack_{user}",
                platform="slack"
            )

            await send_slack_message(channel, response)

    return {"status": "ok"}


def verify_slack_signature(body: bytes, signature: str, timestamp: str) -> bool:
    """Verify Slack request signature"""
    signing_secret = os.getenv("SLACK_SIGNING_SECRET")
    if not signing_secret or not signature or not timestamp:
        return False

    # Check timestamp (prevent replay attacks)
    if abs(time.time() - int(timestamp)) > 60 * 5:
        return False

    sig_basestring = f"v0:{timestamp}:{body.decode()}"
    computed_sig = "v0=" + hmac.new(
        signing_secret.encode(),
        sig_basestring.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed_sig, signature)


async def send_slack_message(channel: str, message: str):
    """Send message via Slack API"""
    token = os.getenv("SLACK_BOT_TOKEN")
    if not token:
        print("Slack bot token not configured")
        return

    url = "https://slack.com/api/chat.postMessage"

    async with httpx.AsyncClient() as client:
        await client.post(
            url,
            headers={"Authorization": f"Bearer {token}"},
            json={
                "channel": channel,
                "text": message,
                "mrkdwn": True
            }
        )


# ============== Microsoft Teams ==============

@router.post("/teams")
async def teams_webhook(request: Request):
    """
    Microsoft Teams Bot webhook
    Configure Bot Framework messaging endpoint
    """
    try:
        data = await request.json()

        if data.get("type") == "message":
            text = data.get("text", "").strip()
            conversation_id = data.get("conversation", {}).get("id")
            service_url = data.get("serviceUrl")

            if not text:
                return {"status": "ignored"}

            # Process with QuestAI
            response = await process_message(
                message=text,
                session_id=f"teams_{conversation_id}",
                platform="teams"
            )

            # Teams requires specific response format
            return {
                "type": "message",
                "text": response
            }

        return {"status": "ok"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============== Common Processing ==============

async def process_message(message: str, session_id: str, platform: str) -> str:
    """Process message through QuestAI pipeline"""
    try:
        # Step 1: Detect language
        detected_lang = detect_language(message)

        # Step 2: Translate to English if needed
        english_query = message
        if detected_lang != "en":
            english_query = translate_to_english(message, detected_lang)

        # Step 3: Classify intent
        intent = classify_intent(english_query)

        # Step 4: RAG pipeline
        query_vec = embed_query(english_query)
        context = retrieve_context(query_vec)
        answer, confidence = generate_answer(english_query, context, detected_lang)

        # Step 5: Always respond in English (understand any language, reply in English)
        final_reply = answer

        # Log conversation
        log_conversation(session_id, message, final_reply, detected_lang)

        # Add platform-specific formatting
        if platform == "slack":
            return final_reply  # Slack uses mrkdwn
        elif platform == "telegram":
            return final_reply  # Telegram uses Markdown

        return final_reply

    except Exception as e:
        return f"I'm having trouble processing your request. Please try again. Error: {str(e)}"


# ============== Health Check ==============

@router.get("/status")
async def integration_status():
    """Check which integrations are configured"""
    return {
        "whatsapp": bool(os.getenv("TWILIO_ACCOUNT_SID")),
        "telegram": bool(os.getenv("TELEGRAM_BOT_TOKEN")),
        "slack": bool(os.getenv("SLACK_BOT_TOKEN")),
        "teams": True  # Teams doesn't require env vars for receiving
    }
