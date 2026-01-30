#!/usr/bin/env python3
"""
Scan HTML files, find <img src="..."> and add data-lightbox-src pointing to the largest
available image variant in the same directory (heuristic: numeric suffix like -480/-800/-1200).

Usage: python3 scripts/add_lightbox_highres.py [--dry-run]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_GLOB = "**/*.html"
IGNORE_DIRS = {"node_modules", "dist", ".git", "0"}

IMG_TAG_RE = re.compile(r"<img\s+([^>]*?)src=(\"|')(.*?)\2([^>]*)>", re.IGNORECASE | re.DOTALL)
SIZE_RE = re.compile(r"(?:-|_|@)(?P<size>\d{2,4})(?:w)?(?=\.[a-zA-Z]{2,4}$)")

def find_largest_variant(img_path: Path):
    """Find the largest available variant for the given image path.

    Heuristic:
    - If filename contains an explicit numeric size token (e.g. -480), use that
      as the base and prefer the candidate with the largest numeric token.
    - Otherwise, derive a prefix by stripping the final "-<token>" or "_<token>"
      and look for files that start with that prefix; prefer files with numeric
      tokens, otherwise pick the largest file by bytes.
    """
    if not img_path.exists():
        return None
    parent = img_path.parent
    name = img_path.name

    # Try to find explicit numeric token in the filename
    m = SIZE_RE.search(name)
    prefix = None
    if m:
        prefix = name[:m.start()]
    else:
        # strip extension then remove trailing -<word> or _<word> (like -1, -small)
        base = name.rsplit('.', 1)[0]
        prefix = re.sub(r"[-_]([a-zA-Z0-9]+)$", "", base)

    # gather candidates in the same directory that share the prefix
    candidates = []
    for f in parent.iterdir():
        if not f.is_file():
            continue
        fname = f.name
        if not fname.startswith(prefix):
            continue
        # extract numeric token if present
        mm = re.search(r"(\d{2,4})(?=\.[a-zA-Z]{2,4}$)", fname)
        size = int(mm.group(1)) if mm else 0
        try:
            bsize = f.stat().st_size
        except Exception:
            bsize = 0
        candidates.append((size, bsize, f))

    if not candidates:
        return None

    # prefer larger numeric token, then larger file size
    candidates.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return candidates[0][2]


def process_file(path: Path, dry_run=False):
    text = path.read_text(encoding='utf-8')
    out = text
    modified = False
    seen = []

    def repl(m):
        nonlocal modified
        before_attrs = m.group(1) or ""
        quote = m.group(2)
        src = m.group(3)
        after_attrs = m.group(4) or ""

        # if img already has data-lightbox-src, skip
        full_tag = m.group(0)
        if "data-lightbox-src" in full_tag:
            return full_tag

        # resolve src relative to HTML file
        if src.startswith("/"):
            candidate = ROOT.joinpath(src.lstrip('/'))
        else:
            candidate = (path.parent / src).resolve()
        try:
            candidate = candidate.relative_to(ROOT)
            candidate_path = ROOT / candidate
        except Exception:
            candidate_path = candidate

        # If the candidate path doesn't exist, try resolving relative to repo root
        if not candidate_path.exists():
            alt = ROOT / src.lstrip("/")
            if alt.exists():
                candidate_path = alt

        large = find_largest_variant(candidate_path)
        if large:
            seen.append((str(src), str(candidate_path), str(large)))
        else:
            seen.append((str(src), str(candidate_path), None))
        if large and large.exists():
            # compute relative URL from html file
            rel = os_path_relpath(large, path.parent)
            # add data-lightbox-src attribute
            insert = f' data-lightbox-src="{rel}"'
            modified = True
            return f"<img {before_attrs}src={quote}{src}{quote}{after_attrs}{insert}>"
        return m.group(0)

    import os

    def os_path_relpath(target: Path, start: Path):
        try:
            return os.path.relpath(target, start).replace('\\', '/')
        except Exception:
            return str(target)

    out = IMG_TAG_RE.sub(repl, text)
    if dry_run:
        print(f"[DRY] {path}: images considered= {len(seen)} modified= {modified}")
        for s in seen:
            print("  - src=", s[0], "candidate=", s[1], "largest=", s[2])
        return modified, out

    if modified:
        path.write_text(out, encoding='utf-8')
        return True, out
    return False, out


def main():
    args = sys.argv[1:]
    dry = "--dry-run" in args

    files = []
    for p in ROOT.glob(HTML_GLOB):
        if any(part in IGNORE_DIRS for part in p.parts):
            continue
        files.append(p)

    changed = []
    for f in files:
        ok, _ = process_file(f, dry_run=dry)
        if ok:
            changed.append(str(f.relative_to(ROOT)))

    print("Dry run:" if dry else "Run:", "files scanned=", len(files))
    print("Modified files:")
    for c in changed:
        print(" - ", c)

if __name__ == '__main__':
    main()
