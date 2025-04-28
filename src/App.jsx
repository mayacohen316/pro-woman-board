import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import SimpleFlow from "./components/SimpleFlow";
import AddEntityModal from "./components/AddEntityModal";
import AddTextBubbleModal from "./components/AddTextBubbleModal";
import UploadImageModal from "./components/UploadImageModal";
import AddEmojiModal from "./components/AddEmojiModal";
import { ReactFlowProvider, useReactFlow } from "reactflow";
import { useRef } from "react";

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

  const fetchData = async () => {
    setIsLoading(true);
    const [
      { data: entityData },
      { data: bubbleData },
      { data: imageData },
      { data: emojiData },
    ] = await Promise.all([
      supabase.from("entities").select("*"),
      supabase.from("text_bubbles").select("*"),
      supabase.from("images").select("*"),
      supabase.from("emojis").select("*"),
    ]);

    setEntities(entityData || []);
    setTextBubbles(bubbleData || []);
    setImages(imageData || []);
    setEmojis(emojiData || []);
    setIsLoading(false);
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
          onDelete: (nodeData) => {
            setNodeToDelete(nodeData.id);
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
          onDelete: (nodeData) => {
            setNodeToDelete(nodeData);
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
          onDelete: (nodeData) => {
            setNodeToDelete(nodeData);
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
          onDelete: (nodeData) => {
            setNodeToDelete(nodeData);
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
    // מגדירים את המיני לודר
    setIsLoading(true); // הדלקת הלודר

    const newBubble = {
      text: newBubbleData.text,
      targetId: newBubbleData.targetId,
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 600),
    };

    try {
      // הכנסה ל-DB
      const { data, error } = await supabase
        .from("text_bubbles")
        .insert([newBubble])
        .select();

      if (error) {
        console.error(
          "❌ Error inserting text bubble:",
          error.message || error
        );
        return;
      }

      console.log("✅ Text bubble added:", data[0]);

      const insertedBubble = data[0];

      // עדכון סטייט הבועות
      setTextBubbles((prev) => [...prev, insertedBubble]);

      // עדכון הסטייט של nodes (הוספת טקסט לגריד)
      setNodes((prevNodes) => [
        ...prevNodes,
        {
          id: insertedBubble.id,
          type: "basic", // סוג הבועה
          position: { x: insertedBubble.x, y: insertedBubble.y },
          data: { label: insertedBubble.text },
        },
      ]);

      // עדכון הסטייט של edges (יצירת קשר בין הבועה ל-targetId)
      setEdges((prevEdges) => [
        ...prevEdges,
        {
          id: `edge-${insertedBubble.id}`,
          source: insertedBubble.id,
          target: insertedBubble.targetId, // קשר בין הבועה ל-entity
          sourceHandle: null,
          targetHandle: null,
        },
      ]);

      // עדכון התצוגה (הגריד יתעדכן לפי הצורך)
      const reactFlow = reactFlowInstance.current;
      if (reactFlow) {
        reactFlow.fitView({ padding: 0.2 });
      }
    } catch (err) {
      console.error("❌ Error saving text bubble:", err);
    } finally {
      setIsLoading(false); // כיבוי הלודר אחרי שמירה
      setShowTextBubbleModal(false); // סגירת המודאל אחרי השמירה
    }
  };

  const handleSaveImage = async (newImageData) => {
    setIsSaving(true); // הדלקת הלודר

    const newImage = {
      url: newImageData.url,
      targetId: newImageData.targetId,
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 600),
    };

    try {
      const { data, error } = await supabase
        .from("images")
        .insert([newImage])
        .select();

      if (error) {
        console.error("❌ Error inserting image:", error.message || error);
        return;
      }

      console.log("✅ Image added:", data[0]);

      // הוספת התמונה לסטייט
      setImages((prevImages) => [...prevImages, data[0]]);

      // המתנה לפני ריפרוש הנתונים
      setTimeout(() => {
        // ריפרוש כל הנתונים
        fetchData(); // מחדש את כל ה-entities, images, bubbles וה-emojis
      }, 2000); // המתן 2 שניות לפני הריפרוש

      setShowImageModal(false); // סגירת המודל אחרי השמירה
    } catch (err) {
      console.error("❌ Error saving image:", err);
    } finally {
      setIsSaving(false); // כיבוי הלודר
    }
  };

  const handleSaveEmoji = async (newEmojiData) => {
    setIsLoading(true); // הדלקת לודר

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
      console.error("❌ Error inserting emoji:", error.message || error);
      setIsLoading(false); // כיבוי לודר במקרה של טעות
      return;
    }

    console.log("✅ Emoji added:", data[0]);

    const insertedEmoji = data[0];

    // עדכון הסטייט של emojis
    setEmojis((prev) => [...prev, insertedEmoji]);

    // עדכון הסטייט של nodes כך שהאימוג'י יתווסף לגריד
    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: insertedEmoji.id,
        type: "emoji", // סוג האימוג'י
        position: { x: insertedEmoji.x, y: insertedEmoji.y },
        data: { label: insertedEmoji.symbol },
      },
    ]);

    // עדכון הסטייט של edges, יצירת קשר אם יש צורך
    setEdges((prevEdges) => [
      ...prevEdges,
      {
        id: `edge-${insertedEmoji.id}`,
        source: insertedEmoji.id,
        target: insertedEmoji.targetId,
        sourceHandle: null,
        targetHandle: null,
      },
    ]);

    setIsLoading(false); // כיבוי לודר
  };

  const handleSaveEntity = async (newEntityData) => {
    setIsSaving(true); // הדלקת הלודר

    try {
      // שמירה ל-DB
      const { data, error } = await supabase
        .from("entities")
        .insert([newEntityData])
        .select();

      if (error) {
        console.error("❌ Error inserting entity:", error.message || error);
        return;
      }

      console.log("✅ Entity added:", data[0]);

      // הוספת ה-entity לסטייט
      setEntities((prev) => [...prev, data[0]]);
      setNodes((prev) => [
        ...prev,
        {
          id: data[0].id,
          type: "entity",
          position: { x: data[0].x, y: data[0].y },
          data: { label: data[0].name, address: data[0].address },
        },
      ]);

      // המתנה לפני ריפרוש הנתונים
      setTimeout(() => {
        // ריפרוש כל הנתונים
        fetchData(); // מחדש את כל ה-entities, images, bubbles וה-emojis
      }, 2000); // המתן 2 שניות לפני הריפרוש
    } catch (err) {
      console.error("❌ Error saving entity:", err);
    } finally {
      setIsSaving(false); // כיבוי הלודר
      setShowAddEntityModal(false); // סגירת המודל
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedNodeId) return;

    const nodeToDelete = nodes.find((n) => n.id === selectedNodeId);
    if (!nodeToDelete) return;

    setIsDeleting(true);
    console.log("Deleting node:", nodeToDelete);

    try {
      if (nodeToDelete.type === "entity") {
        // מחיקת פריטי הקישור: text_bubbles, images, emojis
        const relatedEdges = edges.filter((e) => e.target === nodeToDelete.id);
        const relatedIds = relatedEdges.map((e) => e.source);

        console.log("Related nodes to delete:", relatedIds);

        // מחיקת הסטייט המקומי לפני מחיקת ה-DB
        setTextBubbles((prev) =>
          prev.filter((bub) => !relatedIds.includes(bub.id))
        );
        setImages((prev) => prev.filter((img) => !relatedIds.includes(img.id)));
        setEmojis((prev) => prev.filter((emo) => !relatedIds.includes(emo.id)));
        setEntities((prev) => prev.filter((ent) => ent.id !== nodeToDelete.id));

        // מחיקת כל הקישורים ב-DB
        await Promise.all(
          relatedIds.map(async (id) => {
            await supabase.from("text_bubbles").delete().eq("id", id);
            await supabase.from("images").delete().eq("id", id);
            await supabase.from("emojis").delete().eq("id", id);
          })
        );

        // מחיקת ה-entity
        await supabase.from("entities").delete().eq("id", nodeToDelete.id);

        console.log("Deleted entity from DB:", nodeToDelete.id);
      } else {
        // מחיקת פריט רגיל (textBubble, emoji, image)
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

        // מחיקת הסטייט המקומי
        setStateFunction((prev) =>
          prev.filter((item) => item.id !== selectedNodeId)
        );
        console.log(`Deleted ${tableName} from DB: ${selectedNodeId}`);
      }

      setShowDeleteModal(false);
      setSelectedNodeId(null);
    } catch (error) {
      console.error("❌ Failed to delete node:", error);
      alert("Failed to delete everything properly. Try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteNode = async (node) => {
    const idToDelete = node.id;
    let tableName = "";
    let setStateFunction = null;

    if (node.type === "entity") {
      tableName = "entities";
      setStateFunction = setEntities;
    } else if (node.type === "basic") {
      if (node.data?.label === "Image") {
        tableName = "images";
        setStateFunction = setImages;
      } else {
        tableName = "text_bubbles";
        setStateFunction = setTextBubbles;
      }
    } else if (node.type === "emoji") {
      tableName = "emojis";
      setStateFunction = setEmojis;
    }

    if (!tableName || !setStateFunction) {
      console.error("Unknown node type, cannot delete.");
      return;
    }

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", idToDelete);

      if (error) {
        console.error("❌ Failed to delete from DB:", error);
        alert("Failed to delete from database.");
        return;
      }

      console.log(`✅ Deleted ${idToDelete} from ${tableName}`);

      // 👇 עכשיו מוחקים גם מהסטייט המקומי!
      setStateFunction((prev) => prev.filter((item) => item.id !== idToDelete));
    } catch (err) {
      console.error("❌ Unexpected error during delete:", err);
      alert("Unexpected error during delete.");
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
          onDelete: (nodeData) => {
            setSelectedNodeId(nodeData.id);
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
          onDelete: (nodeData) => {
            setSelectedNodeId(nodeData.id);
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
          onDelete: (nodeData) => {
            setSelectedNodeId(nodeData.id);
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
          onDelete: (nodeData) => {
            setSelectedNodeId(nodeData.id);
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
          ProWoman
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
              setTextBubbles={setTextBubbles}
              setImages={setImages}
              setEmojis={setEmojis}
            />
          </ReactFlowProvider>
        )}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={() => setShowAddEntityModal(true)}
          className="bg-[#750202] text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:bg-[#5c0101] transition-all flex items-center gap-2"
        >
          ➕ Add Entity
        </button>

        <button
          onClick={() => setShowTextBubbleModal(true)}
          className="bg-[#750202] text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:bg-[#5c0101] transition-all flex items-center gap-2"
        >
          📝 Write Something Nice
        </button>

        <button
          onClick={() => setShowImageModal(true)}
          className="bg-[#750202] text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:bg-[#5c0101] transition-all flex items-center gap-2"
        >
          📷 Add Image
        </button>

        <button
          onClick={() => setShowEmojiModal(true)}
          className="bg-[#750202] text-white font-semibold px-6 py-3 rounded-2xl shadow-lg hover:bg-[#5c0101] transition-all flex items-center gap-2"
        >
          😀 Add Emoji
        </button>
      </div>

      {showAddEntityModal && (
        <AddEntityModal
          onClose={() => setShowAddEntityModal(false)}
          onSave={handleSaveEntity}
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
          isEntity={nodes.find((n) => n.id === nodeToDelete)?.type === "entity"}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default App;
