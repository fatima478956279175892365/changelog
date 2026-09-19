import logging

logger = logging.getLogger(__name__)


async def notify_subscribers(project_name: str, subscriber_emails: list[str], update_title: str) -> None:
    """MVP: log notification intent. Swap for SendGrid/Resend in production."""
    if not subscriber_emails:
        return
    for email in subscriber_emails:
        logger.info(
            "[email] To=%s | Project=%s | Update=%s",
            email,
            project_name,
            update_title,
        )
