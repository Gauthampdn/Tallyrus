import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import { MessageSquare, X, Send, Mic, MicOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Chatbot = ({ onClassroomUpdate }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello there!
Welcome to Tallyrus Assistant!
I’m here to help you manage your courses with ease. 
Ask me to:
  • Create a classroom for you with a classname and (optional) description
  • Add assignments directly to an existing classroom`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description:
          "Voice recognition is not supported in your browser. Please use Chrome.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    document.body.classList.toggle("show-chatbot");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BACKEND}/openai/function-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ userInput: userMessage }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.chatResponse || "Failed to get response");
      }

      const data = await response.json();
      if (data.chatResponse) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.chatResponse },
        ]);

        setIsLoading(false);
        // Immediately fetch updated classrooms after any response
        try {
          console.log("Fetching updated classroom list...");
          const classroomsResponse = await fetch(
            `${process.env.REACT_APP_API_BACKEND}/classroom`,
            {
              credentials: "include",
            }
          );

          if (classroomsResponse.ok) {
            const classrooms = await classroomsResponse.json();
            console.log("Received updated classrooms:", classrooms);
            onClassroomUpdate(classrooms);
          } else {
            console.error(
              "Failed to fetch classrooms:",
              await classroomsResponse.text()
            );
          }
        } catch (error) {
          console.error("Error fetching classrooms:", error);
        }
      } else {
        throw new Error("No chat response received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.message || "Sorry, I encountered an error. Please try again.",
        },
      ]);

      toast({
        title: "Error",
        description:
          error.message || "An error occurred while processing your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("show-chatbot");
    };
  }, []);

  return (
    <>
      <button id="chatbot-toggler" onClick={toggleChatbot}>
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageSquare className="h-6 w-6 text-white" />
        )}
      </button>

      <div className={`chatbot-popup ${isOpen ? "show" : ""}`}>
        <div className="chat-header">
          <div className="header-info">
            <img
              src="/tallyrus2green.png"
              alt="Tallyrus Logo"
              className="chatbot-logo"
            />
            <span className="logo-text">Tallyrus Assistant</span>
          </div>
          <button id="close-chatbot" onClick={toggleChatbot}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${
                msg.role === "user" ? "user-message" : "bot-message"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="bot-avatar">
                  <img
                    src="/tallyrus2white.png"
                    alt="Tallyrus Logo"
                  />
                </div>
              )}
              <div className="message-text">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message thinking">
              <div className="bot-avatar">
                <img
                    src="/tallyrus2white.png"
                    alt="Tallyrus Logo"
                  />
              </div>
              <div className="message-text">
                <div className="thinking-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-footer">
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              className="message-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening ? "Listening..." : "Type your message..."
              }
              disabled={isLoading}
              required
            />
            <div className="chat-controls">
              <button
                type="button"
                onClick={toggleMic}
                className={`mic-button ${isListening ? "listening" : ""}`}
                disabled={isLoading}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
              <button
                type="submit"
                id="send-message"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
