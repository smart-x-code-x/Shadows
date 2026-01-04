import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ghost, Heart, Plus, Send, User, Filter, Eye,
  Flame, MessageCircle, Share2, MoreHorizontal
} from 'lucide-react';

/* STATIC UI OPTIONS (not stored in DB) */
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
     FETCH + REALTIME (CORE)
     ========================= */
  useEffect(() => {
    // Initial fetch
    const fetchShadows = async () => {
      const { data, error } = await supabase
        .from('shadows')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setConfessions(data);
      else console.error(error);
    };

    fetchShadows();

    // Realtime subscription
    const channel = supabase
      .channel('realtime-shadows')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shadows' },
        (payload) => {
          setConfessions(prev => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* =========================
     POST NEW SHADOW
     ========================= */
  const handlePost = async (e) => {
    e.preventDefault();
    if (!newConfession.trim()) return;

    const { error } = await supabase.from('shadows').insert({
      content: newConfession,
      gender: selectedGender,
      category: selectedCategory,
      reactions: { flame: 0, heart: 0, whisper: 0 },
      views: Math.floor(Math.random() * 200) + 50
    });

    if (!error) {
      setNewConfession("");
      setShowPostModal(false);
    } else {
      console.error(error);
    }
  };

  /* UI-ONLY REACTIONS (not persisted yet) */
  const handleReaction = (id, type) => {
    setConfessions(confessions.map(c => {
      if (c.id === id) {
        return {
          ...c,
          reactions: {
            ...c.reactions,
            [type]: (c.reactions?.[type] || 0) + 1
          }
        };
      }
      return c;
    }));
  };

  /* FILTERS */
  const filteredConfessions = confessions.filter(c =>
    (filterCategory === "All" || c.category === filterCategory) &&
    (filterGender === "All" || c.gender === filterGender)
  );

  return (
    <div className="min-h-screen pb-20">

      {/* NAVBAR */}
      <nav className="glass sticky top-0 z-50 px-8 py-5 mb-12">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ghost size={30} />
            <h1 className="text-3xl font-black">SHADOWS</h1>
          </div>
          <button onClick={() => setShowPostModal(true)} className="btn-primary flex gap-2">
            <Plus /> Unveil
          </button>
        </div>
      </nav>

      {/* FILTERS */}
      <div className="flex justify-center gap-6 mb-12">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
          {GENDERS.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>

      {/* FEED */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 px-6">
        <AnimatePresence>
          {filteredConfessions.map((conf, index) => (
            <motion.div
              key={conf.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass p-6 mb-6 break-inside-avoid"
            >
              <div className="flex justify-between text-xs mb-4">
                <span>{conf.category} • {conf.gender}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {conf.views}</span>
              </div>

              <p className="italic text-xl mb-6">"{conf.content}"</p>

              <div className="flex gap-4">
                <button onClick={() => handleReaction(conf.id, 'flame')}>
                  🔥 {conf.reactions?.flame || 0}
                </button>
                <button onClick={() => handleReaction(conf.id, 'heart')}>
                  ❤️ {conf.reactions?.heart || 0}
                </button>
                <button onClick={() => handleReaction(conf.id, 'whisper')}>
                  💬 {conf.reactions?.whisper || 0}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* POST MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <motion.form
              onSubmit={handlePost}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="glass p-10 max-w-xl w-full"
            >
              <textarea
                value={newConfession}
                onChange={e => setNewConfession(e.target.value)}
                placeholder="Whisper into the void..."
                className="w-full mb-6"
              />

              <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
                {GENDERS.filter(g => g !== "All").map(g => <option key={g}>{g}</option>)}
              </select>

              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>

              <button type="submit" className="btn-primary w-full mt-6">
                <Send /> Commit to Darkness
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
