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
  orientation?: "portrait" | "landscape";
}

export default function GridDisplay({
  images,
  imageFit,
  onReorder,
  onRemove,
  onPositionChange,
  hasPadding = true,
  orientation = "portrait",
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

  // Define container style based on orientation
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    padding: hasPadding ? "4px" : "0",
    border: "1px solid #d1d5db",
    borderRadius: "0.25rem",
    backgroundColor: "#e5e7eb",
    width: "100%",
    margin: "0 auto",
    aspectRatio: orientation === "portrait" ? "4/5" : "5/4", // Set aspect ratio based on orientation
    maxWidth: orientation === "portrait" ? "600px" : "750px", // Adjust max-width based on orientation
  };

  // Calculate item dimensions based on orientation and number of images
  const itemStyle: React.CSSProperties = {
    flex: orientation === "portrait" ? "1 1 32%" : "1 1 24%", // 3 columns for portrait, 4 for landscape
    minWidth: orientation === "portrait" ? "32%" : "24%",
    aspectRatio: "1",
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={imageIds} strategy={rectSortingStrategy}>
        <div id="grid-export-area" style={containerStyle}>
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
