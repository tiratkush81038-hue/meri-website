import { useState } from 'react';
import { Bot, Code, Smartphone, Send, Loader2, CreditCard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<'web-app' | 'app'>('web-app');

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });
      const data = await res.json();
      setResult(data.code || data.error);
    } catch (err) {
      setResult("Error connecting to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-72 bg-zinc-900 p-6 border-r border-zinc-800">
        <h1 className="text-2xl font-bold text-emerald-500 mb-8">Builder Studio</h1>
        <div className="space-y-4">
          <button onClick={() => setType('web-app')} className={`w-full p-4 rounded-xl flex items-center gap-3 ${type === 'web-app' ? 'bg-emerald-600' : 'bg-zinc-800'}`}><Code /> Web App Builder</button>
          <button onClick={() => setType('app')} className={`w-full p-4 rounded-xl flex items-center gap-3 ${type === 'app' ? 'bg-zinc-800' : 'bg-zinc-800'}`}><Smartphone /> App Builder</button>
        </div>
        <div className="mt-auto pt-8 border-t border-zinc-800">
          <div className="bg-zinc-800 p-4 rounded-xl">
            <p className="text-sm text-zinc-400 mb-2">Pro Plan</p>
            <p className="text-2xl font-bold">$25<span className="text-sm font-normal text-zinc-500">/mo</span></p>
            <button className="w-full mt-4 bg-emerald-600 py-2 rounded-lg text-sm">Upgrade Now</button>
          </div>
        </div>
      </div>
      {/* Main */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-32 bg-zinc-900 p-4 rounded-xl border border-zinc-700 outline-none focus:border-emerald-500" placeholder="Describe your app or website..." />
          <button onClick={handleBuild} className="mt-4 bg-emerald-600 px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-500">
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />} Build Now
          </button>
          <div className="mt-8 bg-zinc-900 p-6 rounded-xl border border-zinc-800 min-h-[400px]">
            <ReactMarkdown className="prose prose-invert">{result}</ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}
