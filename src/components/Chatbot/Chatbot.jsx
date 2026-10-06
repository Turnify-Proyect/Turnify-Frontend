import { useState } from "react";
import "./Chatbot.css";

const API_BASE_URL = "http://localhost:3000";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeLoaded, setWelcomeLoaded] = useState(false);

  function addBotMessage(text) {
    setMessages((current) => [...current, { from: "bot", text }]);
  }

  function addApiMessages(response) {
    const apiMessages = Array.isArray(response.messages)
      ? response.messages
      : [];

    setMessages((current) => [
      ...current,
      ...apiMessages.map((message) => ({
        from: message.role === "user" ? "user" : "bot",
        text: message.content,
        type: message.type,
        payload: message.payload,
      })),
    ]);
  }

  async function callApi(path, options = {}) {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con ${response.status}`);
      }

      const data = await response.json();
      addApiMessages(data);
      return true;
    } catch (error) {
      console.error("Error al comunicarse con Lumi:", error);
      addBotMessage(
        "No pude conectarme con Lumi. Verifica que el backend esté iniciado e intenta de nuevo.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function loadWelcome() {
    const success = await callApi("/chatbot/welcome");
    setWelcomeLoaded(success);
  }

  function toggleChat() {
    if (!open && !welcomeLoaded && !loading) {
      void loadWelcome();
    }

    setOpen((current) => !current);
  }

  async function send(text = input) {
    const message = text.trim();

    if (!message || loading) return;

    setMessages((current) => [...current, { from: "user", text: message }]);
    setInput("");

    await callApi("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({
        userId: "web-guest",
        text: message,
      }),
    });
  }

  async function handleOptionClick(label, message) {
    if (loading) return;

    const payload = message.payload || {};

    if (message.type === "category") {
      const category = payload.categories?.find(
        (item) => `${item.icon} ${item.label}` === label,
      );

      if (category) {
        setMessages((current) => [
          ...current,
          { from: "user", text: label },
        ]);
        await callApi(
          `/chatbot/category/${encodeURIComponent(category.id)}`,
        );
        return;
      }
    }

    if (payload.action === "faq_question" && payload.category) {
      setMessages((current) => [...current, { from: "user", text: label }]);

      const params = new URLSearchParams({
        category: payload.category,
        question: label,
      });

      await callApi(`/chatbot/answer?${params.toString()}`);
      return;
    }

    await send(label);
  }

  function getOptions(message) {
    const payload = message.payload || {};

    if (message.type === "category" && Array.isArray(payload.categories)) {
      return payload.categories.map(
        (category) => `${category.icon} ${category.label}`,
      );
    }

    if (message.type === "buttons" && Array.isArray(payload.buttons)) {
      return payload.buttons;
    }

    return [];
  }

  return (
    <>
      {open && (
        <div className="chatbot">
          <div className="chatbot-header">
            <div className="chatbot-avatar">L</div>

            <div>
              <p className="chatbot-name">Lumi</p>
              <p className="chatbot-subtitle">Asistente virtual</p>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={toggleChat}
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.text}`}
                className={`chatbot-message-row ${
                  message.from === "user" ? "user" : "bot"
                }`}
              >
                <div
                  className={`chatbot-message ${
                    message.from === "user" ? "user" : "bot"
                  }`}
                >
                  {message.text}
                </div>

                {message.from === "bot" &&
                  getOptions(message).map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="chatbot-suggestion"
                      disabled={loading}
                      onClick={() => handleOptionClick(option, message)}
                    >
                      {option}
                    </button>
                  ))}
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row bot">
                <div className="chatbot-message bot">Lumi está escribiendo...</div>
              </div>
            )}
          </div>

          <div className="chatbot-input-container">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void send();
              }}
              placeholder="Escribí tu mensaje..."
              className="chatbot-input"
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => void send()}
              className="chatbot-send"
              disabled={loading}
              aria-label="Enviar mensaje"
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="chatbot-toggle"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}

export default Chatbot;