import React, { useState } from 'react';
import './ChatInput.css'; // Import the CSS file

const ChatInput = ({ handleSend }) => {
    const [message, setMessage] = useState('');

    const handleSendClick = () => {
        if (message.trim()) {
            handleSend(message); // Call the prop function
            setMessage('');
        }
    };

    return (
        <div className="chat-input-footer">
            <input
                type="text"
                className="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
            />
            <button className="send-button" onClick={handleSendClick}>
                Send
            </button>
        </div>
    );
};

export default ChatInput;
