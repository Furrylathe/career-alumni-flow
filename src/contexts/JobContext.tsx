import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Application, Feedback } from '@/types';
import { mockJobs } from '@/data/mockJobs';

interface JobContextType {
  jobs: Job[];
  applications: Application[];
  feedbacks: Feedback[];
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  applyToJob: (application: Omit<Application, 'id'>) => void;
  addFeedback: (feedback: Omit<Feedback, 'id'>) => void;
  getJobById: (id: string) => Job | undefined;
  getApplicationsForJob: (jobId: string) => Application[];
  getFeedbacksForJob: (jobId: string) => Feedback[];
  getUserApplications: (userEmail: string) => Application[];
  initializeMockData: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Initialize data from localStorage or use mock data
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobs');
    const savedApplications = localStorage.getItem('applications');
    const savedFeedbacks = localStorage.getItem('feedbacks');

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      // Initialize with mock data on first load
      setJobs(mockJobs);
      localStorage.setItem('jobs', JSON.stringify(mockJobs));
    }

    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    }

    if (savedFeedbacks) {
      setFeedbacks(JSON.parse(savedFeedbacks));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addJob = (jobData: Omit<Job, 'id'>) => {
    const newJob: Job = {
      ...jobData,
      id: `usr-${Date.now()}`,
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const applyToJob = (applicationData: Omit<Application, 'id'>) => {
    const newApplication: Application = {
      ...applicationData,
      id: `app-${Date.now()}`,
    };
    
    setApplications(prev => [...prev, newApplication]);
    
    // Decrement openingsLeft and block if needed
    setJobs(prev => prev.map(job => {
      if (job.id === applicationData.jobId) {
        const newOpeningsLeft = Math.max(0, job.openingsLeft - 1);
        return {
          ...job,
          openingsLeft: newOpeningsLeft,
          blocked: newOpeningsLeft === 0
        };
      }
      return job;
    }));
  };

  const addFeedback = (feedbackData: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
    };
    setFeedbacks(prev => [...prev, newFeedback]);
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const getApplicationsForJob = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  };

  const getFeedbacksForJob = (jobId: string) => {
    return feedbacks.filter(fb => fb.jobId === jobId);
  };

  const getUserApplications = (userEmail: string) => {
    return applications.filter(app => app.alumniEmail === userEmail);
  };

  const initializeMockData = () => {
    setJobs(mockJobs);
    setApplications([]);
    setFeedbacks([]);
    localStorage.setItem('jobs', JSON.stringify(mockJobs));
    localStorage.removeItem('applications');
    localStorage.removeItem('feedbacks');
  };

  return (
    <JobContext.Provider value={{
      jobs,
      applications,
      feedbacks,
      addJob,
      updateJob,
      applyToJob,
      addFeedback,
      getJobById,
      getApplicationsForJob,
      getFeedbacksForJob,
      getUserApplications,
      initializeMockData
    }}>
      {children}
    </JobContext.Provider>
  );
};