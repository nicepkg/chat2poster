import type { BackgroundType } from "@chat2poster/core-schema";

/**
 * Background preset definition
 */
export interface BackgroundPreset {
  id: string;
  label: string;
  value: string;
  type: Exclude<BackgroundType, "image">;
}

/**
 * macOS-style mesh background values
 * Static multi-layer gradients optimized for preview and PNG export.
 */
export const MESH_BACKGROUND_VALUES = {
  sonomaDawn: [
    "radial-gradient(138% 132% at -8% -12%, rgba(255, 126, 102, 0.66) 0%, rgba(255, 126, 102, 0) 58%)",
    "radial-gradient(132% 128% at 102% 8%, rgba(255, 93, 159, 0.54) 0%, rgba(255, 93, 159, 0) 60%)",
    "radial-gradient(128% 136% at 46% 106%, rgba(120, 154, 255, 0.5) 0%, rgba(120, 154, 255, 0) 64%)",
    "radial-gradient(120% 118% at 74% 72%, rgba(255, 222, 168, 0.4) 0%, rgba(255, 222, 168, 0) 62%)",
    "linear-gradient(152deg, #ffece3 0%, #f7edff 54%, #e8f0ff 100%)",
  ].join(", "),
  coastalMint: [
    "radial-gradient(136% 130% at -10% -8%, rgba(114, 232, 200, 0.62) 0%, rgba(114, 232, 200, 0) 58%)",
    "radial-gradient(132% 126% at 104% 10%, rgba(88, 197, 255, 0.58) 0%, rgba(88, 197, 255, 0) 60%)",
    "radial-gradient(126% 132% at 60% 108%, rgba(117, 150, 255, 0.44) 0%, rgba(117, 150, 255, 0) 64%)",
    "radial-gradient(110% 120% at 74% 74%, rgba(191, 255, 230, 0.32) 0%, rgba(191, 255, 230, 0) 58%)",
    "linear-gradient(154deg, #e7fff5 0%, #e3f7ff 52%, #eef0ff 100%)",
  ].join(", "),
  arcticGlow: [
    "radial-gradient(136% 132% at -8% -14%, rgba(224, 184, 255, 0.56) 0%, rgba(224, 184, 255, 0) 58%)",
    "radial-gradient(132% 128% at 104% 8%, rgba(131, 201, 255, 0.62) 0%, rgba(131, 201, 255, 0) 60%)",
    "radial-gradient(126% 134% at 50% 106%, rgba(165, 255, 236, 0.44) 0%, rgba(165, 255, 236, 0) 64%)",
    "radial-gradient(118% 120% at 75% 76%, rgba(203, 225, 255, 0.32) 0%, rgba(203, 225, 255, 0) 58%)",
    "linear-gradient(156deg, #f3f4ff 0%, #e5f1ff 52%, #e8fff8 100%)",
  ].join(", "),
  orchidHaze: [
    "radial-gradient(136% 130% at -10% -10%, rgba(255, 141, 190, 0.62) 0%, rgba(255, 141, 190, 0) 58%)",
    "radial-gradient(132% 126% at 104% 12%, rgba(112, 133, 255, 0.68) 0%, rgba(112, 133, 255, 0) 60%)",
    "radial-gradient(128% 132% at 50% 108%, rgba(188, 129, 255, 0.48) 0%, rgba(188, 129, 255, 0) 62%)",
    "radial-gradient(116% 118% at 80% 72%, rgba(255, 206, 230, 0.28) 0%, rgba(255, 206, 230, 0) 58%)",
    "linear-gradient(150deg, #ffeaf3 0%, #efe5ff 54%, #e7ecff 100%)",
  ].join(", "),
  solarPunch: [
    "radial-gradient(138% 132% at -8% -10%, rgba(255, 118, 70, 0.72) 0%, rgba(255, 118, 70, 0) 58%)",
    "radial-gradient(132% 126% at 104% 12%, rgba(255, 82, 140, 0.58) 0%, rgba(255, 82, 140, 0) 60%)",
    "radial-gradient(126% 134% at 48% 108%, rgba(255, 199, 73, 0.56) 0%, rgba(255, 199, 73, 0) 62%)",
    "radial-gradient(115% 118% at 78% 70%, rgba(255, 150, 88, 0.34) 0%, rgba(255, 150, 88, 0) 56%)",
    "linear-gradient(150deg, #ffe9dc 0%, #ffe6e4 50%, #fff4d6 100%)",
  ].join(", "),
  deepOcean: [
    "radial-gradient(140% 134% at -10% -12%, rgba(55, 125, 255, 0.6) 0%, rgba(55, 125, 255, 0) 58%)",
    "radial-gradient(134% 128% at 104% 10%, rgba(46, 215, 235, 0.46) 0%, rgba(46, 215, 235, 0) 60%)",
    "radial-gradient(128% 136% at 52% 108%, rgba(109, 112, 255, 0.42) 0%, rgba(109, 112, 255, 0) 64%)",
    "radial-gradient(116% 118% at 76% 74%, rgba(101, 172, 255, 0.22) 0%, rgba(101, 172, 255, 0) 56%)",
    "linear-gradient(156deg, #091327 0%, #10223d 54%, #15304c 100%)",
  ].join(", "),
  midnightBerry: [
    "radial-gradient(138% 132% at -8% -12%, rgba(103, 74, 255, 0.56) 0%, rgba(103, 74, 255, 0) 58%)",
    "radial-gradient(132% 126% at 104% 10%, rgba(255, 88, 164, 0.42) 0%, rgba(255, 88, 164, 0) 60%)",
    "radial-gradient(126% 134% at 52% 108%, rgba(124, 180, 255, 0.32) 0%, rgba(124, 180, 255, 0) 62%)",
    "radial-gradient(114% 118% at 74% 72%, rgba(169, 132, 255, 0.2) 0%, rgba(169, 132, 255, 0) 56%)",
    "linear-gradient(158deg, #0c1022 0%, #181834 54%, #23173a 100%)",
  ].join(", "),
  graphiteAurora: [
    "radial-gradient(140% 134% at -10% -10%, rgba(108, 122, 255, 0.42) 0%, rgba(108, 122, 255, 0) 58%)",
    "radial-gradient(134% 126% at 104% 10%, rgba(72, 178, 255, 0.3) 0%, rgba(72, 178, 255, 0) 60%)",
    "radial-gradient(128% 136% at 50% 108%, rgba(145, 120, 255, 0.28) 0%, rgba(145, 120, 255, 0) 62%)",
    "radial-gradient(116% 120% at 72% 72%, rgba(122, 212, 255, 0.18) 0%, rgba(122, 212, 255, 0) 56%)",
    "linear-gradient(156deg, #12161f 0%, #1a2230 54%, #1f2b3a 100%)",
  ].join(", "),
} as const;

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "sonoma-dawn",
    label: "Sonoma Dawn",
    value: MESH_BACKGROUND_VALUES.sonomaDawn,
    type: "gradient",
  },
  {
    id: "coastal-mint",
    label: "Coastal Mint",
    value: MESH_BACKGROUND_VALUES.coastalMint,
    type: "gradient",
  },
  {
    id: "arctic-glow",
    label: "Arctic Glow",
    value: MESH_BACKGROUND_VALUES.arcticGlow,
    type: "gradient",
  },
  {
    id: "orchid-haze",
    label: "Orchid Haze",
    value: MESH_BACKGROUND_VALUES.orchidHaze,
    type: "gradient",
  },
  {
    id: "solar-punch",
    label: "Solar Punch",
    value: MESH_BACKGROUND_VALUES.solarPunch,
    type: "gradient",
  },
  {
    id: "deep-ocean",
    label: "Deep Ocean",
    value: MESH_BACKGROUND_VALUES.deepOcean,
    type: "gradient",
  },
  {
    id: "midnight-berry",
    label: "Midnight Berry",
    value: MESH_BACKGROUND_VALUES.midnightBerry,
    type: "gradient",
  },
  {
    id: "graphite-aurora",
    label: "Graphite Aurora",
    value: MESH_BACKGROUND_VALUES.graphiteAurora,
    type: "gradient",
  },
];
