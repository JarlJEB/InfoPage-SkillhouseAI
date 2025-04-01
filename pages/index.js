
import { useState, useEffect, useRef } from 'react';
import chunks from '../data/skillhouse_chunks.json';

export default function Home() {
  const [messages, setMessages] = useState([
    { from: 'bot', words: ['Hei!', 'Hva', 'lurer', 'du', 'på?'] }
  ]);
  const [input, setInput] = useState('');
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const findRelevantChunk = (question) => {
    const q = question.toLowerCase();
    return chunks.find(chunk => chunk.content.toLowerCase().includes(q)) || chunks[0];
  };

  const fakeOpenAISummary = (context, question) => {
    return `Basert på informasjonen min: ${context.content}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const question = input.trim();
    setInput('');

    const context = findRelevantChunk(question);
    const reply = fakeOpenAISummary(context, question);
    const words = reply.split(' ');

    setMessages(prev => [
      { from: 'user', text: question },
      ...prev,
    ]);

    // Animate words in sequence
    let i = 0;
    clearTimeout(timeoutRef.current);

    const animateWords = () => {
      setMessages(prev => {
        const prevBot = prev.find(m => m.from === 'bot' && m.words);
        const newWords = prevBot ? [...prevBot.words, words[i]] : [words[i]];
        const others = prev.filter(m => !(m.from === 'bot' && m.words));
        return [
          { from: 'bot', words: newWords },
          ...others
        ];
      });

      i++;
      if (i < words.length) {
        timeoutRef.current = setTimeout(animateWords, 120);
      }
    };

    timeoutRef.current = setTimeout(animateWords, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#312f2f] text-white flex flex-col items-center justify-center px-4 pt-32 pb-20 relative overflow-hidden">
      <div ref={containerRef} className="w-full max-w-2xl space-y-4 mb-12">
        {[...messages].reverse().map((msg, i) => (
          <div key={i} className="text-lg leading-relaxed">
            {msg.text && (
              <p className="text-right text-skillwhite opacity-90">{msg.text}</p>
            )}
            {msg.words && (
              <p className="italic text-skillwhite flex flex-wrap gap-1">
                {msg.words.map((word, j) => (
                  <span
                    key={j}
                    style={{
                      opacity: 0,
                      animation: `fadeIn 0.4s ease forwards`,
                      animationDelay: `${j * 150}ms`
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="fixed bottom-10 w-full max-w-2xl flex items-center gap-2 px-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Skriv et spørsmål her..."
          className="flex-1 bg-[#312f2f] text-white border-none focus:outline-none text-lg placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          className="bg-skillgreen hover:opacity-90 text-white rounded-xl px-4 py-2 transition"
        >
          ➤
        </button>
      </div>
      <img
        src="/skillhouse-logo.svg"
        alt="Skillhouse Logo"
        className="fixed bottom-4 right-4 w-32 opacity-80"
      />
      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
