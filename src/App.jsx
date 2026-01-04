import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost,
  Heart,
  Plus,
  Send,
  User,
  Filter,
  Eye,
  Flame,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const CATEGORIES = ["All", "Intimate", "Secrets", "Desires", "Midnight Whispers"];
const GENDERS = ["All", "Male", "Female", "Trans"];

function App() {
  const [confessions, setConfessions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newConfession, setNewConfession] = useState("");
  const [selectedGender, setSelectedGender] = useState("Female");
  const [selectedCategory, setSelectedCategory] = useState("Intimate");

  /* =======================
     FETCH INITIAL DATA
  ======================= */
  useEffect(() => {
    const fetchConfessions = async () => {
      const { data, error } = await supabase
        .from("shadows")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setConfessions(data);
      else console.error(error);
    };

    fetchConfessions();
  }, []);

  /* =======================
     REALTIME SUBSCRIPTION
  ======================= */
  useEffect(() => {
    const channel = supabase
      .channel("realtime-shadows")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "shadows" },
        (payload) => {
          setConfessions((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* =======================
     POST NEW CONFESSION
  ======================= */
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

  const filteredConfessions = confessions.filter(
    (c) =>
      (filterCategory === "All" || c.aura === filterCategory) &&
      (filterGender === "All" || c.perspective === filterGender)
  );

  return (
    <div className="min-h-screen pb-20">
      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-[100] px-8 py-5 mb-12">
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
              className="glass p-8 mb-8"
            >
              <span className="tag">
                {conf.aura} • {conf.perspective}
              </span>
              <p className="text-xl italic mt-6">"{conf.content}"</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div className="fixed inset-0 bg-black/90 flex items-center justify-center">
            <motion.div className="glass p-10 max-w-xl w-full">
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
                  placeholder="Tell the darkness…"
                  className="w-full h-48 mb-6"
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
