// components/DraggableWrapper.jsx
import React, { useRef, useState, useEffect } from "react";

const DraggableWrapper = ({ id, x, y, children, onStop }) => {
  const nodeRef = useRef(null);
  const [position, setPosition] = useState({ x, y });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleDragStart = (e) => {
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;

    const offsetX = clientX - position.x;
    const offsetY = clientY - position.y;

    setDragging(true);

    const handleDragMove = (moveEvent) => {
      const moveX =
        moveEvent.type === "touchmove"
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const moveY =
        moveEvent.type === "touchmove"
          ? moveEvent.touches[0].clientY
          : moveEvent.clientY;

      const newX = moveX - offsetX;
      const newY = moveY - offsetY;

      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setDragging(false);
      onStop(position.x, position.y);
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };

    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);
  };

  return (
    <div
      id={id}
      ref={nodeRef}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      className="absolute cursor-move touch-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: dragging ? 50 : 10,
      }}
    >
      {children}
    </div>
  );
};

export default DraggableWrapper;
