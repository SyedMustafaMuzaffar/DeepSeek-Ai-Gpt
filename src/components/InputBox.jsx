import React, { useState } from 'react';
import './InputBox.css';

const InputBox = ({ onSendMessage, disabled, onOpenModal }) => {
    const [input, setInput] = useState('');

    const handleAttachmentClick = () => {
        onOpenModal('attachments');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="input-container">
            <div className="input-form">
                <div className="start-actions" style={{ paddingBottom: '4px', paddingRight: '12px' }}>
                    <button className="action-btn" onClick={handleAttachmentClick} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
                <textarea
                    className="chat-input"
                    placeholder="Message AIGPT..."
                    rows={1}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                />
                <button
                    className={`send-button ${input.trim() && !disabled ? 'active' : ''}`}
                    onClick={handleSubmit}
                    disabled={!input.trim() || disabled}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
            <div className="disclaimer">
                AIGPT can make mistakes. Check important information.
            </div>
        </div>
    );
};

export default InputBox;
