import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJournals } from '../services/JournalService';
import '../css/JournalList.css';

export default function JournalList() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const data = await getMyJournals();
      // Sort by most recent first
      const sortedJournals = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setJournals(sortedJournals);
      setError(null);
    } catch (err) {
      console.error('Error loading journals:', err);
      setError('Failed to load journals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPreview = (content) => {
    const maxLength = 150;
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="journal-list-container">
        <div className="loading">Loading your journals...</div>
      </div>
    );
  }

  return (
    <div className="journal-list-container">
      <div className="journal-list-header">
        <h1>My Journals</h1>
        <button 
          className="create-btn"
          onClick={() => navigate('/journals/create')}
        >
          + New Journal Entry
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadJournals}>Retry</button>
        </div>
      )}

      {!loading && journals.length === 0 && (
        <div className="empty-state">
          <h2>No journal entries yet</h2>
          <p>Start documenting your thoughts and experiences</p>
          <button 
            className="create-btn-large"
            onClick={() => navigate('/journals/create')}
          >
            Create Your First Entry
          </button>
        </div>
      )}

      <div className="journals-grid">
        {journals.map((journal) => (
          <div 
            key={journal.id} 
            className="journal-card"
            onClick={() => navigate(`/journals/${journal.id}`)}
          >
            <div className="journal-card-header">
              <span className="journal-date">{formatDate(journal.createdAt)}</span>
            </div>
            <div className="journal-card-content">
              <p>{getPreview(journal.content)}</p>
            </div>
            <div className="journal-card-footer">
              <span className="read-more">Read more →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}