
export interface SkillMatch {
  name: string;
  score: number; // 0-100
}

export interface InterviewQuestion {
  question: string;
  purpose: string;
  expectedAnswerClues: string[];
}

export interface SectionSuggestion {
  sectionName: string;
  currentIssues: string[];
  suggestedImprovements: string[];
}

export interface ScreeningResult {
  candidateName: string;
  resumeOverview: string;
  resumeType: 'Fresher' | 'Entry-level' | 'Experienced';
  domain: 'IT' | 'Data' | 'AI' | 'Software' | 'Non-IT';
  formatQuality: 'Poor' | 'Average' | 'Good' | 'ATS-Optimized';
  hiringReadiness: 'Low' | 'Medium' | 'High';
  overallMatchScore: number;
  atsScore: number; // 0-10
  screeningIssuesFound: string[];
  sectionSuggestions: SectionSuggestion[];
  atsOptimizationTips: string[];
  finalScore: number; // 0-10
  skillsAnalysis: SkillMatch[];
  interviewQuestions: InterviewQuestion[];
  revisedResumeStructure: {
    summary: string;
    skills: string[];
    experience: { role: string; bulletPoints: string[] }[];
    projects: { title: string; bulletPoints: string[] }[];
    education: string;
  };
  explanation: string;
}

export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  resumeImage?: string; // base64 for vision tasks
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ScreeningResult;
}

export interface JobDescription {
  title: string;
  content: string;
}

export interface SavedJD extends JobDescription {
  id: string;
  savedAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'success' | 'info' | 'warning';
}

export interface JobTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export type AppView = 'setup' | 'results' | 'analytics' | 'workspace' | 'compare';
