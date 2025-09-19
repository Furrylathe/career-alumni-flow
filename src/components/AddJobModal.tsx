import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { toast } from "sonner";

interface AddJobModalProps {
  onClose: () => void;
}

const AddJobModal = ({ onClose }: AddJobModalProps) => {
  const { user } = useAuth();
  const { addJob } = useJobs();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    experience: "",
    openingsTotal: "",
    referralCode: "",
  });
  
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !skillsList.includes(currentSkill.trim())) {
      setSkillsList(prev => [...prev, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsList(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || skillsList.length === 0 || !formData.experience || !formData.openingsTotal || !formData.referralCode) {
      toast.error("Please fill in all fields");
      return;
    }

    const openings = parseInt(formData.openingsTotal);
    if (isNaN(openings) || openings <= 0) {
      toast.error("Please enter a valid number of openings");
      return;
    }

    addJob({
      source: 'User',
      title: formData.title,
      company: user?.organisation || 'Unknown Company',
      description: formData.description,
      skills: skillsList,
      experience: parseInt(formData.experience) || 0,
      openingsTotal: openings,
      openingsLeft: openings,
      filled: 0,
      postedBy: user?.name || user?.email || 'Unknown User',
      referralCode: formData.referralCode,
      blocked: false,
      interviewStatus: 'Open',
      postedAt: new Date().toISOString(),
    });

    toast.success("Job posted successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Add New Job Opening</CardTitle>
              <CardDescription>
                Create a new job posting for your organization
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code *</Label>
              <Input
                id="referralCode"
                value={formData.referralCode}
                onChange={(e) => handleInputChange("referralCode", e.target.value)}
                placeholder="e.g., REF-FE-2024"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the job role, responsibilities, and requirements..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Required Skills *</Label>
            <div className="flex space-x-2">
              <Input
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button type="button" onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skillsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skillsList.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(skill)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Required (years) *</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                placeholder="e.g., 2"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openings">Number of Openings *</Label>
              <Input
                id="openings"
                type="number"
                value={formData.openingsTotal}
                onChange={(e) => handleInputChange("openingsTotal", e.target.value)}
                placeholder="e.g., 3"
                min="1"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Post Job
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddJobModal;