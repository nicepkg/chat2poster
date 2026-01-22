// ============================================================================
// AI VIBE CODING STARTER - SITE CONFIGURATION
// ============================================================================
// Replace the following placeholders with your actual values:
// - [project-name]: Display name, can include spaces (e.g., "My Awesome Project")
// - [repo-name]: Repository name, no spaces allowed (e.g., "my-awesome-project")
// - [project-slogan]: Your project slogan (e.g., "Build faster with AI")
// - [project-domain]: Your domain name (e.g., "myproject.com")
// - [github-username]: Your GitHub username (e.g., "johndoe")
// - [support-email]: Your support email (e.g., "support@example.com")
// - [author-name]: Your display name (e.g., "John Doe")
// - [author-website]: Your personal website (e.g., "https://johndoe.com")
// - [twitter-handle]: Your Twitter/X handle (e.g., "johndoe")
// - [bilibili-uid]: Your Bilibili UID (e.g., "12345678")
// - [douyin-uid]: Your Douyin UID (e.g., "MS4wLjABAAAAxxxxxx")
// - [douyin-nickname]: Your Douyin nickname (e.g., "小明")
// ============================================================================

// ---------- Basic Site Config ----------
export const siteConfig = {
  name: "[project-name]",
  description: "[project-slogan]",
  url: "https://[project-domain]",
  locale: "en_US",
};

// ---------- GitHub Config ----------
export const githubConfig = {
  username: "[github-username]",
  repo: "[repo-name]",
  get url() {
    return `https://github.com/${this.username}/${this.repo}`;
  },
  get docsBase() {
    return `${this.url}/tree/main/website`;
  },
  get issuesUrl() {
    return `${this.url}/issues/new?labels=feedback,documentation&template=feedback.md`;
  },
};

// ---------- Author Config ----------
export const authorConfig = {
  name: "[author-name]",
  website: "[author-website]",
  email: "[support-email]",
  github: `https://github.com/${githubConfig.username}`,
};

// ---------- Social Links Config ----------
// Set href to empty string "" to hide a social link
export const socialLinksConfig = {
  github: {
    label: "GitHub",
    href: `https://github.com/${githubConfig.username}`,
  },
  bilibili: {
    label: "Bilibili",
    href: "https://space.bilibili.com/[bilibili-uid]",
  },
  douyin: {
    label: "Douyin",
    href: "https://www.douyin.com/user/[douyin-uid]",
    handle: "[douyin-nickname]",
  },
  twitter: {
    label: "X (Twitter)",
    href: "https://x.com/[twitter-handle]",
  },
};

// ---------- Footer Config ----------
export const footerConfig = {
  description: {
    en: "Supercharge your AI coding workflow with context-aware skills and best practices. Built for developers who want to stop repeating themselves.",
    zh: "为你的 AI 编程工作流注入上下文感知技能和最佳实践。专为不想重复自己的开发者打造。",
  },
  links: [
    {
      label: "[author-name]",
      href: authorConfig.website,
    },
    {
      label: githubConfig.username,
      href: authorConfig.github,
    },
    {
      label: "About Author",
      href: authorConfig.github,
    },
  ],
  copyright: {
    holder: siteConfig.name,
    license: "MIT",
  },
};

// ---------- Banner Config ----------
export const bannerConfig = {
  storageKey: `${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-banner`,
  text: {
    en: `🎉 ${siteConfig.name} is now open source!`,
    zh: `🎉 ${siteConfig.name} 现已开源！`,
  },
  linkText: {
    en: "Star us on GitHub",
    zh: "在 GitHub 上 Star 我们",
  },
};

// ---------- Legacy Exports (for backward compatibility) ----------
export const supportEmail = authorConfig.email;
