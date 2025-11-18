import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle, XCircle, Download, Users, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [stats, setStats] = useState({ reports: 0, projects: 0, volunteers: 0, donations: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    
    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();
    
    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    setIsAdmin(true);
  };

  const fetchData = async () => {
    // Fetch pending reports
    const { data: reports } = await supabase
      .from("reports")
      .select("*, profiles(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    setPendingReports(reports || []);

    // Fetch stats
    const { count: reportsCount } = await supabase.from("reports").select("*", { count: "exact", head: true });
    const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true });
    const { count: volunteersCount } = await supabase.from("volunteer_attendance").select("*", { count: "exact", head: true });
    const { data: donationsSum } = await supabase.from("donations").select("amount");
    
    setStats({
      reports: reportsCount || 0,
      projects: projectsCount || 0,
      volunteers: volunteersCount || 0,
      donations: donationsSum?.reduce((sum, d) => sum + Number(d.amount), 0) || 0,
    });
  };

  const handleApprove = async (reportId: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: "verified" })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Report approved successfully" });
      fetchData();
    }
  };

  const handleReject = async (reportId: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: "rejected" })
      .eq("id", reportId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Report rejected" });
      fetchData();
    }
  };

  const exportCSV = async () => {
    const { data } = await supabase.from("reports").select("*");
    if (!data) return;

    const csv = [
      ["ID", "Title", "Type", "Severity", "Status", "Created At"].join(","),
      ...data.map(r => [r.id, r.title, r.problem_type, r.severity, r.status, r.created_at].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <Shield className="w-16 h-16 text-muted-foreground animate-spin" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">{t("admin.title")}</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-3xl font-bold">{stats.reports}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold">{stats.projects}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("admin.volunteers")}</p>
                <p className="text-3xl font-bold">{stats.volunteers}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-3xl font-bold">{stats.donations.toLocaleString()} RWF</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Export Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("admin.exportCSV")}
          </Button>
        </div>

        {/* Pending Reports */}
        <h2 className="text-2xl font-bold mb-6">{t("admin.pendingReports")}</h2>
        <div className="space-y-4">
          {pendingReports.map((report) => (
            <Card key={report.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                  <p className="text-muted-foreground mb-4">{report.description}</p>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">{report.problem_type}</Badge>
                    <Badge variant="outline">{report.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reported by: {report.profiles?.full_name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(report.id)} size="sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t("admin.approve")}
                  </Button>
                  <Button onClick={() => handleReject(report.id)} variant="destructive" size="sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    {t("admin.reject")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
