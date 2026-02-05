#!/bin/bash
set -euo pipefail

normalize_basename() {
  local name="$1"

  # lowercase
  name=$(printf '%s' "$name" | tr '[:upper:]' '[:lower:]')

  # dijakritici (srpski)
  name=$(printf '%s' "$name" \
    | sed -e 's/č/c/g' \
          -e 's/ć/c/g' \
          -e 's/š/s/g' \
          -e 's/ž/z/g' \
          -e 's/đ/dj/g')

  # razmaci i _ -> -
  name=$(printf '%s' "$name" | sed -E 's/[ _]+/-/g')

  # tačke u imenu -> -
  name=$(printf '%s' "$name" | sed -E 's/\./-/g')

  # ukloni sve osim a-z 0-9 i -
  name=$(printf '%s' "$name" | sed -E 's/[^a-z0-9-]+//g')

  # višestruke crte u jednu
  name=$(printf '%s' "$name" | sed -E 's/-{2,}/-/g')

  # ukloni - na početku/kraju
  name=$(printf '%s' "$name" | sed -E 's/^-+//; s/-+$//')

  [ -z "$name" ] && name="image"
  printf '%s' "$name"
}

find . -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0 |
while IFS= read -r -d '' f; do
  dir="$(dirname "$f")"
  file="$(basename "$f")"

  ext=".${file##*.}"      # .JPG / .jpeg ...
  base="${file%.*}"       # sve pre ekstenzije

  ext_lc=$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')  # .jpg/.jpeg
  new_base="$(normalize_basename "$base")"

  target="${dir}/${new_base}${ext_lc}"

  # ako je već ok
  [ "$f" = "$target" ] && continue

  # bez -2: ako target već postoji, preskoči da ne pregazi
  if [ -e "$target" ]; then
    echo "SKIP (exists): $f → $target"
    continue
  fi

  echo "$f → $target"

  # 2-step rename (macOS safe)
  tmp="${dir}/.__tmp__rename__$$__${RANDOM}${ext_lc}"
  mv "$f" "$tmp"
  mv "$tmp" "$target"
done