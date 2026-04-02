import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, Code, Globe, MessageSquare, Smartphone, ExternalLink } from 'lucide-react';

export default function IntegrationPage({ onBack }) {
  const [copiedItem, setCopiedItem] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const embedScript = `<script src="https://your-domain.com/questai-embed.js"
  data-api="https://your-api-server.com"
  data-position="bottom-right"
  data-color="#10b981">
</script>`;

  const iframeCode = `<iframe
  src="https://your-domain.com/widget.html"
  width="400"
  height="600"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
</iframe>`;

  const apiExample = `// Example API Request
const response = await fetch('https://your-api.com/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is the fee deadline?",
    session_id: "unique-session-id",
    language: "english"
  })
});

const data = await response.json();
console.log(data.reply);`;

  const webhookSetup = `# WhatsApp (Twilio)
Webhook URL: https://your-api.com/webhook/whatsapp

# Telegram
Webhook URL: https://your-api.com/webhook/telegram
Bot Token: Get from @BotFather

# Slack
Events URL: https://your-api.com/webhook/slack
OAuth Scopes: chat:write, app_mentions:read

# Microsoft Teams
Messaging Endpoint: https://your-api.com/webhook/teams`;

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 relative overflow-auto">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[150px]"
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </motion.button>
          <div className="flex items-center gap-3">
            <img src="/src/assets/cam.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg">QuestAI Integration</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Developer Documentation</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Integrate QuestAI</h1>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Add QuestAI to your college website or connect it with messaging platforms. Choose the integration method that works best for you.
            </p>
          </div>

          {/* Integration Options */}
          <div className="space-y-8">
            {/* Option 1: Embed Script */}
            <IntegrationCard
              icon={Code}
              color="emerald"
              title="Embed Script (Recommended)"
              description="Add a single script tag to your website. The chatbot widget will appear as a floating button."
              copyId="embed"
              copiedItem={copiedItem}
              onCopy={() => copyToClipboard(embedScript, 'embed')}
              code={embedScript}
              steps={[
                "Copy the script tag below",
                "Paste it before the closing </body> tag on your website",
                "Replace 'your-domain.com' with your QuestAI frontend URL",
                "Replace 'your-api-server.com' with your backend API URL",
                "The widget will automatically appear on your site!"
              ]}
            />

            {/* Option 2: iFrame */}
            <IntegrationCard
              icon={Globe}
              color="blue"
              title="iFrame Embed"
              description="Embed the full chatbot interface directly into a page section or popup."
              copyId="iframe"
              copiedItem={copiedItem}
              onCopy={() => copyToClipboard(iframeCode, 'iframe')}
              code={iframeCode}
              steps={[
                "Copy the iframe code below",
                "Add it to any HTML page where you want the chatbot to appear",
                "Adjust width/height as needed",
                "Style the container as desired"
              ]}
            />

            {/* Option 3: Direct API */}
            <IntegrationCard
              icon={MessageSquare}
              color="purple"
              title="Direct API Integration"
              description="Build custom integrations using our REST API. Full control over the UI and experience."
              copyId="api"
              copiedItem={copiedItem}
              onCopy={() => copyToClipboard(apiExample, 'api')}
              code={apiExample}
              language="javascript"
              steps={[
                "Use the /chat endpoint for conversations",
                "Use /documents/upload for document uploads",
                "Include session_id for conversation continuity",
                "Handle streaming responses with /chat/stream"
              ]}
            />

            {/* Option 4: Messaging Platforms */}
            <IntegrationCard
              icon={Smartphone}
              color="teal"
              title="Messaging Platforms"
              description="Connect QuestAI to WhatsApp, Telegram, Slack, or Microsoft Teams."
              copyId="webhook"
              copiedItem={copiedItem}
              onCopy={() => copyToClipboard(webhookSetup, 'webhook')}
              code={webhookSetup}
              language="bash"
              steps={[
                "Set up webhooks for each platform",
                "Configure OAuth/Bot tokens as needed",
                "Use our pre-built integration endpoints",
                "Test with sample messages"
              ]}
            />
          </div>

          {/* API Endpoints Reference */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-6 rounded-2xl bg-zinc-900/50 border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              API Endpoints Reference
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-semibold text-zinc-300">Endpoint</th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-300">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-zinc-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/chat</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">POST</span></td>
                    <td className="py-3 px-4 text-zinc-400">Send a chat message and get a response</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/chat/stream</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">POST</span></td>
                    <td className="py-3 px-4 text-zinc-400">Stream chat response (Server-Sent Events)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/documents/upload</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">POST</span></td>
                    <td className="py-3 px-4 text-zinc-400">Upload a document (PDF, DOCX, TXT)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/documents/{'{session_id}'}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 text-xs">GET</span></td>
                    <td className="py-3 px-4 text-zinc-400">List uploaded documents for a session</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/webhook/whatsapp</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">POST</span></td>
                    <td className="py-3 px-4 text-zinc-400">WhatsApp webhook (Twilio)</td>
                  </tr>
                  <tr className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-emerald-400">/webhook/telegram</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs">POST</span></td>
                    <td className="py-3 px-4 text-zinc-400">Telegram bot webhook</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
          >
            <h3 className="text-xl font-bold mb-4">Quick Start for Local Testing</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <p className="text-zinc-300 font-medium">Start the Backend</p>
                  <code className="text-xs text-emerald-300 bg-black/30 px-2 py-1 rounded mt-1 block">
                    cd backend && uvicorn main:app --reload --port 8000
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <p className="text-zinc-300 font-medium">Start the Frontend</p>
                  <code className="text-xs text-emerald-300 bg-black/30 px-2 py-1 rounded mt-1 block">
                    cd frontend && npm run dev
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <p className="text-zinc-300 font-medium">Access URLs</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Frontend: <code className="text-emerald-300">http://localhost:5173</code><br />
                    Backend API: <code className="text-emerald-300">http://localhost:8000</code><br />
                    API Docs: <code className="text-emerald-300">http://localhost:8000/docs</code>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function IntegrationCard({ icon: Icon, color, title, description, code, copyId, copiedItem, onCopy, language = 'html', steps }) {
  const colors = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-white/20 transition-all"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase mb-2">Steps</p>
        <ol className="space-y-1">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-400">
              <span className="text-emerald-400 font-medium">{idx + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Code Block */}
      <div className="relative">
        <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 rounded-t-lg">
          <span className="text-xs text-zinc-500 font-mono">{language}</span>
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            {copiedItem === copyId ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy code
              </>
            )}
          </button>
        </div>
        <pre className="p-4 bg-black/40 rounded-b-lg overflow-x-auto">
          <code className="text-xs text-zinc-300 font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    </motion.div>
  );
}
