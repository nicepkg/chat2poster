"use client";

import { STORAGE_KEYS } from "@ui/constants";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import { useEffect, useRef, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";

export interface FloatingButtonProps {
  onClick: () => void;
  visible: boolean;
  className?: string;
}

interface FloatingButtonPosition {
  x: number;
  y: number;
}

const BUTTON_SIZE = 48;
const BUTTON_MARGIN = 20;
const DRAG_THRESHOLD = 4;

function getDefaultPosition(): FloatingButtonPosition {
  return {
    x: window.innerWidth - BUTTON_SIZE - BUTTON_MARGIN,
    y: window.innerHeight - BUTTON_SIZE - BUTTON_MARGIN,
  };
}

function clampPosition(
  position: FloatingButtonPosition,
): FloatingButtonPosition {
  const bounds = {
    left: BUTTON_MARGIN,
    top: BUTTON_MARGIN,
    right: window.innerWidth - BUTTON_SIZE - BUTTON_MARGIN,
    bottom: window.innerHeight - BUTTON_SIZE - BUTTON_MARGIN,
  };
  return {
    x: Math.min(Math.max(position.x, bounds.left), bounds.right),
    y: Math.min(Math.max(position.y, bounds.top), bounds.bottom),
  };
}

function parseStoredPosition(value: unknown): FloatingButtonPosition | null {
  if (!value || typeof value !== "object") return null;
  const { x, y } = value as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number") return null;
  return { x, y };
}

function loadStoredPosition(): FloatingButtonPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXT_FLOATING_BUTTON_POSITION);
    if (!raw) return null;
    return parseStoredPosition(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveStoredPosition(position: FloatingButtonPosition) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.EXT_FLOATING_BUTTON_POSITION,
      JSON.stringify(position),
    );
  } catch {
    // ignore storage errors
  }
}

export function FloatingButton({
  onClick,
  visible,
  className,
}: FloatingButtonProps) {
  const { t } = useI18n();
  const [dragKey, setDragKey] = useState(0);
  const [defaultPosition, setDefaultPosition] =
    useState<FloatingButtonPosition>(() => {
      if (typeof window === "undefined") return { x: 0, y: 0 };
      const stored = loadStoredPosition();
      return clampPosition(stored ?? getDefaultPosition());
    });
  const positionRef = useRef<FloatingButtonPosition>(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);
  const nodeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const next = clampPosition(positionRef.current ?? getDefaultPosition());
      positionRef.current = next;
      setDefaultPosition(next);
      setDragKey((prev) => prev + 1);
      saveStoredPosition(next);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <Draggable
        key={dragKey}
        nodeRef={nodeRef}
        defaultPosition={defaultPosition}
        bounds="parent"
        onStart={() => {
          hasMovedRef.current = false;
          setIsDragging(true);
        }}
        onDrag={(_event: DraggableEvent, data: DraggableData) => {
          if (
            Math.abs(data.deltaX) > DRAG_THRESHOLD ||
            Math.abs(data.deltaY) > DRAG_THRESHOLD
          ) {
            hasMovedRef.current = true;
          }
          positionRef.current = { x: data.x, y: data.y };
        }}
        onStop={(_event: DraggableEvent, data: DraggableData) => {
          setIsDragging(false);
          const next = clampPosition({ x: data.x, y: data.y });
          positionRef.current = next;
          setDefaultPosition(next);
          saveStoredPosition(next);
        }}
      >
        <button
          ref={nodeRef}
          onClick={() => {
            if (hasMovedRef.current) {
              hasMovedRef.current = false;
              return;
            }
            onClick();
          }}
          className={cn(
            "c2p-floating-btn pointer-events-auto absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[box-shadow,background-color,transform] duration-150 ease-out hover:bg-primary/90 hover:shadow-xl touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
            className,
          )}
          title={t("floatingButton.title")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </button>
      </Draggable>
    </div>
  );
}
