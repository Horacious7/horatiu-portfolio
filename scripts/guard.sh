#!/usr/bin/env bash
# Fails the build if something that must never be published shows up in the
# source or the built site. See "Never publish" in CLAUDE.md.
set -uo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"
status=0

# Words that must not appear anywhere on the site (case-insensitive).
denylist='ciubar|ciubere|tahara|aquoraspa|BEGIN [A-Z ]*PRIVATE KEY'
if grep -rniE "$denylist" src public dist 2>/dev/null; then
	echo "guard: denylisted term found (see above)" >&2
	status=1
fi

# Employer wording lives in one approved place only: src/data/site.ts.
if grep -rniE "porsche" src public --exclude=site.ts 2>/dev/null; then
	echo "guard: 'Porsche' may only appear in src/data/site.ts" >&2
	status=1
fi

# No key material in the repo.
if find src public -iname "*.pem" -o -iname "*.key" 2>/dev/null | grep -q .; then
	echo "guard: key file found in src/ or public/" >&2
	status=1
fi

[ "$status" -eq 0 ] && echo "guard: clean"
exit "$status"
