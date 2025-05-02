import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import { MessageSquare, X, Send } from 'lucide-react';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        document.body.classList.toggle('show-chatbot');
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BACKEND}/openai/function-call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ userInput: userMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.chatResponse || 'Failed to get response');
            }

            const data = await response.json();
            if (data.chatResponse) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.chatResponse }]);
            } else {
                throw new Error('No chat response received');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: error.message || 'Sorry, I encountered an error. Please try again.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button id="chatbot-toggler" onClick={toggleChatbot}>
                {isOpen ? (
                    <X className="h-6 w-6 text-white" />
                ) : (
                    <MessageSquare className="h-6 w-6 text-white" />
                )}
            </button>

            <div className={`chatbot-popup ${isOpen ? 'show' : ''}`}>
                <div className="chat-header">
                    <div className="header-info">
                        <img src="/tallyrus2green.png" alt="Tallyrus Logo" className="chatbot-logo" />
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
                            className={`message ${msg.role === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="bot-avatar">
                                    <MessageSquare className="h-full w-full text-white p-1" />
                                </div>
                            )}
                            <div className="message-text">
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot-message thinking">
                            <div className="bot-avatar">
                                <MessageSquare className="h-full w-full text-white p-1" />
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
                            placeholder="Type your message..."
                            disabled={isLoading}
                            required
                        />
                        <div className="chat-controls">
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