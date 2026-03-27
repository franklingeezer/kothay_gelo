import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

const TerminalInput = ({ onAdd }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Regex matches: [numbers] followed by [anything else]
    const match = input.match(/^(\d+)\s+(.+)$/);
    
    if (match) {
      onAdd(match[1], match[2]);
      setInput(''); // Clear for next entry
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-6">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500">
        <Terminal size={18} />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type '50 rickshaw'..."
        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-12 pr-4 text-emerald-400 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
        autoFocus
      />
    </form>
  );
};

export default TerminalInput;
