// src/pages/donor/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Calendar,
  Droplet,
  Heart,
  MapPin,
  Clock,
  RefreshCw,
  User,
  X,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const DonorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [donations, setDonations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

const loadData = async () => {
  if (!user) return;

  try {
    setLoading(true);

    // On ne charge PLUS /api/donations/my → ça n'existe pas encore
    // On garde seulement les alertes (qui marchent maintenant)
    const alertRes = await api.get("/api/alerts/my").catch(() => ({ data: { data: [] } }));

    setAlerts(alertRes.data?.data || []);
    // On laisse donations vide pour l’instant (pas de 404)
    setDonations([]);
  } catch (error) {
    // Rien, on reste silencieux
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  // Rafraîchissement toutes les 10 minutes
  useEffect(() => {
    const interval = setInterval(loadData, 600000);
    return () => clearInterval(interval);
  }, [user]);

  const compatibleAlerts = alerts.filter((a: any) => a.bloodType === user?.bloodType);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Chargement du profil donneur...</p>
        </div>
      </div>
    );
  }

  if (!user) return <div className="p-8 text-center text-2xl">Non connecté</div>;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header + Profil */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-4 hover:bg-muted/50 rounded-lg p-3 transition-all w-full text-left"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Droplet className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-lg text-muted-foreground">
                Groupe sanguin : <strong className="text-primary">{user.bloodType}</strong>
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* Profil Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="left" className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Mon profil donneur
              <Button size="icon" variant="ghost" onClick={() => setProfileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-20 h-20 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <Badge variant="destructive" className="text-3xl px-8 py-4 mt-2">
                {user.bloodType}
              </Badge>
            </div>
            <div className="space-y-6 text-lg bg-muted/30 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <Mail className="w-6 h-6" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="w-6 h-6" />
                <span>{user.phone || "Non renseigné"}</span>
              </div>
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-red-600" />
                <span className="font-bold text-xl">
                  {donations.length} don(s) effectué(s)
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-end">
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader><CardTitle className="text-lg">Total dons</CardTitle></CardHeader>
            <CardContent><div className="text-5xl font-bold text-primary">{donations.length}</div></CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader><CardTitle className="text-lg">Vies sauvées</CardTitle></CardHeader>
            <CardContent><div className="text-5xl font-bold text-red-600">{donations.length * 3}</div></CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader><CardTitle className="text-lg">Alertes pour vous</CardTitle></CardHeader>
            <CardContent><div className="text-5xl font-bold text-orange-600">{compatibleAlerts.length}</div></CardContent>
          </Card>
        </div>

        {/* Alertes urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              Alertes urgentes – Besoin de {user.bloodType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : compatibleAlerts.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
                <p className="text-2xl font-medium">Tout va bien pour l'instant ❤️</p>
                <p className="text-muted-foreground mt-2">Vous serez prévenu dès qu'un hôpital aura besoin de vous</p>
              </div>
            ) : (
              <div className="space-y-6">
                {compatibleAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`p-8 rounded-2xl border-4 ${
                      alert.urgency === "critical"
                        ? "border-red-600 bg-red-50"
                        : alert.urgency === "urgent"
                        ? "border-orange-600 bg-orange-50"
                        : "border-yellow-600 bg-yellow-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold">{alert.hospitalName}</h3>
                        <p className="text-xl">
                          Besoin de <strong className="text-primary">{alert.units} unité(s) {alert.bloodType}</strong>
                        </p>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5" />
                          <span className="text-lg">{alert.address}</span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="h-20 text-xl font-semibold"
                        onClick={() => toast({ title: "Fonctionnalité à venir", description: "L'acceptation des dons sera bientôt disponible" })}
                      >
                        <Heart className="w-6 h-6 mr-3" />
                        Je peux donner !
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historique des dons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mon historique de dons</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-20">
                <Droplet className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
                <p className="text-2xl font-medium">Aucun don enregistré</p>
                <p className="text-muted-foreground mt-2">Votre premier don changera le monde ❤️</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((don) => (
                  <div key={don._id} className="flex items-center justify-between p-6 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold">
                          {new Date(don.createdAt).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-lg text-muted-foreground">
                          {don.bloodBank?.hospitalName || "Hôpital"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-6 py-3">
                      Don effectué
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;