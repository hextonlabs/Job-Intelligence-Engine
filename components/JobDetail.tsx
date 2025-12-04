import React, { useState } from 'react';
import { AppView, Job } from '../types';

interface JobDetailProps {
  job: Job;
  onNavigate: (view: AppView) => void;
  onUpdateStatus: (jobId: string, status: Job['status']) => void;
  onDelete: (jobId: string) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onNavigate, onUpdateStatus, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'intel' | 'artefacts'>('analysis');

  if (!job.analysis || !job.marketIntel || !job.artefacts) {
    return <div className="p-8 text-center text-slate-500">Analysis data incomplete for this record.</div>;
  }

  const statusColors = {
    'Draft': 'bg-slate-100 text-slate-700',
    'Applied': 'bg-blue-100 text-blue-700',
    'Interview': 'bg-purple-100 text-purple-700',
    'Offer': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-7xl mx-auto p-6 animate-fade-in">
      {/* Top Navigation */}
      <button 
        onClick={() => onNavigate(AppView.DASHBOARD)} 
        className="mb-6 text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <div className="text-lg text-slate-600 font-medium">{job.company}</div>
            <div className="mt-2 flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${
                  job.analysis.moscow_priority === 'Must' ? 'bg-red-50 text-red-700 border-red-100' :
                  job.analysis.moscow_priority === 'Should' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                {job.analysis.moscow_priority} Priority
              </span>
              <span className="text-sm text-slate-500 font-mono">
                RICE Score: {job.analysis.rice_score}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <select
              value={job.status}
              onChange={(e) => onUpdateStatus(job.id, e.target.value as Job['status'])}
              className={`px-3 py-1 rounded text-sm font-semibold outline-none cursor-pointer border-2 border-transparent hover:border-slate-200 ${statusColors[job.status]}`}
            >
              <option value="Draft">Draft</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button 
              onClick={() => {
                if(window.confirm('Delete this job?')) onDelete(job.id);
              }}
              className="text-xs text-red-400 hover:text-red-600 underline"
            >
              Delete Job
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Analysis & Gaps
        </button>
        <button
          onClick={() => setActiveTab('intel')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'intel' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Market Intel
        </button>
        <button
          onClick={() => setActiveTab('artefacts')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'artefacts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Artefacts (CV/Cover)
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'analysis' && (
            <>
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Core Analysis</h3>
                <ul className="space-y-2 mb-6">
                  {job.analysis.summary_bullets.map((b, i) => (
                    <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded text-sm">
                  <div>
                    <span className="block text-slate-400 text-xs uppercase">Est. Salary</span>
                    <span className="font-mono font-medium text-slate-800">{job.analysis.salary_range}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-xs uppercase">Fit Score</span>
                    <span className="font-mono font-medium text-slate-800">{job.analysis.competency_match_score}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Competency Gap Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-green-600 mb-2 uppercase">Required (Matched)</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.analysis.skills_required.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 mb-2 uppercase">Missing / Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.analysis.skills_missing.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-100">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {job.analysis.red_flags.length > 0 && (
                 <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-3">Risks & Red Flags</h3>
                    <ul className="space-y-1">
                      {job.analysis.red_flags.map((flag, i) => (
                        <li key={i} className="text-red-700 text-sm">• {flag}</li>
                      ))}
                    </ul>
                 </div>
              )}
            </>
          )}

          {activeTab === 'intel' && (
            <>
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Funding & News</h3>
                <ul className="space-y-2">
                   {job.marketIntel.funding_news.length > 0 ? job.marketIntel.funding_news.map((n, i) => (
                     <li key={i} className="text-slate-700 text-sm border-b border-slate-50 last:border-0 pb-2">{n}</li>
                   )) : <li className="text-slate-400 text-sm italic">No recent major news detected.</li>}
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hiring Context</h3>
                 <p className="text-slate-700 text-sm leading-relaxed">{job.marketIntel.hiring_trends_context}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Competitors</h3>
                 <div className="flex flex-wrap gap-2">
                    {job.marketIntel.competitors.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">{c}</span>
                    ))}
                 </div>
              </div>
            </>
          )}

          {activeTab === 'artefacts' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tailored CV Bullets</h3>
                  <ul className="space-y-3">
                    {job.artefacts.cv_bullets.map((b, i) => (
                      <li key={i} className="text-slate-700 text-sm font-mono bg-slate-50 p-3 rounded border border-slate-100">
                        {b}
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">LinkedIn Outreach</h3>
                  <div className="text-slate-700 text-sm font-mono whitespace-pre-wrap bg-slate-50 p-4 rounded border border-slate-100">
                    {job.artefacts.linkedin_outreach}
                  </div>
               </div>

               <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Interview STAR Stories</h3>
                   <ul className="space-y-3">
                    {job.artefacts.star_stories.map((s, i) => (
                      <li key={i} className="text-slate-700 text-sm whitespace-pre-wrap">
                        {s}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Interview Prep</h3>
              <ul className="space-y-3">
                 {job.artefacts.interview_prep.map((q, i) => (
                   <li key={i} className="text-sm text-slate-700">
                     <span className="font-semibold block text-slate-900 mb-1">Q{i+1}:</span>
                     {q}
                   </li>
                 ))}
              </ul>
           </div>
           
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Office Locations</h3>
              <ul className="space-y-1">
                 {job.marketIntel.office_locations.map((loc, i) => (
                   <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                     <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                     {loc}
                   </li>
                 ))}
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetail;