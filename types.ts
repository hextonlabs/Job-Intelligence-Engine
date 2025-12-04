export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  status: 'Draft' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  dateAdded: string;
  clarificationAnswers?: string;
  analysis?: JobAnalysis;
  marketIntel?: MarketIntel;
  artefacts?: Artefacts;
}

export interface JobAnalysis {
  skills_required: string[];
  skills_missing: string[];
  competency_match_score: number; // 0-100
  salary_range: string;
  rice_score: number;
  moscow_priority: 'Must' | 'Should' | 'Could' | 'Won\'t';
  summary_bullets: string[];
  red_flags: string[];
}

export interface MarketIntel {
  funding_news: string[];
  competitors: string[];
  office_locations: string[];
  hiring_trends_context: string;
}

export interface Artefacts {
  cv_bullets: string[];
  cover_letter_draft: string;
  linkedin_outreach: string;
  interview_prep: string[];
  star_stories: string[];
}

export interface HeatmapData {
  skill: string;
  frequency: number;
  gap_frequency: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  JOB_DETAIL = 'JOB_DETAIL',
  ADD_JOB = 'ADD_JOB'
}
