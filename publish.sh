#!/usr/bin/env bash
# One-shot helper: push this folder to a GitHub repo for Pages hosting.
#   ./publish.sh https://github.com/YOURNAME/clawmark.git
set -e
cd "$(dirname "$0")"
REMOTE="$1"
if [ -z "$REMOTE" ]; then
  echo ""
  echo "  Usage: ./publish.sh https://github.com/YOURNAME/REPO.git"
  echo ""
  echo "  1. Create an empty PUBLIC repo on github.com/new"
  echo "  2. Run this with its URL"
  echo "  3. Then: Settings -> Pages -> Branch: main / (root)"
  echo ""
  exit 1
fi
if [ ! -d .git ]; then
  git init
  git branch -M main
fi
git add .
git commit -m "Shoutout overlay" || echo "  (nothing new to commit)"
if git remote | grep -q '^origin$'; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi
git push -u origin main
echo ""
echo "  Pushed."
# only print Pages hints for a real github remote
if echo "$REMOTE" | grep -qi 'github\.com'; then
  USER=$(echo "$REMOTE" | sed -E 's#.*github\.com[:/]+([^/]+)/.*#\1#')
  REPO=$(echo "$REMOTE" | sed -E 's#/+$##; s#\.git$##; s#.*/##')
  echo ""
  echo "  Now enable Pages:"
  echo "     https://github.com/$USER/$REPO/settings/pages"
  echo "     Source: Deploy from a branch  ->  main  ->  / (root)"
  echo ""
  echo "  Then your builder will be at:"
  echo "     https://$USER.github.io/$REPO/"
else
  echo "  (not a github.com remote - enable static hosting however your host expects)"
fi
echo ""
