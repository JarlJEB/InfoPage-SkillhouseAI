import { useState, useEffect } from 'react';
import chunks from '../data/skillhouse_chunks.json';

export default function InfoPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const intro = "Hei! Hva lurer du på?";
    const words = intro.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      setMessages([{ from: 'bot', words: words.slice(0, i + 1) }]);
      i++;
      if (i === words.length) {
        clearInterval(interval);
        setPlaceholder('Spør meg om Skillhouse...');
      }
    }, 250);
  }, []);

  const findRelevantChunk = (question) => {
    const q = question.toLowerCase();
    let bestMatch = chunks[0];
    let score = 0;

    chunks.forEach(chunk => {
      const combined = (chunk.title + ' ' + chunk.content).toLowerCase();
      const count = q.split(' ').filter(word => combined.includes(word)).length;
      if (count > score) {
        score = count;
        bestMatch = chunk;
      }
    });

    return bestMatch.content;
  };

  const fakeOpenAISummary = (context, question) => {
    return `> (Simulert svar basert på dokumentet)
${context}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');
    setMessageCount((count) => count + 1);

    setMessages((prev) => {
      const updated = [
        { from: 'user', text: question },
        ...prev
      ];
      return updated.slice(0, 6);
    });

    const context = findRelevantChunk(question);
    const reply = fakeOpenAISummary(context, question);
    const words = reply.split(' ');
    let i = 0;

    const interval = setInterval(() => {
      setMessages((prev) => {
        const existing = prev.filter((m) => m.from !== 'bot');
        const botMsg = { from: 'bot', words: words.slice(0, i + 1) };
        return [botMsg, ...existing].slice(0, 6);
      });
      i++;
      if (i === words.length) {
        clearInterval(interval);
        setPlaceholder(
          messageCount + 1 >= 3 ? 'Vil du høre en suksesshistorie?' : 'Lurer du på noe annet?'
        );
      }
    }, 150);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-4 pt-[40vh] relative bg-[#312f2f] text-skillwhite font-sans overflow-hidden">
      <div className="w-full max-w-2xl flex flex-col items-start space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap transition-opacity duration-500 ${
              msg.from === 'bot' ? 'italic' : 'font-semibold'
            }`}
          >
            {msg.words
              ? msg.words.map((word, j) => (
                  <span
                    key={j}
                    className="inline-block opacity-0 animate-fade-in"
                    style={{ animationDelay: \`\${j * 150}ms\` }}
                  >
                    {word + ' '}
                  </span>
                ))
              : msg.text}
          </p>
        ))}
      </div>
      <div className="w-full max-w-2xl mt-8 flex items-center">
        <input
          type="text"
          className="bg-transparent border-none text-skillwhite placeholder-gray-500 focus:outline-none flex-1 text-lg"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-4 p-2 bg-skillgreen rounded-md hover:bg-opacity-80 transition"
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-skillwhite" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="absolute bottom-4 right-4 opacity-50">
        <img src="/skillhouse-logo.svg" alt="Skillhouse logo" className="h-5" />
      </div>
    </main>
  );
}