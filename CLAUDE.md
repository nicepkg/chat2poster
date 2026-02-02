# Chat2Poster

> Turn AI chats into share-worthy posters.

---

## 🎯 Project Overview

**Chat2Poster** converts AI chat sessions (ChatGPT / Claude / Gemini) into beautiful, export-ready PNG images.

### Core Features (MVP)

- Parse conversations from ChatGPT/Claude/Gemini pages
- Select messages to export (all or specific)
- Apply themes & decorations (radius, shadow, background, macOS bar)
- Auto/manual pagination for long conversations
- Export as PNG (1x/2x/3x) or ZIP for multi-page

### Dual Platform

- **Browser Extension:** WXT + Shadow DOM, works on AI chat pages
- **Web App:** Next.js, supports share links + manual input

---

## 👤 Owner & Preferences

| Key        | Value                                    |
| ---------- | ---------------------------------------- |
| **Name**   | Jinming Yang                             |
| **GitHub** | `2214962083` (personal), `nicepkg` (org) |
| **Domain** | `chat2poster.xiaominglab.com`            |

### Communication Rules

- **Respond in Chinese** (Jinming prefers it)
- **Code/docs in English**
- **Be concise** - No bullshit, no unnecessary verbosity

### Automation Rules

- **DO automatically:** lint, typecheck, commits, PRs, deploys
- **ASK before:** force push, delete branches, production deploys

---

## 🎨 Design Philosophy (CRITICAL)

> **You are not writing code. You are crafting a work of art.**
> Every pixel, every animation, every interaction should spark delight.

### Design Personality

Chat2Poster's design character:

| Trait         | Expression                                            |
| ------------- | ----------------------------------------------------- |
| **Premium**   | Apple-level polish, every detail refined              |
| **Playful**   | Fun without being childish, subtle joy                |
| **Confident** | Bold whitespace, restrained colors, no over-design    |
| **Smooth**    | Fluid animations, silky transitions, natural feedback |

### Anti-Patterns (Never Do This)

```
❌ Default shadcn gray tones - too dull and boring
❌ Cramped layouts - no breathing room
❌ Interactions without animation - feels cheap
❌ Hardcoded colors - doesn't support theming
❌ Jarring state changes - no transition
❌ Plain hover effects - no surprise
❌ Default form styling - no design sense
❌ Text-heavy UI - use icons when possible
```

---

## 🎯 Design System

### Color Strategy

```css
/* Don't use lifeless grays - use colors with emotion */

/* Primary: Indigo - professional yet vibrant */
--primary: oklch(0.619 0.202 268.7); /* #6366F1 */
--primary-hover: oklch(0.55 0.22 268.7);
--primary-glow: oklch(0.619 0.202 268.7 / 0.15);

/* Secondary: Rose - warm accent */
--secondary: oklch(0.749 0.164 14.2); /* #FB7185 */

/* Background layers */
--bg-base: oklch(0.985 0.002 240); /* Not pure white, slight blue tint */
--bg-subtle: oklch(0.97 0.003 240); /* Subtle layer */
--bg-muted: oklch(0.95 0.005 240); /* Cards/inputs */

/* Dark mode - not pure black, deep blue-black */
--bg-base-dark: oklch(0.145 0.015 260);
--bg-subtle-dark: oklch(0.18 0.015 260);
--bg-muted-dark: oklch(0.22 0.015 260);

/* Text colors - never use pure black */
--text-primary: oklch(0.25 0.015 260); /* Main text */
--text-secondary: oklch(0.45 0.01 260); /* Secondary text */
--text-muted: oklch(0.6 0.005 260); /* Hints/labels */
```

### Typography

```css
/* Font stack - local first, graceful fallback */
--font-sans:
  "Inter var", "SF Pro Display", -apple-system, "Noto Sans SC", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;

/* Font weights with rhythm */
--font-weight-normal: 400;
--font-weight-medium: 500; /* Common, don't use 600 */
--font-weight-semibold: 600; /* Headings only */
--font-weight-bold: 700; /* Rarely used */

/* Comfortable line heights */
--line-height-tight: 1.25; /* Large headings */
--line-height-normal: 1.5; /* Body text */
--line-height-relaxed: 1.75; /* Long paragraphs */

/* Letter spacing */
--letter-spacing-tight: -0.02em; /* Large headings */
--letter-spacing-normal: 0; /* Body */
--letter-spacing-wide: 0.05em; /* All-caps labels */
```

### Spacing System (8px Grid)

```css
/* All spacing is multiples of 8 */
--space-1: 4px; /* Tiny gaps */
--space-2: 8px; /* Compact */
--space-3: 12px; /* Small */
--space-4: 16px; /* Standard */
--space-5: 24px; /* Comfortable */
--space-6: 32px; /* Loose */
--space-8: 48px; /* Sections */
--space-10: 64px; /* Large sections */
--space-12: 80px; /* Page margins */
```

### Border Radius (Consistent Curves)

```css
/* Unified corner language */
--radius-sm: 6px; /* Small elements: tag, badge */
--radius-md: 10px; /* Medium: input, button */
--radius-lg: 14px; /* Large: card, dialog */
--radius-xl: 20px; /* Containers: modal, panel */
--radius-2xl: 28px; /* Extra large: floating panel */
--radius-full: 9999px; /* Circle: avatar, pill */
```

### Shadow System (Layered Depth)

```css
/* Shadows should be soft and layered */
--shadow-xs: 0 1px 2px oklch(0.2 0.02 260 / 0.04);
--shadow-sm:
  0 1px 3px oklch(0.2 0.02 260 / 0.06), 0 1px 2px oklch(0.2 0.02 260 / 0.04);
--shadow-md:
  0 4px 6px oklch(0.2 0.02 260 / 0.05), 0 2px 4px oklch(0.2 0.02 260 / 0.03);
--shadow-lg:
  0 10px 15px oklch(0.2 0.02 260 / 0.06), 0 4px 6px oklch(0.2 0.02 260 / 0.03);
--shadow-xl:
  0 20px 25px oklch(0.2 0.02 260 / 0.08), 0 8px 10px oklch(0.2 0.02 260 / 0.04);

/* Glow effects for emphasis */
--shadow-glow: 0 0 20px oklch(0.619 0.202 268.7 / 0.25);
--shadow-glow-rose: 0 0 20px oklch(0.749 0.164 14.2 / 0.25);
```

---

## ✨ Animation & Motion

### Core Principles

```
1. Fast response - Feedback within 100ms of user action
2. Natural flow - Use ease-out or spring easing
3. Purposeful - Every animation conveys information
4. Non-intrusive - Duration between 150-400ms
```

### Animation Tokens

```css
/* Duration */
--duration-fast: 150ms; /* Micro-interactions: hover, focus */
--duration-normal: 250ms; /* Standard transitions */
--duration-slow: 400ms; /* Complex animations */
--duration-slower: 600ms; /* Page transitions */

/* Easing */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1); /* Primary use */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1); /* Symmetric */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Elastic */
--ease-bounce: cubic-bezier(0.34, 1.8, 0.64, 1); /* Playful bounce */
```

### Must-Have Animations

```tsx
/* 1. Button Hover - Subtle lift + shadow enhancement */
<Button className="
  transition-all duration-200 ease-out
  hover:-translate-y-0.5 hover:shadow-md
  active:translate-y-0 active:shadow-sm
" />

/* 2. Card Hover - Border glow + background shift */
<Card className="
  transition-all duration-300 ease-out
  hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
  hover:bg-gradient-to-br hover:from-white hover:to-primary/[0.02]
" />

/* 3. Input Focus - Border color + ring */
<Input className="
  transition-all duration-200
  focus:border-primary focus:ring-4 focus:ring-primary/10
" />

/* 4. List Items Enter - Staggered fade-slide */
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05, duration: 0.3 }}
  />
))}

/* 5. Page Transition - Fade + slide up */
<motion.main
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
/>

/* 6. Loading State - Skeleton pulse */
<div className="animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted" />

/* 7. Success Feedback - Spring scale + color */
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
/>
```

### Framer Motion Patterns

```tsx
// Recommended spring config
const springConfig = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

// Stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};
```

---

## 🧩 Component Guidelines

### Button Hierarchy

```tsx
/* Primary - Main action, max 1-2 per page */
<Button className="
  bg-primary text-white shadow-sm
  hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md
  active:translate-y-0
  transition-all duration-200
">
  Export Image
</Button>

/* Secondary - Secondary action */
<Button variant="outline" className="
  border-2 border-primary/20 text-primary
  hover:bg-primary/5 hover:border-primary/40
  transition-all duration-200
">
  Preview
</Button>

/* Ghost - Least emphasis */
<Button variant="ghost" className="
  text-muted-foreground
  hover:text-foreground hover:bg-muted/50
  transition-all duration-200
">
  Cancel
</Button>

/* Icon Button - Toolbar icons */
<Button size="icon" variant="ghost" className="
  rounded-xl h-10 w-10
  text-muted-foreground hover:text-foreground
  hover:bg-muted/80
  transition-all duration-200
">
  <Settings className="h-4 w-4" />
</Button>
```

### Card Patterns

```tsx
/* Feature Card - Showcase features */
<Card className="
  group relative overflow-hidden
  border border-border/50 bg-card/50 backdrop-blur-sm
  transition-all duration-300 ease-out
  hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
">
  {/* Gradient on hover */}
  <div className="
    absolute inset-0 opacity-0 group-hover:opacity-100
    bg-gradient-to-br from-primary/[0.03] to-transparent
    transition-opacity duration-300
  " />
  <CardContent className="relative p-6">
    {/* Icon with background */}
    <div className="
      inline-flex p-3 rounded-xl
      bg-primary/10 text-primary
      mb-4
    ">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
  </CardContent>
</Card>

/* Selection Card - Selectable item */
<Card className={cn(
  "cursor-pointer border-2 transition-all duration-200",
  selected
    ? "border-primary bg-primary/5 shadow-sm"
    : "border-transparent hover:border-muted"
)}>
  {/* Selection indicator */}
  {selected && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-2 right-2"
    >
      <CheckCircle className="h-5 w-5 text-primary" />
    </motion.div>
  )}
</Card>
```

### Form Controls

```tsx
/* Input - With icon and states */
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    className="
      pl-10 h-11 rounded-xl
      bg-muted/50 border-transparent
      focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10
      placeholder:text-muted-foreground/60
      transition-all duration-200
    "
    placeholder="Search..."
  />
</div>

/* Slider - Custom track styling */
<Slider
  className="
    [&_[role=slider]]:h-5 [&_[role=slider]]:w-5
    [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary
    [&_[role=slider]]:bg-white [&_[role=slider]]:shadow-md
    [&_[role=slider]]:transition-transform [&_[role=slider]]:hover:scale-110
    [&_[data-orientation=horizontal]]:h-2
    [&_[data-orientation=horizontal]_[data-track]]:bg-muted
    [&_[data-orientation=horizontal]_[data-range]]:bg-primary
  "
/>

/* Toggle Group - Segmented control */
<ToggleGroup
  type="single"
  className="
    bg-muted/50 p-1 rounded-xl
    [&_button]:rounded-lg [&_button]:px-4 [&_button]:py-2
    [&_button]:transition-all [&_button]:duration-200
    [&_button[data-state=on]]:bg-background [&_button[data-state=on]]:shadow-sm
  "
>
  <ToggleGroupItem value="1x">1x</ToggleGroupItem>
  <ToggleGroupItem value="2x">2x</ToggleGroupItem>
  <ToggleGroupItem value="3x">3x</ToggleGroupItem>
</ToggleGroup>
```

### Empty States & Loading

```tsx
/* Empty State - Should have emotion */
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="
    mb-6 p-4 rounded-2xl
    bg-gradient-to-br from-muted to-muted/50
  ">
    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
  </div>
  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
  <p className="text-muted-foreground text-sm max-w-[250px] mb-6">
    Open a ChatGPT conversation, then click the export button
  </p>
  <Button variant="outline" className="gap-2">
    <HelpCircle className="h-4 w-4" />
    View Tutorial
  </Button>
</div>

/* Skeleton Loading - With rhythm */
<div className="space-y-4">
  {[0, 1, 2].map((i) => (
    <div
      key={i}
      className="flex gap-4 animate-pulse"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      <div className="w-10 h-10 rounded-full bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted/70 rounded w-2/3" />
      </div>
    </div>
  ))}
</div>
```

---

## 💫 Micro-interactions

### Feedback Patterns

```tsx
/* 1. Copy Success - Toast + icon swap */
const [copied, setCopied] = useState(false);
<Button onClick={() => { copy(); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
  <AnimatePresence mode="wait">
    {copied ? (
      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
        <Check className="h-4 w-4 text-green-500" />
      </motion.div>
    ) : (
      <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
        <Copy className="h-4 w-4" />
      </motion.div>
    )}
  </AnimatePresence>
</Button>

/* 2. Save Success - Button state change */
<Button disabled={saving}>
  {saving ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      Saving...
    </>
  ) : saved ? (
    <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-green-500">
      ✓ Saved
    </motion.span>
  ) : (
    "Save"
  )}
</Button>

/* 3. Count Change - Number animation */
<motion.span
  key={count}
  initial={{ y: -10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  className="tabular-nums"
>
  {count}
</motion.span>

/* 4. Progress Bar - With shimmer */
<div className="relative h-2 bg-muted rounded-full overflow-hidden">
  <motion.div
    className="absolute inset-y-0 left-0 bg-primary rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
</div>
```

### Hover Effects

```tsx
/* 1. Icon Button - Background expand */
<Button variant="ghost" size="icon" className="
  relative overflow-hidden
  before:absolute before:inset-0 before:bg-primary/10 before:scale-0
  hover:before:scale-100 before:transition-transform before:duration-300 before:rounded-xl
">
  <Icon className="relative z-10" />
</Button>

/* 2. Link - Underline animation */
<a className="
  relative text-primary
  after:absolute after:bottom-0 after:left-0 after:right-0
  after:h-[2px] after:bg-primary after:origin-left
  after:scale-x-0 hover:after:scale-x-100
  after:transition-transform after:duration-300
">
  Learn more
</a>

/* 3. Card - 3D tilt effect */
<motion.div
  whileHover={{
    rotateX: -5,
    rotateY: 5,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  }}
  transition={{ type: "spring", stiffness: 300 }}
  style={{ transformPerspective: 1000 }}
/>
```

---

## 📐 Layout Patterns

### Page Layout

```tsx
/* Standard page structure */
<div className="min-h-screen bg-background">
  {/* Header - Frosted glass effect */}
  <header
    className="
    sticky top-0 z-50
    bg-background/80 backdrop-blur-lg
    border-b border-border/50
  "
  >
    <div className="container h-16 flex items-center justify-between">
      {/* ... */}
    </div>
  </header>

  {/* Main Content - Proper padding */}
  <main className="container py-10 md:py-16">
    {/* Page title area */}
    <div className="mb-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        Title
      </h1>
      <p className="text-muted-foreground text-lg max-w-2xl">
        Description should be concise and impactful
      </p>
    </div>

    {/* Content area */}
    <div className="grid gap-8">{/* ... */}</div>
  </main>
</div>
```

### Editor Layout (Chat2Poster Specific)

```tsx
/* Two-column layout - Settings Tabs / Preview */
/* Header + Editor = 100vh, Footer below (scrollable) */
<main className="bg-muted/30">
  <div className="mx-auto flex h-[calc(100vh-64px)] w-full max-w-7xl gap-4 p-4">
    {/* Left - Settings Tabs */}
    <Card className="w-80 shrink-0 h-full overflow-hidden">
      <Tabs defaultValue="theme" className="h-full flex flex-col">
        <TabsList className="m-2 grid grid-cols-3">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="flex-1 min-h-0">
          <MessagesTab /> {/* Scrollable list */}
        </TabsContent>
        <TabsContent value="theme" className="flex-1 overflow-auto">
          <ThemeTab />
        </TabsContent>
        <TabsContent value="export" className="flex-1 overflow-auto">
          <ExportTab />
        </TabsContent>
      </Tabs>
    </Card>

    {/* Right - Preview with controls in header */}
    <Card className="flex-1 min-h-0 h-full overflow-hidden">
      {/* Preview Header: Device selector | Page nav | Export button */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <DeviceSelector /> {/* mobile/tablet/desktop icons */}
        <PageNavigation /> {/* Only when pages > 1 */}
        <ExportButton />
      </div>
      {/* Preview Canvas (CleanShot X style layers) */}
      <div className="flex-1 min-h-0 overflow-auto checkerboard-bg p-4">
        <div className="c2p-desktop mx-auto" style={{ width: deviceWidth }}>
          <div className="c2p-window">
            <div className="c2p-window-bar">
              <MacOSBar />
            </div>
            <div className="c2p-window-content">
              <Messages />
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</main>
```

**Layer Structure (CleanShot X style):**

- `c2p-desktop`: Canvas surface with gradient background (width = deviceType)
- `c2p-window`: App window (width = desktop - padding×2)
- `c2p-window-bar`: macOS traffic lights (optional)
- `c2p-window-content`: Message content with theme colors

**Device Widths:**

- mobile: 390px
- tablet: 768px (default)
- desktop: 1200px

---

## 🎭 Theme Presets (Chat2Poster)

### Preset Theme Design

```tsx
const themePresets = [
  {
    id: "minimal-light",
    name: "Minimal Light",
    preview: "/themes/minimal-light.png",
    tokens: {
      background: "#FFFFFF",
      foreground: "#1A1A2E",
      userBubble: "#F4F4F5",
      assistantBubble: "#FFFFFF",
      border: "#E4E4E7",
      codeBlock: "#FAFAFA",
    },
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    preview: "/themes/minimal-dark.png",
    tokens: {
      background: "#0A0A0F",
      foreground: "#FAFAFA",
      userBubble: "#1F1F28",
      assistantBubble: "#16161D",
      border: "#27272A",
      codeBlock: "#0D0D12",
    },
  },
  {
    id: "ocean-gradient",
    name: "Ocean",
    preview: "/themes/ocean.png",
    tokens: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      foreground: "#FFFFFF",
      userBubble: "rgba(255,255,255,0.15)",
      assistantBubble: "rgba(255,255,255,0.1)",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    preview: "/themes/sunset.png",
    tokens: {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      // ...
    },
  },
];

/* Theme Selector - Grid layout + hover preview */
<div className="grid grid-cols-2 gap-3">
  {themePresets.map((theme) => (
    <motion.button
      key={theme.id}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(theme.id)}
      className={cn(
        "relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-colors",
        selected === theme.id
          ? "border-primary ring-2 ring-primary/20"
          : "border-transparent hover:border-muted"
      )}
    >
      <img
        src={theme.preview}
        alt={theme.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-white text-sm font-medium">{theme.name}</span>
      </div>
      {selected === theme.id && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 p-1 bg-primary rounded-full"
        >
          <Check className="h-3 w-3 text-white" />
        </motion.div>
      )}
    </motion.button>
  ))}
</div>;
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Large phone / small tablet */
md: 768px   /* Tablet */
lg: 1024px  /* Small laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large screen */
```

### Extension Specific

```tsx
/* Extension panel - Fixed width, adaptive content */
<div className="w-[360px] h-[600px] flex flex-col bg-background rounded-2xl shadow-2xl overflow-hidden">
  {/* Header */}
  <header className="shrink-0 h-14 border-b flex items-center justify-between px-4">
    <Logo className="h-6" />
    <Button size="icon" variant="ghost">
      <X className="h-4 w-4" />
    </Button>
  </header>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto">{/* ... */}</div>

  {/* Fixed Footer */}
  <footer className="shrink-0 border-t p-4">
    <Button className="w-full">Export</Button>
  </footer>
</div>
```

---

## 📚 Reference & Inspiration

### Design References

| Product         | What to Learn                                                  |
| --------------- | -------------------------------------------------------------- |
| **Linear**      | Keyboard shortcuts, fluid animations, minimalist aesthetic     |
| **Raycast**     | Command palette, dark theme, icon design                       |
| **Notion**      | Content hierarchy, empty states, onboarding                    |
| **Figma**       | Toolbar design, multi-select interactions, collaboration hints |
| **Arc Browser** | Bold colors, space utilization, innovative interactions        |
| **Vercel**      | Black/white contrast, code display, deploy status              |

### Icon Library

```tsx
// Prefer Lucide Icons
import { Download, Settings, Check, X } from 'lucide-react';

// Icon size conventions
<Icon className="h-4 w-4" />  // Inside buttons
<Icon className="h-5 w-5" />  // Standalone icons
<Icon className="h-6 w-6" />  // Feature icons
<Icon className="h-8 w-8" />  // Large icons
```

---

## 🏗️ Architecture

### Monorepo Structure

```
chat2poster/
├── packages/
│   ├── core-schema/       # Types + Zod validators
│   ├── core-adapters/     # Parsing adapters (ChatGPT/Claude/Gemini)
│   ├── core-pagination/   # Height estimation + page splitting
│   ├── core-export/       # SnapDOM export + ZIP packaging
│   └── shared-ui/         # Shared UI components (Radix/Shadcn)
├── apps/
│   ├── browser-extension/     # Browser extension (WXT)
│   └── web/                   # Website (Next.js)
├── configs/               # Shared configs (eslint, etc.)
├── docs/                  # PRD, architecture, specs
├── memories/              # Session & long-term memory
├── turbo.json             # Turborepo task configuration
└── TASKS.md               # Task board for parallel AI work
```

### Build Toolchain

**Package Manager:** pnpm (workspace protocol)
**Task Runner:** Turborepo (parallel builds, caching)
**Bundler:** tsup (packages), Next.js (web), WXT/Vite (extension)

```bash
# Common commands (all use Turborepo under the hood)
pnpm build              # Build all packages and apps
pnpm build:packages     # Build packages only
pnpm build:web          # Build web app
pnpm build:extension    # Build browser extension
pnpm dev:web            # Dev server for web
pnpm dev:extension      # Dev server for extension
pnpm lint               # Lint all packages
pnpm typecheck          # Type check all packages
pnpm test               # Run all tests
```

**Turborepo Benefits:**

- Task dependency graph (packages build before apps)
- Local caching (repeat builds are instant)
- Parallel execution (independent tasks run concurrently)

---

## 🧩 Engineering Rules (Must Follow)

### File Naming

- All `*.ts` / `*.tsx` / `*.js` / `*.jsx` / `*.d.ts` filenames must be **kebab-case** (e.g., `editor-panel.tsx`).
- Do **not** create PascalCase/UpperCamel filenames.
- `index.ts` is allowed when it is a barrel file.

### i18n (Single Source of Truth)

- All localization lives in `packages/shared-ui/src/i18n/`.
- `locales/en.ts` is the source of truth; other locale files must match keys (enforced via `LocaleMessages`).
- Client components use `useI18n()`; server components and API routes use `createTranslator(locale)`.
- Do not hardcode `"en" | "zh"` anywhere; always import `Locale` and helpers from shared-ui.
- Web App Router is localized: routes live under `app/[locale]/...` and API routes under `app/[locale]/api/**`.

### Constants (Single Source of Truth)

- Storage keys: All sessionStorage/localStorage keys must be defined in `packages/shared-ui/src/constants/storage-keys.ts` (`STORAGE_KEYS`).
- Export defaults: All export parameter defaults must use `EXPORT_DEFAULTS` from `@chat2poster/core-schema`.
- Type aliases: Use types from `@chat2poster/core-schema` (e.g., `MessageRole`, `ThemeMode`, `ShadowLevel`) instead of hand-writing union types.

---

## 🧠 Memory System

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│  Tier 1: CLAUDE.md (this file)              │
│  - Always loaded automatically              │
│  - Project identity & design system         │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  Tier 2: Long-Term Memory                   │
│  - memories/long-term-memory.md             │
│  - Architecture decisions, user prefs       │
└─────────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────┐
│  Tier 3: Session Memories                   │
│  - memories/YYYY-MM-DD-NNN-*.md             │
│  - Per-session context & decisions          │
└─────────────────────────────────────────────┘
```

### Memory Commands

| Command               | Purpose                             |
| --------------------- | ----------------------------------- |
| `/remember`           | Save current session to memory file |
| `/recall`             | Load previous sessions              |
| `/recall --long-term` | Load long-term memory               |

---

## ⚡ Commands

### Task Management

| Command            | Description            |
| ------------------ | ---------------------- |
| `/claim-track`     | Claim a track (T1-T5)  |
| `/do-track`        | Execute track tasks    |
| `/track-status`    | View progress          |
| `/milestone-check` | Check milestone status |

### Development

| Command        | Description                    |
| -------------- | ------------------------------ |
| `/commit`      | Commit with Angular convention |
| `/create-pr`   | Create pull request            |
| `/code-review` | Review code changes            |

---

## 🚨 Design Review Checklist

Before every UI change, ask yourself:

```
□ Are animations smooth? Any jarring state changes?
□ Are colors harmonious? Any lifeless grays?
□ Is spacing comfortable? Too cramped or too sparse?
□ Do interactions have feedback? Immediate response on click?
□ Are empty states friendly? No cold "No data" messages?
□ Are loading states elegant? Skeleton screens or progress indicators?
□ Do hover effects delight? More than just color change?
□ Is focus state visible? Can keyboard users see current position?
□ Is dark mode cohesive? Not just inverted, but redesigned?
□ Is mobile usable? Touch targets large enough?
```

---

## 📁 File Ownership (Multi-AI Mode)

```
AI-1 (T1): packages/core-schema/**
AI-2 (T2): packages/core-adapters/**
AI-3 (T3): packages/shared-ui/src/components/renderer/**, packages/shared-ui/src/themes/**
AI-4 (T4): packages/core-pagination/**, packages/core-export/**
AI-5 (T5): apps/browser-extension/**, apps/web/**, packages/shared-ui/**
```

---

_Design is not just what it looks like. Design is how it works._ — Steve Jobs

_Last updated: 2026-02-02_
