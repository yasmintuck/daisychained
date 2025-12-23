import React, { useState } from 'react';
import './FeedbackModal.css';

const EMOJIS = [
  { label: '😃', title: 'Loved it', value: 5 },
  { label: '🙂', title: 'Liked it', value: 4 },
  { label: '😐', title: 'Neutral', value: 3 },
  { label: '😕', title: 'Confused', value: 2 },
  { label: '😴', title: 'Bored', value: 1 },
];

export default function FeedbackModal({ open, onClose, moduleId, getAccessTokenSilently }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  async function submit() {
    if (rating == null) {
      setError('Please let us know how the module felt to complete.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = await getAccessTokenSilently();
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/modules/${moduleId}/feedback`;

      // Try to create feedback. If a conflict (409) is returned, overwrite via PUT.
      let res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (res.status === 409) {
        // existing feedback — update instead
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        });

        if (!putRes.ok) {
          const txt = await putRes.text();
          throw new Error(txt || 'Failed to update existing feedback');
        }

        setSubmitted(true);
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to submit feedback');
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Could not submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    // reset state when closing
    setRating(null);
    setComment('');
    setError('');
    setSubmitting(false);
    setSubmitted(false);
    onClose();
  }

  return (
    <>
      {!submitted ? (
        <div className="fd-overlay" onMouseDown={close}>
          <div className="fd-modal" role="dialog" aria-modal="true" aria-labelledby="fd-title" onMouseDown={e => e.stopPropagation()}>
            <button className="fd-close" aria-label="Close" onClick={close}>✕</button>
            <h2 id="fd-title">Leave us some feedback</h2>
            <p className="fd-sub">How did this module feel to complete? <span className="required">*</span></p>

            <div className="fd-emoji-group" role="radiogroup" aria-label="Module completion feeling">
              {EMOJIS.map(e => (
                <button
                  key={e.value}
                  type="button"
                  className={`fd-emoji ${rating === e.value ? 'selected' : ''}`}
                  onClick={() => { setRating(e.value); setError(''); }}
                  aria-pressed={rating === e.value}
                  title={`${e.title} (${e.label})`}
                >
                  <span className="emoji">{e.label}</span>
                </button>
              ))}
            </div>

            {error && <div className="fd-error" role="alert">{error}</div>}

            <label className="fd-textarea-label" htmlFor="fd-comment">Additional comments (optional)</label>
            <textarea id="fd-comment" className="fd-textarea" rows={5} value={comment} onChange={e => setComment(e.target.value)} placeholder="Want to share anything else? What worked well or what we could improve."></textarea>

            <div className="fd-actions">
              <button className="fd-cancel" onClick={close}>Skip</button>
              <button className="fd-submit" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit feedback'}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fd-overlay" onMouseDown={close}>
          <div className="fd-modal fd-thanks" role="dialog" aria-modal="true" aria-labelledby="fd-thanks-title" onMouseDown={e => e.stopPropagation()}>
            <button className="fd-close" aria-label="Close" onClick={close}>✕</button>
            <h2 id="fd-thanks-title">Thank you</h2>
            <p className="fd-thanks-body">We appreciate you taking the time to tell us about your experience. Your feedback helps us improve the modules.</p>
            <div className="fd-actions">
              <button className="fd-thanks-button" onClick={close}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
