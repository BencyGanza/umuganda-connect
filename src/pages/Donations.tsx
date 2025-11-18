import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, DollarSign, Package, Loader2, CreditCard, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { User } from "@supabase/supabase-js";

const Donations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [donationAmount, setDonationAmount] = useState("10000");
  const [currency, setCurrency] = useState("RWF");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const handleDonate = async (amount?: string) => {
    const finalAmount = amount || donationAmount;
    
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
      if (paymentMethod === "stripe") {
        const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
          body: { 
            amount: parseFloat(finalAmount),
            currency,
            message 
          }
        });

        if (error) throw error;
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      } else {
        // Mobile Money flow
        toast({
          title: "Mobile Money Payment",
          description: `Processing ${paymentMethod.toUpperCase()} payment for ${finalAmount} ${currency}`,
        });
        
        // Here you would integrate with MTN/Airtel Money API
        // For now, we'll simulate the payment
        setTimeout(() => {
          toast({
            title: "Payment Initiated",
            description: "Please check your phone to complete the payment",
          });
        }, 1500);
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
    { amount: "5000", label: t("donations.supporter"), description: "Help with small repairs" },
    { amount: "25000", label: t("donations.contributor"), description: "Fund materials for projects" },
    { amount: "50000", label: t("donations.champion"), description: "Sponsor a community project" },
    { amount: "100000", label: t("donations.hero"), description: "Make a major impact" },
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
            <h1 className="text-4xl font-bold mb-4">{t("donations.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("donations.description")}
            </p>
          </div>

          {/* Donation Tiers */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {donationTiers.map((tier) => (
              <Card key={tier.amount} className="p-6 hover:shadow-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">{tier.amount} RWF</h3>
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
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("donations.donateNow")}
                </Button>
              </Card>
            ))}
          </div>

          {/* Custom Amount */}
          <Card className="p-8 bg-gradient-card">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold mb-4 text-center">{t("donations.customAmount")}</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency">{t("donations.currency")}</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Donation Amount ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="method">{t("donations.paymentMethod")}</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {t("donations.creditCard")}
                        </div>
                      </SelectItem>
                      <SelectItem value="mtn">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          {t("donations.mtnMoney")}
                        </div>
                      </SelectItem>
                      <SelectItem value="airtel">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4" />
                          {t("donations.airtelMoney")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a message..."
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => handleDonate()}
                  disabled={isLoading || !donationAmount || parseFloat(donationAmount) < 1}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  {t("donations.donateNow")} {donationAmount} {currency}
                </Button>
              </div>
            </div>
          </Card>

          {/* Impact Section */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">{t("donations.yourImpact")}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">{t("donations.materials")}</h4>
                <p className="text-sm text-muted-foreground">
                  Cement, paint, and tools for repairs
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">{t("donations.community")}</h4>
                <p className="text-sm text-muted-foreground">
                  Empower volunteers and local leaders
                </p>
              </Card>
              <Card className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">{t("donations.transparency")}</h4>
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
