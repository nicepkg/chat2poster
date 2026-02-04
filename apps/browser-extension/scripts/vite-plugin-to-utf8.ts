/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// see: https://github.com/qiweiii/markdown-sticky-notes/blob/master/scripts/vite-plugin-to-utf8.ts
import { type PluginOption } from "vite";

const strToUtf8 = (str: string) =>
  str
    .split("")
    .map((ch) =>
      ch.charCodeAt(0) <= 0x7f
        ? ch
        : `\\u${`0000${ch.charCodeAt(0).toString(16)}`.slice(-4)}`,
    )
    .join("");

export const toUtf8 = (): PluginOption => ({
  name: "to-utf8",
  generateBundle(options, bundle) {
    // Iterate through each asset in the bundle
    for (const fileName in bundle) {
      if (bundle[fileName]?.type === "chunk") {
        // Assuming you want to convert the chunk's code
        const originalCode = bundle[fileName].code as string;
        const modifiedCode = strToUtf8(originalCode);

        // Update the chunk's code with the modified version
        bundle[fileName].code = modifiedCode;
      }
    }
  },
});
