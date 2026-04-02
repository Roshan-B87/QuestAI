import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, ChevronDown, Loader2, Upload, Mic, Globe, GraduationCap,
  Headset, Plus, MessageSquare, FileText, X, Check, Trash2, File,
  FileType, AlertCircle, LogOut
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const getSessionId = () => {
  let sessionId = localStorage.getItem('campus_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('campus_session_id', sessionId);
  }
  return sessionId;
};

const getInitialMessages = (lang) => {
  // Always respond in English regardless of selected language
  return [{ id: '1', role: 'assistant', content: "Hello! I'm QuestAI, your AI assistant. I can understand questions in any language (English, Hindi, or regional) but I'll always respond in English. Ask me about fees, scholarships, exams, hostel, library timings, and more! You can also upload documents and ask questions from them." }];
};

export default function RagLayout({ onLogout }) {
  const [language, setLanguage] = useState('English');
  const [messages, setMessages] = useState(getInitialMessages('English'));
  const [recentQueries, setRecentQueries] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [useDocuments, setUseDocuments] = useState(false);
  const sessionId = useRef(getSessionId());

  // Fetch uploaded documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents/${sessionId.current}`);
      const data = await res.json();
      setUploadedDocs(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleNewChat = () => {
    setMessages(getInitialMessages(language));
  };

  useEffect(() => {
    if (messages.length <= 1) {
      setMessages(getInitialMessages(language));
    }
  }, [language]);

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      <Sidebar
        onNewChat={handleNewChat}
        recentQueries={recentQueries}
        uploadedDocs={uploadedDocs}
        setUploadedDocs={setUploadedDocs}
        sessionId={sessionId.current}
        useDocuments={useDocuments}
        setUseDocuments={setUseDocuments}
        onDocumentsUpdate={fetchDocuments}
        onLogout={onLogout}
      />
      <ChatPanel
        messages={messages}
        setMessages={setMessages}
        language={language}
        setLanguage={setLanguage}
        onNewChat={handleNewChat}
        sessionId={sessionId.current}
        setRecentQueries={setRecentQueries}
        useDocuments={useDocuments}
        uploadedDocs={uploadedDocs}
      />
    </div>
  );
}

function Sidebar({ onNewChat, recentQueries, uploadedDocs, setUploadedDocs, sessionId, useDocuments, setUseDocuments, onDocumentsUpdate, onLogout }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, TXT, or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    setUploadProgress({ filename: file.name, status: 'uploading' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId);

    try {
      const res = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadProgress({ filename: file.name, status: 'success', chunks: data.document.num_chunks });
        onDocumentsUpdate();
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadProgress(null);
        }, 1500);
      } else {
        setUploadProgress({ filename: file.name, status: 'error', message: data.detail });
      }
    } catch (error) {
      setUploadProgress({ filename: file.name, status: 'error', message: 'Network error' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      const res = await fetch(`${API_URL}/documents/${sessionId}/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDocumentsUpdate();
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return <FileType className="w-4 h-4 text-red-400" />;
    if (fileType === 'docx') return <FileText className="w-4 h-4 text-blue-400" />;
    return <File className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#09090b] flex flex-col hidden md:flex">
      {/* Brand Header with Campus Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center">
          <img src="/src/assets/cam.png" alt="CampusBot Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-emerald-500/20" />
          <div className="ml-3 flex-1">
            <p className="text-sm font-bold text-zinc-100 tracking-tight">CampusBot</p>
            <p className="text-[10px] text-emerald-400 font-medium">AI Assistant</p>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors text-sm font-medium mb-4 border border-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> New Chat
        </button>

        {/* Document Upload Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Your Documents</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 transition-colors"
              title="Upload Document"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Use Documents Toggle */}
          {uploadedDocs.length > 0 && (
            <button
              onClick={() => setUseDocuments(!useDocuments)}
              className={`w-full flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs transition-all ${
                useDocuments
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800/40 border border-white/5 text-zinc-400 hover:bg-zinc-800/60'
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center ${useDocuments ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                {useDocuments && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>Ask from my docs</span>
            </button>
          )}

          {/* Uploaded Documents List */}
          <nav className="space-y-1">
            {uploadedDocs.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-[11px] text-zinc-500">No documents uploaded</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  Upload your first document
                </button>
              </div>
            ) : (
              uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800/40 transition-colors"
                >
                  {getFileIcon(doc.file_type)}
                  <div className="ml-2 flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{doc.filename}</p>
                    <p className="text-[10px] text-zinc-500">{doc.num_chunks} chunks</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Knowledge Base */}
        <div className="mb-6">
          <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Knowledge Base</p>
          <nav className="space-y-0.5">
            <div className="w-full flex items-center px-3 py-2 rounded-lg text-zinc-400 text-sm group hover:bg-zinc-800/40 transition-colors">
              <FileText className="w-4 h-4 mr-3 text-emerald-500/70" />
              <span className="flex-1 text-left truncate text-xs">Campus FAQs</span>
            </div>
            <div className="w-full flex items-center px-3 py-2 rounded-lg text-zinc-400 text-sm group hover:bg-zinc-800/40 transition-colors">
              <FileText className="w-4 h-4 mr-3 text-emerald-500/70" />
              <span className="flex-1 text-left truncate text-xs">Fee Structure</span>
            </div>
          </nav>
        </div>

        {/* Recent Queries */}
        <div className="mb-6">
          <p className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Recent Queries</p>
          <nav className="space-y-0.5">
            {recentQueries.length === 0 ? (
              <p className="px-3 py-2 text-xs text-zinc-500 italic">No recent queries</p>
            ) : (
              recentQueries.map((query, idx) => (
                <NavItem key={idx} icon={MessageSquare} label={query} active={idx === 0} />
              ))
            )}
          </nav>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-zinc-100">Upload Document</h3>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!uploadProgress ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Upload className="w-7 h-7 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-sm text-zinc-300 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-zinc-500">PDF, TXT, or DOCX (max 10MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-center gap-3 mb-4">
                    {uploadProgress.status === 'uploading' && (
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    )}
                    {uploadProgress.status === 'success' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {uploadProgress.status === 'error' && (
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-zinc-200 truncate">{uploadProgress.filename}</p>
                      <p className="text-xs text-zinc-500">
                        {uploadProgress.status === 'uploading' && 'Processing document...'}
                        {uploadProgress.status === 'success' && `Indexed ${uploadProgress.chunks} chunks`}
                        {uploadProgress.status === 'error' && uploadProgress.message}
                      </p>
                    </div>
                  </div>

                  {uploadProgress.status === 'error' && (
                    <button
                      onClick={() => setUploadProgress(null)}
                      className="w-full py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Your documents are processed securely. The content is chunked and indexed for question-answering. Enable "Ask from my docs" to query your uploaded documents.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <button className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
      active ? 'bg-zinc-800/80 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
    } text-sm`}>
      {Icon && <Icon className={`w-4 h-4 mr-3 ${active ? 'text-zinc-100' : 'text-zinc-500'}`} />}
      <span className="flex-1 text-left truncate text-xs">{label}</span>
    </button>
  );
}

function ChatPanel({ messages, setMessages, language, setLanguage, onNewChat, sessionId, setRecentQueries, useDocuments, uploadedDocs }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e, customText = null) => {
    e?.preventDefault();
    const text = customText || input.trim();
    if (!text) return;

    const newMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    setQuickReplies([]);

    // Add to recent queries
    setRecentQueries(prev => {
      const filtered = prev.filter(q => q !== text);
      return [text.substring(0, 30) + (text.length > 30 ? '...' : ''), ...filtered].slice(0, 5);
    });

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          language: language.toLowerCase(),
          use_documents: useDocuments,
          document_ids: useDocuments ? uploadedDocs.map(d => d.id) : null,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      const botResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I'm sorry, I couldn't process that request.",
        intent: data.intent,
        confidence: data.confidence,
        detected_lang: data.detected_lang,
        usedDocuments: data.used_documents,
      };

      setMessages((prev) => [...prev, botResponse]);

      if (data.quick_replies) {
        setQuickReplies(data.quick_replies);
      }

    } catch (error) {
      setIsTyping(false);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please make sure the backend is running on http://localhost:8000",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        let simulatedText = "What is the fee payment deadline?";
        if (language === 'Hindi') {
          simulatedText = "Fee payment ki last date kya hai?";
        }
        setInput(simulatedText);
        setIsListening(false);
      }, 2000);
    }
  };

  const requestHumanSupport = async () => {
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: "Transferring you to a human support agent. Please wait..."
    }]);

    try {
      await fetch(`${API_URL}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reason: 'User requested human support',
        }),
      });
    } catch (error) {
      console.error('Escalation error:', error);
    }
  };

  const languages = ['English', 'Hindi', 'Regional'];

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] relative">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 shadow-sm">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">CampusBot Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] text-zinc-400 font-medium">
                {useDocuments ? 'Using your documents' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Document indicator */}
          {useDocuments && uploadedDocs.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <FileText className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-300">{uploadedDocs.length} docs</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {language}
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-white/10 rounded-lg shadow-xl overflow-hidden z-50"
                >
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 transition-colors ${language === lang ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-300'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={requestHumanSupport}
            title="Talk to a human"
            className="p-2 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Headset className="w-4 h-4" />
          </button>
          <button
            onClick={onNewChat}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : msg.role === 'system' ? 'justify-center' : 'flex-row'}`}
              >
                {msg.role === 'system' ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-2 rounded-full flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {msg.content}
                  </div>
                ) : (
                  <>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                      msg.role === 'user' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-zinc-800 border border-white/10'
                    }`}>
                      {msg.role === 'user' ? (
                        <span className="text-white text-xs font-bold">U</span>
                      ) : (
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                      <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-zinc-100 text-zinc-900 rounded-tr-sm'
                          : msg.isError
                            ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm'
                            : 'bg-zinc-900/80 border border-white/5 text-zinc-200 rounded-tl-sm backdrop-blur-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>

                      {/* Intent & Confidence & Document indicator */}
                      {(msg.intent || msg.usedDocuments) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.intent && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                              {msg.intent}
                            </div>
                          )}
                          {msg.confidence && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/50 border border-white/5 text-[11px] text-zinc-400">
                              {Math.round(msg.confidence * 100)}% confident
                            </div>
                          )}
                          {msg.usedDocuments && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                              <FileText className="w-3 h-3" />
                              From your docs
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-[10px] text-zinc-500 mt-1.5 px-1">Just now</span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-3 flex-row"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-zinc-900/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-4 flex items-center gap-1.5 backdrop-blur-sm">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && !isTyping && (
        <div className="px-6 pb-2 relative z-10">
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSend(e, reply.value)}
                className="px-4 py-2 rounded-full bg-zinc-800/50 text-zinc-300 text-sm hover:bg-zinc-800 border border-white/5 transition-all hover:border-emerald-500/30"
              >
                {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#09090b] relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={handleSend} className="relative flex items-center">
            <button
              type="button"
              onClick={toggleMic}
              className={`absolute left-3 p-1.5 rounded-full transition-colors ${isListening ? 'text-rose-400 bg-rose-500/10 animate-pulse' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : useDocuments ? "Ask about your documents..." : "Ask about fees, scholarships, exams..."}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-12 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() && !isListening}
              className="absolute right-2 p-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-zinc-500 mt-3">
            {useDocuments ? 'Querying your uploaded documents + knowledge base' : 'AI can make mistakes. Verify important information with the administration.'}
          </p>
        </div>
      </div>
    </div>
  );
}
