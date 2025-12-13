#!/bin/bash
# install-hooks.sh
mkdir -p .git/hooks
cp hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
echo "Pre-push hook installed!"