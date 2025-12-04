import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddJob from './components/AddJob';
import JobDetail from './components/JobDetail';
import { Job, AppView, HeatmapData } from './types';

// Helper to calculate heatmap data from current jobs
const calculateHeatmap = (jobs: Job[]): HeatmapData[] => {
  const frequencyMap: Record<string, { freq: number; gap: number }> = {};

  jobs.forEach(job => {
    if (job.status === 'Rejected' || !job.analysis) return;

    job.analysis.skills_required.forEach(skill => {
      const s = skill.toLowerCase();
      if (!frequencyMap[s]) frequencyMap[s] = { freq: 0, gap: 0 };
      frequencyMap[s].freq += 1;
    });

    job.analysis.skills_missing.forEach(skill => {
      const s = skill.toLowerCase();
      if (!frequencyMap[s]) frequencyMap[s] = { freq: 0, gap: 0 };
      // Note: 'missing' implies it was 'required' but found wanting, so it increments freq too usually,
      // but here we just track 'missing' counts explicitly.
      // If the API puts a skill in 'missing', we assume it's also 'required' for the role.
      // To keep it simple, we trust the API lists.
      frequencyMap[s].gap += 1;
    });
  });

  return Object.entries(frequencyMap).map(([skill, counts]) => ({
    skill: skill.charAt(0).toUpperCase() + skill.slice(1), // Capitalize
    frequency: counts.freq,
    gap_frequency: counts.gap
  }));
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DASHBOARD);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('lhf_job_tracker_jobs');
    if (savedJobs) {
      try {
        const parsed = JSON.parse(savedJobs);
        setJobs(parsed);
        setHeatmapData(calculateHeatmap(parsed));
      } catch (e) {
        console.error("Failed to load jobs", e);
      }
    }
  }, []);

  // Persist jobs whenever they change
  useEffect(() => {
    localStorage.setItem('lhf_job_tracker_jobs', JSON.stringify(jobs));
    setHeatmapData(calculateHeatmap(jobs));
  }, [jobs]);

  const handleAddJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJob(newJob);
    setView(AppView.JOB_DETAIL);
  };

  const handleUpdateStatus = (jobId: string, status: Job['status']) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob(null);
      setView(AppView.DASHBOARD);
    }
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setView(AppView.JOB_DETAIL);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Simple Top Bar */}
      <div className="bg-slate-900 h-1.5 w-full"></div>
      
      <main>
        {view === AppView.DASHBOARD && (
          <Dashboard
            jobs={jobs}
            heatmapData={heatmapData}
            onNavigate={setView}
            onSelectJob={handleSelectJob}
          />
        )}
        
        {view === AppView.ADD_JOB && (
          <AddJob
            onNavigate={setView}
            onJobAdded={handleAddJob}
          />
        )}

        {view === AppView.JOB_DETAIL && selectedJob && (
          <JobDetail
            job={selectedJob}
            onNavigate={setView}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteJob}
          />
        )}
      </main>
    </div>
  );
};

export default App;