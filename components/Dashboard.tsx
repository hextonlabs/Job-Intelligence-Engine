import React, { useEffect, useState } from 'react';
import { Job, HeatmapData, AppView } from '../types';
import { getDailyBriefing } from '../services/geminiService';

interface DashboardProps {
  jobs: Job[];
  heatmapData: HeatmapData[];
  onNavigate: (view: AppView) => void;
  onSelectJob: (job: Job) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ jobs, heatmapData, onNavigate, onSelectJob }) => {
  const [briefing, setBriefing] = useState<string>("Analysing market trends...");

  useEffect(() => {
    // In a real app, we might cache this to avoid hitting API on every render
    getDailyBriefing().then(setBriefing);
  }, []);

  const activeJobs = jobs.filter(j => j.status !== 'Rejected');
  
  // Sort heatmap by gap frequency to show critical missing skills first (descending)
  const sortedHeatmap = [...heatmapData]
    .sort((a, b) => b.gap_frequency - a.gap_frequency)
    .slice(0, 8); // Top 8 gaps

  return (
    <div className="space-y-8 animate-fade-in p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 text-sm">Overview of market signals and application pipeline (LHF Edition).</p>
        </div>
        <button
          onClick={() => onNavigate(AppView.ADD_JOB)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Analyse New Role
        </button>
      </div>

      {/* Daily Briefing Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Market Signal</h2>
        </div>
        <div className="prose prose-sm max-w-none text-slate-700">
          <div className="whitespace-pre-wrap leading-relaxed font-mono text-sm bg-slate-50 p-4 rounded border border-slate-100">{briefing}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Applications List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Priority Queue</h2>
          {activeJobs.length === 0 ? (
            <div className="text-slate-400 text-sm italic py-12 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              No active applications tracking. Start a new analysis.
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map(job => (
                <div 
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="group bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-lg cursor-pointer transition-all hover:shadow-md flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">{job.title}</h3>
                    <p className="text-slate-500 text-sm">{job.company}</p>
                    <div className="flex items-center gap-2 mt-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        job.analysis?.moscow_priority === 'Must' ? 'bg-red-50 text-red-700 border-red-100' :
                        job.analysis?.moscow_priority === 'Should' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {job.analysis?.moscow_priority || 'N/A'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        RICE: {job.analysis?.rice_score ?? '-'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                     <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Offer' ? 'bg-green-100 text-green-800' :
                        job.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-600'
                     }`}>
                        {job.status}
                     </span>
                     <div className="text-xs text-slate-400 mt-2 font-mono">
                       {new Date(job.dateAdded).toLocaleDateString('en-GB')}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Competency Gap Heatmap */}
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Market Gap Heatmap</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            {sortedHeatmap.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Add jobs to generate skill gap data.</p>
            ) : (
              <div className="space-y-4">
                {sortedHeatmap.map((item, idx) => {
                  // Calculate percentage for bar width
                  const total = Math.max(item.frequency, 1);
                  const gapPercent = (item.gap_frequency / total) * 100;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-700 truncate w-2/3">{item.skill}</span>
                        <span className="text-red-500 font-mono text-[10px]">MISSING IN {item.gap_frequency} JDs</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        {/* Red bar shows how often it's missing relative to how often it appears */}
                        <div 
                          className="bg-red-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${gapPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
              * Bars represent gap frequency. High red bars indicate skills frequently required by the market but missing from your current profile analysis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;