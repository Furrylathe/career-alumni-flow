import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Calendar, Users, AlertCircle, ExternalLink } from 'lucide-react';

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
  onApply?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, showApplyButton = false, onApply }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const getInterviewStatusColor = (status: Job['interviewStatus']) => {
    switch (status) {
      case 'Open': return 'bg-success/10 text-success border-success/20';
      case 'In Progress': return 'bg-warning/10 text-warning border-warning/20';
      case 'Interview Over': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canApply = () => {
    return user?.role === 'alumni' && 
           user?.isVerified &&
           !job.blocked && 
           job.openingsLeft > 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-medium transition-shadow duration-200 border border-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getSourceBadgeColor(job.source)}>
                {job.source}
              </Badge>
              {job.blocked && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Blocked
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg mb-2 line-clamp-1">{job.title}</CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(job.postedAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-3 w-3" />
                <span>
                  {job.openingsLeft} of {job.openingsTotal} openings left
                </span>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getInterviewStatusColor(job.interviewStatus)}>
              {job.interviewStatus}
            </Badge>
            {(job.referralCode || job.sourceReferral) && (
              <Badge variant="outline" className="font-mono text-xs">
                {job.referralCode || job.sourceReferral}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium">Skills: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span>
              <span className="font-medium">Experience:</span> {job.experience} years
            </span>
            <span className="text-muted-foreground">
              Posted by: {job.postedBy}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/job/${job.id}`)}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Details
          </Button>
          
          {showApplyButton && (
            <Button
              size="sm"
              onClick={() => onApply?.(job)}
              disabled={!canApply()}
              className="flex items-center gap-1"
            >
              {job.blocked ? 'Closed' : job.openingsLeft === 0 ? 'Full' : 'Apply'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;