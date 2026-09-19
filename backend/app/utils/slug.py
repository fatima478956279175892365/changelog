from slugify import slugify


def make_unique_slug(name: str, existing: set[str]) -> str:
    base = slugify(name, max_length=80) or "project"
    slug = base
    counter = 2
    while slug in existing:
        slug = f"{base}-{counter}"
        counter += 1
    return slug
