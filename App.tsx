import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Lock, CreditCard } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'chat' | 'login' | 'plans'>('chat');
  
  // Chat state
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
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h1 className="font-bold text-xl">AI Chat Tool</h1>
        <div className="flex gap-2">
          <button onClick={() => setView('chat')} className="text-sm hover:text-emerald-400">Chat</button>
          <button onClick={() => setView('plans')} className="text-sm hover:text-emerald-400">Plans</button>
          <button onClick={() => setView('login')} className="text-sm hover:text-emerald-400">Login</button>
        </div>
      </header>

      {view === 'chat' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && <Bot className="text-emerald-500" />}
              <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 bg-zinc-900 rounded-xl p-3" placeholder="Kuch puchein..." />
            <button className="bg-emerald-600 p-3 rounded-xl"><Send size={20} /></button>
          </form>
        </div>
      )}

      {view === 'login' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-sm border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Lock /> Login</h2>
            <input className="w-full bg-zinc-800 p-3 rounded-xl mb-4" placeholder="Email" />
            <input className="w-full bg-zinc-800 p-3 rounded-xl mb-6" type="password" placeholder="Password" />
            <button className="w-full bg-emerald-600 p-3 rounded-xl font-bold">Login</button>
          </div>
        </div>
      )}

      {view === 'plans' && (
        <div className="flex-1 p-8 grid md:grid-cols-3 gap-6">
          {[ { name: '1 Month', price: '799' }, { name: '3 Months', price: '1499' }, { name: '6 Months', price: '2499' } ].map(plan => (
            <div key={plan.name} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 text-center">
              <CreditCard className="mx-auto mb-4 text-emerald-500" size={40} />
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">₹{plan.price}</p>
              <button className="w-full bg-emerald-600 p-3 rounded-xl">Buy Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
