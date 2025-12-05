import React, { useState, useRef, useEffect } from 'react';
import { GeminiController } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Ciao! Sono SmartUrban AI. Come posso aiutarti oggi? Chiedimi pure della disponibilità dei parcheggi.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !isKeySet) return;

    const userMsg: ChatMessage = { sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Istanza del Controller per gestire la richiesta
    const controller = new GeminiController(apiKey);
    const responseText = await controller.gestisciRichiestaAI(userMsg.text);

    const aiMsg: ChatMessage = { sender: 'ai', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  if (!isKeySet) {
      return (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-full flex flex-col justify-center items-center">
              <h2 className="text-xl font-bold mb-4 text-purple-600">Configurazione AI</h2>
              <p className="text-gray-600 mb-4 text-center">Inserisci la tua Google Gemini API Key per attivare l'assistente intelligente.</p>
              <input 
                type="password" 
                placeholder="API Key" 
                className="border p-2 rounded w-full mb-2"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button 
                onClick={() => setIsKeySet(true)}
                disabled={!apiKey}
                className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                  Attiva Assistente
              </button>
          </div>
      )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col h-[500px]">
      <div className="border-b pb-2 mb-2">
        <h2 className="text-xl font-bold text-purple-600">SmartUrban Assistant</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70 block mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none animate-pulse">
                    <span className="text-gray-500 text-sm">Sto analizzando il database...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Chiedi disponibilità (es. C'è posto a Murat?)"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          Invia
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;