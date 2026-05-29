import { useEffect, useRef, useState } from "react";

function InputBox({ sendMessage }) {
  const [input, setInput] = useState("");
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);
  const voiceModeRef = useRef(false);

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage(input, startListening);
    setInput("");
  };

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("voice") === "true") {
    setTimeout(() => {
      toggleVoiceMode();
    }, 1000);
  }
}, []);

  const startListening = () => {
    if (!voiceModeRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;

      setInput("");
      setListening(false);

      sendMessage(voiceText, startListening);
    };

    recognition.onerror = (event) => {
      console.log("Speech error:", event.error);
      setListening(false);

      if (voiceModeRef.current) {
        setTimeout(startListening, 500);
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const toggleVoiceMode = () => {
    const newMode = !voiceModeRef.current;

    voiceModeRef.current = newMode;
    setVoiceMode(newMode);

    if (newMode) {
      startListening();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      window.speechSynthesis.cancel();
      setListening(false);
    }
  };

  return (
    <div className="input-box">
      <input
        type="text"
        placeholder="Ask Aditi something..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />

      <button onClick={toggleVoiceMode}>
        {voiceMode ? "Stop Voice" : "Start Voice"}
      </button>

      <button onClick={handleSend}>Send</button>

      {listening && <span className="listening-text">Listening...</span>}
    </div>
  );
}

export default InputBox;