import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Search, Filter, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import JobCard from "@/components/JobCard";
import ApplyModal from "@/components/ApplyModal";
import { Job } from "@/types";

const JobOpenings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    // Sort jobs by most recent first
    const sortedJobs = [...jobs].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    setFilteredJobs(sortedJobs);
  }, [jobs]);

  useEffect(() => {
    let filtered = jobs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.postedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by experience
    if (experienceFilter !== "all") {
      filtered = filtered.filter(job => {
        const experience = job.experience;
        switch (experienceFilter) {
          case "fresher":
            return experience === 0 || experience === 1;
          case "junior":
            return experience >= 1 && experience <= 2;
          case "mid":
            return experience >= 3 && experience <= 5;
          case "senior":
            return experience >= 6;
          default:
            return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [searchTerm, experienceFilter, jobs]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
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
              <JobCard 
                key={job.id} 
                job={job} 
                showApplyButton={user?.role === 'alumni'} 
                onApply={handleApply} 
              />
            ))}
          </div>
        )}
      </div>

      <ApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
      />
    </div>
  );
};

export default JobOpenings;