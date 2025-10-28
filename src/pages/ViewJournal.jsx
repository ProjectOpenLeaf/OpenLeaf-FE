import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJournalById } from '../services/JournalService';
import '../css/ViewJournal.css';

export default function ViewJournal() {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadJournal();
  }, [id]);

  const loadJournal = async () => {
    try {
      setLoading(true);
      const data = await getJournalById(id);
      setJournal(data);
      setError(null);
    } catch (err) {
      console.error('Error loading journal:', err);
      if (err.response?.status === 404) {
        setError('Journal entry not found');
      } else {
        setError('Failed to load journal entry. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const wordCount = journal?.content.trim().split(/\s+/).filter(word => word.length > 0).length || 0;

  if (loading) {
    return (
      <div className="view-journal-container">
        <div className="loading">Loading journal entry...</div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="view-journal-container">
        <div className="error-state">
          <h2>😕 {error || 'Journal not found'}</h2>
          <button onClick={() => navigate('/journals')}>
            ← Back to Journals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-journal-container">
      <div className="view-journal-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/journals')}
        >
          ← Back to Journals
        </button>
      </div>

      <div className="journal-content-wrapper">
        <div className="journal-metadata">
          <div className="metadata-item">
            <span className="metadata-label">Date</span>
            <span className="metadata-value">{formatDate(journal.createdAt)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Time</span>
            <span className="metadata-value">{formatTime(journal.createdAt)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Words</span>
            <span className="metadata-value">{wordCount}</span>
          </div>
        </div>

        <div className="journal-content">
          <p>{journal.content}</p>
        </div>

        {journal.updatedAt !== journal.createdAt && (
          <div className="journal-updated">
            Last updated: {formatDate(journal.updatedAt)} at {formatTime(journal.updatedAt)}
          </div>
        )}
      </div>
    </div>
  );
}