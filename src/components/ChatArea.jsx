import React, { useState, useRef, useEffect } from 'react';
import InputBox from './InputBox';
import './ChatArea.css';

const ChatArea = ({ messages, setMessages, isLoading, setIsLoading, onSpeak, isSpeechEnabled, onOpenModal, apiKey }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const newMessage = {
            id: Date.now(),
            role: 'user',
            content: text
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        setIsLoading(true);

        // Create a placeholder message for the AI response
        const aiMessageId = Date.now() + 1;
        setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', content: '' }]);

        try {
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            }));

            console.log("Attempting API call with key starting with:", apiKey ? apiKey.substring(0, 10) + "..." : "MISSING");

            const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3-8b-instruct",
                    messages: apiMessages,
                    stream: true
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            setIsLoading(false); // Stop showing loading indicator as soon as stream starts

            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ") && line !== "data: [DONE]") {
                            try {
                                const parsed = JSON.parse(line.substring(6));
                                const token = parsed.choices[0]?.delta?.content || "";

                                setMessages(prev =>
                                    prev.map(msg =>
                                        msg.id === aiMessageId
                                            ? { ...msg, content: msg.content + token }
                                            : msg
                                    )
                                );
                            } catch (e) {
                                console.error("Error parsing JSON chunk:", e);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error calling API:", error);
            let errorMessage = "Sorry, I encountered an error. Please check your API key credits and network.";

            if (error.message.includes("API error")) {
                const status = error.message.split(": ")[1];
                errorMessage = `Sorry, I encountered an API error (Status: ${status}). Please check your credits.`;
            } else if (error.name === 'TypeError') {
                errorMessage = "Network error or CORS issue detected. Please ensure you have a stable connection.";
            } else {
                errorMessage = `An unexpected error occurred: ${error.message}`;
            }

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === aiMessageId
                        ? { ...msg, content: errorMessage }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="chat-area">
            <div className="chat-header">
                <div className="model-selector">
                    <span>AIGPT (Llama 3)</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>

            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="logo-container">
                            <span className="logo-icon">🤖</span>
                        </div>
                        <h1 className="welcome-text">How can I assist you?</h1>
                        <div className="suggestions-grid">
                            <div className="suggestion-card" onClick={() => handleSendMessage("Explain the concept of Glassmorphism")}>
                                <div className="card-title">
                                    <span>💡</span> Explain Concept
                                </div>
                                <div className="card-subtitle">What is Glassmorphism in modern UI design?</div>
                            </div>
                            <div className="suggestion-card" onClick={() => handleSendMessage("Write a React component using Tailwind CSS")}>
                                <div className="card-title">
                                    <span>{'<>'}</span> Code Assistance
                                </div>
                                <div className="card-subtitle">Write a React component using Tailwind CSS</div>
                            </div>
                            <div className="suggestion-card" onClick={() => handleSendMessage("Create a 10-day itinerary for Japan")}>
                                <div className="card-title">
                                    <span>🧭</span> Travel Planning
                                </div>
                                <div className="card-subtitle">Create a 10-day itinerary for Japan</div>
                            </div>
                            <div className="suggestion-card" onClick={() => handleSendMessage("Condense long articles into key points")}>
                                <div className="card-title">
                                    <span>📖</span> Summarize Text
                                </div>
                                <div className="card-subtitle">Condense long articles into key points</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`message-row ${msg.role}`}>
                            <div className="message-content-wrapper">
                                <div className={`avatar ${msg.role === 'ai' ? 'ai-avatar' : 'user-avatar'}`}>
                                    {msg.role === 'ai' ? 'AI' : 'U'}
                                </div>
                                <div className="message-text-container">
                                    <div className="message-text">
                                        {msg.content}
                                    </div>
                                    {msg.file && (
                                        <div className="file-attachment">
                                            {msg.file.preview ? (
                                                <div className="image-attachment">
                                                    <img src={msg.file.preview} alt={msg.file.name} className="attachment-preview" />
                                                    <div className="image-overlay">
                                                        <span>{msg.file.name}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="doc-attachment glass-panel">
                                                    <div className="doc-icon">📄</div>
                                                    <div className="doc-info">
                                                        <span className="doc-name">{msg.file.name}</span>
                                                        <span className="doc-size">{msg.file.size}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {msg.role === 'ai' && msg.content && isSpeechEnabled && (
                                        <div className="message-actions">
                                            <button
                                                className="action-btn speech-btn"
                                                title="Speak Message"
                                                onClick={() => onSpeak(msg.content)}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="message-row ai">
                        <div className="message-content-wrapper">
                            <div className="avatar ai-avatar">AI</div>
                            <div className="message-text" style={{ opacity: 0.7, fontStyle: 'italic' }}>
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area-wrapper">
                <InputBox onSendMessage={handleSendMessage} disabled={isLoading} onOpenModal={onOpenModal} />
            </div>
        </main>
    );
};

export default ChatArea;
