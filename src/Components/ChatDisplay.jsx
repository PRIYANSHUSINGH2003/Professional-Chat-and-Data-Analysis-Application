import React from 'react';
import './ChatDisplay.css';

const ChatDisplay = ({ chatHistory }) => {
    return (
        <div className="chat-display">
            {chatHistory.map((message, index) => (
                <div
                    key={index}
                    className={`chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                    {message.content}
                </div>
            ))}
        </div>
    );
};

export default ChatDisplay;
