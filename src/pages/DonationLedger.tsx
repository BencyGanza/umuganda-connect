import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Award, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@supabase/supabase-js";

const DonationLedger = () => {
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
    fetchDonations();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchDonations = async () => {
    const { data } = await supabase
      .from("donations")
      .select("*")
      .eq("payment_status", "completed")
      .order("created_at", { ascending: false });
    
    setDonations(data || []);
  };

  const getBadge = (amount: number, currency: string) => {
    const rwfAmount = currency === "RWF" ? amount : amount * 1300; // Rough conversion
    if (rwfAmount >= 100000) return { label: "Hero", color: "text-yellow-500" };
    if (rwfAmount >= 50000) return { label: "Champion", color: "text-blue-500" };
    if (rwfAmount >= 25000) return { label: "Contributor", color: "text-green-500" };
    return { label: "Supporter", color: "text-gray-500" };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">{t("ledger.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("ledger.description")}</p>
          </div>

          <div className="space-y-4">
            {donations.map((donation) => {
              const badge = getBadge(Number(donation.amount), donation.currency);
              return (
                <Card key={donation.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {donation.is_anonymous ? "Anonymous Donor" : donation.donor_name}
                        </h3>
                        <Award className={`w-5 h-5 ${badge.color}`} />
                        <Badge variant="secondary">{badge.label}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary mb-2">
                        {Number(donation.amount).toLocaleString()} {donation.currency}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{t("ledger.method")}: {donation.payment_method}</span>
                        <span>{t("ledger.date")}: {new Date(donation.created_at).toLocaleDateString()}</span>
                      </div>
                      {donation.message && (
                        <p className="mt-3 text-muted-foreground italic">"{donation.message}"</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationLedger;
