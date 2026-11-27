import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function StarRating({ rating = 5, onChange, readOnly = false, size = 32 }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="star-rating-container">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${isFilled ? 'star-active' : 'star-inactive'} ${readOnly ? 'star-readonly' : ''}`}
            onClick={() => !readOnly && onChange && onChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            aria-label={`Rate ${star} star`}
          >
            <Star 
              size={size} 
              fill={isFilled ? '#F59E0B' : 'none'} 
              stroke={isFilled ? '#F59E0B' : '#CBD5E1'} 
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
