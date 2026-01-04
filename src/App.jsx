import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Heart, Plus, Send, User, Filter, Eye, Flame, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { CONFESSIONS, CATEGORIES, GENDERS } from './data/confessions';

function App() {
  const [confessions, setConfessions] = useState(() => {
    const saved = localStorage.getItem('shadows_posts');
    return saved ? JSON.parse(saved) : CONFESSIONS;
  });

  const [filterCategory, setFilterCategory] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newConfession, setNewConfession] = useState("");
  const [selectedGender, setSelectedGender] = useState("Female");
  const [selectedCategory, setSelectedCategory] = useState("Intimate");

  useEffect(() => {
    localStorage.setItem('shadows_posts', JSON.stringify(confessions));
  }, [confessions]);

  const filteredConfessions = confessions.filter(c =>
    (filterCategory === "All" || c.category === filterCategory) &&
    (filterGender === "All" || c.gender === filterGender)
  );

  const handlePost = (e) => {
    e.preventDefault();
    if (!newConfession.trim()) return;

    const post = {
      id: Date.now(),
      content: newConfession,
      category: selectedCategory,
      gender: selectedGender,
      author: "Anonymous Shadow",
      timestamp: "Just now",
      likes: 0,
      views: Math.floor(Math.random() * 200) + 50,
      reactions: { flame: 0, heart: 0, whisper: 0 }
    };

    const updated = [post, ...confessions];
    setConfessions(updated);
    setNewConfession("");
    setShowPostModal(false);
  };

  const handleReaction = (id, type) => {
    setConfessions(confessions.map(c => {
      if (c.id === id) {
        const reactions = { ...c.reactions };
        reactions[type] = (reactions[type] || 0) + 1;
        return { ...c, reactions };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Navbar */}
      <nav className="glass sticky top-0 z-[100] px-8 py-5 mb-12 rounded-none border-t-0 border-x-0">
        <div className="container mx-auto flex justify-between items-center p-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-xl shadow-lg">
              <Ghost className="text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter shadow-text">SHADOWS</h1>
          </motion.div>

          <div className="hidden md:flex items-center gap-10">
            {["Trending", "Latest", "Hall of Shadows"].map(item => (
              <button key={item} className="text-sm font-bold tracking-widest uppercase text-text-secondary hover:text-white transition-all hover:scale-110">
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostModal(true)}
              className="btn-primary flex items-center gap-2 rounded-full px-6"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="hidden sm:inline">Unveil</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4">
        <header className="mb-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              Where <span className="shadow-text">Desire</span> Meets The Dark
            </h2>
            <p className="text-text-secondary text-2xl font-light leading-relaxed">
              The world's most intimate anonymous collective. Share what you can't tell anyone else.
              <span className="text-pink-500 font-bold ml-2">No judgement. No trace.</span>
            </p>
          </motion.div>
        </header>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-6 mb-12 justify-center"
        >
          <div className="glass px-6 py-3 flex items-center gap-4">
            <Filter size={18} className="text-pink-500" />
            <span className="text-xs uppercase font-black text-text-secondary">Explore</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-white font-bold border-none outline-none cursor-pointer appearance-none pr-4"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
            </select>
          </div>
          <div className="glass px-6 py-3 flex items-center gap-4">
            <User size={18} className="text-pink-500" />
            <span className="text-xs uppercase font-black text-text-secondary">Perspective</span>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-transparent text-white font-bold border-none outline-none cursor-pointer appearance-none pr-4"
            >
              {GENDERS.map(g => <option key={g} value={g} className="bg-black">{g}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Ultra-Smooth Feed */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredConfessions.map((conf, index) => (
              <motion.div
                key={conf.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-8 mb-8 break-inside-avoid flex flex-col group relative overflow-hidden"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-pink-500/10 transition-all"></div>

                <div className="flex justify-between items-start mb-6 z-10">
                  <span className="tag">{conf.category} • {conf.gender}</span>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-secondary">
                    <Eye size={12} />
                    {conf.views || 0}
                  </div>
                </div>

                <p className="text-xl md:text-2xl leading-relaxed text-gray-100 font-light mb-8 font-serif italic tracking-wide">
                  "{conf.content}"
                </p>

                <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center z-10">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReaction(conf.id, 'flame')}
                      className="flex flex-col items-center gap-1 group/btn"
                    >
                      <motion.div whileHover={{ y: -5 }} className="bg-orange-500/10 p-2 rounded-lg group-hover/btn:bg-orange-500/20 text-orange-500">
                        <Flame size={20} />
                      </motion.div>
                      <span className="text-xs font-black">{conf.reactions?.flame || 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(conf.id, 'heart')}
                      className="flex flex-col items-center gap-1 group/btn"
                    >
                      <motion.div whileHover={{ y: -5 }} className="bg-pink-500/10 p-2 rounded-lg group-hover/btn:bg-pink-500/20 text-pink-500">
                        <Heart size={20} />
                      </motion.div>
                      <span className="text-xs font-black">{conf.reactions?.heart || 0}</span>
                    </button>
                    <button
                      onClick={() => handleReaction(conf.id, 'whisper')}
                      className="flex flex-col items-center gap-1 group/btn"
                    >
                      <motion.div whileHover={{ y: -5 }} className="bg-purple-500/10 p-2 rounded-lg group-hover/btn:bg-purple-500/20 text-purple-500">
                        <MessageCircle size={20} />
                      </motion.div>
                      <span className="text-xs font-black">{conf.reactions?.whisper || 0}</span>
                    </button>
                  </div>

                  <button className="text-text-secondary hover:text-white transition-colors">
                    <Share2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Premium Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="glass max-w-2xl w-full p-10 relative border-pink-500/30"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute top-6 right-6 text-text-secondary hover:text-white transition-all hover:rotate-90"
              >
                <MoreHorizontal size={32} />
              </button>

              <h3 className="text-4xl font-black mb-2 shadow-text uppercase italic tracking-tighter">Cast Your Shadow</h3>
              <p className="text-text-secondary mb-8 font-bold">Unburden your soul in total anonymity.</p>

              <form onSubmit={handlePost}>
                <textarea
                  value={newConfession}
                  onChange={(e) => setNewConfession(e.target.value)}
                  placeholder="Tell us everything... the things you whisper to yourself when the lights go out."
                  className="input-field min-h-[220px] mb-8 resize-none shadow-inner"
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-pink-500 mb-3 tracking-widest">Perspective</label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Trans"].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedGender(g)}
                          className={`flex-1 text-xs font-black py-3 rounded-xl border-2 transition-all ${selectedGender === g
                            ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_15px_rgba(255,0,171,0.4)]'
                            : 'bg-white/5 border-white/5 text-text-secondary hover:border-white/20'
                            }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-purple-500 mb-3 tracking-widest">Aura</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white/5 border-2 border-white/5 text-white font-bold w-full py-3 px-4 rounded-xl outline-none"
                    >
                      {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-xl"
                >
                  <Send size={24} strokeWidth={3} />
                  COMMIT TO DARKNESS
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-32 py-16 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-pink-500/5 blur-[120px] -z-10"></div>
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-pink-500/20 p-2 rounded-lg">
            <Ghost size={20} className="text-pink-500" />
          </div>
          <span className="font-black tracking-[0.3em] text-xl shadow-text">SHADOWS</span>
        </div>
        <p className="text-text-secondary font-bold tracking-widest uppercase text-[10px] opacity-50">
          Encrypted • Anonymous • Eternal
        </p>
      </footer>
    </div>
  );
}

export default App;
