import React, { useState } from 'react';
import { AppView, Job, JobAnalysis, MarketIntel, Artefacts } from '../types';
import { generateClarifyingQuestions, analyzeJobFull } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface AddJobProps {
  onNavigate: (view: AppView) => void;
  onJobAdded: (job: Job) => void;
}

const AddJob: React.FC<AddJobProps> = ({ onNavigate, onJobAdded }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Step 1: Initial Ingestion & Question Generation
  const handleInitialScan = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const qs = await generateClarifyingQuestions(jdText);
      setQuestions(qs);
      setStep(2);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Full Analysis
  const handleFullAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Format answers into a single string context
      const clarifications = questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || 'N/A'}`).join('\n\n');
      
      const result = await analyzeJobFull(jdText, clarifications);
      
      // Construct the Job object
      const titleMatch = jdText.match(/title:?\s*(.*?)(\n|$)/i) || jdText.match(/^(.*?)(\n|$)/);
      const companyMatch = jdText.match(/company:?\s*(.*?)(\n|$)/i);

      const newJob: Job = {
        id: uuidv4(),
        title: titleMatch ? titleMatch[1].trim().substring(0, 50) : "Untitled Role",
        company: companyMatch ? companyMatch[1].trim().substring(0, 50) : "Unknown Company",
        description: jdText,
        status: 'Draft',
        dateAdded: new Date().toISOString(),
        clarificationAnswers: clarifications,
        analysis: result.analysis as JobAnalysis,
        marketIntel: result.marketIntel as MarketIntel,
        artefacts: result.artefacts as Artefacts
      };

      onJobAdded(newJob);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">New Role Analysis</h1>
        <button onClick={() => onNavigate(AppView.DASHBOARD)} className="text-slate-500 hover:text-slate-900 text-sm">
          Cancel
        </button>
      </div>

      {step === 1 && (
        <div className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Job Description / Link Content</label>
            <textarea
              className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          <button
            onClick={handleInitialScan}
            disabled={loading || !jdText.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Scanning...' : 'Start Ingestion & Clarification'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-fade-in">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Clarifying Context</h2>
            <p className="text-slate-600 text-sm mb-4">The engine needs specific details to calibrate the RICE score and artefacts.</p>
          </div>
          
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-slate-800 mb-1">{q}</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [idx]: e.target.value }))}
                  placeholder="Your concise answer..."
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleFullAnalysis}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Market Intel & Artefacts...
              </>
            ) : 'Run Full Analysis'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddJob;