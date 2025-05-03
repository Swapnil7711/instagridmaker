"use client";

import React, { useState, useRef, CSSProperties } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ImageItem = {
  id: string;
  src: string;
};

type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

interface GridItemProps {
  image: ImageItem;
  imageFit: ObjectFit;
  onRemove: (id: string) => void;
}

export default function GridItem({ image, imageFit, onRemove }: GridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto", // Ensure dragging item is on top
    opacity: isDragging ? 0.5 : 1, // Make dragging item slightly transparent
    touchAction: "none", // Necessary for @dnd-kit interaction
  };

  // Add flex properties for sizing within the flex container
  const itemStyle: React.CSSProperties = {
    ...style, // Include transform/transition from useSortable
    flex: "1 1 150px", // Grow, Shrink, Basis (adjust 150px as needed)
    minWidth: "100px", // Prevent shrinking too small (optional, adjust as needed)
  };

  return (
    <div
      ref={setNodeRef}
      style={itemStyle}
      {...attributes}
      {...listeners}
      className="relative group bg-gray-300 overflow-hidden aspect-square"
    >
      <Image
        src={image.src}
        alt={`Grid image ${image.id}`}
        layout="fill"
        objectFit={imageFit}
        className="pointer-events-none" // Prevent image drag interference
      />
      {/* Remove Button (visible on hover/focus) */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent drag start when clicking remove
          onRemove(image.id);
        }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10"
        aria-label={`Remove image ${image.id}`}
      >
        X
      </button>
    </div>
  );
}
