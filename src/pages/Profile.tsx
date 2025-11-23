import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, MapPin, TrendingUp, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/contexts/LanguageContext";

interface Profile {
  full_name: string;
  district: string | null;
  sector: string | null;
  role: string;
  points: number;
  badges: any;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reportCount, setReportCount] = useState(0);
  const [voteCount, setVoteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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
    fetchProfile(session.user.id);
  };

  const fetchProfile = async (userId: string) => {
    setIsLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      toast({
        title: t("profile.errorLoading"),
        description: profileError.message,
        variant: "destructive",
      });
    } else {
      setProfile(profileData);
    }

    const { count: reportsCount } = await supabase
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setReportCount(reportsCount || 0);

    const { count: votesCount } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setVoteCount(votesCount || 0);

    setIsLoading(false);
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
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{profile?.full_name || t("profile.user")}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {profile?.district && profile?.sector
                      ? `${profile.sector}, ${profile.district}`
                      : t("profile.locationNotSet")}
                  </span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {profile?.role || t("profile.citizen")}
                </Badge>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">
                  {profile?.points || 0}
                </div>
                <div className="text-sm text-muted-foreground">{t("profile.points")}</div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{reportCount}</div>
                  <div className="text-sm text-muted-foreground">{t("profile.reportsSubmitted")}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{voteCount}</div>
                  <div className="text-sm text-muted-foreground">{t("profile.votesCast")}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Array.isArray(profile?.badges) ? profile.badges.length : 0}</div>
                  <div className="text-sm text-muted-foreground">{t("profile.badgesEarned")}</div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("profile.achievements")}</h2>
            {profile?.badges && Array.isArray(profile.badges) && profile.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.badges.map((badge: any, index: number) => (
                  <div key={index} className="flex flex-col items-center p-4 border border-border rounded-lg">
                    <Award className="w-8 h-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {t("profile.noBadges")}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
