import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GraduationCap, Briefcase, LogOut, Search, User, Mail, Code, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";
import ApplyModal from "@/components/ApplyModal";

const AlumniDashboard = () => {
  const { user, logout } = useAuth();
  const { jobs, getUserApplications } = useJobs();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<string | null>(null);
  const [selectedJobForFeedback, setSelectedJobForFeedback] = useState<string | null>(null);

  // Filter jobs based on user skills and availability
  useEffect(() => {
    if (!user?.isVerified) {
      navigate("/alumni-verification");
      return;
    }

    let availableJobs = jobs;
    
    if (!showAllJobs) {
      // Show only jobs matching skills and not blocked
      availableJobs = jobs.filter(job => {
        if (job.blocked) return false;
        
        const userSkills = user.skills || [];
        const jobSkills = job.skills || [];
        
        // Check if any user skill matches any job skill (case insensitive)
        const hasMatchingSkill = userSkills.some(userSkill =>
          jobSkills.some(jobSkill =>
            userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
            jobSkill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        
        return hasMatchingSkill;
      });
    }

    // Apply search filter
    if (searchTerm) {
      availableJobs = availableJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredJobs(availableJobs);
  }, [user, jobs, searchTerm, showAllJobs, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCopyReferralCode = (job: any) => {
    const code = job.referralCode || job.sourceReferral || 'N/A';
    navigator.clipboard.writeText(code);
    toast.success(`Referral code "${code}" copied to clipboard!`);
  };

  const calculateMatchScore = (job: any) => {
    if (!user?.skills) return 0;
    
    const userSkills = user.skills.map(s => s.toLowerCase());
    const jobSkills = job.skills.map((s: string) => s.toLowerCase());
    
    const matchingSkills = jobSkills.filter((skill: string) =>
      userSkills.some(userSkill =>
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    
    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  };

  if (!user || !user.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Alumni Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.name || user.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/job-openings')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                All Jobs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches">Job Matches ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            {/* Search Bar and Toggle */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job openings by role, skills, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showAllJobs ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllJobs(!showAllJobs)}
                  >
                    {showAllJobs ? "Show Skill Matches Only" : "Show All Jobs"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Job Matches */}
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No job matches found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {!showAllJobs ? "No jobs currently match your skills. Try viewing all jobs or check back later!" : "No jobs found for your search criteria."}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/job-openings')}
                  >
                    View All Job Openings
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredJobs.map((job) => {
                  const matchScore = calculateMatchScore(job);
                  const referralCode = job.referralCode || job.sourceReferral || 'N/A';
                  
                  return (
                    <Card key={job.id} className={`hover:shadow-medium transition-shadow ${job.blocked ? 'opacity-60' : ''}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center space-x-2">
                              <span>{job.title}</span>
                              {!showAllJobs && (
                                <Badge
                                  variant={matchScore >= 80 ? "default" : matchScore >= 50 ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {matchScore}% Match
                                </Badge>
                              )}
                              {job.blocked && (
                                <Badge variant="destructive">Closed</Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              {job.company} • Posted by {job.postedBy} • {new Date(job.postedAt).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary font-mono">
                              {referralCode}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{job.description}</p>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Required Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill: string, index: number) => {
                              const isMatched = user.skills?.some(userSkill =>
                                userSkill.toLowerCase().includes(skill.toLowerCase()) ||
                                skill.toLowerCase().includes(userSkill.toLowerCase())
                              );
                              return (
                                <Badge
                                  key={index}
                                  variant={isMatched ? "default" : "secondary"}
                                  className={isMatched ? "bg-success text-success-foreground" : ""}
                                >
                                  {skill}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">Experience:</span> {job.experience} years • 
                            <span className="font-medium ml-1">Openings:</span> {job.openingsLeft}/{job.openingsTotal}
                          </div>
                          <Badge variant="outline">{job.source}</Badge>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-muted-foreground">
                            Status: {job.interviewStatus}
                          </div>
                          <div className="flex space-x-2">
                            {!job.blocked && (
                              job.source === 'User' ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => setSelectedJobForApplication(job.id)}
                                >
                                  <Mail className="mr-1 h-3 w-3" />
                                  Apply
                                </Button>
                              ) : (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    const urls = {
                                      'LinkedIn': 'https://linkedin.com/jobs',
                                      'Indeed': 'https://indeed.com/jobs',
                                      'Naukri': 'https://naukri.com/jobs',
                                      'Glassdoor': 'https://glassdoor.com/jobs'
                                    };
                                    window.open(urls[job.source] || '#', '_blank');
                                  }}
                                >
                                  <Mail className="mr-1 h-3 w-3" />
                                  Apply on {job.source}
                                </Button>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyReferralCode(job)}
                            >
                              <Code className="mr-1 h-3 w-3" />
                              Copy Code
                            </Button>
                            {(() => {
                              const userApplications = getUserApplications(user?.email || '');
                              const hasApplied = userApplications.some(app => app.jobId === job.id);
                              return hasApplied ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/feedback/${job.id}`)}
                                >
                                  Feedback
                                </Button>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Your verified alumni profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm bg-muted rounded-md px-3 py-2">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm bg-muted rounded-md px-3 py-2">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">USN</label>
                    <p className="text-sm bg-muted rounded-md px-3 py-2">{user.usn}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Verified Alumni
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience</label>
                  <p className="text-sm bg-muted rounded-md px-3 py-2 whitespace-pre-wrap">
                    {user.experience}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Apply Modal */}
      {selectedJobForApplication && (
        <ApplyModal
          job={jobs.find(job => job.id === selectedJobForApplication) || null}
          isOpen={!!selectedJobForApplication}
          onClose={() => setSelectedJobForApplication(null)}
        />
      )}
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
    {children}
  </label>
);

export default AlumniDashboard;
