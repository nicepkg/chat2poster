# AI Vibe Coding Starter

A modern, AI-friendly starter template for building documentation websites with Next.js + Nextra.

---

## For AI Assistants

> **IMPORTANT**: Read this entire document before making any changes.

### Overview

This is a starter template. Your job is to:
1. Collect configuration from the user
2. Replace placeholders throughout the project
3. Customize content based on PRD
4. Track progress using `CHECKLIST.md`

---

### ⛔ DO NOT List

**NEVER do the following without explicit user approval:**

| Category | Do NOT |
|----------|--------|
| **Dependencies** | Add new npm packages or change versions |
| **UI Components** | Modify files in `website/src/components/ui/` (shadcn/ui managed) |
| **Core Framework** | Change Next.js config, Tailwind config, or TypeScript config |
| **Delete Files** | Delete any file except those listed in Step 8 (Cleanup) |
| **Hardcode Values** | Write literal values instead of using `site-info.ts` |
| **Skip Questions** | Start modifying files before collecting ALL required variables |
| **Ignore Errors** | Continue if `pnpm typecheck` or `pnpm lint` fails |
| **Batch Changes** | Make multiple unrelated changes without updating CHECKLIST.md |

**If you're unsure, ASK the user first.**

---

### 🤖 Automation & CLI Tools

**User Preference**: The user prefers automation and minimal manual steps. Execute tasks directly instead of providing instructions.

#### Default CLI Tools

| Task | Tool | Example |
|------|------|---------|
| **GitHub operations** | `gh` CLI | `gh pr create`, `gh issue list`, `gh repo clone` |
| **Cloudflare operations** | `wrangler` CLI | `wrangler pages deploy`, `wrangler d1`, `wrangler kv` |
| **Package management** | `pnpm` | `pnpm install`, `pnpm add`, `pnpm run` |

#### Automation Rules

1. **DO automatically**:
   - Run lint/typecheck after code changes
   - Create branches, commits, PRs
   - Deploy to preview environments
   - Install dependencies when needed

2. **ASK before** (dangerous operations):
   - `git push --force` or `git reset --hard`
   - Deleting branches, repos, or production resources
   - Publishing to npm/registries
   - Deploying to production
   - Modifying billing-related resources
   - Any irreversible destructive action

#### Examples

```bash
# GitHub: Create PR (DO automatically)
gh pr create --title "feat: add feature" --body "Description"

# GitHub: Delete branch (ASK first)
# ⚠️ "Are you sure you want to delete branch 'feature-x'?"
gh branch delete feature-x

# Cloudflare: Deploy preview (DO automatically)
wrangler pages deploy ./out --project-name=my-project

# Cloudflare: Delete production resource (ASK first)
# ⚠️ "Are you sure you want to delete KV namespace 'production-data'?"
wrangler kv:namespace delete --namespace-id=xxx
```

---

### 🔑 GitHub Actions Token Naming

When creating GitHub Actions workflows that require secrets, use these **standard token names**:

| Purpose | Secret Name | Description |
|---------|-------------|-------------|
| **NPM Publish** | `NPM_TOKEN` | Token for publishing packages to npm registry |
| **VSCode Marketplace** | `VSCE_TOKEN` | Token for publishing VSCode extensions to official marketplace |
| **OpenVSX** | `OVSX_TOKEN` | Token for publishing VSCode extensions to OpenVSX registry |
| **GitHub API** | `GITHUB_TOKEN` | Built-in, no need to create (auto-provided) |

**Why these names?**
- Users typically configure these names in their local environment and GitHub organization secrets
- Using consistent names avoids confusion and reduces setup friction
- These are de-facto standards in the ecosystem

**Example workflow snippet:**
```yaml
- name: Publish to npm
  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

- name: Publish to VSCode Marketplace
  run: vsce publish
  env:
    VSCE_PAT: ${{ secrets.VSCE_TOKEN }}

- name: Publish to OpenVSX
  run: ovsx publish
  env:
    OVSX_PAT: ${{ secrets.OVSX_TOKEN }}
```

---

### 🚨 Error Handling

#### When TypeScript/Lint Errors Occur

```
1. STOP immediately
2. Read the full error message
3. Identify the file and line number
4. Check if error is from YOUR changes or pre-existing
5. If your change caused it → fix it before continuing
6. If pre-existing → inform user and ask how to proceed
7. Run verification again after fix
```

#### When Placeholder Replacement Fails

```
1. Check if you're using the correct placeholder (e.g., [repo-name] not [project-name])
2. Verify the file hasn't been modified unexpectedly
3. Use exact string matching, don't rely on regex
4. If placeholder not found → inform user, might be already replaced
```

#### When User Provides Incomplete Info

```
1. List exactly which variables are missing
2. Provide example values for each
3. Wait for user response before proceeding
4. Never assume or generate fake values
```

#### Recovery Checkpoints

If something goes wrong, you can recover:
- **Phase 1 incomplete**: Re-run from `site-info.ts`
- **Phase 2 incomplete**: Visual assets are independent, fix individually
- **Phase 3 incomplete**: README files can be regenerated from examples
- **Phase 4 incomplete**: Run `scripts/validate-setup.sh` to check status

### Step 1: Check Existing Documentation

Before asking questions, check these files:

| File | Purpose |
|------|---------|
| `docs/config.md` | Pre-filled configuration values |
| `docs/prd.md` | Product requirements and content |
| `CHECKLIST.md` | Track what's done and what's pending |

If `docs/config.md` or `docs/prd.md` don't exist, ask the user for the information below.

### Step 2: Gather Required Information

**IMPORTANT**: Ask the user for ALL missing values before making changes. Provide recommended options but always allow custom input.

#### Basic Info (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `[project-name]` | Display name (can have spaces) | "AI Workflow", "My Project" |
| `[repo-name]` | Repository name (no spaces, lowercase) | "ai-workflow", "my-project" |
| `[project-slogan]` | Short tagline (English) | "Build faster with AI" |
| `[project-slogan-zh]` | Short tagline (Chinese) | "用 AI 更快构建" |
| `[project-domain]` | Domain without https:// | "myproject.com" |
| `[github-username]` | GitHub username or org | "nicepkg", "vercel" |

#### Author Info (Optional - empty string to skip)

| Variable | Description | Example |
|----------|-------------|---------|
| `[author-name]` | Display name | "John Doe" |
| `[author-website]` | Personal website with https:// | "https://johndoe.com" |
| `[support-email]` | Contact email | "support@example.com" |

#### Social Links (Optional - empty string to hide)

| Variable | Description | Example |
|----------|-------------|---------|
| `[twitter-handle]` | Twitter/X username (no @) | "johndoe" |
| `[bilibili-uid]` | Bilibili user ID | "12345678" |
| `[douyin-uid]` | Douyin user ID | "MS4wLjABAAAAxx" |
| `[douyin-nickname]` | Douyin display name | "小明" |

#### Theme Colors (Required)

Ask user to pick a primary color:

| Color | oklch Value | Vibe |
|-------|-------------|------|
| **Purple** (default) | `oklch(0.55 0.25 290)` | Creative, modern |
| **Blue** | `oklch(0.55 0.2 260)` | Trust, professional |
| **Green** | `oklch(0.6 0.2 145)` | Growth, nature |
| **Orange** | `oklch(0.65 0.2 50)` | Energy, warmth |
| **Pink** | `oklch(0.65 0.25 0)` | Playful, bold |
| **Custom** | User provides hex → convert | - |

---

### 📝 Concrete Examples

#### Example: Filling in site-info.ts

**Before:**
```typescript
export const siteConfig = {
  name: "[project-name]",
  description: "[project-slogan]",
  url: "https://[project-domain]",
};

export const githubConfig = {
  username: "[github-username]",
  repo: "[repo-name]",
};
```

**After (for a project called "AI Workflow"):**
```typescript
export const siteConfig = {
  name: "AI Workflow",
  description: "Build faster with AI-powered automation",
  url: "https://ai-workflow.dev",
};

export const githubConfig = {
  username: "nicepkg",
  repo: "ai-workflow",
};
```

#### Example: Updating Theme Colors in globals.css

**Before:**
```css
:root {
  --primary: oklch(0.55 0.25 290);  /* Purple */
}
```

**After (choosing Blue theme):**
```css
:root {
  --primary: oklch(0.55 0.2 260);  /* Blue - professional */
}
```

#### Example: Replacing in README.md

**Before:**
```markdown
# [project-name]

[![GitHub stars](https://img.shields.io/github/stars/[github-username]/[repo-name])]
```

**After:**
```markdown
# AI Workflow

[![GitHub stars](https://img.shields.io/github/stars/nicepkg/ai-workflow)]
```

#### Example: Empty Optional Values

If user skips Twitter handle:
```typescript
// In site-info.ts
export const socialLinks = {
  twitter: "", // Empty = link won't show in footer
  bilibili: "12345678",
};
```

---

### Step 3: Modify Configuration Files

After collecting all values, modify in this order:

#### 3.1 Core Configuration

| File | Changes |
|------|---------|
| `website/src/lib/site-info.ts` | Replace ALL `[placeholder]` values |
| `website/src/styles/globals.css` | Update `--primary` and `--secondary` in `:root` and `.dark` |
| `package.json` | Replace `[repo-name]`, `[project-name]`, `[github-username]` |
| `LICENSE` | Replace `[github-username]` |
| `.github/workflows/deploy-website.yml` | Replace `[repo-name]`, `[project-domain]` |
| `.github/ISSUE_TEMPLATE/config.example.yml` | Copy to `config.yml`, replace URLs |

#### 3.2 Content Files

| File | Changes |
|------|---------|
| `website/content/en/index.mdx` | Update frontmatter title |
| `website/content/zh/index.mdx` | Update frontmatter title |

#### 3.3 Documentation Files

| File | Changes |
|------|---------|
| `README.example.md` | Copy to `README.md`, replace placeholders, write description |
| `README_cn.example.md` | Copy to `README_cn.md`, Chinese version |
| `CONTRIBUTING.md` | Replace placeholders, customize guidelines |
| `.github/ISSUE_TEMPLATE/*.example.*` | Copy to non-example names, customize |
| `.github/PULL_REQUEST_TEMPLATE.example.md` | Copy to `PULL_REQUEST_TEMPLATE.md`, customize |

### Step 4: Customize Landing Page

Edit `website/src/components/home/landing-page.tsx`:

| Section | What to Edit |
|---------|--------------|
| Hero | `t.hero` translations, demo command |
| Problem Cards | `problems` array (role, pain, gain) |
| Workflow Cards | `workflows` array (icon, title, desc, link, color) |
| CTA | `t.cta` translations |

### Step 5: Visual Assets

| File | Action |
|------|--------|
| `website/public/icon.svg` | Replace with project favicon |
| `website/src/components/shared/logo.tsx` | Customize SVG or use image |
| `website/src/components/home/hero-3d.tsx` | Customize colors or remove |

### Step 6: Update Checklist

After each change, update `CHECKLIST.md`:
- Mark completed items with `[x]`
- Add notes about blockers or decisions
- Update "Last Updated" date

### Step 7: Verification

```bash
pnpm typecheck    # Must pass
pnpm lint         # Must pass
pnpm dev:website  # Preview the site
```

### Step 8: Cleanup

When project is fully set up:
- Delete `docs/config.example.md`
- Delete `docs/prd.example.md`
- Delete `README.example.md`
- Delete `README_cn.example.md`
- Delete `.github/ISSUE_TEMPLATE/*.example.*`
- Delete `.github/PULL_REQUEST_TEMPLATE.example.md`
- Delete `CHECKLIST.md`
- Remove `⚠️ TEMPLATE NOTICE` blocks from all files

---

## Example AI Interaction

When user says "help me set up this template":

```
I'll help you customize this starter template. First, let me check if you have
any existing configuration...

[Check docs/config.md and docs/prd.md]

I need some information to set up your project:

**Required Info:**
1. Project name (display name, can have spaces)?
   Examples: "AI Workflow", "Code Helper", "My SaaS"

2. Repository name (no spaces, lowercase)?
   Examples: "ai-workflow", "code-helper", "my-saas"

3. Project slogan?
   Examples: "Build faster with AI", "Your coding companion"

4. Domain name (without https://)?
   Examples: "myproject.com", "docs.myproject.com"

5. GitHub username or organization?
   Examples: "nicepkg", "your-username"

6. Primary brand color?
   □ Purple (creative/modern) - recommended
   □ Blue (professional/trust)
   □ Green (growth/nature)
   □ Orange (energy/warmth)
   □ Pink (playful/bold)
   □ Custom (provide hex code)

**Optional (press Enter to skip):**
7. Author name?
8. Author website?
9. Support email?
10. Twitter handle?
11. Bilibili UID?
```

---

## Project Structure

```
├── CLAUDE.md                      # ⭐ This file - AI instructions
├── CHECKLIST.md                   # ⭐ Setup progress tracker
├── docs/
│   ├── config.md                  # User's configuration (create from example)
│   ├── config.example.md          # Configuration template
│   ├── prd.md                     # User's PRD (create from example)
│   └── prd.example.md             # PRD template
├── .github/
│   ├── actions/
│   │   └── setup-node-pnpm/       # Reusable composite action
│   │       └── action.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.example.md        # Template → copy to bug_report.md
│   │   ├── feature_request.example.md   # Template → copy to feature_request.md
│   │   ├── feedback.example.md          # Template → copy to feedback.md
│   │   └── config.example.yml           # Template → copy to config.yml
│   ├── PULL_REQUEST_TEMPLATE.example.md # Template → copy to PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                 # Lint & TypeCheck
│       ├── pr-title.yml           # PR title validation (Angular convention)
│       └── deploy-website.yml     # Cloudflare Pages deployment
├── website/
│   ├── content/                   # MDX content (en/zh)
│   ├── public/                    # Static assets
│   │   └── icon.svg               # Favicon
│   └── src/
│       ├── app/                   # Next.js app router
│       ├── components/
│       │   ├── home/              # Landing page components
│       │   │   ├── hero-3d.tsx
│       │   │   └── landing-page.tsx
│       │   ├── shared/
│       │   │   ├── logo.tsx
│       │   │   └── site-footer.tsx
│       │   └── ui/                # shadcn/ui components
│       ├── lib/
│       │   └── site-info.ts       # ⭐ Main configuration
│       └── styles/
│           └── globals.css        # ⭐ Theme colors
├── README.example.md              # README template → copy to README.md
├── README_cn.example.md           # Chinese README template → copy to README_cn.md
├── CONTRIBUTING.md                # Contribution guide (customize)
├── LICENSE
└── package.json
```

## Tech Stack

- **Framework**: Next.js 15 + React 19
- **Documentation**: Nextra 4
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animation**: Framer Motion + React Three Fiber
- **Language**: TypeScript 5
- **Package Manager**: pnpm
- **Git Hooks**: Husky + Commitlint (Angular convention)

## Commit Convention

All commits must follow [Angular Commit Convention](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit):

```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**:
```bash
feat(website): add dark mode toggle
fix: resolve hydration mismatch
docs: update installation guide
chore(deps): update dependencies
```

**Enforcement**:
- Commits validated by commitlint via husky hook
- PR titles validated by GitHub Action

## Files with Placeholders

Quick reference for files containing `[placeholder]` values:

```
website/src/lib/site-info.ts       # Main config
website/src/styles/globals.css     # Theme colors (comment only)
website/content/en/index.mdx       # Frontmatter
website/content/zh/index.mdx       # Frontmatter
package.json                       # Package info
LICENSE                            # Copyright
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
