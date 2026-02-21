import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Modal from './components/Modal'
import Login from './components/Login'

function App() {
  const [chats, setChats] = useState([{ id: Date.now(), title: 'New Chat', messages: [] }]);
  const [currentChatId, setCurrentChatId] = useState(chats[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [user, setUser] = useState(null); // Auth State
  const [speechSettings, setSpeechSettings] = useState({
    voiceURI: '', // Use voiceURI for reliable selection
    rate: 1.0,
    pitch: 1.0,
    isEnabled: true
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [theme, setTheme] = useState('dark'); // Theme State
  const [fileAccept, setFileAccept] = useState('*');
  const fileInputRef = useRef(null);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];

  const updateVoices = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setAvailableVoices(voices);
      // Set default voice if none selected
      setSpeechSettings(prev => {
        if (!prev.voiceURI) {
          const defaultVoice = voices.find(v => v.default) || voices[0];
          return { ...prev, voiceURI: defaultVoice.voiceURI };
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [updateVoices]);

  useEffect(() => {
    const applyTheme = (themeName) => {
      const root = document.documentElement;
      if (themeName === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('light-theme', !isDark);
      } else {
        root.classList.toggle('light-theme', themeName === 'light');
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Custom setMessages that updates the active chat's messages
  const setMessages = (newMessagesOrCallback) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === currentChatId) {
        const updatedMessages = typeof newMessagesOrCallback === 'function'
          ? newMessagesOrCallback(chat.messages)
          : newMessagesOrCallback;

        let newTitle = chat.title;
        // Auto-generate title from first user message
        if (newTitle === 'New Chat' && updatedMessages.length > 0 && updatedMessages[0].role === 'user') {
          newTitle = updatedMessages[0].content.slice(0, 30) + (updatedMessages[0].content.length > 30 ? '...' : '');
        }

        return { ...chat, messages: updatedMessages, title: newTitle };
      }
      return chat;
    }));
  };

  const handleNewChat = () => {
    if (!isLoading) {
      const newId = Date.now();
      setChats([{ id: newId, title: 'New Chat', messages: [] }, ...chats]);
      setCurrentChatId(newId);
    }
  };

  const handleSelectChat = (id) => {
    if (!isLoading) {
      setCurrentChatId(id);
    }
  };

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const handleSpeak = (text, bypassEnabled = false) => {
    if (!text || (!speechSettings.isEnabled && !bypassEnabled)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Find matching voice by URI
    const voice = availableVoices.find(v => v.voiceURI === speechSettings.voiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = speechSettings.rate;
    utterance.pitch = speechSettings.pitch;

    window.speechSynthesis.speak(utterance);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    window.speechSynthesis.cancel();
    setActiveModal(null);
  };

  const triggerFilePicker = (type) => {
    if (type === 'image') {
      setFileAccept('image/*');
    } else {
      setFileAccept('.pdf,.doc,.docx,.txt,.csv');
    }
    // Small timeout to ensure state update propagates to DOM
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const fileData = {
        name: file.name,
        type: file.type,
        size: (file.size / 1024).toFixed(1) + ' KB',
        preview: isImage ? URL.createObjectURL(file) : null
      };

      const newMessage = {
        id: Date.now(),
        role: 'user',
        content: isImage ? '' : `Attached file: ${file.name}`,
        file: fileData
      };

      setMessages(prev => [...prev, newMessage]);
      closeModal();

      // Trigger dummy AI response for contextual feel
      setTimeout(() => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          const aiResponse = {
            id: Date.now() + 1,
            role: 'ai',
            content: isImage
              ? "I've received your image. How can I help you with it?"
              : `I've received the file "${file.name}". What would you like me to do with it?`
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      }, 500);
    }
  };

  const getModalContent = () => {
    switch (activeModal) {
      case 'upgrade':
        return {
          title: 'Upgrade Plan',
          content: (
            <div className="upgrade-modal">
              <p>Experience the full power of AI with our Premium plans.</p>
              <div className="plans-grid">
                <div className="plan-card">
                  <h3>Free</h3>
                  <p>Basic features</p>
                  <button disabled>Current Plan</button>
                </div>
                <div className="plan-card featured">
                  <h3>Pro</h3>
                  <p>$20/month</p>
                  <button className="primary-btn">Upgrade Now</button>
                </div>
              </div>
            </div>
          )
        };
      case 'settings':
        return {
          title: 'Settings',
          content: (
            <div className="settings-modal">
              <div className="setting-item">
                <label>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Data Sharing</label>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          )
        };
      case 'profile':
        return {
          title: 'User Profile',
          content: (
            <div className="profile-modal">
              <div className="profile-header">
                <div className="profile-avatar large">U</div>
                <div className="profile-info">
                  <h3>User Name</h3>
                  <p>user@example.com</p>
                </div>
              </div>
              <button className="secondary-btn">Edit Profile</button>
              <button className="danger-btn" onClick={handleLogout}>Log Out</button>
            </div>
          )
        };
      case 'search':
        return {
          title: 'Search Chats',
          content: (
            <div className="search-modal">
              <input type="text" placeholder="Search your history..." className="search-input" autoFocus />
              <div className="search-results">
                <p className="no-results">No recent chats match your search.</p>
              </div>
            </div>
          )
        };
      case 'speech':
        return {
          title: 'Text to Speech Settings',
          content: (
            <div className="speech-modal">
              <div className="setting-item" style={{ marginBottom: '24px' }}>
                <label>TTS Service</label>
                <div className="button-group">
                  <button
                    className={`group-btn ${speechSettings.isEnabled ? 'active' : ''}`}
                    onClick={() => setSpeechSettings({ ...speechSettings, isEnabled: true })}
                  >
                    ON
                  </button>
                  <button
                    className={`group-btn ${!speechSettings.isEnabled ? 'active-off' : ''}`}
                    onClick={() => {
                      setSpeechSettings({ ...speechSettings, isEnabled: false });
                      window.speechSynthesis.cancel();
                    }}
                  >
                    OFF
                  </button>
                </div>
              </div>
              <div className={`speech-settings-controls ${!speechSettings.isEnabled ? 'disabled' : ''}`}>
                <div className="setting-item">
                  <label>Voice</label>
                  <select
                    value={speechSettings.voiceURI}
                    onChange={(e) => setSpeechSettings({ ...speechSettings, voiceURI: e.target.value })}
                    disabled={!speechSettings.isEnabled}
                  >
                    {availableVoices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="setting-item">
                  <label>Speaking Rate ({speechSettings.rate}x)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechSettings.rate}
                    onChange={(e) => setSpeechSettings({ ...speechSettings, rate: parseFloat(e.target.value) })}
                    disabled={!speechSettings.isEnabled}
                  />
                </div>
                <div className="setting-item">
                  <label>Pitch ({speechSettings.pitch})</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speechSettings.pitch}
                    onChange={(e) => setSpeechSettings({ ...speechSettings, pitch: parseFloat(e.target.value) })}
                    disabled={!speechSettings.isEnabled}
                  />
                </div>
                <div className="speech-preview" style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="secondary-btn"
                    onClick={() => handleSpeak("This is a preview of the selected voice settings.", true)}
                    disabled={!speechSettings.isEnabled}
                    style={{ flex: 1 }}
                  >
                    Preview Voice
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => window.speechSynthesis.cancel()}
                    style={{ flex: 1 }}
                  >
                    Stop Speech
                  </button>
                </div>
              </div>
            </div>
          )
        };
      case 'attachments':
        return {
          title: 'Upload Attachments',
          content: (
            <div className="attachments-modal">
              <p>Select the type of file you'd like to share with AIGPT.</p>
              <div className="suggestions-grid" style={{ marginTop: '20px' }}>
                <div className="suggestion-card" onClick={() => triggerFilePicker('document')}>
                  <div className="card-title">
                    <span>📁</span> Document
                  </div>
                  <div className="card-subtitle">PDF, Word, TXT, etc.</div>
                </div>
                <div className="suggestion-card" onClick={() => triggerFilePicker('image')}>
                  <div className="card-title">
                    <span>🖼️</span> Image
                  </div>
                  <div className="card-subtitle">PNG, JPG, WEBP</div>
                </div>
              </div>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const modalData = getModalContent();


  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenModal={openModal}
        user={user}
      />
      <ChatArea
        messages={currentChat.messages}
        setMessages={setMessages}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onSpeak={handleSpeak}
        isSpeechEnabled={speechSettings.isEnabled}
        onOpenModal={openModal}
      />
      {activeModal && (
        <Modal
          isOpen={!!activeModal}
          title={modalData.title}
          content={modalData.content}
          onClose={closeModal}
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept={fileAccept}
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App
