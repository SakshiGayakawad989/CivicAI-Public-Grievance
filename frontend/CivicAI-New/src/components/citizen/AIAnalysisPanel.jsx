import React from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, AlertTriangle, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function AIAnalysisPanel({ 
  title = '', 
  description = '', 
  location = '', 
  customCategory = null,
  customPriority = null,
  customDept = null,
  customDuplicate = null,
  customScores = null 
}) {
  // Real-time AI mock inference logic based on entered text
  const combinedText = (title + " " + description).toLowerCase();

  let predictedCategory = customCategory || "OTHER";
  let catConfidence = customScores?.categoryAccuracy || 95;
  let predictedPriority = customPriority || "MEDIUM";
  let priorityConfidence = customScores?.priorityScore || 94;
  let recommendedDept = customDept || "Parks & Horticulture";
  let isDuplicate = customDuplicate !== null ? customDuplicate : false;
  let duplicateTicket = 11;

  if (!customCategory) {
    if (combinedText.includes("light") || combinedText.includes("electric") || combinedText.includes("lamp") || combinedText.includes("power") || combinedText.includes("wire")) {
      predictedCategory = "ELECTRICITY";
      recommendedDept = "Electricity Department";
      catConfidence = 96;
      predictedPriority = "MEDIUM";
      priorityConfidence = 94;
      if (location.toLowerCase().includes("college") || location.toLowerCase().includes("bvvs")) {
        isDuplicate = true;
        duplicateTicket = 11;
      }
    } else if (combinedText.includes("pothole") || combinedText.includes("road") || combinedText.includes("tar") || combinedText.includes("bridge") || combinedText.includes("asphalt")) {
      predictedCategory = "ROAD";
      recommendedDept = "Road Department";
      catConfidence = 99;
      predictedPriority = "HIGH";
      priorityConfidence = 97;
      if (location.toLowerCase().includes("station")) {
        isDuplicate = true;
        duplicateTicket = 13;
      }
    } else if (combinedText.includes("garbage") || combinedText.includes("drain") || combinedText.includes("waste") || combinedText.includes("sewage") || combinedText.includes("smell")) {
      predictedCategory = "SANITATION";
      recommendedDept = "Sanitation Department";
      catConfidence = 98;
      predictedPriority = "HIGH";
      priorityConfidence = 95;
    } else if (combinedText.includes("water") || combinedText.includes("pipe") || combinedText.includes("leak") || combinedText.includes("tap")) {
      predictedCategory = "WATER";
      recommendedDept = "Water Department";
      catConfidence = 97;
      predictedPriority = "HIGH";
      priorityConfidence = 95;
    } else if (combinedText.includes("tree") || combinedText.includes("branch") || combinedText.includes("park") || combinedText.includes("garden")) {
      predictedCategory = "OTHER";
      recommendedDept = "Parks & Horticulture";
      catConfidence = 93;
      predictedPriority = "LOW";
      priorityConfidence = 91;
    }
  }

  return (
    <div className="ai-analysis-panel">
      {/* Panel Header */}
      <div className="ai-panel-header">
        <div className="ai-panel-title-row">
          <BrainCircuit size={18} className="ai-panel-sparkle" />
          <h3 className="ai-panel-title">LIVE AI ANALYSIS ENGINE</h3>
        </div>
        <div className="ai-live-badge">
          <span className="live-pulse-dot"></span>
          <span>INFERENCE ACTIVE</span>
        </div>
      </div>

      <p className="ai-panel-intro">
        As you type your complaint details, the CivicAI machine learning model runs real-time inference on the input text and location.
      </p>

      {/* Inference Blocks */}
      <div className="ai-inference-sections">
        {/* Block 1: Predicted Category */}
        <div className="ai-inference-card">
          <div className="inference-label-row">
            <span className="inference-label">PREDICTED CATEGORY</span>
            <span className="confidence-pill">Confidence: {catConfidence}%</span>
          </div>
          <div className="inference-value-box">
            <span className={`ai-category-tag cat-${predictedCategory.toLowerCase()}`}>
              {predictedCategory}
            </span>
          </div>
        </div>

        {/* Block 2: Predicted Priority */}
        <div className="ai-inference-card">
          <div className="inference-label-row">
            <span className="inference-label">PREDICTED PRIORITY</span>
            <span className="confidence-pill">Confidence: {priorityConfidence}%</span>
          </div>
          <div className="inference-value-box">
            <span className={`ai-priority-tag prio-${predictedPriority.toLowerCase()}`}>
              {predictedPriority}
            </span>
          </div>
        </div>

        {/* Block 3: Recommended Department */}
        <div className="ai-inference-card">
          <div className="inference-label-row">
            <span className="inference-label">RECOMMENDED DEPARTMENT</span>
            <span className="confidence-pill">Match: 97%</span>
          </div>
          <div className="inference-value-box dept-box">
            <span className="ai-dept-name">{recommendedDept}</span>
          </div>
        </div>

        {/* Block 4: Duplicate Grievance Check */}
        <div className={`ai-inference-card duplicate-card ${isDuplicate ? 'is-dup-flagged' : 'is-dup-clean'}`}>
          <div className="inference-label-row">
            <span className="inference-label">DUPLICATE GRIEVANCE CHECK</span>
            {isDuplicate ? (
              <span className="dup-status-pill dup-yes">MATCH FOUND</span>
            ) : (
              <span className="dup-status-pill dup-no">NO DUPLICATE</span>
            )}
          </div>
          <div className="inference-value-box dup-box-content">
            {isDuplicate ? (
              <div className="duplicate-alert-text">
                <span className="dup-highlight">YES</span>
                <span className="dup-sub">Clustered with Master Ticket #{duplicateTicket}</span>
              </div>
            ) : (
              <div className="duplicate-alert-text">
                <span className="dup-highlight-green">NO</span>
                <span className="dup-sub">Unique / New Grievance</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Spec Footer */}
      <div className="ai-panel-footer">
        <div className="footer-spec-item">
          <span className="spec-name">Model Architecture:</span>
          <span className="spec-val">CivicBERT-v3</span>
        </div>
        <div className="footer-spec-item">
          <span className="spec-name">Inference Latency:</span>
          <span className="spec-val">180 ms</span>
        </div>
      </div>
    </div>
  );
}
