import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "¡Hola! Soy Lumi, tu asistente de Turnify. ¿En qué te puedo ayudar? 🌿",
    },
  ]);

  const [input, setInput] = useState("");

  const suggestions = [
    "¿Cómo reservo un turno?",
    "¿Cuáles son los horarios?",
    "¿Cómo cancelo mi turno?",
  ];

  function send(text) {
    const message = text || input;

    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text: message,
      },
    ]);

    setInput("");

    setTimeout(() => {
      let response =
        "Entendido. Un momento mientras busco la mejor respuesta para vos. 😊";

      const normalizedMessage = message.toLowerCase();

      if (normalizedMessage.includes("reserv")) {
        response =
          "Para reservar, hacé clic en 'Reservar mi turno' y seguí los pasos.";
      } else if (normalizedMessage.includes("cancel")) {
        response =
          "Podés cancelar tu turno desde 'Mis Turnos' en tu perfil.";
      } else if (normalizedMessage.includes("horario")) {
        response =
          "Atendemos de lunes a sábado de 9:00 a 18:00 hs.";
      }

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: response,
        },
      ]);
    }, 700);
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
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
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
              </div>
            ))}
          </div>

          <div className="chatbot-suggestions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="chatbot-suggestion"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="chatbot-input-container">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send("");
                }
              }}
              placeholder="Escribí tu mensaje..."
              className="chatbot-input"
            />

            <button
              type="button"
              onClick={() => send("")}
              className="chatbot-send"
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="chatbot-toggle"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}

export default Chatbot;