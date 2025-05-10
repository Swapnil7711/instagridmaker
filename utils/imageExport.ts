/**
 * Utility functions for high-quality image export
 */

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";
type ImageOrientation = "portrait" | "landscape";

/**
 * Load an image and handle CORS properly
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = (error) =>
      reject(new Error(`Failed to load image: ${error}`));

    // For data URLs, we can use them directly
    if (src.startsWith("data:")) {
      img.src = src;
    } else {
      // For other URLs, try to use a proxy or CORS-enabled endpoint
      // You might need to adjust this based on your setup
      img.src = src;
    }
  });
}

/**
 * Calculate dimensions for cover-style image cropping
 */
export function getCoverCrop(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetWidth / targetHeight;

  let width = img.width;
  let height = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    // Image is wider than target: crop the sides
    width = img.height * targetRatio;
    sx = (img.width - width) / 2;
  } else {
    // Image is taller than target: crop the top/bottom
    height = img.width / targetRatio;
    sy = (img.height - height) / 2;
  }

  return {
    sx,
    sy,
    sWidth: width,
    sHeight: height,
  };
}

/**
 * Calculate canvas dimensions based on orientation
 */
function getCanvasDimensions(
  orientation: ImageOrientation,
  displayWidth: number,
  displayHeight: number
): { width: number; height: number } {
  // Instagram recommended dimensions
  const INSTAGRAM_PORTRAIT = { width: 1080, height: 1350 }; // 4:5 ratio
  const INSTAGRAM_LANDSCAPE = { width: 1350, height: 1080 }; // 5:4 ratio

  const targetRatio =
    orientation === "portrait"
      ? INSTAGRAM_PORTRAIT.height / INSTAGRAM_PORTRAIT.width
      : INSTAGRAM_LANDSCAPE.height / INSTAGRAM_LANDSCAPE.width;

  // Calculate dimensions while maintaining the target ratio
  let width: number;
  let height: number;

  const currentRatio = displayHeight / displayWidth;

  if (orientation === "portrait") {
    // For portrait, ensure height is 1.25x the width
    width = Math.min(INSTAGRAM_PORTRAIT.width, displayWidth);
    height = width * targetRatio;
  } else {
    // For landscape, ensure width is 1.25x the height
    height = Math.min(INSTAGRAM_LANDSCAPE.height, displayHeight);
    width = height / targetRatio;
  }

  return { width, height };
}

/**
 * Export the grid exactly as displayed on screen
 */
export async function exportDisplayedGrid(
  gridElement: HTMLElement,
  orientation: ImageOrientation = "portrait",
  scale: number = 2 // Scale factor for higher resolution
): Promise<Blob> {
  // Save current scroll position
  const originalScrollPosition = window.scrollY;

  try {
    // Scroll the grid into view
    gridElement.scrollIntoView({ behavior: "instant", block: "nearest" });

    // Wait a bit for any scroll animations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the exact dimensions and position of the grid
    const rect = gridElement.getBoundingClientRect();
    const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions(
      orientation,
      rect.width,
      rect.height
    );

    // Create a high-resolution canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
      desynchronized: true,
    });

    if (!ctx) throw new Error("Canvas 2D context not supported");

    // Set canvas size to match target dimensions * scale factor
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;

    // Scale the context to match the desired output size
    const scaleX = (canvasWidth * scale) / rect.width;
    const scaleY = (canvasHeight * scale) / rect.height;
    ctx.scale(scaleX, scaleY);

    // Fill background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Get all images in the grid
    const images = Array.from(gridElement.querySelectorAll("img"));
    const gridRect = gridElement.getBoundingClientRect();

    // Process each image
    for (const img of images) {
      const imgRect = img.getBoundingClientRect();

      // Calculate position relative to grid
      const x = imgRect.left - gridRect.left;
      const y = imgRect.top - gridRect.top;
      const width = imgRect.width;
      const height = imgRect.height;

      // Load the image for high-quality rendering
      const loadedImg = await loadImage(img.src);

      // Draw the image maintaining its object-fit style
      const objectFit = getComputedStyle(img).objectFit as ObjectFit;
      if (objectFit === "cover") {
        const { sx, sy, sWidth, sHeight } = getCoverCrop(
          loadedImg,
          width,
          height
        );
        ctx.drawImage(loadedImg, sx, sy, sWidth, sHeight, x, y, width, height);
      } else {
        // For other object-fit values, use simple drawing
        ctx.drawImage(loadedImg, x, y, width, height);
      }
    }

    // Convert to high-quality PNG blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create image blob"));
          }
        },
        "image/png",
        1.0 // Maximum quality
      );
    });
  } finally {
    // Restore the original scroll position
    window.scrollTo({
      top: originalScrollPosition,
      behavior: "instant",
    });
  }
}

/**
 * Export grid as a high-quality PNG image
 */
export async function exportGridAsImage({
  images,
  columns,
  cellSize = 1024,
  padding = 8,
  backgroundColor = "#FFFFFF",
  quality = 1.0,
}: {
  images: { src: string }[];
  columns: number;
  cellSize?: number;
  padding?: number;
  backgroundColor?: string;
  quality?: number;
}): Promise<Blob> {
  // Calculate dimensions
  const rows = Math.ceil(images.length / columns);
  const width = columns * cellSize + (columns - 1) * padding;
  const height = rows * cellSize + (rows - 1) * padding;

  // Create high-DPI canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", {
    alpha: true,
    willReadFrequently: false,
    desynchronized: true,
  });

  if (!ctx) throw new Error("Canvas 2D context not supported");

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Load and draw all images
  try {
    const loadedImages = await Promise.all(
      images.map((img) => loadImage(img.src))
    );

    for (let i = 0; i < loadedImages.length; i++) {
      const image = loadedImages[i];
      const col = i % columns;
      const row = Math.floor(i / columns);

      // Calculate position
      const x = col * (cellSize + padding);
      const y = row * (cellSize + padding);

      // Get crop dimensions for cover-style fit
      const { sx, sy, sWidth, sHeight } = getCoverCrop(
        image,
        cellSize,
        cellSize
      );

      // Draw image with high quality
      ctx.drawImage(image, sx, sy, sWidth, sHeight, x, y, cellSize, cellSize);
    }

    // Convert to blob with specified quality
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create image blob"));
          }
        },
        "image/png",
        quality
      );
    });
  } catch (error) {
    throw new Error(`Failed to export grid: ${error}`);
  }
}
