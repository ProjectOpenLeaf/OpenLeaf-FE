import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJournal } from '../services/JournalService';
import '../css/CreateJournal.css';

export default function CreateJournal() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please write something before saving');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createJournal(content);
      navigate('/journals');
    } catch (err) {
      console.error('Error creating journal:', err);
      setError('Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() && !window.confirm('Are you sure you want to discard this entry?')) {
      return;
    }
    navigate('/journals');
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="create-journal-container">
      <div className="create-journal-header">
        <h1>New Journal Entry</h1>
        <div className="header-actions">
          <button 
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="save-btn"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="journal-editor">
        <div className="editor-info">
          <span className="current-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <span className="word-count">{wordCount} words</span>
        </div>

        <textarea
          className="journal-textarea"
          placeholder="What's on your mind today?&#10;&#10;Start writing your thoughts, experiences, or reflections..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="editor-tips">
        <h3>✍️ Writing Tips</h3>
        <ul>
          <li>Be honest and authentic with yourself</li>
          <li>Don't worry about grammar or structure</li>
          <li>Focus on your feelings and experiences</li>
          <li>Write as much or as little as you want</li>
        </ul>
      </div>
    </div>
  );
}