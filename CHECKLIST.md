# Project Setup Checklist

> **For AI**: This checklist tracks items that need to be completed or reviewed.
> Mark items as done by changing `[ ]` to `[x]` after completion.
> Delete this file when the project is fully set up.

---

## 🔖 Checkpoint System

Each phase has a **checkpoint command** to verify completion before moving on.
If verification fails, fix issues before proceeding to the next phase.

| Phase | Checkpoint Command | Success Criteria |
|-------|-------------------|------------------|
| Phase 1 | `pnpm --filter website typecheck` | No TypeScript errors |
| Phase 2 | Manual review | All visual assets customized |
| Phase 3 | `grep -r "\[project-name\]" README.md` | No placeholders found |
| Phase 4 | `./scripts/validate-setup.sh` | All checks pass |

**If you need to pause:**
- Update this file with current progress
- Add notes in the "Notes" section at the bottom
- Mark current task as `[~]` (in progress)

---

## Phase 1: Core Configuration

> **Checkpoint**: Run `pnpm --filter website typecheck` after completing this phase.

### Required

- [ ] Replace placeholders in `website/src/lib/site-info.ts`
- [ ] Update theme colors in `website/src/styles/globals.css`
- [ ] Replace placeholders in `package.json`
- [ ] Update `LICENSE` with correct copyright holder
- [ ] Update `.github/workflows/deploy-website.yml`

### Content Files

- [ ] Update `website/content/en/index.mdx` frontmatter
- [ ] Update `website/content/zh/index.mdx` frontmatter

### ✅ Phase 1 Checkpoint

- [ ] Run `pnpm --filter website typecheck` - PASSED

## Phase 2: Visual Assets

> **Checkpoint**: Visual review - preview site and confirm all visual elements are customized.

- [ ] Replace `website/public/icon.svg` with project favicon
- [ ] Customize or replace logo in `website/src/components/shared/logo.tsx`
- [ ] Customize `website/src/components/home/hero-3d.tsx` colors (or remove if not needed)
- [ ] Update `website/src/components/home/landing-page.tsx`:
  - [ ] Customize `workflows` array
  - [ ] Customize `problems` array
  - [ ] Update hero section translations
  - [ ] Update demo command

### ✅ Phase 2 Checkpoint

- [ ] Run `pnpm dev:website` and visually verify landing page
- [ ] Confirm favicon appears correctly in browser tab

## Phase 3: Documentation

> **Checkpoint**: Run `grep -r "\[project-name\]\|\[repo-name\]\|\[github-username\]" *.md` - should return nothing.

### README Files

- [ ] Copy `README.example.md` to `README.md`
- [ ] Copy `README_cn.example.md` to `README_cn.md`
- [ ] Replace all placeholders in both README files
- [ ] Write compelling project description
- [ ] Add actual screenshots/demos
- [ ] Update badges with correct URLs
- [ ] Remove template notices (⚠️ blocks) from README files

### GitHub Templates

- [ ] Copy `.github/ISSUE_TEMPLATE/bug_report.example.md` → `bug_report.md`, customize
- [ ] Copy `.github/ISSUE_TEMPLATE/feature_request.example.md` → `feature_request.md`, customize
- [ ] Copy `.github/ISSUE_TEMPLATE/config.example.yml` → `config.yml`, update URLs
- [ ] Copy `.github/ISSUE_TEMPLATE/feedback.example.md` → `feedback.md`, customize
- [ ] Copy `.github/PULL_REQUEST_TEMPLATE.example.md` → `PULL_REQUEST_TEMPLATE.md`, customize
- [ ] Update `CONTRIBUTING.md` with project-specific guidelines
- [ ] Remove template notices (⚠️ blocks) from all files

### ✅ Phase 3 Checkpoint

- [ ] No `[placeholder]` values found in README.md
- [ ] No `[placeholder]` values found in README_cn.md
- [ ] No `⚠️ TEMPLATE NOTICE` blocks remaining

## Phase 4: Final Review

> **Checkpoint**: Run `./scripts/validate-setup.sh` - all checks must pass.

### Verification

- [ ] Run `pnpm typecheck` - no errors
- [ ] Run `pnpm lint` - no errors
- [ ] Run `pnpm dev:website` - site loads correctly
- [ ] Run `./scripts/validate-setup.sh` - all checks pass
- [ ] Test all links work correctly
- [ ] Review site on mobile devices

### Deployment

- [ ] Set up Cloudflare Pages / deployment
- [ ] Configure custom domain

### Cleanup (Only after everything works!)

- [ ] Delete `docs/config.example.md` and `docs/prd.example.md`
- [ ] Delete `README.example.md` and `README_cn.example.md`
- [ ] Delete `.github/ISSUE_TEMPLATE/*.example.*` files
- [ ] Delete `.github/PULL_REQUEST_TEMPLATE.example.md`
- [ ] Delete this `CHECKLIST.md` file

### ✅ Phase 4 Checkpoint

- [ ] `./scripts/validate-setup.sh` reports "All checks passed!"
- [ ] Site is deployed and accessible

---

## 🔄 Recovery Guide

If setup was interrupted or needs to be resumed:

| Situation | How to Recover |
|-----------|---------------|
| Phase 1 incomplete | Check `site-info.ts` for unfilled `[placeholder]` values |
| Phase 2 incomplete | Visual assets are independent, fix individually |
| Phase 3 incomplete | Re-copy from `.example.md` files and fill again |
| Unknown state | Run `./scripts/validate-setup.sh` to diagnose |

**To find all remaining placeholders:**
```bash
grep -r "\[project-name\]\|\[repo-name\]\|\[github-username\]" --include="*.ts" --include="*.md" --include="*.json" .
```

---

## Notes

<!-- Add any project-specific notes here -->

**PRD Status**: Draft / In Review / Finalized

**Last Updated**: [date]

**Current Phase**: 1 / 2 / 3 / 4

**Blockers**:
- None

**Decisions Made**:
- Theme color: [color]
- Skip optional fields: [list]

---

## Quick Reference

Files with `[placeholder]` values to replace:

```
website/src/lib/site-info.ts      # Main configuration
website/src/styles/globals.css    # Theme colors
package.json                      # Package info
LICENSE                           # Copyright
.github/workflows/deploy-website.yml
CONTRIBUTING.md

# Templates (copy and customize):
README.example.md                           → README.md
README_cn.example.md                        → README_cn.md
.github/ISSUE_TEMPLATE/bug_report.example.md      → bug_report.md
.github/ISSUE_TEMPLATE/feature_request.example.md → feature_request.md
.github/ISSUE_TEMPLATE/config.example.yml         → config.yml
.github/ISSUE_TEMPLATE/feedback.example.md        → feedback.md
.github/PULL_REQUEST_TEMPLATE.example.md          → PULL_REQUEST_TEMPLATE.md
```
