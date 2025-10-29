import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../services/UserService';
import { getUserId } from '../utils/roleUtils';
import Navigation from '../components/Navigation';
import '../css/DeleteAccount.css'; // You'll need to create this CSS file

export default function DeleteAccount({ keycloak }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    // Validate confirmation text
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setError('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userKeycloakId = getUserId(keycloak);
      
      // Call backend to delete user
      await deleteUser(userKeycloakId, 'User requested account deletion');
      
      // Logout from Keycloak
      keycloak.logout({
        redirectUri: window.location.origin
      });

    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      setLoading(false);
    }
  };

  if (!showConfirmation) {
    return (
      <div>
        <Navigation keycloak={keycloak} />
        <div className="delete-account-container">
          <div className="delete-account-card">
            <h1>Delete Account</h1>
            
            <div className="warning-box">
              <h2>⚠️ Warning</h2>
              <p>Deleting your account is <strong>permanent</strong> and cannot be undone.</p>
            </div>

            <div className="deletion-info">
              <h3>What will be deleted:</h3>
              <ul>
                <li>Your user profile and personal information</li>
                <li>All your journal entries and attachments</li>
                <li>All your scheduled appointments</li>
                <li>Your therapist assignments</li>
                <li>All your messages and chat history</li>
              </ul>
            </div>

            <div className="button-group">
              <button 
                className="btn-cancel"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger"
                onClick={() => setShowConfirmation(true)}
              >
                Continue to Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation keycloak={keycloak} />
      <div className="delete-account-container">
        <div className="delete-account-card">
          <h1>Confirm Account Deletion</h1>
          
          <div className="danger-box">
            <p>This action is <strong>irreversible</strong>. All your data will be permanently deleted.</p>
          </div>

          <div className="confirmation-section">
            <label htmlFor="confirmText">
              Type <strong>"DELETE MY ACCOUNT"</strong> to confirm:
            </label>
            <input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="confirm-input"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="button-group">
            <button 
              className="btn-cancel"
              onClick={() => {
                setShowConfirmation(false);
                setConfirmText('');
                setError(null);
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn-danger"
              onClick={handleDeleteAccount}
              disabled={loading || confirmText !== 'DELETE MY ACCOUNT'}
            >
              {loading ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}