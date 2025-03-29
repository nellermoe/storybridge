// src/components/StoryGallery.jsx
import { useState, useEffect } from 'react';
import { getStories } from '../services/api';

function StoryGallery({ onStorySelect }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const data = await getStories();
        setStories(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories. Please try again later.');
        // Fallback to mock data if API fails
        setStories([
          {
            id: 1,
            title: "Healthcare Access in Rural South Sudan",
            storyteller: "Nyakim",
            storytellerRole: "Village Elder",
            target: "Minister of Health",
            targetRole: "Government Official",
            stepsAway: 5,
            thumbnail: "https://via.placeholder.com/150",
            videoUrl: "https://example.com/video1.mp4"
          },
          {
            id: 2,
            title: "River Pollution in Wyoming",
            storyteller: "Jim",
            storytellerRole: "Local Farmer",
            target: "Wildlife Director",
            targetRole: "Government Official",
            stepsAway: 3,
            thumbnail: "https://via.placeholder.com/150",
            videoUrl: "https://example.com/video2.mp4"
          },
          {
            id: 3,
            title: "Oil Pipeline Environmental Impact",
            storyteller: "Anna",
            storytellerRole: "Environmental Activist",
            target: "Li Wei",
            targetRole: "Community Leader",
            stepsAway: 7,
            thumbnail: "https://via.placeholder.com/150",
            videoUrl: "https://example.com/video3.mp4"
          },
          {
            id: 4,
            title: "Housing Displacement Warning",
            storyteller: "Marcus",
            storytellerRole: "Community Organizer",
            target: "Neighborhood Association",
            targetRole: "Organization",
            stepsAway: 2,
            thumbnail: "https://via.placeholder.com/150",
            videoUrl: "https://example.com/video4.mp4"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, []);

  // Sort stories by steps away (closest first)
  const sortedStories = [...stories].sort((a, b) => a.stepsAway - b.stepsAway);

  return (
    <div className="story-gallery">
      <h2>Stories Near You</h2>
      {loading ? (
        <div className="loading-indicator">
          <p>Loading stories...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="story-list">
          {sortedStories.map(story => (
            <div 
              key={story.id} 
              className="story-card"
              onClick={() => onStorySelect(story)}
            >
              <img src={story.thumbnail} alt={story.title} />
              <h3>{story.title}</h3>
              <p className="storyteller">By: {story.storyteller}</p>
              <p className="target">To: {story.target}</p>
              <div className="steps-indicator">
                <span className={story.stepsAway <= 2 ? 'close' : story.stepsAway >= 6 ? 'far' : 'medium'}>
                  {story.stepsAway} steps away
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress" 
                    style={{ width: `${(1 - story.stepsAway/10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StoryGallery;