import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Job, Feedback } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { toast } from 'sonner';
import { Star, MessageSquare, Send, Filter } from 'lucide-react';

interface FeedbackFormProps {
  job: Job;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ job }) => {
  const { user } = useAuth();
  const { addFeedback, getFeedbacksForJob } = useJobs();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const feedbacks = getFeedbacksForJob(job.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'alumni') {
      toast.error('Only alumni can leave feedback');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    // Check if user already left feedback for this job
    const existingFeedback = feedbacks.find(fb => fb.alumniEmail === user.email);
    if (existingFeedback) {
      toast.error('You have already left feedback for this job');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      addFeedback({
        jobId: job.id,
        alumniEmail: user.email,
        rating,
        title: title.trim() || undefined,
        comments: comments.trim() || undefined,
        createdAt: new Date().toISOString()
      });

      setRating(0);
      setTitle('');
      setComments('');
      toast.success('Feedback submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          index < currentRating
            ? 'fill-warning text-warning'
            : 'text-muted-foreground hover:text-warning'
        }`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
      />
    ));
  };

  const filteredFeedbacks = ratingFilter 
    ? feedbacks.filter(fb => fb.rating === ratingFilter)
    : feedbacks;

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Add Feedback Form */}
      {user?.role === 'alumni' && user?.isVerified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Leave Feedback
            </CardTitle>
            <CardDescription>
              Share your experience about this company and their hiring process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Rating *</Label>
                <div className="flex items-center gap-1">
                  {renderStars(rating, true)}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-title">Title (Optional)</Label>
                <Input
                  id="feedback-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your experience"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-comments">Comments (Optional)</Label>
                <Textarea
                  id="feedback-comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share details about the company culture, interview process, etc."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {comments.length}/500 characters
                </p>
              </div>

              <Button type="submit" disabled={isSubmitting || rating === 0}>
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Feedback Display */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Company Feedback</CardTitle>
              <CardDescription>
                {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} from alumni
                {feedbacks.length > 0 && (
                  <span className="ml-2">
                    • Average rating: {averageRating}/5
                  </span>
                )}
              </CardDescription>
            </div>
            {feedbacks.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  <Button
                    variant={ratingFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRatingFilter(null)}
                  >
                    All
                  </Button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Button
                      key={rating}
                      variant={ratingFilter === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRatingFilter(rating)}
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3 fill-current" />
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedbacks.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {feedbacks.length === 0 
                ? "No feedback yet. Be the first to share your experience!"
                : "No feedback matches the selected rating filter."
              }
            </p>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <div key={feedback.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(feedback.rating)}</div>
                      <Badge variant="outline" className="text-xs">
                        {feedback.rating}/5
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {feedback.title && (
                    <h4 className="font-medium text-sm">{feedback.title}</h4>
                  )}
                  
                  {feedback.comments && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feedback.comments}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    by {feedback.alumniEmail.split('@')[0]}***
                  </div>
                  
                  <Separator className="my-4 last:hidden" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackForm;