import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import ApplyModal from '@/components/ApplyModal';
import FeedbackForm from '@/components/FeedbackForm';
import { Job } from '@/types';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  Code, 
  User,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobById, updateJob, getApplicationsForJob } = useJobs();
  const [job, setJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [showInterviewControls, setShowInterviewControls] = useState(false);
  const [newInterviewStatus, setNewInterviewStatus] = useState<Job['interviewStatus']>('Open');
  const [hiresMetQuestion, setHiresMetQuestion] = useState(false);
  const [newOpeningsLeft, setNewOpeningsLeft] = useState(0);

  useEffect(() => {
    if (id) {
      const foundJob = getJobById(id);
      if (foundJob) {
        setJob(foundJob);
        setNewInterviewStatus(foundJob.interviewStatus);
        setNewOpeningsLeft(foundJob.openingsLeft);
      }
    }
  }, [id, getJobById]);

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/job-openings')}>
              Back to Job Openings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = getApplicationsForJob(job.id);
  const canApply = user?.role === 'alumni' && user?.isVerified && !job.blocked && job.openingsLeft > 0;
  const isJobPoster = user?.email && job.postedBy !== 'external' && job.source === 'User';

  const handleApply = () => {
    if (!canApply) {
      if (user?.role !== 'alumni') {
        toast.error('Only alumni can apply for jobs');
      } else if (!user?.isVerified) {
        toast.error('Please complete verification to apply for jobs');
      } else if (job.blocked || job.openingsLeft === 0) {
        toast.error('This job is no longer accepting applications');
      }
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleInterviewStatusUpdate = () => {
    if (newInterviewStatus === 'Interview Over') {
      setHiresMetQuestion(true);
    } else {
      updateJob(job.id, { interviewStatus: newInterviewStatus });
      setJob(prev => prev ? { ...prev, interviewStatus: newInterviewStatus } : null);
      toast.success('Interview status updated');
      setShowInterviewControls(false);
    }
  };

  const handleHiresMetResponse = (hiresMet: boolean) => {
    const updates: Partial<Job> = {
      interviewStatus: 'Interview Over' as const
    };

    if (!hiresMet) {
      // Reopen the job
      updates.blocked = false;
      // Keep existing openingsLeft or allow manual adjustment
    } else {
      // Keep job blocked
      updates.blocked = true;
    }

    updateJob(job.id, updates);
    setJob(prev => prev ? { ...prev, ...updates } : null);
    toast.success(hiresMet ? 'Job marked as filled' : 'Job reopened for new applications');
    setHiresMetQuestion(false);
    setShowInterviewControls(false);
  };

  const handleMarkFilled = () => {
    updateJob(job.id, { openingsLeft: 0, blocked: true });
    setJob(prev => prev ? { ...prev, openingsLeft: 0, blocked: true } : null);
    toast.success('Job marked as filled');
  };

  const handleOpeningsLeftUpdate = () => {
    if (newOpeningsLeft >= 0 && newOpeningsLeft <= job.openingsTotal) {
      updateJob(job.id, { 
        openingsLeft: newOpeningsLeft,
        blocked: newOpeningsLeft === 0
      });
      setJob(prev => prev ? { 
        ...prev, 
        openingsLeft: newOpeningsLeft,
        blocked: newOpeningsLeft === 0
      } : null);
      toast.success('Openings count updated');
    }
  };

  const getSourceBadgeColor = (source: Job['source']) => {
    switch (source) {
      case 'LinkedIn': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Indeed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Naukri': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Glassdoor': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'User': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Job Details</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-8">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getSourceBadgeColor(job.source)}>
                      {job.source}
                    </Badge>
                    {job.blocked && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Closed
                      </Badge>
                    )}
                    <Badge 
                      variant={job.interviewStatus === 'Open' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {job.interviewStatus}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Posted {formatDate(job.postedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {job.openingsLeft} of {job.openingsTotal} positions available
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        {job.experience} years experience required
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {(job.referralCode || job.sourceReferral) && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
                      <Badge variant="outline" className="font-mono">
                        {job.referralCode || job.sourceReferral}
                      </Badge>
                    </div>
                  )}
                  {canApply && (
                    <Button onClick={handleApply} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Job Description</h3>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                  }
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Posted By</h3>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{job.postedBy}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Applications</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{applications.length} application{applications.length !== 1 ? 's' : ''} received</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Management Controls (for job posters) */}
          {isJobPoster && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Job Management
                </CardTitle>
                <CardDescription>
                  Manage interview status and job openings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showInterviewControls ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowInterviewControls(true)}
                    >
                      Update Interview Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleMarkFilled}
                    >
                      Mark as Filled
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!hiresMetQuestion ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Interview Status</Label>
                          <Select value={newInterviewStatus} onValueChange={(value: Job['interviewStatus']) => setNewInterviewStatus(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Interview Over">Interview Over</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleInterviewStatusUpdate}>
                            Update Status
                          </Button>
                          <Button variant="outline" onClick={() => setShowInterviewControls(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <h4 className="font-medium mb-2">Interview Process Complete</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Were your required hires met for this position?
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleHiresMetResponse(true)}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Yes, hires met
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => handleHiresMetResponse(false)}
                              className="flex items-center gap-2"
                            >
                              <AlertCircle className="h-4 w-4" />
                              No, reopen job
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Manual openings adjustment */}
                <div className="space-y-2">
                  <Label>Adjust Available Openings</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      min="0"
                      max={job.openingsTotal}
                      value={newOpeningsLeft}
                      onChange={(e) => setNewOpeningsLeft(Number(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      of {job.openingsTotal} total
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpeningsLeftUpdate}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          <FeedbackForm job={job} />
        </div>
      </div>

      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default JobDetail;
