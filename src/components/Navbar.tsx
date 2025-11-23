import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, X, Plus, Home, LayoutDashboard, LogOut, Shield, BookOpen, Globe } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export const Navbar = ({ isAuthenticated = false }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  useState(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    }
  });

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();
      setIsAdmin(!!data);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">U+</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">Umuganda+</span>
              <span className="text-xs text-muted-foreground">Umuganda made smart</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Select value={language} onValueChange={(value: "en" | "rw") => setLanguage(value)}>
              <SelectTrigger className="w-[120px]">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="rw">Kinyarwanda</SelectItem>
              </SelectContent>
            </Select>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("nav.projects")}
                  </Button>
                </Link>
                <Link to="/donations">
                  <Button variant="ghost" size="sm">
                    {t("nav.donate")}
                  </Button>
                </Link>
                <Link to="/donation-ledger">
                  <Button variant="ghost" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("nav.ledger")}
                  </Button>
                </Link>
                <Link to="/map">
                  <Button variant="ghost" size="sm">
                    {t("nav.map")}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                <Link to="/submit-report">
                  <Button variant="default" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("nav.reportIssue")}
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    {t("nav.profile")}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">{t("nav.reports")}</Button>
                </Link>
                <Link to="/projects">
                  <Button variant="ghost">{t("nav.projects")}</Button>
                </Link>
                <Link to="/donations">
                  <Button variant="ghost">{t("nav.donate")}</Button>
                </Link>
                <Link to="/donation-ledger">
                  <Button variant="ghost">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("nav.ledger")}
                  </Button>
                </Link>
                <Link to="/map">
                  <Button variant="ghost">{t("nav.map")}</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost">{t("nav.signIn")}</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="default">{t("nav.getStarted")}</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Select value={language} onValueChange={(value: "en" | "rw") => setLanguage(value)}>
              <SelectTrigger className="w-full mb-2">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="rw">Kinyarwanda</SelectItem>
              </SelectContent>
            </Select>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="w-4 h-4 mr-2" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
                <Link to="/projects" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("nav.projects")}
                  </Button>
                </Link>
                <Link to="/donations" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.donate")}
                  </Button>
                </Link>
                <Link to="/donation-ledger" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("nav.ledger")}
                  </Button>
                </Link>
                <Link to="/map" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.map")}
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      {t("nav.admin")}
                    </Button>
                  </Link>
                )}
                <Link to="/submit-report" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("nav.reportIssue")}
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.profile")}
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.reports")}
                  </Button>
                </Link>
                <Link to="/projects" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.projects")}
                  </Button>
                </Link>
                <Link to="/donations" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.donate")}
                  </Button>
                </Link>
                <Link to="/donation-ledger" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t("nav.ledger")}
                  </Button>
                </Link>
                <Link to="/map" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    {t("nav.map")}
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full">{t("nav.signIn")}</Button>
                </Link>
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full">{t("nav.getStarted")}</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
