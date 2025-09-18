import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, GraduationCap, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AlumniVerification = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
   useEffect(() => {
    if (!user) {
      navigate("/alumni-login");
    } else if (user.isVerified) {
      navigate("/alumni-dashboard");
    }
  }, [user, navigate]);

  if (!user || user.isVerified) {
    return null;
  }

  const [formData, setFormData] = useState({
    fullName: "",
    usn: "",
    skills: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitVerification = async () => {
    if (!formData.fullName || !formData.usn || !formData.skills || !formData.experience) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    
    // Simulate verification process
    setTimeout(() => {
      updateUser({
        name: formData.fullName,
        usn: formData.usn,
        skills: formData.skills.split(',').map(s => s.trim()),
        experience: formData.experience,
        isVerified: true,
      });
      
      setLoading(false);
      toast.success("Verification successful! Welcome to the alumni network.");
      navigate("/alumni-dashboard");
    }, 2000);
  };

  if (!user) {
    navigate("/alumni-login");
    return null;
  }

  if (user.isVerified) {
    navigate("/alumni-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Alumni Verification</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                updateUser({ isVerified: false });
                navigate("/alumni-login");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Progress Indicator */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Login Complete</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <span className="text-sm font-medium text-primary">Verification</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground"></div>
                  <span className="text-sm text-muted-foreground">Dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Form */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Alumni Verification</span>
              </CardTitle>
              <CardDescription>
                Please provide your details for verification. This helps us ensure you're part of our alumni network and match you with relevant opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name as per records"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usn">University Serial Number (USN) *</Label>
                  <Input
                    id="usn"
                    value={formData.usn}
                    onChange={(e) => handleInputChange("usn", e.target.value)}
                    placeholder="e.g., 1XX20CS001"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills & Technologies *</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="e.g., JavaScript, React, Python, Data Science (comma-separated)"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  List your key skills to help us match you with relevant job openings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Professional Experience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Briefly describe your work experience, internships, or projects..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              {/* Skills Preview */}
              {formData.skills && (
                <div className="space-y-2">
                  <Label>Skills Preview:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.split(',').map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Verification Process</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your details will be verified against our alumni database</li>
                  <li>• Skills matching will be enabled for job recommendations</li>
                  <li>• Verification typically takes a few moments</li>
                </ul>
              </div>

              <Button 
                onClick={handleSubmitVerification} 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Submit for Verification"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlumniVerification;