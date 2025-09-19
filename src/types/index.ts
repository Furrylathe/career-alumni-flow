// TypeScript interfaces for the job board application
export interface Job {
  id: string;
  source: 'LinkedIn' | 'Indeed' | 'Naukri' | 'Glassdoor' | 'User';
  title: string;
  company: string;
  description: string;
  skills: string[];
  experience: number; // years
  openingsTotal: number;
  openingsLeft: number;
  filled: number; // number of filled positions
  postedBy: string; // user name or 'external'
  referralCode?: string; // present for user posts
  sourceReferral?: string; // for external (LinkedIn etc.)
  blocked: boolean;
  interviewStatus: 'Open' | 'In Progress' | 'Interview Over';
  postedAt: string; // ISO
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'alumni';
  organisation?: string;
  isVerified?: boolean; // for alumni
  usn?: string;
  skills?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  alumniEmail: string;
  referralCodeUsed?: string;
  appliedAt: string;
}

export interface Feedback {
  id: string;
  jobId: string;
  alumniEmail: string;
  rating: number;
  title?: string;
  comments?: string;
  createdAt: string;
}