import React, { useState, useEffect } from 'react';
import { ACTIVITIES, INITIAL_ACTIVITY } from '../data';
import { LiveActivity } from '../types';

export const LiveActivityCard: React.FC = () => {
  const [current, setCurrent] = useState<LiveActivity>(INITIAL_ACTIVITY);
  const [isChanging, setIsChanging] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true);
      const nextItem = ACTIVITIES[index];
      setCurrent(nextItem);
      setIndex((prev) => (prev + 1) % ACTIVITIES.length);

      const timer = setTimeout(() => {
        setIsChanging(false);
      }, 300);

      return () => clearTimeout(timer);
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div
      id="activity-card"
      className={`activity-card ${isChanging ? 'activity-changing' : ''}`}
      aria-live="polite"
    >
      {/* LIVE badge */}
      <div className="activity-live">
        <span className="activity-live-dot" aria-hidden="true"></span>
        LIVE
      </div>

      {/* Avatar */}
      <div id="activity-avatar" className="activity-avatar" aria-hidden="true">
        {current.initial}
      </div>

      {/* Details */}
      <div className="activity-details">
        <div className="activity-person">
          <strong id="activity-name">{current.name}</strong>
          <span id="activity-phone">{current.phone}</span>
        </div>
        <div className="activity-message">
          <span className="activity-check" aria-hidden="true">
            ✓
          </span>
          <span id="activity-message">
            Kiwango cha mtumiaji kimeongezwa hadi <strong>{current.amount}</strong>
          </span>
        </div>
      </div>

      {/* Time */}
      <div id="activity-time" className="activity-time">
        {current.time}
      </div>
    </div>
  );
};
