import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, CheckCircle2, Loader2, Wrench } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  volunteer_count: number;
  start_date: string | null;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  before_photo_urls: string[];
  after_photo_urls: string[];
  created_at: string;
}

const Projects = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    fetchProjects();
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading projects",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProjects(data || []);
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      verified: "bg-blue-500",
      in_progress: "bg-orange-500",
      completed: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toUpperCase();
  };

  const calculateProgress = (project: Project) => {
    if (project.status === "completed") return 100;
    if (project.status === "in_progress") return 60;
    if (project.status === "verified") return 30;
    return 10;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Community Projects</h1>
          <p className="text-lg text-muted-foreground">
            Track progress on Umuganda projects across Rwanda
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce((sum, p) => sum + p.volunteer_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Volunteers</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === "completed").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {projects.filter(p => p.status === "in_progress").length}
                </p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6">
              Top-voted community reports will be converted into projects
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              View Reports
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <Card key={project.id} className="p-6 hover:shadow-hover transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Project Images */}
                  {project.before_photo_urls.length > 0 && (
                    <div className="md:w-1/3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Before</p>
                          <img
                            src={project.before_photo_urls[0]}
                            alt="Before"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                        {project.after_photo_urls.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">After</p>
                            <img
                              src={project.after_photo_urls[0]}
                              alt="After"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{project.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} />
                    </div>

                    {/* Project Info */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{project.volunteer_count} volunteers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Start: {formatDate(project.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Target: {formatDate(project.target_completion_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
