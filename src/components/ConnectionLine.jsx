import React, { useEffect, useState } from "react";

const ConnectionLine = ({ fromRef, toRef, color = "black" }) => {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const updateCoords = () => {
    if (!fromRef || !toRef) return;

    const fromBox = fromRef.getBoundingClientRect();
    const toBox = toRef.getBoundingClientRect();

    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    setCoords({
      x1: fromBox.left + fromBox.width / 2 + scrollX,
      y1: fromBox.top + fromBox.height / 2 + scrollY,
      x2: toBox.left + toBox.width / 2 + scrollX,
      y2: toBox.top + toBox.height / 2 + scrollY,
    });
  };

  useEffect(() => {
    updateCoords(); // once on mount

    const handleRefresh = () => {
      updateCoords();
    };

    window.addEventListener("refresh-lines", handleRefresh);
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords);

    return () => {
      window.removeEventListener("refresh-lines", handleRefresh);
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords);
    };
  }, [fromRef, toRef]);

  return (
    <line
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      stroke={color}
      strokeWidth="2"
    />
  );
};

export default ConnectionLine;
