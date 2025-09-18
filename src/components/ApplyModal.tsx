import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { toast } from 'sonner';
import { Building2, Code, User } from 'lucide-react';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ job, isOpen, onClose }) => {
  const { user } = useAuth();
  const { applyToJob, getUserApplications } = useJobs();
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (job && isOpen) {
      // Pre-fill referral code from job listing
      setReferralCode(job.referralCode || job.sourceReferral || '');
    }
  }, [job, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !user) return;

    // Check if user already applied to this job
    const userApplications = getUserApplications(user.email);
    const alreadyApplied = userApplications.some(app => app.jobId === job.id);

    if (alreadyApplied) {
      toast.error('You have already applied to this job!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      applyToJob({
        jobId: job.id,
        alumniEmail: user.email,
        referralCodeUsed: referralCode,
        appliedAt: new Date().toISOString()
      });

      toast.success(`Successfully applied to ${job.title}! The recruiter will be notified.`);
      onClose();
      setReferralCode('');
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReferralCode('');
    onClose();
  };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Apply for Position
          </DialogTitle>
          <DialogDescription>
            You're applying for {job.title} at {job.company}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            {/* Job Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{job.company}</span>
                <span className="text-muted-foreground">•</span>
                <span>{job.title}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {job.openingsLeft} of {job.openingsTotal} positions available
              </div>
            </div>

            {/* Applicant Info */}
            <div className="space-y-2">
              <Label htmlFor="applicant-email">Your Email</Label>
              <Input
                id="applicant-email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Referral Code */}
            <div className="space-y-2">
              <Label htmlFor="referral-code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Referral Code
              </Label>
              <Input
                id="referral-code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Using the referral code may increase your chances of getting selected
              </p>
            </div>

            {/* Posted By Info */}
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-sm">
                <span className="font-medium text-primary">Posted by:</span> {job.postedBy}
                {(job.referralCode || job.sourceReferral) && (
                  <>
                    <br />
                    <span className="font-medium text-primary">Recommended code:</span>{' '}
                    <code className="text-xs bg-primary/10 px-1 rounded">
                      {job.referralCode || job.sourceReferral}
                    </code>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyModal;