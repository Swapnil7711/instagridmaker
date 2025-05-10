"use client";

import { useState, useMemo, useEffect } from "react";
import html2canvas from "html2canvas"; // Uncomment html2canvas
// @ts-ignore // Suppress type error for dom-to-image-more
import domtoimage from "dom-to-image-more"; // Re-import dom-to-image-more
import GridDisplay from "@/components/GridDisplay";
import useLocalStorageState from "@/hooks/useLocalStorageState"; // Import the hook
import { exportDisplayedGrid } from "@/utils/imageExport";

// Define types for images and layout
type ImageItem = {
  id: string;
  src: string;
  position?: { x: number; y: number }; // Add optional position (percentages)
};

// Define type for object-fit values
type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export default function Home() {
  // Use useLocalStorageState instead of useState
  const [images, setImages] = useLocalStorageState<ImageItem[]>(
    "instagrid-images",
    []
  );
  // Add state for image fit style
  const [imageFit, setImageFit] = useLocalStorageState<ObjectFit>(
    "instagrid-image-fit",
    "cover" // Default to cover
  );
  const [hasPadding, setHasPadding] = useState(true);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      // Keep track of promises for reading files
      const fileReadPromises: Promise<ImageItem>[] = [];

      files.forEach((file) => {
        if (file.type.startsWith("image/")) {
          // Create a promise for each file read
          const promise = new Promise<ImageItem>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && typeof e.target.result === "string") {
                const newImage: ImageItem = {
                  id: crypto.randomUUID(),
                  src: e.target.result, // Use Base64 Data URL result
                };
                resolve(newImage);
              } else {
                reject(new Error("Failed to read file as Data URL."));
              }
            };
            reader.onerror = (error) => {
              reject(error);
            };
            // Read file as Base64 Data URL
            reader.readAsDataURL(file);
          });
          fileReadPromises.push(promise);
        }
      });

      // Wait for all files to be read
      Promise.all(fileReadPromises)
        .then((newImages) => {
          setImages((prevImages) => {
            const combinedImages = [...prevImages, ...newImages];
            return combinedImages;
          });
        })
        .catch((error) => {
          console.error("Error reading files:", error);
          // Optionally show an error message to the user
        });

      // Reset the file input value
      event.target.value = "";
    }
  };

  // Handler for reordering images from GridDisplay
  const handleReorder = (newImages: ImageItem[]) => {
    setImages(newImages);
  };

  // TODO: Implement handler for image removal
  const handleRemoveImage = (id: string) => {
    // No need to revoke URL here anymore as the hook doesn't persist the actual blob
    // The URL created during upload is temporary anyway.
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
  };

  // Handler for updating a specific image's position
  const handleImagePositionChange = (
    id: string,
    newPosition: { x: number; y: number }
  ) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, position: newPosition } : img
      )
    );
  };

  const handleExport = async () => {
    try {
      const gridElement = document.getElementById("grid-export-area");
      if (!gridElement) {
        throw new Error("Could not find grid element for export");
      }

      // Temporarily remove padding for export
      setHasPadding(false);

      // Wait for state update to take effect
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Export the grid with 2x resolution scale
      const blob = await exportDisplayedGrid(gridElement, 2);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `instagrid-${images.length}-images-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export grid:", error);
      // You might want to show an error message to the user here
    } finally {
      // Restore padding
      setHasPadding(true);
    }
  };

  // Handler to clear all images from the grid
  const handleClearGrid = () => {
    if (
      images.length > 0 &&
      window.confirm(
        "Are you sure you want to clear the grid? This cannot be undone."
      )
    ) {
      // No need to revoke URLs individually as we are clearing the whole state
      // and the hook handles localStorage update.
      setImages([]);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-12 lg:p-24 bg-gray-50">
      <header className="w-full max-w-5xl mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          InstaGridMaker
        </h1>
        <p className="text-center text-gray-600">
          Plan your Instagram grid layout visually.
        </p>
      </header>

      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Controls Section */}
        <section className="md:w-1/4 flex flex-col gap-4 order-2 md:order-1">
          <h2 className="text-xl font-semibold text-gray-700">Controls</h2>

          {/* Photo Uploader Placeholder */}
          <div>
            <label
              htmlFor="photo-upload"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload Photos
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Select up to {images.length} images.
            </p>
          </div>

          {/* Image Fit Selector */}
          <div>
            <label
              htmlFor="image-fit-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image Fit
            </label>
            <select
              id="image-fit-select"
              value={imageFit}
              onChange={(e) => setImageFit(e.target.value as ObjectFit)}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="cover">Cover (Fill & Crop)</option>
              <option value="contain">Contain (Fit & Letterbox)</option>
              <option value="fill">Fill (Stretch)</option>
              <option value="none">None (Original Size)</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </div>

          {/* Export Button Placeholder */}
          <button
            onClick={handleExport}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Export Grid (PNG)
          </button>

          {/* Clear Grid Button */}
          <button
            onClick={handleClearGrid}
            disabled={images.length === 0} // Disable if no images
            className="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            Clear Grid
          </button>

          {/* TODO: Add Clear Grid Button */}
        </section>

        {/* Grid Display Area */}
        <section
          id="grid-container"
          className="flex-1 order-1 md:order-2 min-w-0 flex flex-col"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center md:text-left">
            Grid Preview
          </h2>
          {images.length > 0 ? (
            <GridDisplay
              images={images}
              imageFit={imageFit}
              onReorder={handleReorder}
              onRemove={handleRemoveImage}
              onPositionChange={handleImagePositionChange}
              hasPadding={hasPadding}
            />
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gray-200 border border-gray-300 rounded text-gray-500 p-8 text-center min-h-[300px]">
              Upload images using the controls to start building your grid.
            </div>
          )}
        </section>
      </div>

      {/* TODO: Add Uploaded Images Preview/Bank */}
    </main>
  );
}
