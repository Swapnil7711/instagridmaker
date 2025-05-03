"use client";

import React from "react";
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
  onPositionChange: (id: string, newPosition: { x: number; y: number }) => void;
  hasPadding?: boolean;
}

export default function GridDisplay({
  images,
  imageFit,
  onReorder,
  onRemove,
  onPositionChange,
  hasPadding = true,
}: GridDisplayProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Define flexbox style dynamically for auto-flow
  const flexContainerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap", // Allow items to wrap to the next line
    gap: "4px", // Spacing between items
    padding: hasPadding ? "4px" : "0", // Padding inside the container
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    backgroundColor: "#e5e7eb",
    width: "100%",
    maxWidth: "600px", // Restore max-width
    margin: "0 auto",
    // Remove grid-specific styles
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={imageIds} strategy={rectSortingStrategy}>
        <div
          id="grid-export-area"
          // Use flexbox style
          style={flexContainerStyle}
        >
          {images.map((image) => (
            // Apply flex properties to the GridItem wrapper if needed,
            // but GridItem itself might handle sizing if given a basis.
            // For now, GridItem has aspect-square, let's see how it behaves.
            // We might need to wrap GridItem or apply flex styles directly.
            <GridItem
              key={image.id}
              image={image}
              imageFit={imageFit}
              onRemove={onRemove}
            />
          ))}
          {/* Placeholders are already removed */}
        </div>
      </SortableContext>
    </DndContext>
  );
}
