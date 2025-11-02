// src/pages/donor/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Droplet, Heart, MapPin, Clock, RefreshCcw } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  _id: string;
  date: string;
  location: string;
  status: string;
}

interface Alert {
  _id: string;
  bloodType: string;
  urgency: 'normal' | 'urgent' | 'critical';
  quantity: number;
  bloodBank: { hospitalName: string; location?: { coordinates: [number, number] } };
  createdAt: string;
}

const DonorDashboard = () => {
  const { user, loading: authLoading, refetch } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [canDonate, setCanDonate] = useState(true);
  const [nextDonationDate, setNextDonationDate] = useState("");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [alertRes, donationRes] = await Promise.all([
        api.get<{ data: { alerts: Alert[] } }>('/alerts'),
        api.get<{ data: Donation[] }>('/donations'),
      ]);

      setAlerts(alertRes.data.data.alerts);
      setDonations(donationRes.data.data);
      calculateEligibility(donationRes.data.data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEligibility = (history: Donation[]) => {
    if (history.length === 0) {
      setCanDonate(true);
      return;
    }

    const last = new Date(history[0].date);
    const now = new Date();
    const monthsDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const required = 3; // 3 mois minimum

    if (monthsDiff >= required) {
      setCanDonate(true);
      setNextDonationDate("");
    } else {
      const next = new Date(last);
      next.setMonth(next.getMonth() + required);
      setCanDonate(false);
      setNextDonationDate(next.toLocaleDateString("fr-FR"));
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  if (authLoading) return <div className="p-8 text-center">Chargement...</div>;
  if (!user) return <div className="p-8 text-center">Non connecté</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {canDonate ? "Prêt à donner" : `Prochain don : ${nextDonationDate}`}
                </p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">{user.bloodType}</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-end">
          <Button onClick={loadData} disabled={loading}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Dons</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold">{donations.length}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Vies aidées</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-accent fill-accent" />
              <span className="text-3xl font-bold">
                {alerts.filter(a => a.bloodType === user.bloodType).length * 3}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">Prochain don</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-2">
              <Calendar className="w-8 h-8 text-secondary" />
              <span className="text-3xl font-bold">{canDonate ? "Disponible" : nextDonationDate}</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Urgentes</CardTitle>
            <CardDescription>Appels au don près de chez vous</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : alerts.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucune alerte</p>
            ) : (
              alerts
                .filter(a => a.bloodType === user.bloodType)
                .map((alert) => (
                  <div key={alert._id} className="p-4 bg-muted/50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{alert.bloodBank.hospitalName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.quantity} unité(s) • {alert.urgency}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const [lng, lat] = alert.bloodBank.location?.coordinates || [0, 0];
                        window.open(`https://maps.google.com?q=${lat},${lng}`);
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" /> Voir
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique</CardTitle>
            <CardDescription>Vos derniers dons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {donations.length === 0 ? (
              <p className="text-center text-muted-foreground">Aucun don</p>
            ) : (
              donations.map((d) => (
                <div key={d._id} className="flex justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{new Date(d.date).toLocaleDateString("fr-FR")}</p>
                      <p className="text-sm text-muted-foreground">{d.location}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{d.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;