import { useState, FormEvent } from 'react';
import { Bot, Image as ImageIcon, Video, Palette, Send, Loader2, User } from 'lucide-react';
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
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-emerald-400">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
};

const Sidebar = ({ activeView, setView }: any) => {
  const menu = [
    { id: 'chat', name: 'AI Chat', icon: Bot },
    { id: 'image', name: 'AI Image', icon: ImageIcon },
    { id: 'video', name: 'AI Video', icon: Video },
    { id: 'design', name: 'Logo/Card', icon: Palette },
  ];
  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
      <h1 className="text-xl font-bold text-emerald-500 mb-8">Pro AI Studio</h1>
      <div className="space-y-2">
        {menu.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeView === item.id ? 'bg-emerald-600' : 'hover:bg-zinc-800'}`}>
            <item.icon size={20} /> {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setImage(data.imageUrl);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">AI Image Generator</h2>
      <div className="flex gap-2 mb-6">
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} className="flex-1 bg-zinc-900 p-3 rounded-xl border border-zinc-700" placeholder="Describe your image..." />
        <button onClick={generate} className="bg-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-500">{loading ? <Loader2 className="animate-spin" /> : 'Generate'}</button>
      </div>
      {image && <img src={image} className="rounded-2xl border border-zinc-800 w-full" alt="Generated" />}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState('chat');
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
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar activeView={view} setView={setView} />
      <main className="flex-1 p-8">
        {view === 'chat' && (
          <div className="max-w-3xl mx-auto flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 mb-20">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-800"><Bot size={18} className="text-emerald-500" /></div>}
                  <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 border border-zinc-800'}`}>
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown components={{ code: CodeBlock }}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex items-center p-2 focus-within:border-emerald-500 transition">
              <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent p-3 outline-none" placeholder="Message Pro AI Studio..." />
              <button className="bg-emerald-600 p-2 rounded-xl hover:bg-emerald-500 transition"><Send size={18} /></button>
            </form>
          </div>
        )}
        {view === 'image' && <ImageGenerator />}
        {view === 'video' && <div className="text-center mt-20">Video Coming Soon</div>}
        {view === 'design' && <div className="text-center mt-20">Design Coming Soon</div>}
      </main>
    </div>
  );
}
