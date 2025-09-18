import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { GraduationCap, Briefcase, LogOut, Search, User, Mail, Code, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface JobMatch {
  id: string;
  role: string;
  description: string;
  skillsets: string[];
  experience: string;
  referralCode: string;
  datePosted: string;
  userEmail: string;
  userName: string;
  matchScore: number;
}

const AlumniDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matchedJobs, setMatchedJobs] = useState<JobMatch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState<JobMatch[]>([]);
  const [openModalJobId, setOpenModalJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !user.isVerified) {
      navigate("/alumni-verification");
      return;
    }

    // Load all jobs and find matches based on skills
    const allJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
    const userSkills = user.skills || [];

    const matches: JobMatch[] = allJobs.map((job: any) => {
      // Calculate match score based on skill overlap
      const jobSkills = job.skillsets.map((s: string) => s.toLowerCase());
      const userSkillsLower = userSkills.map((s: string) => s.toLowerCase());

      const matchingSkills = jobSkills.filter((skill: string) =>
        userSkillsLower.some(userSkill =>
          userSkill.includes(skill) || skill.includes(userSkill)
        )
      );

      const matchScore = (matchingSkills.length / jobSkills.length) * 100;

      return {
        ...job,
        matchScore: Math.round(matchScore)
      };
    }).filter((job: JobMatch) => job.matchScore > 0)
      .sort((a: JobMatch, b: JobMatch) => b.matchScore - a.matchScore);

    setMatchedJobs(matches);
    setFilteredJobs(matches);
  }, [user, navigate]);

  useEffect(() => {
    // Filter jobs based on search term
    if (!searchTerm) {
      setFilteredJobs(matchedJobs);
    } else {
      const filtered = matchedJobs.filter(job =>
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skillsets.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, matchedJobs]);

  const handleApply = (job: JobMatch) => {
    // Copy referral code to clipboard
    navigator.clipboard.writeText(job.referralCode);
    toast.success(`Referral code "${job.referralCode}" copied to clipboard!`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // --- START OF CODE FOR API CALL ---
  const handleOpenModal = (jobId: string) => setOpenModalJobId(jobId);
  const handleCloseModal = () => setOpenModalJobId(null);

  const handleSubmitApplication = async (job: JobMatch) => {
    setIsSubmitting(true);
    try {
      // The API call below is correctly structured to match your mailer.py backend
      await fetch("http://localhost:5000/api/send-application-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: job.userEmail,
          alumni: {
            name: user.name,
            email: user.email,
            usn: user.usn,
            skills: user.skills,
            experience: user.experience,
          },
          job: {
            id: job.id,
            role: job.role,
            referralCode: job.referralCode,
            description: job.description,
            skillsets: job.skillsets,
            experience: job.experience,
            datePosted: job.datePosted,
            userName: job.userName,
          },
        }),
      });
      toast.success("Application submitted! The alumni will be notified by email.");
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    }
    setIsSubmitting(false);
  };
  // --- END OF CODE FOR API CALL ---

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
            {/* Search Bar */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job openings by role, skills, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Matches */}
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {matchedJobs.length === 0 ? "No job matches found" : "No results found"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    {matchedJobs.length === 0
                      ? "No jobs currently match your skills. Check back later for new opportunities!"
                      : "Try adjusting your search terms to find more opportunities."
                    }
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
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-medium transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center space-x-2">
                            <span>{job.role}</span>
                            <Badge
                              variant={job.matchScore >= 80 ? "default" : job.matchScore >= 50 ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {job.matchScore}% Match
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Posted by {job.userName} • {job.datePosted}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary font-mono">
                            {job.referralCode}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{job.description}</p>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skillsets.map((skill, index) => {
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

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm">
                          <span className="font-medium">Experience:</span> {job.experience}
                        </div>
                        <div className="flex space-x-2">
                          {/* ---- MODAL TRIGGER ---- */}
                          <Dialog open={openModalJobId === job.id} onOpenChange={open => open ? handleOpenModal(job.id) : handleCloseModal()}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal(job.id)}
                              >
                                <Mail className="mr-1 h-3 w-3" />
                                Contact
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Job Application</DialogTitle>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Do you want to submit your application to <span className="font-medium">{job.userName}</span> for the role <span className="font-medium">{job.role}</span>?</p>
                                <p className="text-xs mt-2 text-muted-foreground">Your details and referral code will be sent to the job poster via email.</p>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="ghost"
                                  onClick={handleCloseModal}
                                  disabled={isSubmitting}
                                >
                                  No
                                </Button>
                                <Button
                                  onClick={() => handleSubmitApplication(job)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Submitting..." : "Yes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          {/* ---- END MODAL ---- */}
                          <Button
                            size="sm"
                            onClick={() => handleApply(job)}
                          >
                            <Code className="mr-1 h-3 w-3" />
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
    </div>
  );
};

const Label = ({ className, children, ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
    {children}
  </label>
);

export default AlumniDashboard;
