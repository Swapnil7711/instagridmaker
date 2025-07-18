"use client";

import { useState } from "react";
import GridDisplay from "@/components/GridDisplay";
import useLocalStorageState from "@/hooks/useLocalStorageState"; // Import the hook
import { exportDisplayedGrid } from "@/utils/imageExport";
import ShootAIAd from "@/components/ShootAIAd";

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
  const [imageFit] = useLocalStorageState<ObjectFit>(
    "instagrid-image-fit",
    "cover" // Default to cover
  );
  const [hasPadding, setHasPadding] = useState(true);
  const [imageOrientation, setImageOrientation] = useState<
    "portrait" | "landscape"
  >("portrait");

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
  // const _handleImagePositionChange = (
  //   id: string,
  //   newPosition: { x: number; y: number }
  // ) => {
  //   setImages((prevImages) =>
  //     prevImages.map((img) =>
  //       img.id === id ? { ...img, position: newPosition } : img
  //     )
  //   );
  // };

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

      try {
        // Export the grid with orientation and 2x resolution scale
        const blob = await exportDisplayedGrid(
          gridElement,
          imageOrientation,
          2
        );

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `instagrid-${
          images.length
        }-images-${imageOrientation}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
      } catch (exportError) {
        console.error("Failed to export grid:", exportError);
        alert("Failed to export grid. Please try again.");
      }
    } catch (error) {
      console.error("Error during export setup:", error);
      alert("Error preparing grid for export. Please try again.");
    } finally {
      // Always restore padding
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
    <main className="flex min-h-screen flex-col items-center p-2 md:p-4 bg-gray-50">
      <header className="w-full max-w-7xl mb-4 px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-1">
          InstaGridMaker
        </h1>
        <p className="text-center text-sm md:text-base text-gray-600">
          Plan your Instagram grid layout visually.
        </p>
      </header>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 px-2 md:px-0">
        {/* Controls Section */}
        <section className="lg:w-1/4 flex flex-col gap-4 order-2 lg:order-1 bg-white p-4 rounded-lg shadow lg:sticky lg:top-4 lg:self-start">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700">
            Controls
          </h2>

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
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="mt-1 text-xs text-gray-500">
              Select multiple images to add to your grid.
            </p>
          </div>

          {/* Image Orientation Selector */}
          <div>
            <label
              htmlFor="image-orientation-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image Orientation
            </label>
            <select
              id="image-orientation-select"
              value={imageOrientation}
              onChange={(e) =>
                setImageOrientation(e.target.value as "portrait" | "landscape")
              }
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm md:text-sm"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm md:text-base"
          >
            Export Grid (PNG)
          </button>

          {/* Clear Grid Button */}
          <button
            onClick={handleClearGrid}
            disabled={images.length === 0}
            className="mt-2 w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-sm md:text-base"
          >
            Clear Grid
          </button>
        </section>

        {/* Grid Display Area */}
        <section className="flex-1 order-1 lg:order-2 min-w-0">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 text-center lg:text-left">
            Grid Preview
          </h2>
          {images.length > 0 ? (
            <GridDisplay
              images={images}
              imageFit={imageFit}
              onReorder={handleReorder}
              onRemove={handleRemoveImage}
              hasPadding={hasPadding}
              orientation={imageOrientation}
            />
          ) : (
            <div className="flex-grow flex items-center justify-center bg-gray-200 border border-gray-300 rounded text-gray-500 p-4 md:p-8 text-center min-h-[200px] md:min-h-[300px]">
              Upload images using the controls to start building your grid.
            </div>
          )}
        </section>

        {/* Ad Section */}
        <section className="lg:w-1/4 order-3 lg:sticky lg:top-4 lg:self-start">
          <ShootAIAd />
        </section>
      </div>
    </main>
  );
}
