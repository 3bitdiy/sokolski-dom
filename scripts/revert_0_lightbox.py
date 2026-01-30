#!/usr/bin/env python3
"""
Remove data-lightbox-src attributes from HTML files under the `0` folder.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
TARGET_GLOB = "0/**/*.html"
ATTR_RE = re.compile(r"\sdata-lightbox-src=(\"|').*?\1")

changed = []
for p in ROOT.glob(TARGET_GLOB):
    text = p.read_text(encoding='utf-8')
    new = ATTR_RE.sub('', text)
    if new != text:
        p.write_text(new, encoding='utf-8')
        changed.append(str(p.relative_to(ROOT)))

print("Reverted data-lightbox-src in files:")
for c in changed:
    print(" - ", c)
if not changed:
    print("(none)")
