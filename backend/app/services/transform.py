from app.models.update import UpdateType


def detect_type(title: str, description: str) -> UpdateType:
    text = f"{title} {description}".lower()
    if "fix" in text or "bug" in text or "patch" in text:
        return UpdateType.BUGFIX
    if "feat" in text:
        return UpdateType.FEATURE
    return UpdateType.IMPROVEMENT


def _combined(title: str, description: str) -> str:
    if description.strip().lower() == title.strip().lower():
        return title.strip()
    return f"{title.strip()}. {description.strip()}".strip(".")


def generate_developer_view(title: str, description: str, update_type: UpdateType) -> str:
    text = _combined(title, description)
    lower = text.lower()

    if update_type == UpdateType.BUGFIX:
        if any(k in lower for k in ("jwt", "login", "auth", "token")):
            return "Resolved JWT validation issue affecting authentication flow"
        return f"Resolved {text.lower()} in the application stack"

    if update_type == UpdateType.FEATURE:
        return f"Shipped {text} — includes API, schema, and UI integration"

    return f"Optimized {text.lower()} for improved performance and reliability"


def generate_customer_view(title: str, description: str, update_type: UpdateType) -> str:
    text = _combined(title, description)
    lower = text.lower()

    if update_type == UpdateType.BUGFIX:
        if any(k in lower for k in ("jwt", "login", "auth", "token")):
            return "Fixed an issue preventing some users from logging in"
        return "We fixed a bug that may have affected your experience"

    if update_type == UpdateType.FEATURE:
        clean = title.strip().rstrip(".")
        if clean.lower().startswith(("add ", "added ")):
            return f"We're excited to introduce {clean[4:].lower() if clean.lower().startswith('add ') else clean[6:].lower()}"
        return f"We're excited to introduce: {clean}"

    clean = title.strip().rstrip(".").lower()
    if clean.startswith(("faster ", "improved ", "optimized ")):
        return f"We've {clean} for a smoother experience"
    return f"We've improved {clean} for a smoother experience"


def generate_internal_view(title: str, description: str, update_type: UpdateType) -> str:
    text = _combined(title, description)
    lower = text.lower()

    if update_type == UpdateType.BUGFIX:
        if any(k in lower for k in ("jwt", "login", "auth", "token")):
            return "Root cause was token validation mismatch after recent auth changes"
        return f"Bug fix deployed — reduces support tickets related to {title.lower()}"

    if update_type == UpdateType.FEATURE:
        return f"New capability shipped — expected to improve activation and retention"

    return f"Quality-of-life improvement — reduces friction in {title.lower()}"


def transform_update(title: str, description: str, update_type: UpdateType | None = None) -> dict:
    resolved_type = update_type or detect_type(title, description)
    return {
        "type": resolved_type,
        "developer_view": generate_developer_view(title, description, resolved_type),
        "customer_view": generate_customer_view(title, description, resolved_type),
        "internal_view": generate_internal_view(title, description, resolved_type),
    }
