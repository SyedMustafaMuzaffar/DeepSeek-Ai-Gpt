import React from 'react';
import './Sidebar.css';

const Sidebar = ({ chats, currentChatId, onNewChat, onSelectChat, onOpenModal }) => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={onNewChat}>
                    <span>+</span> New chat
                </button>
                <button className="sidebar-icon-btn" onClick={() => onOpenModal('search')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </button>
                <button className="sidebar-icon-btn" title="Text to Speech" onClick={() => onOpenModal('speech')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                </button>
            </div>

            <div className="sidebar-nav">
                <div className="nav-group">
                    <small>Chat History</small>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => onSelectChat(chat.id)}
                            className={`nav-item ${chat.id === currentChatId ? 'active' : ''}`}
                            style={{ cursor: 'pointer', background: chat.id === currentChatId ? 'rgba(255, 255, 255, 0.08)' : 'transparent' }}
                        >
                            <span className="icon">💬</span>
                            <span className="label">{chat.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="footer-link" onClick={() => onOpenModal('upgrade')}>
                    <span className="icon">✨</span>
                    <span>Upgrade Plan</span>
                </button>
                <button className="footer-link" onClick={() => onOpenModal('settings')}>
                    <span className="icon">⚙️</span>
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
