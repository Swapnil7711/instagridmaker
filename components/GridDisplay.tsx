"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import GridItem from "./GridItem";

type ImageItem = {
  id: string;
  src: string;
};

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

interface GridDisplayProps {
  images: ImageItem[];
  imageFit: ObjectFit;
  onReorder: (newImages: ImageItem[]) => void;
  onRemove: (id: string) => void;
  hasPadding?: boolean;
  orientation?: "portrait" | "landscape";
}

export default function GridDisplay({
  images,
  imageFit,
  onReorder,
  onRemove,
  hasPadding = true,
  orientation = "portrait",
}: GridDisplayProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [numCols, setNumCols] = useState(orientation === "portrait" ? 3 : 4); // Default for SSR / non-browser
  const [currentMaxWidth, setCurrentMaxWidth] = useState("100%"); // Default for SSR / mobile

  useEffect(() => {
    const getGridCols = () => {
      if (window.innerWidth < 768) {
        // Tailwind's 'md' breakpoint
        return 2; // 2 columns for mobile
      }
      return orientation === "portrait" ? 3 : 4; // 3 for portrait, 4 for landscape on md+
    };

    const updateLayout = () => {
      setNumCols(getGridCols());
      setCurrentMaxWidth(
        window.innerWidth >= 768
          ? orientation === "portrait"
            ? "640px"
            : "800px"
          : "100%"
      );
    };

    updateLayout(); // Set initial values on client mount
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [orientation]); // Re-run if orientation changes

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  const imageIds = images.map((img) => img.id);

  // Define container style based on orientation
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px", // Consider responsive gap if needed, e.g., `md:gap-2` via className
    padding: hasPadding ? "4px" : "0", // Consider responsive padding
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    backgroundColor: "#e5e7eb",
    width: "100%",
    margin: "0 auto",
    // Mobile-first: height will be determined by aspect ratio and width
    // maxWidth will be 100% on mobile, and capped on larger screens
    aspectRatio: orientation === "portrait" ? "4/5" : "5/4",
  };

  // Calculate item dimensions based on orientation and number of images
  // Responsive item styling: 2 columns on mobile, then adjust for larger screens
  // const getGridCols = () => { // MOVED to useEffect
  //   if (typeof window !== 'undefined') {
  //     if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint
  //       return 2; // 2 columns for mobile
  //     }
  //   }
  //   return orientation === "portrait" ? 3 : 4; // 3 for portrait, 4 for landscape on md+
  // };

  // const numCols = getGridCols(); // numCols is now a state variable
  const itemFlexBasis = `${100 / numCols}%`;

  const itemStyle: React.CSSProperties = {
    flex: `1 1 calc(${itemFlexBasis} - 4px)`, // Adjust for gap
    minWidth: `calc(${itemFlexBasis} - 4px)`, // Adjust for gap
    aspectRatio: "1",
    // maxWidth to prevent items from becoming too large on wider screens within the flex container
    // This is useful if the container itself doesn't have a max-width or if rows aren't full
    maxWidth: `calc(${itemFlexBasis} - 4px)`,
  };

  const responsiveContainerStyle: React.CSSProperties = {
    ...containerStyle,
    // Apply max-width for non-mobile views to constrain the grid size
    // For mobile, it will take full width available (already set by width: "100%")
    maxWidth: currentMaxWidth,
    // Height will be driven by aspect ratio and width, so no explicit height needed here for responsiveness
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={imageIds} strategy={rectSortingStrategy}>
        <div id="grid-export-area" style={responsiveContainerStyle}>
          {images.map((image) => (
            <GridItem
              key={image.id}
              image={image}
              imageFit={imageFit}
              onRemove={onRemove}
              style={itemStyle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
