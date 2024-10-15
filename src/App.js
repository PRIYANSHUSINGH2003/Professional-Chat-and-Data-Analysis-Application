import React, { useState } from 'react';
import ChatInput from './Components/ChatInput';
import ChatDisplay from './Components/ChatDisplay';
import axios from 'axios';
import './App.css'; // Ensure the CSS is included
import './Components/Sidebar.css'; // Import the CSS for the sidebar
import logo from './Image/logo.png';
import DarkModeIcon from './Image/night-mode.png';
import lightModeIcon from './Image/brightness.png';
import menuIcon from './Image/menu.png'; // Menu icon for toggling the sidebar
import closeIcon from './Image/close.png'; // Close icon for closing the sidebar
import settingsIcon from './Image/settings.png'; // Correct the settings icon path
import SettingsBox from './Components/SettingsBox';
import MainTable from './Components/MainTable';
import LineGraph from './Components/LineGraph';

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Manage sidebar visibility
  const [newDatasetUrl, setNewDatasetUrl] = useState(''); // State for the new dataset URL
  const [settingsOpen, setSettingsOpen] = useState(false); // State to control settings box visibility
  const [currentView, setCurrentView] = useState('chat');

  const handleSend = async (userInput) => {
    const userMessage = { role: 'user', content: userInput };
    setChatHistory([...chatHistory, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { userInput });
      const botMessage = { role: 'assistant', content: response.data.content };
      setChatHistory([...chatHistory, userMessage, botMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      const errorMessage = { role: 'assistant', content: 'There was an error processing your request. Please try again.' };
      setChatHistory([...chatHistory, userMessage, errorMessage]);
    }
  };

  const handleDatasetUrlChange = async () => {
    try {
      await axios.post('http://localhost:5000/api/update-dataset-url', { datasetUrl: newDatasetUrl });
      alert('Dataset URL updated and processed successfully!');
    } catch (error) {
      console.error('Error updating dataset URL:', error);
      alert('There was an error updating the dataset URL.');
    }
  };

  const handleDeleteDataset = async () => {
    try {
      // Implement your endpoint or logic to delete the dataset
      await axios.post('http://localhost:5000/api/delete-dataset'); // Placeholder endpoint
      alert('Dataset deleted successfully!');
    } catch (error) {
      console.error('Error deleting dataset:', error);
      alert('There was an error deleting the dataset.');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderMainContent = () => {
    if (currentView === 'table') {
      return (
        <div>
          <button className="back-button" onClick={() => setCurrentView('chat')}>↩️</button>
          <MainTable />
        </div>
      );
    }
    if (currentView === 'analytics') {
      return (
        <div>
          <button className="back-button" onClick={() => setCurrentView('chat')}>↩️</button>
          {/* Analytics component can be added here */}
          <LineGraph/>
        </div>
      );
    }
    return (
      <>
        <ChatDisplay chatHistory={chatHistory} onSidebarOpen={() => setSidebarOpen(true)} />
        <ChatInput handleSend={handleSend} />
      </>
    );
  };


  return (
    <div className={`chat-app-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {settingsOpen && (
        <SettingsBox onClose={() => setSettingsOpen(false)}
          appVersion="1.0.0"
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <header className="sidebar-header">
          {sidebarOpen && <h2 className="sidebar-title">Chats</h2>}
          {sidebarOpen && (
            <button className="settings-button" onClick={() => setSettingsOpen(true)}>
              <img src={settingsIcon} alt="Settings" className="settings-icon" />
            </button>
          )}
        </header>
        {sidebarOpen && (
          <div className="update-dataset-url">
            <h3 className='input-h3'>Enter Kaggle Dataset url <br /><code className='input-code'>Example: (Username/Dataset_name)</code></h3>
            <input
              type="text"
              placeholder="Enter dataset URL"
              value={newDatasetUrl}
              onChange={(e) => setNewDatasetUrl(e.target.value)}
            />
            <button onClick={handleDatasetUrlChange}>Update Dataset</button>
            <button className="delete-dataset-button" onClick={handleDeleteDataset}>Delete Dataset</button>
          </div>
        )}
        <div className="update-dataset-url">
          <button onClick={() => setCurrentView('table')}>Create Data Table</button>
          <button onClick={() => setCurrentView('analytics')}>Create Analytics <code>(Graph)</code></button>
        </div>
      </aside>
      <main className={`chat-main ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <header className="chat-header">
          <img src={logo} alt="Logo" className="chat-logo" />
          <h1 className="chat-title">Professional Chat</h1>
          <div>
            <button className="dark-mode-toggle" onClick={toggleDarkMode}>
              <img
                src={darkMode ? lightModeIcon : DarkModeIcon}
                alt={darkMode ? "Light Mode" : "Dark Mode"}
                className="dark-mode-icon"
              />
            </button>
            <button className="toggle-sidebar-button" onClick={toggleSidebar}>
              <img
                src={sidebarOpen ? closeIcon : menuIcon}
                alt={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                className="sidebar-icon"
              />
            </button>
          </div>
        </header>
        {renderMainContent()}
      </main>
    </div>
  );
};

export default App;
