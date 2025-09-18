import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  User, 
  GraduationCap, 
  ArrowRight, 
  X, 
  Upload, 
  ShieldCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmitVerification = async () => {
    if (!formData.fullName || !formData.usn || !formData.skills || !formData.experience) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!file) {
      toast.error("Please upload your degree certificate");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.fullName);
      submitData.append("university_seat_number", formData.usn);
      submitData.append("skills", formData.skills);
      submitData.append("experience", formData.experience);
      submitData.append("degree_file", file);

      const response = await axios.post("http://127.0.0.1:5000/api/verify_degree_certificate", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "success") {
        updateUser({
          name: formData.fullName,
          usn: formData.usn,
          skills: formData.skills.split(',').map(s => s.trim()),
          experience: formData.experience,
          isVerified: true,
        });
        setVerified(true);
        toast.success("✅ Verification successful! Welcome to the alumni network.");
      } else {
        toast.error("❌ Invalid credentials/document. Verification failed.");
        setVerified(false);
      }
    } catch (err: any) {
      toast.error("Server not reachable. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/alumni-login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
                Upload your certificate and provide details to complete verification.
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
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usn">USN *</Label>
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
                <Label htmlFor="skills">Skills *</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange("skills", e.target.value)}
                  placeholder="e.g., JavaScript, React"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="Your work experience"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* File Upload + Verification Button in one row */}
              <div className="flex items-center gap-4">
                <div className="flex-1 border border-dashed border-muted-foreground rounded-lg p-4 text-center">
                  <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <Input
                    id="certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  {file && <p className="text-sm text-primary mt-1">{file.name}</p>}
                </div>

                <Button
                  onClick={handleSubmitVerification}
                  className={`flex items-center gap-2 px-4 py-6 h-full w-40 
                    ${verified ? "bg-green-600 hover:bg-green-700" : ""}`}
                  disabled={loading || verified}
                >
                  <ShieldCheck className="h-5 w-5" />
                  {loading ? "Verifying..." : verified ? "Verified ✅" : "Verify"}
                </Button>
              </div>

              {/* Continue Button */}
              <Button
                onClick={() => navigate("/alumni-dashboard")}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                           text-white font-semibold py-3 rounded-xl shadow-lg 
                           hover:opacity-90 transition duration-300 ease-in-out"
                disabled={!verified}
              >
                Continue →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AlumniVerification;
