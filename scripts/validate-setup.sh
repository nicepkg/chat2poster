#!/bin/bash

# =============================================================================
# Setup Validation Script
# =============================================================================
# Run this script to check if all placeholders have been replaced.
# Usage: ./scripts/validate-setup.sh
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🔍 Validating project setup..."
echo ""

# Track if any issues found
ISSUES_FOUND=0

# -----------------------------------------------------------------------------
# Check for unreplaced placeholders
# -----------------------------------------------------------------------------
echo "📋 Checking for unreplaced placeholders..."

PLACEHOLDER_PATTERNS=(
  "\[project-name\]"
  "\[repo-name\]"
  "\[project-slogan\]"
  "\[project-domain\]"
  "\[github-username\]"
  "\[author-name\]"
  "\[author-website\]"
  "\[support-email\]"
  "\[twitter-handle\]"
  "\[bilibili-uid\]"
  "\[douyin-uid\]"
  "\[douyin-nickname\]"
)

# Files to check (exclude example files, templates, and AI instruction files)
FILES_TO_CHECK=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.md" -o -name "*.json" -o -name "*.yml" -o -name "*.yaml" \) \
  ! -path "./node_modules/*" \
  ! -path "./.git/*" \
  ! -path "./.next/*" \
  ! -name "*.example.md" \
  ! -name "*.example.yml" \
  ! -name "*.example.yaml" \
  ! -name "validate-setup.sh" \
  ! -name "CLAUDE.md" \
  ! -name "AGENTS.md" \
  ! -name "CHECKLIST.md" \
  ! -name "mcp-manager.md")

for pattern in "${PLACEHOLDER_PATTERNS[@]}"; do
  MATCHES=$(grep -rl "$pattern" $FILES_TO_CHECK 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}❌ Found unreplaced placeholder: $pattern${NC}"
    echo "$MATCHES" | while read -r file; do
      echo "   - $file"
    done
    ISSUES_FOUND=1
  fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ All placeholders have been replaced${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Check required files exist
# -----------------------------------------------------------------------------
echo "📁 Checking required files..."

REQUIRED_FILES=(
  "README.md"
  "README_cn.md"
  "package.json"
  "LICENSE"
  "CONTRIBUTING.md"
  "apps/web-nextjs/src/lib/site-info.ts"
  "apps/web-nextjs/public/icon.svg"
  ".github/workflows/ci.yml"
  ".github/workflows/deploy-website.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Missing required file: $file${NC}"
    ISSUES_FOUND=1
  fi
done

if [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ All required files exist${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Check MCP configs exist
# -----------------------------------------------------------------------------
echo "🔌 Checking MCP configurations..."

MCP_FILES=(
  ".mcp.json"
  ".cursor/mcp.json"
  ".codex/config.toml"
  "opencode.json"
)

MCP_MISSING=0
for file in "${MCP_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️  MCP config not found: $file${NC}"
    MCP_MISSING=1
  fi
done

if [ $MCP_MISSING -eq 0 ]; then
  echo -e "${GREEN}✅ All MCP configs exist${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Check symlinks
# -----------------------------------------------------------------------------
echo "🔗 Checking symlinks..."

if [ -L "AGENTS.md" ]; then
  echo -e "${GREEN}✅ AGENTS.md → CLAUDE.md symlink exists${NC}"
else
  echo -e "${YELLOW}⚠️  AGENTS.md symlink not found (optional)${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Check if example files should be deleted
# -----------------------------------------------------------------------------
echo "🗑️  Checking for leftover example files..."

EXAMPLE_FILES=(
  "README.example.md"
  "README_cn.example.md"
  "docs/config.example.md"
  "docs/prd.example.md"
  ".github/ISSUE_TEMPLATE/bug_report.example.md"
  ".github/ISSUE_TEMPLATE/feature_request.example.md"
  ".github/ISSUE_TEMPLATE/config.example.yml"
  ".github/ISSUE_TEMPLATE/feedback.example.md"
  ".github/PULL_REQUEST_TEMPLATE.example.md"
  "CHECKLIST.md"
)

EXAMPLE_FOUND=0
for file in "${EXAMPLE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${YELLOW}⚠️  Example file still exists: $file${NC}"
    EXAMPLE_FOUND=1
  fi
done

if [ $EXAMPLE_FOUND -eq 0 ]; then
  echo -e "${GREEN}✅ All example files have been cleaned up${NC}"
else
  echo -e "${YELLOW}   (These should be deleted before publishing)${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Run TypeScript check
# -----------------------------------------------------------------------------
echo "🔧 Running TypeScript check..."

if command -v pnpm &> /dev/null; then
  if pnpm --filter @chat2poster/web typecheck 2>/dev/null; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
  else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    ISSUES_FOUND=1
  fi
else
  echo -e "${YELLOW}⚠️  pnpm not found, skipping TypeScript check${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Run Lint check
# -----------------------------------------------------------------------------
echo "🧹 Running lint check..."

if command -v pnpm &> /dev/null; then
  if pnpm lint 2>/dev/null; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
  else
    echo -e "${RED}❌ Lint check failed${NC}"
    ISSUES_FOUND=1
  fi
else
  echo -e "${YELLOW}⚠️  pnpm not found, skipping lint check${NC}"
fi

echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo "============================================="
if [ $ISSUES_FOUND -eq 0 ] && [ $EXAMPLE_FOUND -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Project is ready.${NC}"
  exit 0
elif [ $ISSUES_FOUND -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Setup complete but example files remain.${NC}"
  echo "   Delete example files before publishing."
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
  exit 1
fi
