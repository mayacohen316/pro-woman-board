import React, { useEffect, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
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
  nodes: initialNodes,
  edges: initialEdges,
  setTextBubbles,
  setImages,
  setEmojis,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [baseNodes, setBaseNodes] = useState(initialNodes || []);
  const [baseEdges, setBaseEdges] = useState(initialEdges || []);
  const reactFlowInstance = useReactFlow();
  const lastAddedNodeId = useRef(null);
  const isFirstLoad = useRef(true);

  // טעינה ראשונית בלבד
  useEffect(() => {
    // ביצוע בפעם הראשונה בלבד
    if (isFirstLoad.current) {
      setNodes(initialNodes || []); // עדכון סטייט של nodes
      setEdges(initialEdges || []); // עדכון סטייט של edges
      setBaseNodes(initialNodes || []); // עדכון של baseNodes
      setBaseEdges(initialEdges || []); // עדכון של baseEdges

      if (initialNodes.length > 0) {
        // אם יש Nodes, נעשה scroll כדי להתאים את התצוגה לגריד
        setTimeout(() => {
          reactFlowInstance.fitView({ padding: 0.2 });
        }, 300);
      }

      isFirstLoad.current = false;
    }
  }, []); // הפעל רק פעם אחת בהתחלה

  useEffect(() => {
    if (!isFirstLoad.current) {
      setBaseNodes(initialNodes || []); // עדכון של baseNodes
    }
  }, [initialNodes]); // התעדכן כש- initialNodes משתנה

  useEffect(() => {
    if (!isFirstLoad.current) {
      setBaseEdges(initialEdges || []); // עדכון של baseEdges
    }
  }, [initialEdges]); // התעדכן כש- initialEdges משתנה

  // פוקוס על אלמנט חדש אם נוסף
  useEffect(() => {
    if (lastAddedNodeId.current) {
      const node = baseNodes.find((n) => n.id === lastAddedNodeId.current);
      if (node) {
        // התמקדות ב-node החדש שנוסף
        setTimeout(() => {
          reactFlowInstance.setCenter(node.position.x, node.position.y, {
            zoom: 1.8,
            duration: 800,
          });
        }, 300);
      }
      lastAddedNodeId.current = null; // איפוס ה-referenece
    }
  }, [baseNodes]); // הפעל מחדש ברגע ש-baseNodes משתנה

  useEffect(() => {
    // אם יש גריד ו-ReactFlow Instance, נעשה fitView כך שהגריד יתעדכן
    const reactFlow = reactFlowInstance.current;
    if (reactFlow) {
      reactFlow.fitView({ padding: 0.2 });
    }
  }, [nodes, edges]); // הפעל מחדש כל פעם ש-nodes או edges משתנים

  const onNodeDragStop = async (event, node) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );
    setBaseNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
    );

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
      console.log("✅ Position updated in DB");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedNodeId) return;

    const nodeToDelete = nodes.find((n) => n.id === selectedNodeId);
    if (!nodeToDelete) return;

    setIsDeleting(true); // הדלקת לודר

    try {
      if (nodeToDelete.type === "entity") {
        // שליפה של כל האובייקטים הקשורים ל-entity
        const [emojisRes, bubblesRes, imagesRes] = await Promise.all([
          supabase.from("emojis").select("id").eq("targetId", selectedNodeId),
          supabase
            .from("text_bubbles")
            .select("id")
            .eq("targetId", selectedNodeId),
          supabase.from("images").select("id").eq("targetId", selectedNodeId),
        ]);

        if (emojisRes.error || bubblesRes.error || imagesRes.error) {
          throw new Error("Failed to fetch linked items.");
        }

        const allRelatedIds = [
          ...(emojisRes.data || []).map((item) => item.id),
          ...(bubblesRes.data || []).map((item) => item.id),
          ...(imagesRes.data || []).map((item) => item.id),
        ];

        // מחיקת כל הקישורים ב-DB
        await Promise.all([
          supabase.from("emojis").delete().eq("targetId", selectedNodeId),
          supabase.from("text_bubbles").delete().eq("targetId", selectedNodeId),
          supabase.from("images").delete().eq("targetId", selectedNodeId),
          supabase.from("entities").delete().eq("id", selectedNodeId),
        ]);

        // עדכון הסטייט אחרי מחיקה
        setNodes((prev) =>
          prev.filter(
            (n) => n.id !== selectedNodeId && !allRelatedIds.includes(n.id)
          )
        );
        setEdges((prev) =>
          prev.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          )
        );
        setTextBubbles((prev) =>
          prev.filter((bub) => !allRelatedIds.includes(bub.id))
        );
        setImages((prev) =>
          prev.filter((img) => !allRelatedIds.includes(img.id))
        );
        setEmojis((prev) =>
          prev.filter((emo) => !allRelatedIds.includes(emo.id))
        );
      } else {
        // מחיקת פריט רגיל (כגון אימוג'י, תמונה או text bubble)
        let tableName = "text_bubbles";
        let setStateFunction = setTextBubbles;

        if (
          nodeToDelete.type === "basic" &&
          nodeToDelete.data.label === "Image"
        ) {
          tableName = "images";
          setStateFunction = setImages;
        } else if (nodeToDelete.type === "emoji") {
          tableName = "emojis";
          setStateFunction = setEmojis;
        }

        await supabase.from(tableName).delete().eq("id", selectedNodeId);

        // עדכון הסטייט המקומי אחרי מחיקת הפריט
        setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
        setEdges((prev) =>
          prev.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          )
        );
        setStateFunction((prev) =>
          prev.filter((item) => item.id !== selectedNodeId)
        );
      }

      setSelectedNodeId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error(error);
      alert("Failed to delete properly. Try again.");
    } finally {
      setIsDeleting(false); // כיבוי לודר
    }
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onDelete: () => {
              setSelectedNodeId(node.id);
              setShowDeleteModal(true);
            },
          },
          selected: selectedNodeId === node.id,
        }))}
        edges={edges.map((edge) => ({
          ...edge,
          type: "default",
          markerEnd: { type: "arrowclosed" },
          style: { stroke: "#9d174d", strokeWidth: 2 },
        }))}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(event, node) => {
          event.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        onPaneClick={() => {
          setSelectedNodeId(null);
        }}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {showDeleteModal && (
        <DeleteConfirmModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isEntity={
            nodes.find((n) => n.id === selectedNodeId)?.type === "entity"
          }
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

const DeleteConfirmModal = ({ onCancel, onConfirm, isEntity, isDeleting }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-30 z-50">
    <div className="bg-white p-6 rounded-xl shadow-xl w-96 text-center space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">
        {isEntity ? "Delete Entity?" : "Delete Item?"}
      </h2>
      <p className="text-gray-500">
        {isEntity
          ? "Deleting this entity will also remove all linked items."
          : "This action cannot be undone."}
      </p>

      <div className="flex justify-center gap-4 pt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className={`px-5 py-2 rounded-lg ${
            isDeleting
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          } text-white transition flex items-center justify-center gap-2`}
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default SimpleFlow;
