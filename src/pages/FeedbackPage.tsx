import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const FeedbackPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getJobById, addFeedback, getFeedbacksForJob, getUserApplications } = useJobs();
  
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState('');

  const job = getJobById(jobId || '');
  const feedbacks = getFeedbacksForJob(jobId || '');

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Job not found</p>
            <Button onClick={() => navigate('/alumni')} className="w-full mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    if (!comments.trim()) {
      toast.error('Please provide comments');
      return;
    }

    // Check if user has applied to this job first
    const userApplications = getUserApplications(user.email);
    const hasApplied = userApplications.some(app => app.jobId === job.id);
    
    if (!hasApplied) {
      toast.error('You can only give feedback after applying to this job');
      return;
    }

    // Check if user already left feedback for this job
    const existingFeedback = feedbacks.find(fb => fb.alumniEmail === user.email);
    if (existingFeedback) {
      toast.error('You have already submitted feedback for this job');
      return;
    }

    addFeedback({
      jobId: job.id,
      alumniEmail: user.email,
      rating,
      comments,
      createdAt: new Date().toISOString(),
    });

    toast.success('Feedback submitted successfully!');
    navigate('/alumni');
  };

  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/alumni')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Job Feedback</h1>
            <p className="text-muted-foreground">Share your experience with {job.company}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Position</Label>
                <p className="text-sm text-muted-foreground">{job.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Company</Label>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Experience Level</Label>
                <p className="text-sm text-muted-foreground">{job.experience}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Skills Required</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="rating">Overall Rating *</Label>
                  <div className="mt-2">
                    <StarRating rating={rating} onRatingChange={setRating} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">Your Experience & Comments *</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Share your experience with the company, interview process, work culture, etc..."
                    rows={6}
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Feedbacks */}
        {feedbacks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Other Alumni Feedback ({feedbacks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {feedback.alumniEmail.split('@')[0]}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
