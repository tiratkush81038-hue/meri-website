import { useState } from 'react';
import { Bot, Image as ImageIcon, Video, Palette, CreditCard, LayoutDashboard } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Components
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

export default function App() {
  const [view, setView] = useState('chat');

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar activeView={view} setView={setView} />
      <main className="flex-1 p-8">
        {view === 'chat' && <div className="text-center mt-20">AI Chat Interface (Coming Soon)</div>}
        {view === 'image' && <div className="text-center mt-20">AI Image Generator (Coming Soon)</div>}
        {view === 'video' && <div className="text-center mt-20">AI Video Generator (Coming Soon)</div>}
        {view === 'design' && <div className="text-center mt-20">Logo/Card Creator (Coming Soon)</div>}
      </main>
    </div>
  );
}
