import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Search, Filter, ArrowLeft, Mail, Code, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Job {
  id: string;
  role: string;
  description: string;
  skillsets: string[];
  experience: string;
  referralCode: string;
  datePosted: string;
  userEmail: string;
  userName: string;
}

const JobOpenings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");

  useEffect(() => {
    // Load all jobs
    const allJobs = JSON.parse(localStorage.getItem('allJobs') || '[]');
    // Sort by most recent first
    const sortedJobs = allJobs.sort((a: Job, b: Job) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    setJobs(sortedJobs);
    setFilteredJobs(sortedJobs);
  }, []);

  useEffect(() => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skillsets.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by experience
    if (experienceFilter !== "all") {
      filtered = filtered.filter(job => {
        const experience = job.experience.toLowerCase();
        switch (experienceFilter) {
          case "fresher":
            return experience.includes("fresher") || experience.includes("0") || experience.includes("entry");
          case "junior":
            return experience.includes("1") || experience.includes("2") || experience.includes("junior");
          case "mid":
            return experience.includes("3") || experience.includes("4") || experience.includes("5") || experience.includes("mid");
          case "senior":
            return experience.includes("6") || experience.includes("7") || experience.includes("8") || experience.includes("senior");
          default:
            return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [searchTerm, experienceFilter, jobs]);

  const handleCopyReferralCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Referral code "${code}" copied to clipboard!`);
  };

  const handleContactRecruiter = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("Recruiter email copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">All Job Openings</h1>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by role, skills, company, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience Levels</SelectItem>
                    <SelectItem value="fresher">Fresher (0 years)</SelectItem>
                    <SelectItem value="junior">Junior (1-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (6+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {jobs.length === 0 ? "No job openings yet" : "No jobs match your search"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {jobs.length === 0 
                  ? "Be the first to post a job opening and connect with talented alumni!"
                  : "Try adjusting your search terms or filters to find more opportunities."
                }
              </p>
              {jobs.length === 0 && (
                <div className="flex space-x-2">
                  <Button onClick={() => navigate("/user-login")} variant="outline">
                    Post a Job
                  </Button>
                  <Button onClick={() => navigate("/alumni-login")}>
                    Join as Alumni
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{job.role}</CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>Posted by {job.userName}</span>
                        </span>
                        <span>•</span>
                        <span>{job.datePosted}</span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary font-mono text-sm">
                      {job.referralCode}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{job.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Required Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skillsets.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Experience Required: </span>
                      <span className="text-sm">{job.experience}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      Use the referral code when applying for priority consideration
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleContactRecruiter(job.userEmail)}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        Contact
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleCopyReferralCode(job.referralCode)}
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
      </div>
    </div>
  );
};

export default JobOpenings;