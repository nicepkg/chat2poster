import Link from "next/link";
import {
  siteConfig,
  socialLinksConfig,
  footerConfig,
  authorConfig,
} from "~/lib/site-info";
import { cn } from "~/lib/utils";
import { GitHubIcon, BilibiliIcon, DouyinIcon, XIcon } from "./social-icons";

const socialIconMap = {
  github: GitHubIcon,
  bilibili: BilibiliIcon,
  douyin: DouyinIcon,
  twitter: XIcon,
} as const;

// Build social links from config, filtering out empty hrefs
const socialLinks = Object.entries(socialLinksConfig)
  .filter(([, config]) => config.href && config.href.length > 0)
  .map(([key, config]) => ({
    label: config.label,
    href: config.href,
    handle: "handle" in config ? config.handle : undefined,
    Icon: socialIconMap[key as keyof typeof socialIconMap],
  }));

export function SiteFooter({ lang = "en" }: { lang?: "en" | "zh" }) {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {/* Left Column: Brand & Description */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              {siteConfig.name}
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {footerConfig.description[lang]}
            </p>
          </div>

          {/* Right Column: Links & Socials */}
          <div className="flex flex-col justify-between gap-6 md:items-end">
            {/* Navigation Links - Prominent & Horizontal */}
            <nav className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium">
              {footerConfig.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full p-2 transition-all hover:scale-110",
                    !social.href &&
                      "hover:text-muted-foreground cursor-default hover:scale-100 hover:bg-transparent",
                  )}
                  title={
                    social.handle
                      ? `${social.label}: ${social.handle}`
                      : social.label
                  }
                  aria-label={social.label}
                >
                  <social.Icon className="h-5 w-5 fill-current" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="text-muted-foreground mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row">
          <p>
            © {new Date().getFullYear()} {footerConfig.copyright.holder}.
            Released under the {footerConfig.copyright.license} License.
          </p>
          <p className="flex items-center gap-1">
            Built with <span className="text-red-500">♥</span> by{" "}
            <a
              href={authorConfig.github}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground hover:underline"
            >
              {authorConfig.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
