// src/App.jsx
import { useState, useEffect } from 'react';
import { initDemoData } from './services/api';
import StoryGallery from './components/StoryGallery';
import StoryViewer from './components/enhanced-story-viewer';
import NetworkGraph from './components/NetworkGraph';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('story');
  const [selectedStory, setSelectedStory] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(10);

  // Initialize demo data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await initDemoData();
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize demo data:', error);
        // Continue anyway for the prototype
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
  }, []);

  // Check if mobile on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle story selection
  const handleStorySelect = (story) => {
    setSelectedStory(story);
    if (isMobile) {
      setActiveTab('video');
    }
  };

  // Handle credit updates
  const handleCreditChange = (amount) => {
    setCredits(prev => prev + amount);
  };

  if (loading) {
    return (
      <div className="loading-app">
        <div className="loader"></div>
        <p>Initializing Story Network...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>StoryBridge</h1>
        <div className="credit-display">
          <span className="credit-icon">💰</span>
          <span className="credit-count">{credits}</span>
        </div>
      </header>
      
      {isMobile ? (
        <>
          <div className="mobile-content">
            {activeTab === 'story' && <StoryGallery onStorySelect={handleStorySelect} />}
            {activeTab === 'video' && <StoryViewer story={selectedStory} onCreditChange={handleCreditChange} />}
            {activeTab === 'network' && <NetworkGraph story={selectedStory} />}
          </div>
          <nav className="mobile-nav">
            <button 
              className={activeTab === 'story' ? 'active' : ''} 
              onClick={() => setActiveTab('story')}
            >
              <span className="icon">📚</span>
              <span className="label">Stories</span>
            </button>
            <button 
              className={activeTab === 'video' ? 'active' : ''} 
              onClick={() => setActiveTab('video')}
              disabled={!selectedStory}
            >
              <span className="icon">📺</span>
              <span className="label">View</span>
            </button>
            <button 
              className={activeTab === 'network' ? 'active' : ''} 
              onClick={() => setActiveTab('network')}
              disabled={!selectedStory}
            >
              <span className="icon">🌐</span>
              <span className="label">Network</span>
            </button>
          </nav>
        </>
      ) : (
        <div className="desktop-layout">
          <div className="panel story-panel">
            <StoryGallery onStorySelect={handleStorySelect} />
          </div>
          <div className="panel video-panel">
            <StoryViewer 
              story={selectedStory} 
              onCreditChange={handleCreditChange} 
            />
          </div>
          <div className="panel network-panel">
            <NetworkGraph story={selectedStory} />
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>StoryBridge Prototype &copy; 2025</p>
      </footer>
    </div>
  );
}

export default App;