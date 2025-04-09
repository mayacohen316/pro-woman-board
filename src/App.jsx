import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

import EntityCard from "./components/EntityCard";
import AddEntityModal from "./components/AddEntityModal";
import AddTextBubbleModal from "./components/AddTextBubbleModal";
import UploadImageModal from "./components/UploadImageModal";
import ConnectionLine from "./components/ConnectionLine";
import DraggableWrapper from "./components/DraggableWrapper";
import AddEmojiModal from "./components/AddEmojiModal";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const App = () => {
  const [entities, setEntities] = useState([
    {
      id: "1",
      name: "Noa",
      address: "Tel Aviv",
      contribution: "Creativity",
      x: 100,
      y: 100,
    },
    {
      id: "2",
      name: "Roni",
      address: "Haifa",
      contribution: "Tech mentor",
      x: 350,
      y: 250,
    },
    {
      id: "3",
      name: "Tamar",
      address: "Jerusalem",
      contribution: "Community builder",
      x: 100,
      y: 500,
    },
  ]);

  const [textBubbles, setTextBubbles] = useState([]);
  const [editingTextBubbleId, setEditingTextBubbleId] = useState(null);
  const [images, setImages] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [selectedEmojiId, setSelectedEmojiId] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showTextBubbleModal, setShowTextBubbleModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showEditEntityModal, setShowEditEntityModal] = useState(false);
  const entityRefs = useRef({});
  const bubbleRefs = useRef({});
  const imageRefs = useRef({});
  const emojiRefs = useRef({});
  const canvasRef = useRef(null);

  const addEntity = async (entity) => {
    const newEntity = {
      ...entity,
      id: crypto.randomUUID(),
      x: entity.x || 50,
      y: entity.y || 50,
    };

    const { error } = await supabase.from("entities").insert(newEntity);
    if (error) {
      console.error("Error inserting entity:", error);
      return;
    }

    setEntities([...entities, newEntity]);
  };

  const updateEntity = async (updatedEntity) => {
    const { error } = await supabase
      .from("entities")
      .update({
        name: updatedEntity.name,
        address: updatedEntity.address,
        contribution: updatedEntity.contribution,
        linkedin: updatedEntity.linkedin,
      })
      .eq("id", updatedEntity.id);

    if (error) {
      console.error("Error updating entity:", error);
      return;
    }

    setEntities((prev) =>
      prev.map((e) => (e.id === updatedEntity.id ? updatedEntity : e))
    );
    setSelectedEntityId(null);
    setShowEditEntityModal(false);
  };

  const deleteEntity = async (id) => {
    console.log("🗑️ Attempting to delete entity:", id);

    // קודם מוחקים את כל מה שקשור
    const { error: textError } = await supabase
      .from("text_bubbles")
      .delete()
      .eq("targetId", id);
    const { error: imageError } = await supabase
      .from("images")
      .delete()
      .eq("targetId", id);
    const { error: emojiError } = await supabase
      .from("emojis")
      .delete()
      .eq("targetId", id);

    // רק אחרי זה מוחקים את ה־Entity
    const { error: entityError } = await supabase
      .from("entities")
      .delete()
      .eq("id", id);

    if (entityError || textError || imageError || emojiError) {
      console.error("❌ Error deleting entity or related items:", {
        entityError,
        textError,
        imageError,
        emojiError,
      });
    } else {
      console.log("✅ Entity and all related items deleted");

      // עדכון ה־UI אחרי הצלחה
      setEntities((prev) => prev.filter((e) => e.id !== id));
      setTextBubbles((prev) => prev.filter((b) => b.targetId !== id));
      setImages((prev) => prev.filter((i) => i.targetId !== id));
      setEmojis((prev) => prev.filter((e) => e.targetId !== id));
      setSelectedEntityId(null);
    }
  };

  const addTextBubble = async (bubble) => {
    const { data, error } = await supabase
      .from("text_bubbles")
      .insert([{ ...bubble, x: bubble.x || 50, y: bubble.y || 50 }])
      .select()
      .single();

    if (error) {
      console.error("Error adding text bubble:", error);
      return;
    }

    setTextBubbles((prev) => [...prev, data]);
  };

  const deleteTextBubble = async (id) => {
    const { error } = await supabase.from("text_bubbles").delete().eq("id", id);

    if (error) {
      console.error("Error deleting text bubble:", error);
      return;
    }

    setTextBubbles((prev) => prev.filter((b) => b.id !== id));
    setSelectedTextId(null);
  };

  const addImage = async (img) => {
    const newImage = {
      ...img,
      id: crypto.randomUUID(),
      x: img.x || 50,
      y: img.y || 50,
    };

    const { error } = await supabase.from("images").insert([newImage]);

    if (error) {
      console.error("❌ Error adding image:", error);
    } else {
      console.log("✅ Image added to DB");
      setImages((prev) => [...prev, newImage]);
    }
  };

  const deleteImage = async (id) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
    setSelectedImageId(null);

    const { error } = await supabase.from("images").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting image:", error);
    } else {
      console.log("✅ Image deleted from Supabase");
    }
  };

  const addEmoji = async (emoji) => {
    const newEmoji = {
      ...emoji,
      id: crypto.randomUUID(),
      x: emoji.x || 50,
      y: emoji.y || 50,
    };

    setEmojis((prev) => [...prev, newEmoji]);

    const { error } = await supabase.from("emojis").insert([newEmoji]);

    if (error) {
      console.error("❌ Failed to save emoji to DB:", error);
    } else {
      console.log("✅ Emoji saved to DB");
    }
  };

  const deleteEmoji = async (id) => {
    setEmojis((prev) => prev.filter((e) => e.id !== id));
    setSelectedEmojiId(null);

    const { error } = await supabase.from("emojis").delete().eq("id", id);

    if (error) {
      console.error("❌ Error deleting emoji:", error);
    } else {
      console.log("✅ Emoji deleted from Supabase");
    }
  };

  const getAnchorCenter = (ref, containerRef) => {
    if (!ref || !containerRef) return { x: 0, y: 0 };
    const refRect = ref.getBoundingClientRect();
    const containerRect = containerRef.getBoundingClientRect();
    return {
      x: refRect.left - containerRect.left + refRect.width / 2,
      y: refRect.top - containerRect.top + refRect.height / 2,
    };
  };

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchEntities = async () => {
      const { data, error } = await supabase.from("entities").select("*");
      if (error) {
        console.error("Error fetching entities:", error);
      } else {
        setEntities(data);
      }
    };

    fetchEntities();
  }, []);

  useEffect(() => {
    const fetchTextBubbles = async () => {
      const { data, error } = await supabase.from("text_bubbles").select("*");
      if (error) {
        console.error("Error fetching text bubbles:", error);
      } else {
        setTextBubbles(data);
      }
    };

    fetchTextBubbles();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase.from("images").select("*");
      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(data);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    const fetchEmojis = async () => {
      const { data, error } = await supabase.from("emojis").select("*");
      if (error) {
        console.error("❌ Failed to load emojis:", error);
      } else {
        setEmojis(data);
      }
    };

    fetchEmojis();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedConnections = [
        ...textBubbles.map((b) => ({
          from: bubbleRefs.current[b.id],
          to: entityRefs.current[b.targetId],
          color: "deeppink",
        })),
        ...images.map((img) => ({
          from: imageRefs.current[img.id],
          to: entityRefs.current[img.targetId],
          color: "seagreen",
        })),
        ...emojis.map((e) => ({
          from: emojiRefs.current[e.id],
          to: entityRefs.current[e.targetId],
          color: "orange",
        })),
      ];
      setConnections(updatedConnections);
    }, 100);

    return () => clearInterval(interval);
  }, [textBubbles, images, emojis]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow p-4 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-center text-purple-600">
          Pro Woman: Entity Grid
        </h1>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-center gap-4">
          <button
            onClick={() => setShowImageModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-full w-full sm:w-auto"
          >
            📷 Upload Image
          </button>
          <button
            onClick={() => setShowTextBubbleModal(true)}
            className="bg-pink-500 text-white px-4 py-2 rounded-full w-full sm:w-auto"
          >
            📝 Add text bubble
          </button>
          <button
            onClick={() => setShowEmojiModal(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-full w-full sm:w-auto"
          >
            📍 Add emoji
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white w-12 h-12 rounded-full self-center sm:self-auto"
          >
            +
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto relative">
        <svg
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        >
          {connections.map((conn, i) => {
            const from = getAnchorCenter(conn.from, canvasRef.current);
            const to = getAnchorCenter(conn.to, canvasRef.current);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={conn.color}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        <div className="relative w-full h-[2000px] touch-none">
          {/* Entities */}
          {entities.map((entity) => (
            <DraggableWrapper
              key={entity.id}
              id={`entity-${entity.id}`}
              x={entity.x}
              y={entity.y}
              onStop={(x, y) => {
                setEntities((prev) =>
                  prev.map((e) => (e.id === entity.id ? { ...e, x, y } : e))
                );
                supabase
                  .from("entities")
                  .update({ x: Number(x), y: Number(y) }) // 🟢 Number!
                  .eq("id", entity.id)
                  .then(({ error }) => {
                    if (error) {
                      console.error(
                        "❌ Error updating entity position:",
                        error
                      );
                    } else {
                      console.log("✅ Entity position updated");
                    }
                  });
              }}
            >
              <div
                ref={(el) => (entityRefs.current[entity.id] = el)}
                onClick={() => setSelectedEntityId(entity.id)}
              >
                <EntityCard entity={entity} />
                {selectedEntityId === entity.id && (
                  <div className="flex gap-2 mt-1">
                    <button
                      className="text-sm text-blue-600 underline"
                      onClick={() => setShowEditEntityModal(true)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="text-sm text-red-600 underline"
                      onClick={() => deleteEntity(entity.id)}
                    >
                      ✕ Delete
                    </button>
                  </div>
                )}
              </div>
            </DraggableWrapper>
          ))}

          {/* Text Bubbles */}
          {textBubbles.map((bubble) => (
            <DraggableWrapper
              key={bubble.id}
              id={`bubble-${bubble.id}`}
              x={bubble.x}
              y={bubble.y}
              onStop={(x, y) => {
                setTextBubbles((prev) =>
                  prev.map((b) => (b.id === bubble.id ? { ...b, x, y } : b))
                );
                supabase
                  .from("text_bubbles")
                  .update({ x: Number(x), y: Number(y) })
                  .eq("id", bubble.id)
                  .select() // הוספת השורה הזאת עוזרת להבין אם זה עובד
                  .then(({ data, error }) => {
                    if (error) {
                      console.error(
                        "❌ Error updating bubble position:",
                        error
                      );
                    } else {
                      console.log("✅ Text bubble position updated:", data);
                    }
                  });
              }}
            >
              <div
                ref={(el) => (bubbleRefs.current[bubble.id] = el)}
                className="bg-yellow-100 rounded px-3 py-2 text-black w-fit relative"
                onClick={() => setSelectedTextId(bubble.id)}
              >
                {editingTextBubbleId === bubble.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="border px-2 py-1 text-sm"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <button
                      className="text-green-600 text-sm bg-white rounded px-2"
                      onClick={() => {
                        updateTextBubble({ ...bubble, text: editingText });
                      }}
                    >
                      💾
                    </button>
                  </div>
                ) : (
                  <span>{bubble.text}</span>
                )}

                {selectedTextId === bubble.id && (
                  <div className="absolute top-0 right-0 flex gap-1">
                    <button
                      onClick={() => deleteTextBubble(bubble.id)}
                      className="text-red-600 text-sm bg-white rounded"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => {
                        setEditingTextBubbleId(bubble.id);
                        setEditingText(bubble.text); // הכנסה של הטקסט הקיים ל־state
                      }}
                      className="text-blue-600 text-sm bg-white rounded"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
            </DraggableWrapper>
          ))}

          {/* Images */}
          {images.map((img) => (
            <DraggableWrapper
              key={img.id}
              id={`image-${img.id}`}
              x={img.x}
              y={img.y}
              onStop={(x, y) => {
                const updatedImages = images.map((i) =>
                  i.id === img.id ? { ...i, x, y } : i
                );
                setImages(updatedImages);

                supabase
                  .from("images")
                  .update({ x: Number(x), y: Number(y) })
                  .eq("id", img.id)
                  .then(({ error }) => {
                    if (error) {
                      console.error("❌ Error updating image position:", error);
                    } else {
                      console.log("✅ Image position updated");
                    }
                  });
              }}
            >
              <div
                ref={(el) => (imageRefs.current[img.id] = el)}
                onClick={() => setSelectedImageId(img.id)}
                className="w-24 h-24 relative"
              >
                <img
                  src={img.url}
                  alt="linked"
                  className="w-full h-full object-cover rounded shadow"
                />
                {selectedImageId === img.id && (
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-0 right-0 text-red-600 text-sm bg-white rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            </DraggableWrapper>
          ))}

          {/* Emojis */}
          {emojis.map((emoji) => (
            <DraggableWrapper
              key={emoji.id}
              id={`emoji-${emoji.id}`}
              x={emoji.x}
              y={emoji.y}
              onStop={(x, y) => {
                setEmojis((prev) =>
                  prev.map((e) => (e.id === emoji.id ? { ...e, x, y } : e))
                );

                supabase
                  .from("emojis")
                  .update({ x: Number(x), y: Number(y) })
                  .eq("id", emoji.id)
                  .then(({ error }) => {
                    if (error) {
                      console.error("❌ Error updating emoji position:", error);
                    } else {
                      console.log("✅ Emoji position updated");
                    }
                  });
              }}
            >
              <div
                ref={(el) => (emojiRefs.current[emoji.id] = el)}
                onClick={() => setSelectedEmojiId(emoji.id)}
                className="text-3xl relative"
              >
                {emoji.symbol}
                {selectedEmojiId === emoji.id && (
                  <button
                    onClick={() => deleteEmoji(emoji.id)}
                    className="absolute top-0 right-0 text-red-600 text-sm bg-white rounded"
                  >
                    ✕
                  </button>
                )}
              </div>
            </DraggableWrapper>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <AddEntityModal
          onClose={() => setShowAddModal(false)}
          onSave={addEntity}
        />
      )}
      {showEditEntityModal && (
        <AddEntityModal
          onClose={() => setShowEditEntityModal(false)}
          onSave={updateEntity}
          entity={entities.find((e) => e.id === selectedEntityId)}
        />
      )}
      {showTextBubbleModal && (
        <AddTextBubbleModal
          onClose={() => setShowTextBubbleModal(false)}
          onSave={addTextBubble}
          entities={entities}
        />
      )}
      {showImageModal && (
        <UploadImageModal
          onClose={() => setShowImageModal(false)}
          onSave={addImage}
          entities={entities}
        />
      )}
      {showEmojiModal && (
        <AddEmojiModal
          onClose={() => setShowEmojiModal(false)}
          onSave={addEmoji}
          entities={entities}
        />
      )}
    </div>
  );
};

export default App;
