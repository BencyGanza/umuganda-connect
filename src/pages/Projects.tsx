import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Users, QrCode, LogIn, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectQRCode } from "@/components/ProjectQRCode";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@supabase/supabase-js";

const Projects = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

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
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setIsLoading(false);
  };

  const handleCheckIn = async (projectId: string) => {
    if (!user) return toast({ title: "Sign in required", variant: "destructive" });
    const { error } = await supabase.from("volunteer_attendance").insert({
      project_id: projectId, user_id: user.id, qr_code: `${projectId}-${Date.now()}`
    });
    if (!error) toast({ title: "Checked in!" });
  };

  const handleCheckOut = async (projectId: string) => {
    if (!user) return;
    const { data } = await supabase.from("volunteer_attendance").select("*").eq("project_id", projectId).eq("user_id", user.id).is("check_out_time", null).single();
    if (data) {
      await supabase.from("volunteer_attendance").update({ check_out_time: new Date().toISOString() }).eq("id", data.id);
      toast({ title: "Checked out!" });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-2">{t("projects.title")}</h1>
        <p className="text-lg text-muted-foreground mb-8">{t("projects.description")}</p>
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="p-6">
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <p className="text-muted-foreground mb-4">{project.description}</p>
              <div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4" /><span>{project.volunteer_count} {t("projects.volunteers")}</span></div>
              <Progress value={project.status === "completed" ? 100 : 50} className="mb-4" />
              {user && (
                <div className="flex gap-2">
                  <Button onClick={() => handleCheckIn(project.id)} size="sm"><LogIn className="w-4 h-4 mr-2" />{t("projects.checkIn")}</Button>
                  <Button onClick={() => handleCheckOut(project.id)} size="sm" variant="outline"><LogOut className="w-4 h-4 mr-2" />{t("projects.checkOut")}</Button>
                  <Button onClick={() => { setSelectedProject(project.id); setShowQR(true); }} size="sm" variant="secondary"><QrCode className="w-4 h-4 mr-2" />{t("projects.viewQR")}</Button>
                </div>
              )}
            </Card>
          ))}
        </div>
        {selectedProject && <ProjectQRCode projectId={selectedProject} projectTitle={projects.find(p => p.id === selectedProject)?.title || ""} isOpen={showQR} onClose={() => setShowQR(false)} />}
      </div>
    </div>
  );
};

export default Projects;
