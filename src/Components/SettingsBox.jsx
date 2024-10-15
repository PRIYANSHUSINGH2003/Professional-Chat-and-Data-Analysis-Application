import React from 'react';
import './SettingsBox.css';

const SettingsBox = ({ onClose, appVersion }) => {
    return (
        <div className="settings-box-overlay" onClick={onClose}>
            <div className="settings-box" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>✖</button>
                <div className='Box-Shawdow'>
                <div className="settings-header">
                    <h3>Settings</h3>
                    <div className="app-version">Version: {appVersion}</div>
                </div>
                <div className="settings-content">
                    <p><strong>Developer:</strong> Priyanshu Singh</p>
                    <p><strong>Email:</strong> <a href="mailto:priyanshusingh00004@gmail.com" className="settings-link"></a></p>
                    <p><strong>YouTube:</strong> <a href="https://www.youtube.com/@technicalworld9464" target="_blank" className="settings-link">Your YouTube Channel</a></p>
                    <p><strong>GitHub:</strong> <a href="https://github.com/PRIYANSHUSINGH2003" target="_blank" className="settings-link">github.com/Priyanshu Singh</a></p>
                    <p><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/priyanshu-singh-0859211b6/" target="_blank" className="settings-link">linkedin.com/in/Priyanshu</a></p>
                </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsBox;
