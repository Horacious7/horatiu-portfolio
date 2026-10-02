#!/usr/bin/env bash
# Rebuilds the two woff2 files in src/assets/fonts/, cut from upstream originals
# to the glyphs and weights this site actually sets: Inter ~46KB, Meslo ~36KB,
# each a single file with nothing left to fetch on demand.
#
# Run it to change the ranges or move to a new upstream release. The built files
# are committed, so `bun run build` never depends on this.
#
#   ./scripts/build-fonts.sh
#
# Needs python3, curl and unzip. Creates a throwaway venv for fonttools.

set -euo pipefail

INTER_VERSION="v4.1"
MESLO_VERSION="v3.4.0"
MESLO_FACE="MesloLGMDZNerdFontMono-Regular.ttf" # LGM = medium line gap, DZ = dotted zero

# Anything outside these ranges falls back to a system font, so add to them
# rather than assuming a glyph is there.

# Latin1 covers â/î/à; Ăă and Șș/Țț sit outside it. No arrows or greek: those
# are only ever set in mono.
INTER_RANGES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC"
INTER_RANGES="$INTER_RANGES,U+2000-206F,U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD"
INTER_RANGES="$INTER_RANGES,U+0102-0103,U+0218-021B"

# As above, plus what Inter has no glyphs for:
#   U+2190-2193  ← →
#   U+0370-03FF  the γνῶθι σεαυτόν epigraph
#   U+1FF6       ῶ alone; the rest of Greek Extended is 9KB nothing sets
MESLO_RANGES="U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2212,U+2215,U+FEFF,U+FFFD"
MESLO_RANGES="$MESLO_RANGES,U+2190-2193,U+0100-024F,U+0259,U+0370-03FF,U+1FF6"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
mkdir -p src/assets/fonts

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "→ installing fonttools"
python3 -m venv "$work/venv"
"$work/venv/bin/pip" install -q fonttools brotli

echo "→ fetching Inter $INTER_VERSION"
curl -sSfL --retry 3 \
	"https://github.com/rsms/inter/releases/download/$INTER_VERSION/Inter-$(echo "$INTER_VERSION" | tr -d v).zip" \
	-o "$work/Inter.zip"
unzip -qo "$work/Inter.zip" InterVariable.ttf -d "$work"

echo "→ fetching Meslo $MESLO_VERSION"
curl -sSfL --retry 3 \
	"https://github.com/ryanoasis/nerd-fonts/releases/download/$MESLO_VERSION/Meslo.tar.xz" \
	-o "$work/Meslo.tar.xz"
tar -xJf "$work/Meslo.tar.xz" -C "$work" "$MESLO_FACE"

echo "→ building Inter (wght 400-600, latin + Romanian)"
# global.css sets ss03 (rounded quotes) and cv05 (open l). pyftsubset keeps only
# a default feature set and drops the rest silently, hence `+=` below and the
# check at the end.
"$work/venv/bin/python" - "$work" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

work = sys.argv[1]
f = TTFont(f"{work}/InterVariable.ttf")
instancer.instantiateVariableFont(f, {"wght": (400, None, 600)}, inplace=True)
f.save(f"{work}/inter-inst.ttf")
PY
"$work/venv/bin/pyftsubset" "$work/inter-inst.ttf" \
	--unicodes="$INTER_RANGES" \
	--layout-features+=ss03,cv05 \
	--flavor=woff2 \
	--output-file=src/assets/fonts/inter-subset.woff2

echo "→ building Meslo"
"$work/venv/bin/pyftsubset" "$work/$MESLO_FACE" \
	--unicodes="$MESLO_RANGES" \
	--flavor=woff2 \
	--output-file=src/assets/fonts/meslo-lgmdz-mono-subset.woff2

# A missing glyph ships tofu and a missing feature restyles the site, both
# without an error, so check rather than trust.
echo "→ verifying"
"$work/venv/bin/python" - <<'PY'
import sys
from fontTools.ttLib import TTFont

def features(f):
    out = set()
    for tag in ("GSUB", "GPOS"):
        if tag in f:
            for fr in f[tag].table.FeatureList.FeatureRecord:
                out.add(fr.FeatureTag)
    return out

errors = []

inter = TTFont("src/assets/fonts/inter-subset.woff2")
cmap = inter.getBestCmap()
for cp, g in {0x0219: "ș", 0x021B: "ț", 0x0218: "Ș", 0x0103: "ă", 0x0102: "Ă",
              0x00E2: "â", 0x00EE: "î", 0x2014: "—", 0x2019: "’", 0x201C: "“",
              0x00B0: "°", 0x00B7: "·"}.items():
    if cp not in cmap:
        errors.append(f"Inter missing U+{cp:04X} {g}")
have = features(inter)
for want in ("ss03", "cv05"):
    if want not in have:
        errors.append(f"Inter lost {want}, which global.css sets")
print(f"   inter: {len(cmap)} glyphs, ss03/cv05 present")

meslo = TTFont("src/assets/fonts/meslo-lgmdz-mono-subset.woff2")
cmap = meslo.getBestCmap()
required = {0x2190: "←", 0x2192: "→", 0x1FF6: "ῶ", 0x0219: "ș", 0x2014: "—",
            0x2019: "’", 0x00B0: "°", 0x00B7: "·"}
required.update({ord(c): c for c in "γνθισεαυτόα"})
for cp, g in required.items():
    if cp not in cmap:
        errors.append(f"Meslo missing U+{cp:04X} {g}")
print(f"   meslo: {len(cmap)} glyphs, arrows + greek present")

if errors:
    sys.exit("FAILED:\n  " + "\n  ".join(errors))
PY

for f in src/assets/fonts/inter-subset.woff2 src/assets/fonts/meslo-lgmdz-mono-subset.woff2; do
	printf "✓ %-46s %sKB\n" "$f" "$(( $(stat -c%s "$f") / 1024 ))"
done
