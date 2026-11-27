import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export function Timeline({ timeline = [] }) {
  return (
    <div className="resolution-timeline-card">
      <div className="timeline-header">
        <h3 className="timeline-title">Resolution Lifecycle</h3>
        <p className="timeline-subtitle">Real-time status progression timeline</p>
      </div>

      <div className="timeline-stepper">
        {timeline.map((item, index) => {
          const isCompleted = item.completed;
          const isCurrent = isCompleted && (!timeline[index + 1] || !timeline[index + 1].completed);

          return (
            <div 
              key={index} 
              className={`timeline-step-item ${isCompleted ? 'step-completed' : 'step-pending'} ${isCurrent ? 'step-current' : ''}`}
            >
              {/* Vertical connector line */}
              {index < timeline.length - 1 && (
                <div className={`timeline-connector ${isCompleted && timeline[index + 1]?.completed ? 'connector-active' : ''}`} />
              )}

              {/* Node Icon */}
              <div className="timeline-node">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="node-icon-completed" />
                ) : (
                  <Circle size={16} className="node-icon-pending" />
                )}
              </div>

              {/* Step Content */}
              <div className="timeline-step-content">
                <div className="step-main-row">
                  <div className="step-name">{item.step}</div>
                  <div className={`step-timestamp ${isCompleted ? 'time-completed' : 'time-pending'}`}>
                    {item.time}
                  </div>
                </div>
                {item.detail && (
                  <div className="step-detail-badge">{item.detail}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
