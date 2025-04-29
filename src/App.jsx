import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import SimpleFlow from "./components/SimpleFlow";
import AddEntityModal from "./components/AddEntityModal";
import AddTextBubbleModal from "./components/AddTextBubbleModal";
import UploadImageModal from "./components/UploadImageModal";
import AddEmojiModal from "./components/AddEmojiModal";
import { ReactFlowProvider, useReactFlow } from "reactflow";
import { useRef } from "react";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

const App = () => {
  const [entities, setEntities] = useState([]);
  const [textBubbles, setTextBubbles] = useState([]);
  const [images, setImages] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState(null); // נשמור פה את האובייקט שמבקשים למחוק

  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [showTextBubbleModal, setShowTextBubbleModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const reactFlowInstance = useRef(null);
  const [newlyAddedNodes, setNewlyAddedNodes] = useState([]);
  const [newlyAddedEdges, setNewlyAddedEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isSaving, setIsSaving] = useState(false); // הגדרת הסטייט של isSaving
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: entityData, error: entityError },
        { data: bubbleData, error: bubbleError },
        { data: imageData, error: imageError },
        { data: emojiData, error: emojiError },
      ] = await Promise.all([
        supabase.from("entities").select("*"),
        supabase.from("text_bubbles").select("*"),
        supabase.from("images").select("*"),
        supabase.from("emojis").select("*"),
      ]);

      if (entityError || bubbleError || imageError || emojiError) {
        console.error(
          "❌ Error fetching data:",
          entityError || bubbleError || imageError || emojiError
        );
      }

      setEntities(entityData || []);
      setTextBubbles(bubbleData || []);
      setImages(imageData || []);
      setEmojis(emojiData || []);
    } catch (error) {
      console.error("❌ Unexpected fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // קריאה ראשונית
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const newNodes = [
      ...entities.map((e) => ({
        id: e.id,
        type: "entity",
        position: {
          x: e.x ?? Math.random() * 500,
          y: e.y ?? Math.random() * 500,
        },
        data: {
          label: e.name,
          address: e.address,
          contribution: e.contribution,
          linkedin: e.linkedin,
          onDelete: () => {
            setNodeToDelete({
              id: e.id,
              type: "entity",
              data: {
                label: e.name,
                address: e.address,
                contribution: e.contribution,
                linkedin: e.linkedin,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
      ...textBubbles.map((b) => ({
        id: b.id,
        type: "basic",
        position: { x: b.x ?? 0, y: b.y ?? 0 },
        data: {
          label: b.text,
          onDelete: () => {
            setNodeToDelete({
              id: b.id,
              type: "basic",
              data: {
                label: b.text,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),

      ...images.map((img) => ({
        id: img.id,
        type: "basic",
        position: { x: img.x ?? 0, y: img.y ?? 0 },
        data: {
          label: "Image",
          url: img.url,
          onDelete: () => {
            setNodeToDelete({
              id: img.id,
              type: "basic",
              data: {
                label: "Image",
                url: img.url,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),

      ...emojis.map((emo) => ({
        id: emo.id,
        type: "emoji",
        position: { x: emo.x ?? 0, y: emo.y ?? 0 },
        data: {
          label: emo.symbol,
          onDelete: () => {
            setNodeToDelete({
              id: emo.id,
              type: "emoji",
              data: {
                label: emo.symbol,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
    ];

    setNodes(newNodes);
  }, [entities, textBubbles, images, emojis]);

  useEffect(() => {
    const newEdges = [
      ...textBubbles.map((b) => ({
        id: `edge-${b.id}`,
        source: b.id,
        target: b.targetId,
        sourceHandle: null,
        targetHandle: null,
      })),
      ...images.map((img) => ({
        id: `edge-${img.id}`,
        source: img.id,
        target: img.targetId,
        sourceHandle: null,
        targetHandle: null,
      })),
      ...emojis.map((emo) => ({
        id: `edge-${emo.id}`,
        source: emo.id,
        target: emo.targetId,
        sourceHandle: null,
        targetHandle: null,
      })),
    ];

    setEdges(newEdges);
  }, [textBubbles, images, emojis]);

  // 🛠 פונקציה שמכניסה entity ל-DB
  // פונקציה להוספת אובייקט חדש לגריד
  const handleAddEntity = async (newEntityData) => {
    const newEntity = {
      name: newEntityData.name,
      address: newEntityData.address,
      contribution: newEntityData.contribution,
      linkedin: newEntityData.linkedin,
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 600),
    };

    const { data, error } = await supabase
      .from("entities")
      .insert([newEntity])
      .select();

    if (error) {
      console.error("❌ Error inserting entity:", error.message || error);
    } else {
      console.log("✅ Entity added:", data[0]);

      // הוספת אובייקט לסטייט של ה-entities
      setEntities((prev) => [...prev, data[0]]);
      // עדכון הסטייט של nodes כך שיתעדכן הגריד
      setNodes((prev) => [
        ...prev,
        {
          id: data[0].id,
          type: "entity",
          position: { x: data[0].x, y: data[0].y },
          data: { label: data[0].name, address: data[0].address },
        },
      ]);

      // לדאוג שנעשה scroll ל-Entity החדש
      setTimeout(() => {
        const reactFlow = window.reactFlowInstance;
        if (reactFlow) {
          reactFlow.setCenter(data[0].x, data[0].y, {
            zoom: 1.5,
            duration: 500,
          });
        }
      }, 300);
    }
  };

  const handleSaveTextBubble = async (newBubbleData) => {
    setIsSaving(true);
    try {
      const newBubble = {
        text: newBubbleData.text,
        targetId: newBubbleData.targetId,
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
      };

      const { data, error } = await supabase
        .from("text_bubbles")
        .insert([newBubble])
        .select();

      if (error) {
        console.error("❌ Error inserting text bubble:", error);
        return;
      }

      if (data && data.length > 0) {
        setLastCreatedId(data[0].id); // ✅ זום לבועה החדשה
      }

      await fetchData(); // רענון מלא
    } catch (err) {
      console.error("❌ Error saving text bubble:", err);
    } finally {
      setIsSaving(false);
      setShowTextBubbleModal(false);
    }
  };

  const handleSaveImage = async (newImageData) => {
    setIsSaving(true);
    try {
      const newImage = {
        url: newImageData.url,
        targetId: newImageData.targetId,
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
      };

      const { data, error } = await supabase
        .from("images")
        .insert([newImage])
        .select();

      if (error) {
        console.error("❌ Error inserting image:", error);
        return;
      }

      if (data && data.length > 0) {
        setLastCreatedId(data[0].id); // ✅ זום לאובייקט החדש
      }

      await fetchData(); // רענון מלא
    } catch (err) {
      console.error("❌ Error saving image:", err);
    } finally {
      setIsSaving(false);
      setShowImageModal(false);
    }
  };

  const handleSaveEmoji = async (newEmojiData) => {
    setIsSaving(true);
    try {
      const newEmoji = {
        symbol: newEmojiData.symbol,
        targetId: newEmojiData.targetId,
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
      };

      const { data, error } = await supabase
        .from("emojis")
        .insert([newEmoji])
        .select();

      if (error) {
        console.error("❌ Error inserting emoji:", error);
        return;
      }

      if (data && data.length > 0) {
        setLastCreatedId(data[0].id); // ✅ שמירת ה-id לזום
      }

      await fetchData(); // רענון מלא
    } catch (err) {
      console.error("❌ Error saving emoji:", err);
    } finally {
      setIsSaving(false);
      setShowEmojiModal(false);
    }
  };

  const handleSaveEntity = async (newEntityData) => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("entities")
        .insert([newEntityData])
        .select();
      if (data && data[0]) {
        setLastCreatedId(data[0].id); // 👈 שמירת ה-ID של האובייקט החדש
      }
      if (error || !data || data.length === 0) {
        console.error("❌ Error inserting entity:", error);
        return;
      }

      await fetchData(); // טען מחדש את הנתונים מה-DB
      setShowAddEntityModal(false);

      // 🔍 ביצוע זום לישות שנוספה
      const newEntity = data[0];
      setTimeout(() => {
        if (window.reactFlowInstance?.setCenter) {
          window.reactFlowInstance.setCenter(newEntity.x, newEntity.y, {
            zoom: 1.8,
            duration: 800,
          });
        }
      }, 300);
    } catch (err) {
      console.error("❌ Error saving entity:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!nodeToDelete) return;

    setIsDeleting(true);

    try {
      const { id, type, data } = nodeToDelete;

      if (!id || !type) {
        console.error("❌ Missing id or type on nodeToDelete", nodeToDelete);
        return;
      }

      let tableName = "";

      if (type === "entity") {
        tableName = "entities";

        // אם זה Entity - מוחקים גם את כל הילדים
        await Promise.all([
          supabase.from("text_bubbles").delete().eq("targetId", id),
          supabase.from("images").delete().eq("targetId", id),
          supabase.from("emojis").delete().eq("targetId", id),
        ]);
      } else if (type === "basic") {
        // אם זה basic צריך לבדוק אם זה תמונה או טקסט
        if (data?.url) {
          tableName = "images";
        } else {
          tableName = "text_bubbles";
        }
      } else if (type === "emoji") {
        tableName = "emojis";
      } else {
        console.error("❌ Unknown type:", type);
        return;
      }

      if (tableName) {
        const { error } = await supabase.from(tableName).delete().eq("id", id);
        if (error) {
          console.error("❌ Error deleting from", tableName, error);
        }
      }

      setLastCreatedId(null);
      await fetchData();

      setShowDeleteModal(false);
      setNodeToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("❌ Error deleting node:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteNode = async (node) => {
    let tableName = "";

    if (node.type === "entity") tableName = "entities";
    else if (node.type === "basic")
      tableName = node.data.label === "Image" ? "images" : "text_bubbles";
    else if (node.type === "emoji") tableName = "emojis";

    if (!tableName) return console.error("Unknown node type, cannot delete.");

    try {
      await supabase.from(tableName).delete().eq("id", node.id);
      await fetchData(); // רענון אחרי מחיקה
    } catch (err) {
      console.error("❌ Error deleting node:", err);
    }
  };

  const updateNodesAndEdges = (
    entitiesList,
    bubblesList,
    imagesList,
    emojisList
  ) => {
    const newNodes = [
      ...entitiesList.map((e) => ({
        id: e.id,
        type: "entity",
        position: { x: e.x ?? Math.random() * 500, y: e.y ?? 0 },
        data: {
          label: e.name,
          address: e.address,
          contribution: e.contribution,
          linkedin: e.linkedin,
          onDelete: () => {
            setNodeToDelete({
              id: e.id,
              type: "entity",
              data: {
                label: e.name,
                address: e.address,
                contribution: e.contribution,
                linkedin: e.linkedin,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
      ...bubblesList.map((b) => ({
        id: b.id,
        type: "basic",
        position: { x: b.x ?? 0, y: b.y ?? 0 },
        data: {
          label: b.text,
          onDelete: () => {
            setNodeToDelete({
              id: b.id,
              type: "basic",
              data: {
                label: b.text,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
      ...imagesList.map((img) => ({
        id: img.id,
        type: "basic",
        position: { x: img.x ?? 0, y: img.y ?? 0 },
        data: {
          label: "Image",
          url: img.url,
          onDelete: () => {
            setNodeToDelete({
              id: img.id,
              type: "basic",
              data: {
                label: "Image",
                url: img.url,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
      ...emojisList.map((emo) => ({
        id: emo.id,
        type: "emoji",
        position: { x: emo.x ?? 0, y: emo.y ?? 0 },
        data: {
          label: emo.symbol,
          onDelete: () => {
            setNodeToDelete({
              id: emo.id,
              type: "emoji",
              data: {
                label: emo.symbol,
              },
            });
            setShowDeleteModal(true);
          },
        },
      })),
    ];

    const newEdges = [
      ...bubblesList.map((b) => ({
        id: `edge-${b.id}`,
        source: b.id,
        target: b.targetId,
      })),
      ...imagesList.map((img) => ({
        id: `edge-${img.id}`,
        source: img.id,
        target: img.targetId,
      })),
      ...emojisList.map((emo) => ({
        id: `edge-${emo.id}`,
        source: emo.id,
        target: emo.targetId,
      })),
    ];

    setNodes(newNodes);
    setEdges(newEdges);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow p-4 flex justify-center items-center">
        <h1 className="text-3xl font-bold text-[#800020] tracking-wide">
          Rooted
        </h1>
      </header>

      <main className="flex-1 overflow-hidden">
        {isLoading || nodes.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-solid"></div>
          </div>
        ) : (
          <ReactFlowProvider>
            <SimpleFlow
              nodes={nodes}
              edges={edges}
              lastCreatedId={lastCreatedId}
              setTextBubbles={setTextBubbles}
              setImages={setImages}
              setEmojis={setEmojis}
            />
          </ReactFlowProvider>
        )}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-4">
        <button
          onClick={() => {
            setIsSaving(false);
            setShowAddEntityModal(true);
          }}
          className="bg-[#9d174d] hover:bg-[#831843] text-white px-2 py-2 sm:px-4 sm:py-2 rounded text-xl sm:text-base shadow-md hover:shadow-lg transition"
        >
          ➕<span className="hidden sm:inline"> Add Entity</span>
        </button>
        <button
          onClick={() => setShowTextBubbleModal(true)}
          className="bg-[#9d174d] hover:bg-[#831843] text-white px-2 py-2 sm:px-4 sm:py-2 rounded text-xl sm:text-base shadow-md hover:shadow-lg transition"
        >
          📝<span className="hidden sm:inline"> Write something nice</span>
        </button>
        <button
          onClick={() => setShowImageModal(true)}
          className="bg-[#9d174d] hover:bg-[#831843] text-white px-2 py-2 sm:px-4 sm:py-2 rounded text-xl sm:text-base shadow-md hover:shadow-lg transition"
        >
          📷<span className="hidden sm:inline"> Add Image</span>
        </button>
        <button
          onClick={() => setShowEmojiModal(true)}
          className="bg-[#9d174d] hover:bg-[#831843] text-white px-2 py-2 sm:px-4 sm:py-2 rounded text-xl sm:text-base shadow-md hover:shadow-lg transition"
        >
          😀<span className="hidden sm:inline"> Add Emoji</span>
        </button>
      </div>

      {showAddEntityModal && (
        <AddEntityModal
          onClose={() => setShowAddEntityModal(false)}
          onSave={handleSaveEntity}
          isSaving={isSaving}
        />
      )}

      {showTextBubbleModal && (
        <AddTextBubbleModal
          onClose={() => setShowTextBubbleModal(false)}
          onSave={(newData) => handleSaveTextBubble(newData)} // 🛠️ שינוי כאן
          entities={entities}
        />
      )}

      {showImageModal && (
        <UploadImageModal
          onClose={() => setShowImageModal(false)}
          onSave={handleSaveImage}
          setIsSaving={setIsSaving}
          isSaving={isSaving}
          setShowImageModal={setShowImageModal} // הוספתי את setShowImageModal כפרופס
          entities={entities}
        />
      )}

      {showEmojiModal && (
        <AddEmojiModal
          onClose={() => setShowEmojiModal(false)}
          onSave={(newData) => handleSaveEmoji(newData)} // 🛠️ שינוי כאן
          entities={entities}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          isEntity={nodeToDelete?.type === "entity"}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default App;
