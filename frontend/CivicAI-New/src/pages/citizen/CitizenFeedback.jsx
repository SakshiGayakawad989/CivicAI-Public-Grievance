import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StarRating } from '../../components/citizen/StarRating';
import { useCivicData } from '../../context/CivicDataContext';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  MessageSquareHeart,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function CitizenFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, addFeedback, feedbackList } = useCivicData();

  const complaintId = id || 18;
  const complaint = getComplaintById(complaintId) || getComplaintById(18);

  // Check if feedback exists already for this complaint
  const existingFeedback = feedbackList.find(f => f.complaintId === parseInt(complaintId, 10));

  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [comment, setComment] = useState(
    existingFeedback?.comment || 'The issue was resolved quickly and efficiently by the department squad.'
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5: return "5 / 5 Stars — Excellent Resolution";
      case 4: return "4 / 5 Stars — Good Job";
      case 3: return "3 / 5 Stars — Average Resolution";
      case 2: return "2 / 5 Stars — Needs Improvement";
      case 1:
      default: return "1 / 5 Stars — Poor Resolution";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Map rating stars to verbal satisfaction for backward data compatibility
    let satisfaction = "Very Satisfied";
    if (rating === 4) satisfaction = "Satisfied";
    else if (rating === 3) satisfaction = "Neutral";
    else if (rating <= 2) satisfaction = "Unsatisfied";

    addFeedback({
      complaintId,
      rating,
      satisfaction,
      comment
    });
    setIsSubmitted(true);
    setTimeout(() => {
      navigate(`/citizen/complaints/${complaintId}`);
    }, 1200);
  };

  return (
    <div className="portal-page-container full-width-container">
      {/* Back Bar */}
      <div className="feedback-top-bar">
        <Link to={`/citizen/complaints/${complaintId}`} className="back-nav-link">
          <ArrowLeft size={16} />
          <span>Back to Complaint #{complaintId}</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="feedback-header-card card-box">
        <div className="feedback-header-icon-wrap">
          <MessageSquareHeart size={26} className="feedback-header-icon" />
        </div>
        <div className="feedback-header-text">
          <h1 className="feedback-main-title">Complaint Resolution Feedback</h1>
          <p className="feedback-sub-title">
            Rate Resolution for Complaint #{complaint?.id || complaintId} — <strong>"{complaint?.title || 'broken streetlight'}"</strong>
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="feedback-form-card card-box full-width-card">
        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Question: 5-Star Rating Only */}
          <div className="feedback-question-section">
            <h3 className="feedback-question-title">
              How satisfied are you with the resolution of your complaint?
            </h3>
            <p className="feedback-question-desc">
              Click to select star rating for this completed municipal repair.
            </p>
            
            <div className="star-rating-block-pure">
              <StarRating rating={rating} onChange={setRating} size={46} />
              <div className="rating-score-display-highlight">
                <strong>{getRatingLabel(rating)}</strong>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="feedback-question-section">
            <h3 className="feedback-question-title">Detailed Feedback & Comments</h3>
            <textarea
              rows={5}
              placeholder="Describe the speed, quality, and communication of the resolution squad..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          {/* Verified Resident Trust Badge */}
          <div className="feedback-trust-notice">
            <ShieldCheck size={16} className="trust-icon" />
            <span>Submitted ratings are directly logged to the municipal department SLA performance audit.</span>
          </div>

          {/* Submit Action */}
          <div className="feedback-submit-row">
            <button 
              type="submit" 
              className={`submit-feedback-btn ${isSubmitted ? 'btn-success-state' : ''}`}
              disabled={isSubmitted}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Feedback Recorded! Redirecting...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Citizen Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
