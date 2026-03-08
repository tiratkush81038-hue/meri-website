import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User } from 'lucide-react';

export default function App() {
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

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const aiMessage = { role: 'ai' as const, text: data.text || 'Sorry, main jawab nahi de paya.' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: API call fail ho gayi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="p-4 border-b border-zinc-800 text-center font-bold text-xl">
        AI Chat Tool
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'ai' && <Bot className="text-emerald-500" />}
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <User className="text-emerald-500" />}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <Bot className="text-emerald-500" />
            <div className="p-3 rounded-2xl bg-zinc-800">Typing...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Kuch puchein..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 outline-none focus:border-emerald-500"
          disabled={isLoading}
        />
        <button className="bg-emerald-600 p-3 rounded-xl hover:bg-emerald-500 disabled:opacity-50" disabled={isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
