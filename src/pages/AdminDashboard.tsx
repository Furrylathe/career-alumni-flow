import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  BarChart3, 
  Briefcase, 
  LogOut, 
  Plus, 
  Users, 
  CheckCircle, 
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Trash2,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";
import { Job, User as UserType, Application, Feedback } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { jobs, applications, feedbacks, addJob, updateJob, getApplicationsForJob, getFeedbacksForJob } = useJobs();
  const navigate = useNavigate();

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    description: "",
    skills: "",
    experience: 1,
    openingsTotal: 1,
    source: "User" as Job['source']
  });

  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    verifiedAlumni: 0,
    averageRating: 0,
    applicationTrend: [] as Array<{month: string, applications: number}>,
    companyRatings: [] as Array<{company: string, rating: number, count: number}>,
    jobSourceDistribution: [] as Array<{name: string, value: number}>
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate("/");
      return;
    }

    // Calculate analytics
    const openJobs = jobs.filter(job => !job.blocked && job.filled < job.openingsTotal);
    const closedJobs = jobs.filter(job => job.blocked || job.filled >= job.openingsTotal);
    
    // Get verified alumni count
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const verifiedAlumni = users.filter((u: UserType) => u.role === 'alumni' && u.isVerified).length;

    // Calculate average rating from feedbacks
    const avgRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length 
      : 0;

    // Mock application trend data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const applicationTrend = months.map(month => ({
      month,
      applications: Math.floor(Math.random() * 50) + 10
    }));

    // Company ratings from feedback
    const companyRatings: { [key: string]: { total: number, count: number } } = {};
    feedbacks.forEach(feedback => {
      const job = jobs.find(j => j.id === feedback.jobId);
      if (job) {
        if (!companyRatings[job.company]) {
          companyRatings[job.company] = { total: 0, count: 0 };
        }
        companyRatings[job.company].total += feedback.rating;
        companyRatings[job.company].count += 1;
      }
    });

    const companyRatingArray = Object.entries(companyRatings).map(([company, data]) => ({
      company,
      rating: data.total / data.count,
      count: data.count
    }));

    // Job source distribution
    const sourceCount: { [key: string]: number } = {};
    jobs.forEach(job => {
      sourceCount[job.source] = (sourceCount[job.source] || 0) + 1;
    });

    const jobSourceDistribution = Object.entries(sourceCount).map(([name, value]) => ({
      name,
      value
    }));

    setAnalytics({
      totalJobs: jobs.length,
      openJobs: openJobs.length,
      closedJobs: closedJobs.length,
      totalApplications: applications.length,
      verifiedAlumni,
      averageRating: avgRating,
      applicationTrend,
      companyRatings: companyRatingArray,
      jobSourceDistribution
    });
  }, [user, navigate, jobs, applications, feedbacks]);

  const handleJobSubmit = () => {
    if (!jobForm.title || !jobForm.company || !jobForm.description || !jobForm.skills) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newJob: Omit<Job, 'id'> = {
      source: jobForm.source,
      title: jobForm.title,
      company: jobForm.company,
      description: jobForm.description,
      skills: jobForm.skills.split(',').map(s => s.trim()),
      experience: jobForm.experience,
      openingsTotal: jobForm.openingsTotal,
      openingsLeft: jobForm.openingsTotal,
      filled: 0,
      postedBy: user?.name || "Admin",
      referralCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      blocked: false,
      interviewStatus: 'Open',
      postedAt: new Date().toISOString()
    };

    addJob(newJob);
    setJobForm({
      title: "",
      company: "",
      description: "",
      skills: "",
      experience: 1,
      openingsTotal: 1,
      source: "User"
    });
    toast.success("Job posted successfully!");
  };

  const handleJobStatusUpdate = (jobId: string, status: Job['interviewStatus'], hiresMetRequired?: boolean) => {
    if (status === 'Interview Over') {
      if (hiresMetRequired === true) {
        updateJob(jobId, { interviewStatus: status, blocked: true });
        toast.success("Job closed - required hires met");
      } else if (hiresMetRequired === false) {
        updateJob(jobId, { interviewStatus: status, blocked: false });
        toast.success("Job reopened - still need more candidates");
      }
    } else {
      updateJob(jobId, { interviewStatus: status });
      toast.success(`Job status updated to ${status}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="jobs">Job Management</TabsTrigger>
            <TabsTrigger value="add-job">Add Job</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                      <p className="text-2xl font-bold">{analytics.totalJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Open Jobs</p>
                      <p className="text-2xl font-bold">{analytics.openJobs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Verified Alumni</p>
                      <p className="text-2xl font-bold">{analytics.verifiedAlumni}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.applicationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="applications" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Job Source Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Source Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.jobSourceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.jobSourceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Company Ratings */}
            {analytics.companyRatings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Company Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.companyRatings}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="company" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="rating" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Job Management Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {job.title}
                          <Badge variant="outline">{job.source}</Badge>
                          {(job.blocked || job.filled >= job.openingsTotal) && (
                            <Badge variant="destructive">Closed</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{job.company} • {job.postedBy}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {job.filled}/{job.openingsTotal} filled
                        </Badge>
                        <Badge variant="outline" className={
                          job.interviewStatus === 'Open' ? 'border-green-500 text-green-700' :
                          job.interviewStatus === 'In Progress' ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }>
                          {job.interviewStatus}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJobStatusUpdate(job.id, 'In Progress')}
                          disabled={job.interviewStatus === 'In Progress'}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const hiresMetRequired = window.confirm('Were the required hires met?\nOK = Yes (close job)\nCancel = No (reopen job)');
                            handleJobStatusUpdate(job.id, 'Interview Over', hiresMetRequired);
                          }}
                          disabled={job.interviewStatus === 'Interview Over'}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Interview Over
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Applications: {getApplicationsForJob(job.id).length} • 
                        Feedback: {getFeedbacksForJob(job.id).length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Add Job Tab */}
          <TabsContent value="add-job" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <span>Add New Job Opening</span>
                </CardTitle>
                <CardDescription>
                  Create a new job posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({...jobForm, company: e.target.value})}
                      placeholder="e.g., Tech Corp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills *</Label>
                    <Input
                      id="skills"
                      value={jobForm.skills}
                      onChange={(e) => setJobForm({...jobForm, skills: e.target.value})}
                      placeholder="React, Node.js, Python"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={jobForm.experience}
                      onChange={(e) => setJobForm({...jobForm, experience: parseInt(e.target.value) || 1})}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openings">Total Openings</Label>
                    <Input
                      id="openings"
                      type="number"
                      value={jobForm.openingsTotal}
                      onChange={(e) => setJobForm({...jobForm, openingsTotal: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Job Source</Label>
                  <Select value={jobForm.source} onValueChange={(value: Job['source']) => setJobForm({...jobForm, source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">Internal Posting</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Naukri">Naukri</SelectItem>
                      <SelectItem value="Glassdoor">Glassdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleJobSubmit} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job Opening
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {feedbacks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No feedback received yet</h3>
                  <p className="text-muted-foreground text-center">
                    Alumni feedback will appear here once they start leaving reviews
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {feedbacks.map((feedback) => {
                  const job = jobs.find(j => j.id === feedback.jobId);
                  return (
                    <Card key={feedback.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">{feedback.title || 'Anonymous Feedback'}</CardTitle>
                            <CardDescription>
                              {job?.title} at {job?.company} • {feedback.alumniEmail}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{feedback.comments}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;