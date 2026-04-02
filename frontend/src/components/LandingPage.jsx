import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, Database, Languages, Headset, Sparkles, GraduationCap,
  Upload, MessageSquare, Globe, FileText, Zap, Shield, Code, Smartphone
} from 'lucide-react';

export default function LandingPage({ onEnter, onIntegration }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const floatVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 90, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-emerald-600/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/10 blur-[150px]"
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <img src="/src/assets/cam.png" alt="QuestAI Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-xl tracking-tight">QuestAI</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={onIntegration}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors hidden sm:block"
          >
            Integration Docs
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
            className="px-5 py-2 text-sm font-medium text-zinc-100 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
          >
            Student Login
          </motion.button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-6xl mx-auto w-full mt-8 mb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-8 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </motion.div>
            <span>Hackathon Project - Multilingual RAG Chatbot</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Understand Any Language, <br className="hidden md:block" />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-[length:200%_auto]"
            >
              Respond in English.
            </motion.span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            AI campus assistant that understands queries in English, Hindi, and regional languages.
            Upload your documents for personalized Q&A. Connect via Web, WhatsApp, Telegram, Slack & Teams.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100 text-zinc-900 hover:bg-white rounded-full text-base font-semibold transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
            >
              Launch Chatbot
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Core Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left"
        >
          <motion.div variants={floatVariants} animate="animate">
            <FeatureCard
              icon={Languages}
              title="Multilingual Understanding"
              desc="Ask in English, Hindi, or any regional language. The AI understands all and responds clearly in English."
              delay={0.1}
            />
          </motion.div>
          <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '0.5s' }}>
            <FeatureCard
              icon={Upload}
              title="Document Upload & RAG"
              desc="Upload PDFs, DOCX, or TXT files. Ask questions from your own documents using advanced RAG retrieval."
              delay={0.2}
              highlight
            />
          </motion.div>
          <motion.div variants={floatVariants} animate="animate" style={{ animationDelay: '1s' }}>
            <FeatureCard
              icon={Headset}
              title="Human Escalation"
              desc="Seamlessly escalate to human support when the AI can't confidently answer your query."
              delay={0.3}
            />
          </motion.div>
        </motion.div>

        {/* Integration Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 w-full"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-4"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Platform Integrations</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect Anywhere</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Embed on your college website or connect via your favorite messaging platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <IntegrationCard
              name="Web Embed"
              icon={Code}
              color="emerald"
              desc="One-line script"
            />
            <IntegrationCard
              name="WhatsApp"
              icon={MessageSquare}
              color="green"
              desc="Via Twilio"
            />
            <IntegrationCard
              name="Telegram"
              icon={Smartphone}
              color="blue"
              desc="Bot API"
            />
            <IntegrationCard
              name="Slack"
              icon={MessageSquare}
              color="purple"
              desc="Events API"
            />
            <IntegrationCard
              name="MS Teams"
              icon={MessageSquare}
              color="indigo"
              desc="Bot Framework"
            />
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 w-full"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium mb-4"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Tech Stack</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built with Modern Tech</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <TechBadge name="FastAPI" />
            <TechBadge name="React 18" />
            <TechBadge name="Groq LLaMA 4" />
            <TechBadge name="FAISS Vector DB" />
            <TechBadge name="Sentence Transformers" />
            <TechBadge name="Framer Motion" />
            <TechBadge name="TailwindCSS" />
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 w-full"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Advanced RAG pipeline for accurate, context-aware responses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StepCard step="1" title="Query" desc="Ask in any language" icon={MessageSquare} />
            <StepCard step="2" title="Process" desc="Translate & classify intent" icon={Languages} />
            <StepCard step="3" title="Retrieve" desc="Search knowledge base + your docs" icon={Database} />
            <StepCard step="4" title="Respond" desc="Generate answer in English" icon={Shield} />
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 w-full"
        >
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative z-10 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Try QuestAI?</h3>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                Experience the future of campus assistance. Upload your documents, ask questions, and get instant answers.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEnter}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white hover:bg-emerald-400 rounded-full text-base font-semibold transition-all shadow-lg shadow-emerald-500/25"
              >
                Start Chatting Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 border-t border-white/10 bg-[#09090b]/80 backdrop-blur-md mt-auto"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/src/assets/cam.png" alt="QuestAI Logo" className="w-6 h-6 rounded-md" />
              <span className="font-bold text-lg tracking-tight">QuestAI</span>
            </div>
            <p className="text-xs text-zinc-500">Built for Hackathon 2026 | Multilingual Campus AI Assistant</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 24 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`p-6 rounded-2xl border transition-all group h-full ${
        highlight
          ? 'bg-emerald-500/5 border-emerald-500/30 hover:bg-emerald-500/10'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-emerald-500/20'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 ${
        highlight
          ? 'bg-emerald-500/20 border border-emerald-500/30'
          : 'bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20'
      }`}>
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function IntegrationCard({ name, icon: Icon, color, desc }) {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-4 rounded-xl border ${colors[color]} transition-all cursor-pointer group`}
    >
      <Icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
      <p className="font-semibold text-sm text-zinc-100">{name}</p>
      <p className="text-xs text-zinc-500">{desc}</p>
    </motion.div>
  );
}

function TechBadge({ name }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="px-4 py-2 rounded-full bg-zinc-800/50 border border-white/5 text-sm text-zinc-300 hover:border-emerald-500/30 transition-colors"
    >
      {name}
    </motion.div>
  );
}

function StepCard({ step, title, desc, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative p-5 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/20 transition-all group"
    >
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
        {step}
      </div>
      <div className="pt-3">
        <Icon className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
        <h4 className="font-semibold text-zinc-100 mb-1">{title}</h4>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
    </motion.div>
  );
}
