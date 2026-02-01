/**
 * User-Agent Generator
 *
 * Generates realistic browser User-Agent strings to avoid detection.
 */

const CHROME_VERSIONS = [
  "120",
  "121",
  "122",
  "123",
  "124",
  "125",
  "126",
  "127",
  "128",
  "129",
  "130",
  "131",
] as const;

const OS_CONFIGS = [
  { platform: "Windows NT 10.0; Win64; x64", weight: 0.5 },
  { platform: "Windows NT 11.0; Win64; x64", weight: 0.2 },
  { platform: "Macintosh; Intel Mac OS X 10_15_7", weight: 0.2 },
  { platform: "X11; Linux x86_64", weight: 0.1 },
] as const;

/**
 * Generate a random Chrome User-Agent string
 */
export function generateChromeUserAgent(): string {
  const chromeVersion =
    CHROME_VERSIONS[Math.floor(Math.random() * CHROME_VERSIONS.length)];
  const buildNumber = Math.floor(Math.random() * 9999);

  // Weighted OS selection
  const totalWeight = OS_CONFIGS.reduce((sum, os) => sum + os.weight, 0);
  let random = Math.random() * totalWeight;
  let platform: string = OS_CONFIGS[0].platform;

  for (const os of OS_CONFIGS) {
    random -= os.weight;
    if (random <= 0) {
      platform = os.platform;
      break;
    }
  }

  return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.${buildNumber}.0 Safari/537.36`;
}

/**
 * Generate a random Firefox User-Agent string
 */
export function generateFirefoxUserAgent(): string {
  const firefoxVersions = ["120", "121", "122", "123", "124", "125"];
  const version =
    firefoxVersions[Math.floor(Math.random() * firefoxVersions.length)];

  const platforms = [
    "Windows NT 10.0; Win64; x64",
    "Macintosh; Intel Mac OS X 10.15",
    "X11; Linux x86_64",
  ];
  const platform = platforms[Math.floor(Math.random() * platforms.length)];

  return `Mozilla/5.0 (${platform}; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`;
}
