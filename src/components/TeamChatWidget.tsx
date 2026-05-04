import { useState } from "react";
import { Users, Send } from "lucide-react";

export default function TeamChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! This is Founders Connect support. Please describe your query and our team will contact you directly." },
  ]);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSend() {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { from: "bot", text: "Thank you! Our team will reach out to you soon via your registered email or phone." },
      ]);
      setSubmitted(true);
    }, 700);
    setInput("");
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
      {!open && (
        <button
          aria-label="Open support chat"
          className="rounded-full bg-purple-600 p-3 shadow-lg hover:bg-purple-700"
          onClick={() => setOpen(true)}
        >
          <Users className="text-white" />
        </button>
      )}
      {open && (
        <div className="w-80 bg-white rounded-xl shadow-2xl border border-purple-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-purple-600 rounded-t-xl">
            <span className="text-white font-semibold">Team Support</span>
            <button onClick={() => setOpen(false)} className="text-white">✕</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto" style={{ maxHeight: 300 }}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg text-sm ${m.from === "user" ? "bg-purple-100 text-purple-900" : "bg-purple-600 text-white"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {submitted && (
              <div className="text-xs text-gray-500 mt-2">(This is a demo. Integrate with your support system for real-time chat.)</div>
            )}
          </div>
          <div className="p-2 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
              placeholder="Type your query..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              disabled={submitted}
            />
            <button
              className="bg-purple-600 rounded px-3 py-1 text-white hover:bg-purple-700"
              onClick={handleSend}
              aria-label="Send"
              disabled={submitted}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
