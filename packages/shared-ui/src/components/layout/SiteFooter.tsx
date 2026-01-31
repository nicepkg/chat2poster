"use client";

import * as React from "react";
import { cn } from "../../utils";
import { useI18n } from "~/i18n";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SiteFooterProps {
  logo?: React.ReactNode;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  copyright?: {
    holder: string;
    license?: string;
  };
  author?: {
    name: string;
    href?: string;
  };
  className?: string;
}

export function SiteFooter({
  logo,
  description,
  sections = [],
  socialLinks = [],
  copyright,
  author,
  className,
}: SiteFooterProps) {
  const { t } = useI18n();
  const licenseText = copyright?.license
    ? t("siteFooter.license", { license: copyright.license })
    : undefined;
  return (
    <footer className={cn("bg-background border-t", className)}>
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {logo && <div>{logo}</div>}
            {description && (
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                {description}
              </p>
            )}
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      "hover:bg-muted/50 rounded-full p-2",
                      "transition-all duration-200 hover:scale-110",
                    )}
                    title={social.label}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link sections */}
          {sections.length > 0 && (
            <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
              {sections.map((section) => (
                <div key={section.title} className="flex flex-col gap-3">
                  <h3 className="text-foreground font-semibold text-sm">
                    {section.title}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="text-muted-foreground mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs md:flex-row">
          {copyright && (
            <p>
              &copy; {new Date().getFullYear()} {copyright.holder}.
              {licenseText ? ` ${licenseText}` : ""}
            </p>
          )}
          {author && (
            <p className="flex items-center gap-1">
              {t("siteFooter.builtWithPrefix")}{" "}
              <span className="text-destructive">&#9829;</span>{" "}
              {t("siteFooter.builtWithSuffix")}{" "}
              {author.href ? (
                <a
                  href={author.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground hover:underline"
                >
                  {author.name}
                </a>
              ) : (
                <span>{author.name}</span>
              )}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
