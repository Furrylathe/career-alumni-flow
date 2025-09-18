import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building2, Briefcase, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const UserDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  
  // Profile form states
  const [name, setName] = useState(user?.name || "");
  const [organisation, setOrganisation] = useState(user?.organisation || "");

  const handleProfileUpdate = () => {
    updateUser({ name, organisation });
    toast.success("Profile updated successfully!");
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
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="profile">Profile Setup</TabsTrigger>
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
                  Set up your profile information. Note: Job management has been moved to Admin dashboard.
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
                <Button onClick={handleProfileUpdate}>Update Profile</Button>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Need to manage jobs?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Job posting and management features are now available in the Admin dashboard for better control and analytics.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/job-openings')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    View All Job Openings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;