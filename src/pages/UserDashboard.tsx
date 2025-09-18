import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Briefcase, LogOut, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface JobPosting {
  id: string;
  role: string;
  description: string;
  skillsets: string[];
  experience: string;
  referralCode: string;
  datePosted: string;
}

const UserDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Profile form states
  const [name, setName] = useState(user?.name || "");
  const [organisation, setOrganisation] = useState(user?.organisation || "");
  
  // Job posting form states
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skillsets, setSkillsets] = useState("");
  const [experience, setExperience] = useState("");
  
  // Jobs state
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    // Load existing jobs from localStorage
    const savedJobs = localStorage.getItem(`user-jobs-${user?.id}`);
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, [user?.id]);

  const handleProfileUpdate = () => {
    updateUser({ name, organisation });
    toast.success("Profile updated successfully!");
  };

  const generateReferralCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const handleJobPost = () => {
    if (!jobRole || !jobDescription || !skillsets || !experience) {
      toast.error("Please fill in all fields");
      return;
    }

    const newJob: JobPosting = {
      id: Date.now().toString(),
      role: jobRole,
      description: jobDescription,
      skillsets: skillsets.split(',').map(s => s.trim()),
      experience,
      referralCode: generateReferralCode(),
      datePosted: new Date().toLocaleDateString(),
    };

    const updatedJobs = [...jobs, newJob];
    setJobs(updatedJobs);
    localStorage.setItem(`user-jobs-${user?.id}`, JSON.stringify(updatedJobs));
    
    // Also save to global jobs list
    const allJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
    const jobWithUser = { ...newJob, userEmail: user?.email, userName: user?.name || user?.email };
    allJobs.push(jobWithUser);
    localStorage.setItem('allJobs', JSON.stringify(allJobs));

    // Reset form
    setJobRole("");
    setJobDescription("");
    setSkillsets("");
    setExperience("");
    
    toast.success("Job posted successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    navigate("/user-login");
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
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">User Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/job-openings')}
              >
                <Eye className="mr-2 h-4 w-4" />
                View All Jobs
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
            <TabsTrigger value="post-job">Post Job</TabsTrigger>
            <TabsTrigger value="my-jobs">My Jobs ({jobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Set up your profile to help alumni understand your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisation">Organization</Label>
                    <Input
                      id="organisation"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      placeholder="Enter your organization name"
                    />
                  </div>
                </div>
                <Button onClick={handleProfileUpdate}>
                  Update Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post-job" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>Post New Job Opening</span>
                </CardTitle>
                <CardDescription>
                  Create a job posting that will be visible to all verified alumni
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobRole">Job Role</Label>
                  <Input
                    id="jobRole"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillsets">Required Skillsets</Label>
                  <Input
                    id="skillsets"
                    value={skillsets}
                    onChange={(e) => setSkillsets(e.target.value)}
                    placeholder="e.g., React, Node.js, Python (comma-separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Required</Label>
                  <Input
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 3-5 years"
                  />
                </div>
                <Button onClick={handleJobPost} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job Opening
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-jobs" className="space-y-6">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by posting your first job opening to connect with talented alumni
                  </p>
                  <Button onClick={() => navigate("?tab=post-job")} variant="outline">
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{job.role}</CardTitle>
                          <CardDescription>Posted on {job.datePosted}</CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Code: {job.referralCode}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{job.description}</p>
                      <div className="space-y-2">
                        <h4 className="font-medium">Required Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skillsets.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">
                        <span className="font-medium">Experience:</span> {job.experience}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;