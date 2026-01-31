import nextra from "nextra";

const withNextra = nextra({
  // Nextra config options
  defaultShowCopyCode: true,
  search: {
    codeblocks: false,
  },
  contentDirBasePath: "/docs",
  unstable_shouldAddLocaleToLinks: true,
});

const svgrLoader = {
  loader: "@svgr/webpack",
  options: {
    svgoConfig: {
      plugins: [
        {
          name: "preset-default",
          params: {
            overrides: {
              removeViewBox: false,
            },
          },
        },
        {
          name: "prefixIds",
        },
      ],
    },
  },
};

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    "@chat2poster/core-schema",
    "@chat2poster/core-adapters",
    "@chat2poster/core-renderer",
    "@chat2poster/core-pagination",
    "@chat2poster/core-export",
    "@chat2poster/shared-utils",
    "@chat2poster/themes",
  ],

  i18n: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },

  // Required for image optimization
  images: {
    unoptimized: true,
  },

  // Trailing slash for better static hosting compatibility
  trailingSlash: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  turbopack: {
    rules: {
      // @ts-expect-error - turbopack rules type
      "*.svg": {
        loaders: [svgrLoader],
        as: "*.js",
      },
    },
  },

  webpack(config) {
    // Grab the existing rule that handles SVG imports
    // @ts-ignore
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: [svgrLoader],
      },
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default withNextra(config);
