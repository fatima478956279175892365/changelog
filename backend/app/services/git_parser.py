import re

from app.services.transform import detect_type


CONVENTIONAL_COMMIT = re.compile(
    r"^(?P<type>\w+)(?:\((?P<scope>[^)]+)\))?(?P<breaking>!)?: (?P<subject>.+)$",
    re.MULTILINE,
)


def parse_commit_message(commit_message: str) -> dict:
    lines = [line.strip() for line in commit_message.strip().splitlines() if line.strip()]
    first_line = lines[0] if lines else commit_message.strip()
    body = "\n".join(lines[1:]).strip()

    match = CONVENTIONAL_COMMIT.match(first_line)
    if match:
        subject = match.group("subject").strip()
        title = subject[0].upper() + subject[1:] if subject else first_line
        description = body or subject
        update_type = detect_type(first_line, body or subject)
        return {
            "title": title,
            "description": description,
            "type": update_type,
            "commit_source": first_line,
        }

    title = first_line[0].upper() + first_line[1:] if first_line else "Update"
    return {
        "title": title,
        "description": body or first_line,
        "type": detect_type(first_line, body or first_line),
        "commit_source": first_line[:500],
    }
