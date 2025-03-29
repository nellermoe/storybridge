// src/components/StoryViewer.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function StoryViewer({ story }) {
  const [shared, setShared] = useState(false);
  const [reward, setReward] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Reset state when story changes
  useEffect(() => {
    setShared(false);
    setReward(0);
    setShowAnimation(false);
    setProgress(0);
  }, [story]);

  const handleShare = () => {
    setShared(true);
    setReward(5);
    
    // Start progress animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 3000);
      }
    }, 50);
  };

  if (!story) {
    return <div className="empty-state">Select a story to view</div>;
  }

  // Calculate new distance after sharing
  const newDistance = shared ? story.stepsAway - 1 : story.stepsAway;

  return (
    <div className="story-viewer">
      <div className="video-container">
        {/* In a real app, this would be a video player */}
        <div className="mock-video">
          <img 
            src={story.thumbnail} 
            alt={story.title} 
            style={{ width: '100%', height: '240px', objectFit: 'cover' }}
          />
          <div className="play-button">▶</div>
        </div>
      </div>
      
      <div className="story-info">
        <h2>{story.title}</h2>
        <div className="storyteller-info">
          <div className="avatar">
            {story.storyteller.charAt(0)}
          </div>
          <div className="details">
            <div className="name">{story.storyteller}</div>
            <div className="role">{story.storytellerRole}</div>
          </div>
        </div>
        
        <div className="target-info">
          <h3>Trying to reach:</h3>
          <div className="avatar target-avatar">
            {story.target.charAt(0)}
          </div>
          <div className="details">
            <div className="name">{story.target}</div>
            <div className="role">{story.targetRole}</div>
          </div>
        </div>
        
        <div className="journey-info">
          <h3>Journey</h3>
          <div className="distance-display">
            {/* Visual representation of steps */}
            <div className="steps-visualization">
              <div className="step-node start"></div>
              {Array.from({ length: newDistance }).map((_, i) => (
                <div key={i} className="step-connector">
                  <div className="connector-line"></div>
                  <div className="step-node"></div>
                </div>
              ))}
              <div className="step-connector">
                <div className="connector-line"></div>
                <div className="step-node end"></div>
              </div>
            </div>
            <div className="distance-text">
              <span className={newDistance <= 2 ? 'close' : newDistance >= 6 ? 'far' : 'medium'}>
                {newDistance} {newDistance === 1 ? 'step' : 'steps'} away
                {shared && <span className="reduced"> (was {story.stepsAway})</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {!shared ? (
        <button 
          className="share-button"
          onClick={handleShare}
        >
          Share This Story
        </button>
      ) : progress < 100 ? (
        <div className="sharing-progress">
          <div className="progress-text">Sharing...</div>
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="share-success">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="success-message"
          >
            Story Shared! +{reward} credits earned
          </motion.div>
        </div>
      )}
      
      <AnimatePresence>
        {showAnimation && (
          <motion.div 
            className="success-animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="confetti-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="confetti"
                  initial={{ 
                    y: -20, 
                    x: Math.random() * 400 - 200,
                    rotate: Math.random() * 360,
                    opacity: 1
                  }}
                  animate={{ 
                    y: 500, 
                    rotate: Math.random() * 360 + 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    ease: "easeOut" 
                  }}
                  style={{
                    backgroundColor: [
                      '#ff6347', '#4682b4', '#ffa500', '#9ACD32', 
                      '#BA55D3', '#FF69B4'
                    ][Math.floor(Math.random() * 6)],
                    width: 10 + Math.random() * 10,
                    height: 10 + Math.random() * 10,
                  }}
                />
              ))}
            </div>
            <motion.div
              className="reward-popup"
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
            >
              <div className="reward-icon">🎉</div>
              <div className="reward-text">You shortened the path!</div>
              <div className="reward-credits">+{reward} credits</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StoryViewer;