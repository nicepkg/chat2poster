/**
 * Resource loading utilities for ensuring all assets are ready before export
 */

/**
 * Wait for all fonts to be loaded
 * Uses the Font Loading API
 */
export async function waitForFonts(timeoutMs: number = 5000): Promise<boolean> {
  if (typeof document === "undefined" || !document.fonts) {
    // Not in browser environment
    return true;
  }

  try {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Font loading timeout")), timeoutMs)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if an image element is fully loaded
 */
function isImageLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

/**
 * Wait for a single image to load
 */
function waitForImage(img: HTMLImageElement, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (isImageLoaded(img)) {
      resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      resolve(false);
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
    };

    img.addEventListener(
      "load",
      () => {
        cleanup();
        resolve(true);
      },
      { once: true }
    );

    img.addEventListener(
      "error",
      () => {
        cleanup();
        resolve(false);
      },
      { once: true }
    );
  });
}

/**
 * Wait for all images within an element to be loaded
 */
export async function waitForImages(
  container: HTMLElement,
  timeoutMs: number = 10000
): Promise<{ loaded: number; failed: number }> {
  const images = container.querySelectorAll("img");
  const results = await Promise.all(
    Array.from(images).map((img) => waitForImage(img, timeoutMs))
  );

  const loaded = results.filter((r) => r).length;
  const failed = results.filter((r) => !r).length;

  return { loaded, failed };
}

/**
 * Wait for all resources (fonts + images) to be ready
 */
export async function waitForResources(
  container: HTMLElement,
  options: { fontTimeout?: number; imageTimeout?: number } = {}
): Promise<{ fontsReady: boolean; imagesLoaded: number; imagesFailed: number }> {
  const { fontTimeout = 5000, imageTimeout = 10000 } = options;

  const [fontsReady, imageResult] = await Promise.all([
    waitForFonts(fontTimeout),
    waitForImages(container, imageTimeout),
  ]);

  return {
    fontsReady,
    imagesLoaded: imageResult.loaded,
    imagesFailed: imageResult.failed,
  };
}

/**
 * Get all image URLs from a container
 */
export function getImageUrls(container: HTMLElement): string[] {
  const images = container.querySelectorAll("img");
  return Array.from(images)
    .map((img) => img.src)
    .filter((src) => src.length > 0);
}

/**
 * Preload images by URL
 */
export async function preloadImages(
  urls: string[],
  timeoutMs: number = 10000
): Promise<{ loaded: string[]; failed: string[] }> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const img = new Image();
        img.src = url;

        const loaded = await waitForImage(img, timeoutMs);
        return { url, loaded };
      } catch {
        return { url, loaded: false };
      }
    })
  );

  return {
    loaded: results.filter((r) => r.loaded).map((r) => r.url),
    failed: results.filter((r) => !r.loaded).map((r) => r.url),
  };
}
