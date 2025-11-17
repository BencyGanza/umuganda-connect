import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, MapPin, MessageSquare, TrendingUp, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Report {
  id: string;
  title: string;
  description: string;
  problem_type: string;
  severity: string;
  status: string;
  vote_count: number;
  location_address: string | null;
  photo_urls: string[];
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votedReports, setVotedReports] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    fetchReports();
    fetchUserVotes(session.user.id);
  };

  const fetchReports = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        profiles:user_id (
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      toast({
        title: "Error loading reports",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setReports(data || []);
    }
    setIsLoading(false);
  };

  const fetchUserVotes = async (userId: string) => {
    const { data } = await supabase
      .from("votes")
      .select("report_id")
      .eq("user_id", userId);

    if (data) {
      setVotedReports(new Set(data.map(v => v.report_id)));
    }
  };

  const handleVote = async (reportId: string) => {
    if (!user) return;

    const hasVoted = votedReports.has(reportId);

    if (hasVoted) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("report_id", reportId)
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Error removing vote",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setVotedReports(prev => {
          const newSet = new Set(prev);
          newSet.delete(reportId);
          return newSet;
        });
        fetchReports();
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .insert({ report_id: reportId, user_id: user.id });

      if (error) {
        toast({
          title: "Error voting",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setVotedReports(prev => new Set(prev).add(reportId));
        fetchReports();
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      critical: "bg-red-500",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-gray-500",
      verified: "bg-blue-500",
      in_progress: "bg-yellow-500",
      completed: "bg-green-500",
      rejected: "bg-red-500",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={!!user} />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
          <p className="text-muted-foreground">Vote on issues to help prioritize community action</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden hover:shadow-hover transition-shadow">
              {report.photo_urls.length > 0 && (
                <img
                  src={report.photo_urls[0]}
                  alt={report.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                  <div className="flex gap-1">
                    <Badge className={getSeverityColor(report.severity)}>
                      {report.severity}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {report.description}
                </p>

                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {report.location_address || "Location not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getStatusColor(report.status)}>
                    {report.status.replace("_", " ")}
                  </Badge>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={votedReports.has(report.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleVote(report.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {report.vote_count}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  Reported by {report.profiles?.full_name || "Anonymous"}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No reports yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to report a community issue!</p>
            <Button onClick={() => navigate("/submit-report")}>
              Submit Your First Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
