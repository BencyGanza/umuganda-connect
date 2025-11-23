import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@supabase/supabase-js";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Report {
  id: string;
  title: string;
  description: string;
  problem_type: string;
  severity: string;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  volunteer_count: number;
  report_id: string | null;
}

const Map = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (tokenSubmitted && mapboxToken && reports.length > 0 && mapContainer.current) {
      initializeMap();
    }
  }, [tokenSubmitted, mapboxToken, reports, projects]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
    }
    fetchData();
  };

  const fetchData = async () => {
    setIsLoading(true);
    
    const { data: reportsData, error: reportsError } = await supabase
      .from("reports")
      .select("*")
      .not("location_lat", "is", null)
      .not("location_lng", "is", null);

    if (reportsError) {
      toast({
        title: "Error loading reports",
        description: reportsError.message,
        variant: "destructive",
      });
    } else {
      setReports(reportsData || []);
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*");

    if (projectsError) {
      toast({
        title: "Error loading projects",
        description: projectsError.message,
        variant: "destructive",
      });
    } else {
      setProjects(projectsData || []);
    }

    setIsLoading(false);
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Mapbox Token Required",
        description: "Please enter your Mapbox public token",
        variant: "destructive",
      });
      return;
    }
    setTokenSubmitted(true);
  };

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Center on Rwanda
    const rwandaCenter: [number, number] = [29.8739, -1.9403];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: rwandaCenter,
      zoom: 9,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers for reports
    reports.forEach((report) => {
      if (report.location_lat && report.location_lng) {
        const el = document.createElement("div");
        el.className = "report-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        
        // Color based on severity
        const severityColors: Record<string, string> = {
          low: "#10b981",
          medium: "#eab308",
          high: "#f97316",
          critical: "#ef4444",
        };
        el.style.backgroundColor = severityColors[report.severity] || "#6b7280";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${report.title}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${report.description.substring(0, 100)}...</p>
            <p style="font-size: 11px; color: #999;"><strong>Type:</strong> ${report.problem_type}</p>
            <p style="font-size: 11px; color: #999;"><strong>Status:</strong> ${report.status}</p>
            <p style="font-size: 11px; color: #999;"><strong>Severity:</strong> <span style="color: ${severityColors[report.severity]}">${report.severity}</span></p>
          </div>`
        );

        new mapboxgl.Marker(el)
          .setLngLat([report.location_lng, report.location_lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Add markers for projects (use report location if available)
    projects.forEach((project) => {
      if (project.report_id) {
        const linkedReport = reports.find(r => r.id === project.report_id);
        if (linkedReport && linkedReport.location_lat && linkedReport.location_lng) {
          const el = document.createElement("div");
          el.className = "project-marker";
          el.style.width = "35px";
          el.style.height = "35px";
          el.style.borderRadius = "50%";
          el.style.cursor = "pointer";
          el.style.backgroundColor = "#0066FF";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.4)";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.innerHTML = "📍";

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; color: #0066FF;">🚧 ${project.title}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${project.description.substring(0, 100)}...</p>
              <p style="font-size: 11px; color: #999;"><strong>Status:</strong> ${project.status}</p>
              <p style="font-size: 11px; color: #999;"><strong>Volunteers:</strong> ${project.volunteer_count}</p>
            </div>`
          );

          new mapboxgl.Marker(el)
            .setLngLat([linkedReport.location_lng, linkedReport.location_lat])
            .setPopup(popup)
            .addTo(map.current!);
        }
      }
    });
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

  if (!tokenSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={!!user} />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Card className="max-w-md mx-auto p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h2 className="text-xl font-bold mb-2">Mapbox Token Required</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  To view the interactive map, please enter your Mapbox public token. 
                  You can get one for free at{" "}
                  <a 
                    href="https://mapbox.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={handleTokenSubmit} className="w-full">
                Load Map
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <MapPin className="w-8 h-8" />
            {t("map.title")}
          </h1>
          <p className="text-muted-foreground">{t("map.subtitle")}</p>
        </div>

        <div className="mb-4 flex gap-4">
          <Badge variant="outline" className="bg-red-500/10 border-red-500">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            Critical Reports
          </Badge>
          <Badge variant="outline" className="bg-orange-500/10 border-orange-500">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
            High Priority
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            Medium Priority
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 border-green-500">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            Low Priority
          </Badge>
          <Badge variant="outline" className="bg-primary/10 border-primary">
            <div className="w-3 h-3 rounded-full bg-primary mr-2" />
            Active Projects
          </Badge>
        </div>

        <Card className="overflow-hidden">
          <div 
            ref={mapContainer} 
            className="w-full h-[600px]"
          />
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">📊 Statistics</h3>
            <div className="space-y-1 text-sm">
              <p>Total Reports: <strong>{reports.length}</strong></p>
              <p>Active Projects: <strong>{projects.filter(p => p.status === 'in_progress').length}</strong></p>
              <p>Completed Projects: <strong>{projects.filter(p => p.status === 'completed').length}</strong></p>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="font-semibold mb-2">ℹ️ Map Legend</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Click on any marker to view details</p>
              <p>• Colored circles represent reports by severity</p>
              <p>• Blue markers show active projects</p>
              <p>• Use zoom controls to navigate</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Map;
