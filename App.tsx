import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Lock, CreditCard, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Code block component with Copy button
const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const code = children;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs text-zinc-400">code</span>
        <button onClick={copyToClipboard} className="text-zinc-400 hover:text-white">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-emerald-400">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'chat' | 'login' | 'plans'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! Main aapka AI assistant hoon. Main aapki kya madad kar sakta hoon?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai' as const, text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai' as const, text: 'Error: API call fail.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="font-bold text-xl text-emerald-500">Pro AI Tool</h1>
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {['chat', 'plans', 'login'].map(v => (
            <button key={v} onClick={() => setView(v as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === v ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {view === 'chat' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-3xl mx-auto w-full">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-800"><Bot size={18} className="text-emerald-500" /></div>}
              <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800'}`}>
                {msg.role === 'ai' ? (
                  <ReactMarkdown components={{ code: CodeBlock }} className="prose prose-invert prose-sm max-w-none">
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
          <div className="h-20" /> {/* Spacer */}
          <form onSubmit={handleSubmit} className="fixed bottom-4 max-w-3xl w-full mx-auto px-4">
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex items-center p-2 focus-within:border-emerald-500 transition">
              <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent p-3 outline-none" placeholder="Message Pro AI Tool..." />
              <button className="bg-emerald-600 p-2 rounded-xl hover:bg-emerald-500 transition"><Send size={18} /></button>
            </div>
          </form>
        </div>
      )}
      {/* ... (login and plans views remain same) */}
    </div>
  );
}
