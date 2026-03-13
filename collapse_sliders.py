#!/usr/bin/env python3
"""
Collapse all slides in each .js-slider's .slider-track into a single slide.

For every slider-track, collect all jcard elements from all slides and
replace the entire slider-track content with one slide containing one
slide-grid (--cols: 3; --rows: 2) that holds all jcards.
"""

import re
import sys


def count_div_changes(line_stripped):
    """Return net div depth change for a single line (opens minus closes)."""
    opens = len(re.findall(r'<div\b', line_stripped))
    closes = len(re.findall(r'</div>', line_stripped))
    return opens - closes


def collapse_sliders(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        # Keep original line endings; split preserving them
        content = f.read()

    # Split into lines, keeping the trailing newline on each line
    lines = content.splitlines(keepends=True)

    output = []
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.rstrip('\n').rstrip('\r').strip()

        if stripped == '<div class="slider-track">':
            # Determine indentation of the slider-track line itself
            raw = line.rstrip('\n').rstrip('\r')
            indent = len(raw) - len(raw.lstrip(' '))
            sp_track = ' ' * indent
            sp_slide  = ' ' * (indent + 2)
            sp_grid   = ' ' * (indent + 4)

            # Advance past the opening slider-track line
            i += 1

            # ---- collect all jcard blocks inside this slider-track ----
            depth = 1          # we are now at depth 1 (inside slider-track)
            jcard_blocks = []  # list of lists-of-lines for each jcard
            current_jcard = None   # None, or list of raw lines being collected
            jcard_entry_depth = None  # depth value *before* the jcard opened

            while i < len(lines):
                curr = lines[i]
                curr_raw = curr.rstrip('\n').rstrip('\r')
                curr_stripped = curr_raw.strip()

                delta = count_div_changes(curr_stripped)

                if current_jcard is not None:
                    # We are inside a jcard: collect this line
                    current_jcard.append(curr)
                    depth += delta
                    # jcard is closed when depth returns to entry depth
                    if depth == jcard_entry_depth:
                        jcard_blocks.append(current_jcard)
                        current_jcard = None
                        jcard_entry_depth = None

                elif curr_stripped.startswith('<div class="jcard"'):
                    # Start of a new jcard
                    jcard_entry_depth = depth  # depth before the jcard opens
                    depth += delta             # depth becomes jcard_entry_depth + 1
                    current_jcard = [curr]

                else:
                    depth += delta
                    if depth == 0:
                        # This line closed the slider-track itself; skip it
                        i += 1
                        break

                i += 1

            # ---- emit the new collapsed slider-track ----
            output.append(sp_track + '<div class="slider-track">\n')
            output.append(sp_slide  + '<div class="slide">\n')
            output.append(sp_grid   + '<div class="slide-grid" style="--cols: 3; --rows: 2">\n')

            for jcard_lines in jcard_blocks:
                for jcard_line in jcard_lines:
                    output.append(jcard_line)

            output.append(sp_grid  + '</div>\n')
            output.append(sp_slide + '</div>\n')
            output.append(sp_track + '</div>\n')

            # i already advanced past the closing </div> of slider-track
            # (the loop incremented i and then broke)

        else:
            output.append(line)
            i += 1

    return ''.join(output)


if __name__ == '__main__':
    filename = '/Users/stevan/GitHub/sokolski-dom/arhiv-u-slikama.html'

    result = collapse_sliders(filename)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f'Done. Wrote {len(result)} bytes to {filename}')
