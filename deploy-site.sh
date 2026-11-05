#!/bin/bash
# Builds the site and publishes it to GitHub Pages as a PUBLIC repo and site.
# Usage: bash deploy-site.sh [--build-only]
set -euo pipefail
cd "$(dirname "$0")"

OWNER=kainar24
REPO=daulet-specifica
GH="${GH:-$(command -v gh || echo /private/tmp/claude-501/-Users-kainar-Desktop-Jean-Claude-Van-Code/5ec0f44d-5e51-4e2c-bc47-21f5abcc442e/scratchpad/ghcli/gh_2.103.3_macOS_arm64/bin/gh)}"
NAME="$(git config --global user.name)"
EMAIL="$(git config --global user.email)"

(cd apps/quiz && BASE_PATH="/$REPO" PUBLIC_OG_IMAGE="https://$OWNER.github.io/$REPO/og-image.png" npx -y pnpm@10.11.0 run build </dev/null)
touch apps/quiz/build/.nojekyll
[ "${1:-}" = "--build-only" ] && { echo "Build is ready in apps/quiz/build"; exit 0; }

push() { git -c credential.helper= -c "credential.helper=!$GH auth git-credential" push "$@"; }

"$GH" repo view "$OWNER/$REPO" >/dev/null 2>&1 || "$GH" repo create "$OWNER/$REPO" --public --description "Exam 4 trainer: formula cards, drill and practice exam"
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
push -u origin main

PUB="$(mktemp -d)"
cp -R apps/quiz/build/. "$PUB/"
(
  cd "$PUB"
  git init -q -b gh-pages
  git add -A
  git -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "Publish site"
  git remote add origin "https://github.com/$OWNER/$REPO.git"
  push -f origin gh-pages
)
rm -rf "$PUB"

"$GH" api "repos/$OWNER/$REPO/pages" >/dev/null 2>&1 || "$GH" api -X POST "repos/$OWNER/$REPO/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null
echo "Done: https://$OWNER.github.io/$REPO/ (the first deploy takes 1-2 minutes)"
