import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, DollarSign, Package, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Donations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState("10");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleDonate = async (amount: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to make a donation",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
        body: { amount: parseFloat(amount) }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const donationTiers = [
    { amount: "5", label: "Supporter", description: "Help with small repairs" },
    { amount: "25", label: "Contributor", description: "Fund materials for projects" },
    { amount: "50", label: "Champion", description: "Sponsor a community project" },
    { amount: "100", label: "Hero", description: "Make a major impact" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={!!user} />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Support Community Projects</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your donation helps fund materials, tools, and resources for Umuganda projects across Rwanda.
            </p>
          </div>

          {/* Donation Tiers */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {donationTiers.map((tier) => (
              <Card key={tier.amount} className="p-6 hover:shadow-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">${tier.amount}</h3>
                    <Badge variant="secondary">{tier.label}</Badge>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">{tier.description}</p>
                <Button 
                  onClick={() => handleDonate(tier.amount)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Donate Now"}
                </Button>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <Card className="p-8 bg-gradient-card">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-center">Custom Amount</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Donation Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <Button 
                  onClick={() => handleDonate(donationAmount)}
                  disabled={isLoading || !donationAmount || parseFloat(donationAmount) < 1}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  Donate ${donationAmount}
                </Button>
              </div>
            </div>
          </Card>

          {/* Impact Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Your Impact</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Materials</h4>
                <p className="text-sm text-muted-foreground">
                  Cement, paint, and tools for repairs
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Community</h4>
                <p className="text-sm text-muted-foreground">
                  Empower volunteers and local leaders
                </p>
              </Card>
              <Card className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Transparency</h4>
                <p className="text-sm text-muted-foreground">
                  Track every donation on the public ledger
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donations;
