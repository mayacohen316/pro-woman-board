import React from "react";

const DefaultNode = ({ data }) => {
  return (
    <div
      style={{
        padding: 10,
        border: "2px solid #555",
        borderRadius: 10,
        backgroundColor: "white",
        color: "#333",
        fontWeight: "bold",
        textAlign: "center",
        width: 100,
      }}
    >
      {data?.label || "Node"}
    </div>
  );
};

export default DefaultNode;
