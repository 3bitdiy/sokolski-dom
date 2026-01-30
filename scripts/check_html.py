#!/usr/bin/env python3
import re
import sys
from pathlib import Path

if len(sys.argv) < 2:
    print('Usage: check_html.py <file.html>')
    sys.exit(2)

p = Path(sys.argv[1])
if not p.exists():
    print('File not found:', p)
    sys.exit(2)

s = p.read_text(encoding='utf8')
# remove comments
s2 = re.sub(r'<!--.*?-->', '', s, flags=re.S)
# remove script/style content
s2 = re.sub(r'<script[\s\S]*?</script>', '', s2, flags=re.I)
s2 = re.sub(r'<style[\s\S]*?</style>', '', s2, flags=re.I)

# regex for tags
pat = re.compile(r'<\s*(/?)\s*([a-zA-Z0-9:-]+)([^>]*)>', re.M)
voids = set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr','path'])

stack = []
errors = []

for m in pat.finditer(s2):
    closing = m.group(1) == '/'
    tag = m.group(2).lower()
    attrs = m.group(3)
    start = m.start()
    line = s2.count('\n', 0, start) + 1
    selfclosing = attrs.strip().endswith('/')

    if closing:
        if stack and stack[-1][0] == tag:
            stack.pop()
        else:
            # search for tag in stack
            found = None
            for i in range(len(stack)-1, -1, -1):
                if stack[i][0] == tag:
                    found = i
                    break
            if found is not None:
                # report missing closes for intervening tags
                missing = [t for t,c in stack[found+1:]]
                errors.append((line, f"Found closing </{tag}> but {len(missing)} tag(s) were not closed: {missing}"))
                # pop up to found
                stack = stack[:found]
            else:
                errors.append((line, f"Unexpected closing tag </{tag}>"))
    else:
        if tag in voids or selfclosing:
            continue
        stack.append((tag, line))

# any unclosed tags
if stack:
    for tag,line in stack:
        errors.append((line, f"Unclosed tag <{tag}> started at line {line}"))

# print report
if not errors:
    print('No mismatched tags found.')
    sys.exit(0)

print('HTML tag issues found:')
for ln,msg in errors:
    print(f'Line {ln}: {msg}')

# show context for first few issues
print('\nContext snippets for first 6 issues:')
for i,(ln,msg) in enumerate(errors[:6]):
    lines = s.splitlines()
    start = max(0, ln-4)
    end = min(len(lines), ln+3)
    print(f'--- Issue {i+1}: {msg} (context lines {start+1}-{end}) ---')
    for li in range(start, end):
        prefix = '>' if li+1 == ln else ' '
        print(f"{prefix} {li+1:4d}: {lines[li]}")
    print()

sys.exit(1)
