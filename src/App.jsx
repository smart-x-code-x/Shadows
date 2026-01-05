import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost,
  Plus,
  Send,
  User,
  Filter,
  Eye,
  Flame,
  Heart,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import { supabase } from "./lib/supabase";

/* UI CONSTANTS */
const CATEGORIES = ["All", "Intimate", "Secrets", "Desires", "Midnight Whispers"];
const GENDERS = ["All", "Male", "Female", "Trans"];

function App() {
  /* GLOBAL DATA */
  const [confessions, setConfessions] = useState([]);

  /* UI STATE */
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newConfession, setNewConfession] = useState("");
  const [selectedGender, setSelectedGender] = useState("Female");
  const [selectedCategory, setSelectedCategory] = useState("Intimate");

  /* =========================
     FETCH SHADOWS + REACTIONS
     ========================= */
  const fetchShadows = async () => {
    const { data, error } = await supabase
      .from("shadows")
      .select(
        `
        id,
        content,
        perspective,
        aura,
        created_at,
        reactions (
          id,
          type
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error) setConfessions(data);
    else console.error(error);
  };

  /* INITIAL LOAD */
  useEffect(() => {
    fetchShadows();
  }, []);

  /* REALTIME: NEW SHADOWS */
  useEffect(() => {
    const channel = supabase
      .channel("realtime-shadows")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shadows" },
        (payload) => {
          setConfessions((prev) => [
            { ...payload.new, reactions: [] },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* REALTIME: REACTIONS */
  useEffect(() => {
    const channel = supabase
      .channel("realtime-reactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        () => {
          fetchShadows(); // simple & safe
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* =========================
     POST NEW SHADOW
     ========================= */
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newConfession.trim()) return;

    const { error } = await supabase.from("shadows").insert({
      content: newConfession,
      perspective: selectedGender,
      aura: selectedCategory,
    });

    if (error) {
      console.error("Insert failed:", error);
      return;
    }

    setNewConfession("");
    setShowPostModal(false);
  };

  /* =========================
     ADD REACTION
     ========================= */
  const handleReaction = async (shadowId, type) => {
    const { error } = await supabase.from("reactions").insert({
      shadow_id: shadowId,
      type,
    });

    if (error) console.error(error);
  };

  /* COUNT REACTIONS */
  const countReactions = (reactions, type) =>
    reactions?.filter((r) => r.type === type).length || 0;

  /* FILTERS */
  const filteredConfessions = confessions.filter(
    (c) =>
      (filterCategory === "All" || c.aura === filterCategory) &&
      (filterGender === "All" || c.perspective === filterGender)
  );

  return (
    <div className="min-h-screen pb-20">
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-8 py-5 mb-12">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ghost size={28} />
            <h1 className="text-3xl font-black">SHADOWS</h1>
          </div>
          <button
            onClick={() => setShowPostModal(true)}
            className="btn-primary px-6 py-3 rounded-full flex gap-2"
          >
            <Plus /> Unveil
          </button>
        </div>
      </nav>

      {/* FILTERS */}
      <div className="flex gap-6 justify-center mb-12">
        <div className="glass px-6 py-3 flex gap-2">
          <Filter />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="glass px-6 py-3 flex gap-2">
          <User />
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            {GENDERS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FEED */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 px-6">
        <AnimatePresence>
          {filteredConfessions.map((conf) => (
            <motion.div
              key={conf.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass p-8 mb-8 break-inside-avoid"
            >
              <div className="flex justify-between text-xs mb-4">
                <span>
                  {conf.aura} • {conf.perspective}
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {conf.reactions?.length || 0}
                </span>
              </div>

              <p className="text-xl italic mb-6">"{conf.content}"</p>

              {/* REACTIONS */}
              <div className="flex gap-6">
                <button onClick={() => handleReaction(conf.id, "flame")}>
                  <Flame /> {countReactions(conf.reactions, "flame")}
                </button>
                <button onClick={() => handleReaction(conf.id, "heart")}>
                  <Heart /> {countReactions(conf.reactions, "heart")}
                </button>
                <button onClick={() => handleReaction(conf.id, "whisper")}>
                  <MessageCircle />{" "}
                  {countReactions(conf.reactions, "whisper")}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* POST MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <motion.div className="glass p-10 max-w-xl w-full relative">
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-6 right-6"
              >
                <MoreHorizontal size={32} />
              </button>

              <form onSubmit={handlePost}>
                <textarea
                  value={newConfession}
                  onChange={(e) => setNewConfession(e.target.value)}
                  placeholder="Whisper into the darkness..."
                  className="w-full h-48 mb-6"
                  autoFocus
                />

                <div className="flex gap-4 mb-6">
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    {GENDERS.filter((g) => g !== "All").map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <button className="btn-primary w-full py-4 flex gap-2 justify-center">
                  <Send /> Commit to Darkness
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
