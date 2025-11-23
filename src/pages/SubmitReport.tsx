import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, MapPin } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useLanguage } from "@/contexts/LanguageContext";

const SubmitReport = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemType, setProblemType] = useState<"roads" | "trash" | "water" | "electricity" | "school" | "health" | "other">("roads");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState("");
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
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 5);
      setPhotos(newPhotos);
    }
  };

  const analyzeWithAI = async () => {
    if (!description || !user) return;

    setIsAnalyzing(true);
    try {
      let photoUrl = null;
      if (photos.length > 0) {
        const photo = photos[0];
        const fileExt = photo.name.split('.').pop();
        const fileName = `temp-${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photo);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('report-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;
        }
      }

      const { data, error } = await supabase.functions.invoke('analyze-problem', {
        body: { description, photoUrl }
      });

      if (error) throw error;

      if (data) {
        setProblemType(data.problem_type);
        setSeverity(data.severity);
        setAiSuggestions(data.suggestions);
        
        toast({
          title: t("report.aiAnalysisComplete"),
          description: t("report.aiAnalysisDesc"),
        });
      }
    } catch (error: any) {
      toast({
        title: t("report.aiAnalysisFailed"),
        description: error.message || t("report.aiAnalysisError"),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: t("report.authRequired"),
        description: t("report.signInPrompt"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Upload photos
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('report-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('report-photos')
          .getPublicUrl(fileName);

        photoUrls.push(publicUrl);
      }

      // Create report - user.id is the profile id since they're the same
      const { error: insertError } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
          title,
          description,
          problem_type: problemType,
          severity,
          location_address: location,
          photo_urls: photoUrls,
        }]);

      if (insertError) throw insertError;

      toast({
        title: t("report.submitted"),
        description: t("report.thankYou"),
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: t("report.errorSubmitting"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("report.title")}</h1>
            <p className="text-muted-foreground">{t("report.subtitle")}</p>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t("report.issueTitle")}</Label>
                <Input
                  id="title"
                  placeholder={t("report.issueTitlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("report.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("report.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={analyzeWithAI}
                  disabled={!description || isAnalyzing}
                  className="mt-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("report.analyzing")}
                    </>
                  ) : (
                    t("report.analyzeAI")
                  )}
                </Button>
                {aiSuggestions && (
                  <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold text-primary mb-1">{t("report.aiSuggestions")}</p>
                    <p className="text-sm text-muted-foreground">{aiSuggestions}</p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problem-type">{t("report.problemType")}</Label>
                  <Select value={problemType} onValueChange={(value) => setProblemType(value as any)} required>
                    <SelectTrigger id="problem-type">
                      <SelectValue placeholder={t("report.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roads">{t("report.roads")}</SelectItem>
                      <SelectItem value="trash">{t("report.trash")}</SelectItem>
                      <SelectItem value="water">{t("report.water")}</SelectItem>
                      <SelectItem value="electricity">{t("report.electricity")}</SelectItem>
                      <SelectItem value="school">{t("report.school")}</SelectItem>
                      <SelectItem value="health">{t("report.health")}</SelectItem>
                      <SelectItem value="other">{t("report.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">{t("report.severity")}</Label>
                  <Select value={severity} onValueChange={(value) => setSeverity(value as any)}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("report.low")}</SelectItem>
                      <SelectItem value="medium">{t("report.medium")}</SelectItem>
                      <SelectItem value="high">{t("report.high")}</SelectItem>
                      <SelectItem value="critical">{t("report.critical")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t("report.location")}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder={t("report.locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos">{t("report.photos")}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    id="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <label htmlFor="photos" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t("report.uploadPhotos")}
                    </p>
                    {photos.length > 0 && (
                      <p className="text-sm text-primary mt-2">
                        {photos.length} {t("report.photosSelected")}
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("report.submitting")}
                  </>
                ) : (
                  t("report.submit")
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;
