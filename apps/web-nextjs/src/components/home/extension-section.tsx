"use client";

import { Button, cn, useI18n } from "@chat2poster/shared-ui";
import { motion } from "framer-motion";
import { Download, Chrome, Globe, Zap, Sparkles, Shield } from "lucide-react";
import Link from "next/link";

const browsers = [
  {
    name: "Chrome",
    icon: Chrome,
    status: "available" as const,
    href: "#chrome",
  },
  {
    name: "Edge",
    icon: Globe,
    status: "available" as const,
    href: "#edge",
  },
  {
    name: "Firefox",
    icon: Globe,
    status: "coming" as const,
    href: "#firefox",
  },
  {
    name: "Safari",
    icon: Globe,
    status: "coming" as const,
    href: "#safari",
  },
];

const features = [
  {
    icon: Zap,
    titleKey: "web.extension.features.export.title",
    descKey: "web.extension.features.export.desc",
  },
  {
    icon: Sparkles,
    titleKey: "web.extension.features.themes.title",
    descKey: "web.extension.features.themes.desc",
  },
  {
    icon: Shield,
    titleKey: "web.extension.features.privacy.title",
    descKey: "web.extension.features.privacy.desc",
  },
] as const;

export function ExtensionSection() {
  const { t, locale } = useI18n();
  const localePrefix = `/${locale}`;

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute left-1/4 top-0 h-96 w-96 rounded-full blur-[120px]" />
        <div className="bg-secondary/5 absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Download className="h-4 w-4" />
            {t("web.extension.title")}
          </div>
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-5xl">
            {t("web.extension.subtitle")}
          </h2>
        </motion.div>

        {/* Browser icons grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mb-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
        >
          {browsers.map((browser, i) => (
            <motion.div
              key={browser.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={browser.status === "available" ? { y: -4 } : {}}
              className={cn(
                "group relative flex flex-col items-center rounded-2xl border p-6 transition-all duration-300",
                browser.status === "available"
                  ? "border-border/50 bg-card/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                  : "border-border/30 bg-muted/30 cursor-not-allowed opacity-60",
              )}
            >
              <div
                className={cn(
                  "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                  browser.status === "available"
                    ? "bg-primary/10 group-hover:scale-110"
                    : "bg-muted",
                )}
              >
                <browser.icon
                  className={cn(
                    "h-8 w-8",
                    browser.status === "available"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <span className="mb-2 font-semibold">{browser.name}</span>
              {browser.status === "available" ? (
                <span className="text-primary text-sm font-medium">
                  {t("web.extension.download")}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {t("web.extension.comingSoon")}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="group flex items-start gap-4 rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md"
            >
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="text-primary h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href={`${localePrefix}/import`}>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-lg"
            >
              {t("web.extension.tryWebApp")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
