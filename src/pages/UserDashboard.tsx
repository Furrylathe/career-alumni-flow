import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Briefcase, LogOut, Plus, Edit, Trash2, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AddJobModal from "@/components/AddJobModal";

const UserDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const { jobs, applications, feedbacks, updateJob, getApplicationsForJob, getFeedbacksForJob } = useJobs();
  const navigate = useNavigate();
  
  // Profile form states
  const [name, setName] = useState(user?.name || "");
  const [organisation, setOrganisation] = useState(user?.organisation || "");
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Get user's jobs and stats
  const userJobs = jobs.filter(job => job.postedBy === user?.name || job.postedBy === user?.email);
  const openJobs = userJobs.filter(job => !job.blocked);
  const closedJobs = userJobs.filter(job => job.blocked);
  const totalApplications = userJobs.reduce((total, job) => total + getApplicationsForJob(job.id).length, 0);

  useEffect(() => {
    setProfileCompleted(!!(user?.name && user?.organisation));
  }, [user]);

  const handleProfileUpdate = () => {
    if (!name || !organisation) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateUser({ name, organisation });
    toast.success("Profile updated successfully!");
    setProfileCompleted(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleReopenJob = (jobId: string) => {
    updateJob(jobId, { blocked: false, interviewStatus: 'Open' });
    toast.success("Job reopened successfully!");
  };

  const handleCloseJob = (jobId: string) => {
    updateJob(jobId, { blocked: true, interviewStatus: 'Interview Over' });
    toast.success("Job closed successfully!");
  };

  if (!user) {
    navigate("/user-login");
    return null;
  }

  // Mock data for charts
  const applicationTrend = [
    { month: 'Jan', applications: 12 },
    { month: 'Feb', applications: 19 },
    { month: 'Mar', applications: 8 },
    { month: 'Apr', applications: 25 },
    { month: 'May', applications: 22 },
    { month: 'Jun', applications: 30 }
  ];

  const jobStatusData = [
    { name: 'Open Jobs', value: openJobs.length, color: '#0088FE' },
    { name: 'Closed Jobs', value: closedJobs.length, color: '#00C49F' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
            <Button variant="outline" size="sm" onClick={() => navigate('/job-openings')}>
              <Briefcase className="mr-2 h-4 w-4" />
              View All Jobs
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
            <TabsTrigger value="jobs" disabled={!profileCompleted}>My Jobs</TabsTrigger>
            <TabsTrigger value="analytics" disabled={!profileCompleted}>Analytics</TabsTrigger>
            <TabsTrigger value="feedback" disabled={!profileCompleted}>Feedback</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Complete your profile to access job management features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisation">Organization *</Label>
                    <Input
                      id="organisation"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      placeholder="Enter your organization name"
                    />
                  </div>
                </div>
                <Button onClick={handleProfileUpdate}>Update Profile</Button>
                
                {profileCompleted && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 text-primary">Profile Complete! 🎉</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      You can now post jobs and manage applications. Click the "My Jobs" tab to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">My Job Postings</h2>
              <Button onClick={() => setShowAddJobModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Job
              </Button>
            </div>

            {userJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by posting your first job opening to connect with talented alumni.
                  </p>
                  <Button onClick={() => setShowAddJobModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {userJobs.map((job) => (
                  <Card key={job.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{job.title}</span>
                            <Badge variant={job.blocked ? "destructive" : "default"}>
                              {job.blocked ? "Closed" : "Open"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {job.openingsLeft}/{job.openingsTotal} openings left • {getApplicationsForJob(job.id).length} applications
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-primary/10 text-primary font-mono">
                          {job.referralCode}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-muted-foreground">
                          Posted on {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          {job.blocked ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReopenJob(job.id)}
                            >
                              Reopen Job
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCloseJob(job.id)}
                            >
                              Close Job
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{userJobs.length}</div>
                  <p className="text-xs text-muted-foreground">Total Jobs Posted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{openJobs.length}</div>
                  <p className="text-xs text-muted-foreground">Open Jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{closedJobs.length}</div>
                  <p className="text-xs text-muted-foreground">Closed Jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalApplications}</div>
                  <p className="text-xs text-muted-foreground">Total Applications</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Applications Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={applicationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="applications" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <h2 className="text-2xl font-semibold">Feedback Received</h2>
            
            {userJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No jobs posted yet. Post a job to start receiving feedback.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {userJobs.map((job) => {
                  const jobFeedbacks = getFeedbacksForJob(job.id);
                  return (
                    <Card key={job.id}>
                      <CardHeader>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>
                          {jobFeedbacks.length} feedback{jobFeedbacks.length !== 1 ? 's' : ''} received
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {jobFeedbacks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No feedback yet for this job.</p>
                        ) : (
                          <div className="space-y-4">
                            {jobFeedbacks.map((feedback) => (
                              <div key={feedback.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < feedback.rating ? "text-yellow-400" : "text-gray-300"}>
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">by {feedback.alumniEmail}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {feedback.title && (
                                  <h4 className="font-medium text-sm mb-1">{feedback.title}</h4>
                                )}
                                {feedback.comments && (
                                  <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <AddJobModal onClose={() => setShowAddJobModal(false)} />
      )}
    </div>
  );
};

export default UserDashboard;