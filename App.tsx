import { useState, FormEvent } from 'react';
import { Code, Smartphone, Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CodeBlock = ({ children, className }: any) => {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-xs text-zinc-400">code</span>
        <button onClick={copyToClipboard} className="text-zinc-400 hover:text-white">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-emerald-400"><code className={className}>{children}</code></pre>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'web-app' | 'app-builder'>('web-app');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hello! Main aapka ${view === 'web-app' ? 'Web App' : 'App'} Builder hoon. Main aapki kya madad kar sakta hoon?` }
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
        body: JSON.stringify({ message: input, type: view }),
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
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
        <h1 className="text-xl font-bold text-emerald-500 mb-8">Builder Studio</h1>
        <div className="space-y-2">
          <button onClick={() => setView('web-app')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${view === 'web-app' ? 'bg-emerald-600' : 'hover:bg-zinc-800'}`}><Code size={20} /> Web App Builder</button>
          <button onClick={() => setView('app-builder')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${view === 'app-builder' ? 'bg-emerald-600' : 'hover:bg-zinc-800'}`}><Smartphone size={20} /> App Builder</button>
        </div>
      </div>
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6 mb-20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-800"><Bot size={18} className="text-emerald-500" /></div>}
                <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-emerald-600' : 'bg-zinc-900 border border-zinc-800'}`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown components={{ code: CodeBlock }}>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl flex items-center p-2 focus-within:border-emerald-500 transition">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-transparent p-3 outline-none" placeholder={`Describe your ${view === 'web-app' ? 'Web App' : 'App'}...`} />
            <button className="bg-emerald-600 p-2 rounded-xl hover:bg-emerald-500 transition"><Send size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  );
}
