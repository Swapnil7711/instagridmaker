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
  style?: React.CSSProperties;
}

export default function GridItem({
  image,
  imageFit,
  onRemove,
  style = {},
}: GridItemProps) {
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

  const itemStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
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
        className="pointer-events-none"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
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
