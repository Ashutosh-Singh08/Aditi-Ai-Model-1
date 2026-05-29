import { useState } from "react";
import axios from "axios";

import Message from "./Message";
import InputBox from "./InputBox";

import heroImage from "../assets/hero.png";
import chibiImage from "../assets/chibi.png";

function ChatBox() {
  const AI_NAME = "Aditi";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hello Ashutosh! I am ${AI_NAME}. How can I help you today?`,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const playAudio = (audioUrl, onEnd) => {
    if (!audioUrl) {
      if (onEnd) onEnd();
      return;
    }

    const audio = new Audio(`${audioUrl}?t=${Date.now()}`);

    window.currentAditiAudio = audio;
    window.isAditiSpeaking = true;

    audio.onended = () => {
      window.isAditiSpeaking = false;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      window.isAditiSpeaking = false;
      if (onEnd) onEnd();
    };

    audio.play().catch((error) => {
      console.log("Audio play error:", error);
      window.isAditiSpeaking = false;
      if (onEnd) onEnd();
    });
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/chat/history");

      const oldMessages = response.data.chats.map((chat) => ({
        role: chat.role,
        text: chat.message,
      }));

      setMessages(oldMessages);
      setShowHistory(true);
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async (userMessage, afterSpeak) => {
    if (!userMessage.trim()) return;

    if (window.currentAditiAudio) {
      window.currentAditiAudio.pause();
      window.currentAditiAudio.currentTime = 0;
    }

    window.isAditiSpeaking = false;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/api/chat", {
        message: userMessage,
      });

      const aiText = response.data.reply;
      const audioUrl = response.data.audio;

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiText,
        },
      ]);

      playAudio(audioUrl, afterSpeak);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry Ashutosh, something went wrong.",
        },
      ]);

      if (afterSpeak) afterSpeak();
    }

    setLoading(false);
  };

  return (
    <div className="main-bg">
      <div className="anime-overlay"></div>

      <div className="chat-container">
        <div className="left-panel">
          <img src={heroImage} alt="Aditi" className="hero-image" />

          <div className="ai-info-card">
            <img src={chibiImage} alt="Chibi" className="chibi-image" />

            <h2>{AI_NAME}</h2>

            <p>For eternity ❤️</p>
          </div>
        </div>

        <div className="right-panel">
          <div className="chat-header">
            <div>
              <h2>{AI_NAME} ❤️</h2>
            </div>

            <button
              className="history-btn"
              onClick={() => {
                if (showHistory) {
                  setMessages([
                    {
                      role: "assistant",
                      text: `Hello Ashutosh! I am ${AI_NAME}. How can I help you today?`,
                    },
                  ]);

                  setShowHistory(false);
                } else {
                  fetchHistory();
                }
              }}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <Message key={index} role={msg.role} text={msg.text} />
            ))}

            {loading && (
              <div className="message assistant">
                <div className="typing-container">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          <InputBox sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
}

export default ChatBox;