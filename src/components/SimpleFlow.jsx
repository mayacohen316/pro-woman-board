import React, { useEffect, useState, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "../supabaseClient";
import EntityNode from "./EntityNode";
import BasicNode from "./BasicNode";

const nodeTypes = {
  entity: EntityNode,
  basic: BasicNode,
  emoji: BasicNode,
};

const SimpleFlow = ({
  nodes: incomingNodes = [],
  edges: incomingEdges = [],
  lastCreatedId, // ✅ מקבלים מהאבא
}) => {
  const [localNodes, setLocalNodes] = useState([]);
  const [localEdges, setLocalEdges] = useState([]);
  const { setCenter } = useReactFlow();

  const lastZoomedIdRef = useRef(null);

  useEffect(() => {
    if (
      lastCreatedId &&
      lastCreatedId !== lastZoomedIdRef.current &&
      localNodes.length > 0
    ) {
      const node = localNodes.find((n) => n.id === lastCreatedId);
      if (node) {
        setTimeout(() => {
          setCenter(node.position.x, node.position.y, {
            zoom: 1.8,
            duration: 800,
          });
          lastZoomedIdRef.current = lastCreatedId;
        }, 300);
      }
    }
  }, [lastCreatedId, localNodes, setCenter]);

  // בכל פעם שמגיעים nodes/edges מהאבא --> נעדכן את הסטייט המקומי
  useEffect(() => {
    setLocalNodes(incomingNodes);
  }, [incomingNodes]);

  useEffect(() => {
    setLocalEdges(incomingEdges);
  }, [incomingEdges]);

  const handleNodesChange = (changes) => {
    setLocalNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onNodeDragStop = async (event, node) => {
    let tableName = "entities";
    if (node.type === "basic") {
      tableName = node.data?.label === "Image" ? "images" : "text_bubbles";
    } else if (node.type === "emoji") {
      tableName = "emojis";
    }

    const { error } = await supabase
      .from(tableName)
      .update({
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      })
      .eq("id", node.id);

    if (error) {
      console.error("❌ Failed to update position in DB:", error);
    } else {
      console.log("✅ Position updated in DB:", node.id);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges.map((edge) => ({
          ...edge,
          type: "default",
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#9d174d", strokeWidth: 2 },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default SimpleFlow;
