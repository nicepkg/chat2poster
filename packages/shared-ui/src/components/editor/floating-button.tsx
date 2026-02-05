"use client";

import { STORAGE_KEYS } from "@ui/constants";
import { useI18n } from "@ui/i18n";
import { cn } from "@ui/utils/common";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

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
  const maxX = Math.max(
    BUTTON_MARGIN,
    window.innerWidth - BUTTON_SIZE - BUTTON_MARGIN,
  );
  const maxY = Math.max(
    BUTTON_MARGIN,
    window.innerHeight - BUTTON_SIZE - BUTTON_MARGIN,
  );

  return {
    x: Math.min(Math.max(position.x, BUTTON_MARGIN), maxX),
    y: Math.min(Math.max(position.y, BUTTON_MARGIN), maxY),
  };
}

function loadStoredPosition(): FloatingButtonPosition | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXT_FLOATING_BUTTON_POSITION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FloatingButtonPosition;
    if (typeof parsed.x !== "number" || typeof parsed.y !== "number") {
      return null;
    }
    return parsed;
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
  const [position, setPosition] = useState<FloatingButtonPosition | null>(
    () => {
      if (typeof window === "undefined") return null;
      const stored = loadStoredPosition();
      return clampPosition(stored ?? getDefaultPosition());
    },
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const hasMovedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setPosition((prev) => clampPosition(prev ?? getDefaultPosition()));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const current = position ?? getDefaultPosition();
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: current.x,
      originY: current.y,
    };
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    const { pointerX, pointerY, originX, originY } = dragStartRef.current;
    const dx = event.clientX - pointerX;
    const dy = event.clientY - pointerY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      hasMovedRef.current = true;
    }
    const next = clampPosition({ x: originX + dx, y: originY + dy });
    setPosition(next);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragStartRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStartRef.current = null;
    setIsDragging(false);
    if (position) {
      saveStoredPosition(position);
    }
  };

  const handleClick = () => {
    if (hasMovedRef.current) {
      hasMovedRef.current = false;
      return;
    }
    onClick();
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={
        position
          ? { transform: `translate3d(${position.x}px, ${position.y}px, 0)` }
          : undefined
      }
      className={cn(
        "c2p-floating-btn fixed left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[box-shadow,background-color,transform] duration-150 ease-out hover:bg-primary/90 hover:shadow-xl active:scale-95 touch-none",
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
  );
}
