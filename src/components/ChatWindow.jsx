import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import './ChatWindow.css';


function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [useHistory, setUseHistory] = useState(true);

  const [chatSessions, setChatSessions] = useState([{ id: uuidv4(), messages: [] }]);
  const [currentSessionId, setCurrentSessionId] = useState(chatSessions[0].id);
  const [showHistory, setShowHistory] = useState(false);

  // 获取Ollama中的模型列表
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:11434/api/tags');
        setModels(response.data.models);
        if (response.data.models.length > 0) {
          setSelectedModel(response.data.models[0].name);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage = {
        id: uuidv4(),
        text: inputText,
        isUser: true,
        timestamp: new Date().toLocaleTimeString()
      };
      
      const updatedSessions = chatSessions.map(session => {
        if (session.id === currentSessionId) {
          return { ...session, messages: [...session.messages, newMessage] };
        }
        return session;
      });
      setChatSessions(updatedSessions);
      
      if (inputText.trim()) {
        const newMessage = {
          id: messages.length + 1,
          text: inputText,
          isUser: true,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        setIsLoading(true);
  
        try {
          let chatHistory = [];
          if (useHistory) {
            const recentMessages = messages.slice(-14);
            chatHistory = recentMessages.map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text
            }));
          }
  
          const response = await axios.post('http://localhost:11434/v1/chat/completions', {
            model: selectedModel,
            messages: [
              ...chatHistory,
              { role: 'user', content: inputText }
            ]
          });
  
          const aiMessage = {
            id: messages.length + 2,
            text: response.data.choices[0].message.content,
            isUser: false,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('Error:', error);
          const errorMessage = {
            id: messages.length + 2,
            text: '抱歉，请求失败，请稍后再试',
            isUser: false,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleNewChat = () => {
    const newSession = { id: uuidv4(), messages: [] };
    setChatSessions([...chatSessions, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]); // 清空当前消息列表
  };
  const handleSessionChange = (sessionId) => {
    setCurrentSessionId(sessionId);
    const selectedSession = chatSessions.find(session => session.id === sessionId);
    setMessages(selectedSession.messages);
  };
  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };
  return (
    <div className="chat-window">
      <div className="chat-controls">
        <button onClick={handleNewChat} className="new-chat-btn">
          新聊天
        </button>
        <button onClick={handleShowHistory} className="history-btn">
          {showHistory ? '隐藏历史' : '查看历史'}
        </button>
      </div>

      {showHistory && (
        <div className="chat-history">
          <h3>历史记录</h3>
          <ul>
            {chatSessions.map((session, index) => (
              <li
                key={session.id}
                className={session.id === currentSessionId ? 'active' : ''}
                onClick={() => handleSessionChange(session.id)}
              >
                <span className="chat-link">
                  <span className="chat-icon">💬</span>
                  聊天 {index + 1}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="model-selector">
        <label htmlFor="model-select">选择模型: </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        <label className="history-checkbox">
          <input
            type="checkbox"
            checked={useHistory}
            onChange={(e) => setUseHistory(e.target.checked)}
          />
          使用历史记录
        </label>
      </div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'ai'}`}>
            <div className="avatar">
              {msg.isUser ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <p>{msg.text}</p>
              <span className="timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="输入你的消息..."
        />
        <button onClick={handleSend}>发送</button>
      </div>
    </div>
  );
}

export default ChatWindow;