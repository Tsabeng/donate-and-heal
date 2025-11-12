// src/pages/doctor/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Search, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Request {
  _id: string;
  patientId: string;
  bloodType: string;
  units: number;
  status: 'pending' | 'processing' | 'fulfilled';
  urgency: 'normal' | 'urgent';
  createdAt: string;
  hospital: string;
}

const DoctorDashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);

  // LOG 1 : Vérifie ce que retourne useAuth
  console.log("useAuth retourne:", { loading, user });

  const loadRequests = async () => {
    console.log("loadRequests appelée", { user });
    if (!user) {
      console.log("Pas de user → arrêt");
      return;
    }
    setRequestLoading(true);
    try {
      console.log("Envoi requête GET /api/requests");
      const res = await api.get<{ data: Request[] }>('/api/requests');
      console.log("Réponse brute de l'API:", res);
      console.log("res.data.data existe ?", !!res.data.data);
      const filtered = res.data.filter(r => r.hospital === user.hospital);
      console.log("Demandes filtrées:", filtered);
      setRequests(filtered);
    } catch (error: any) {
      console.error("ERREUR API:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setRequestLoading(false);
    }
  };

  // LOG 2 : Vérifie si useEffect se déclenche
  useEffect(() => {
    console.log("useEffect déclenché", { loading, user });
    if (!loading && user) {
      console.log("Appel loadRequests");
      loadRequests();
    }
  }, [loading, user]);

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-lg font-medium">Non connecté</p>
        <Button asChild>
          <a href="/login">Se connecter</a>
        </Button>
      </div>
    );
  }

  const stats = {
    active: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    thisMonth: requests.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length,
  };

  const handleNewRequest = async () => {
    try {
      console.log("Création nouvelle demande pour:", user.hospital);
      await api.post('/api/requests', {
        patientId: `PAT-${Date.now()}`,
        bloodType: "O+",
        units: 2,
        urgency: "urgent",
        hospital: user.hospital,
      });
      toast({ title: "Succès", description: "Demande créée" });
      loadRequests();
    } catch (error: any) {
      console.error("Erreur création demande:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Docteur {user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.hospital}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* === STATISTIQUES === */}
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { label: "Demandes actives", value: stats.active, color: "text-primary" },
            { label: "En attente", value: stats.pending, color: "text-accent" },
            { label: "Réalisées", value: stats.fulfilled, color: "text-secondary" },
            { label: "Ce mois", value: stats.thisMonth, color: "text-foreground" },
          ].map((s, i) => (
            <Card key={i}>
              <CardHeader><CardTitle className="text-sm text-muted-foreground">{s.label}</CardTitle></CardHeader>
              <CardContent><div className={`text-3xl font-bold ${s.color}`}>{s.value}</div></CardContent>
            </Card>
          ))}
        </div>

        {/* === RECHERCHE SANG === */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche de sang</CardTitle>
            <CardDescription>Disponibilité par groupe sanguin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input placeholder="A+, O-, AB+" value={search} onChange={e => setSearch(e.target.value)} />
              <Button><Search className="w-4 h-4 mr-2" /> Rechercher</Button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(type => (
                <div key={type} className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-primary">{type}</p>
                  <p className="text-sm text-muted-foreground">Disponible</p>
                  <p className="text-xs">~{Math.floor(Math.random() * 40) + 10} unités</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* === DEMANDES RÉCENTES === */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestLoading ? (
                <p className="text-center text-muted-foreground">Chargement...</p>
              ) : requests.length === 0 ? (
                <p className="text-center text-muted-foreground">Aucune demande</p>
              ) : (
                requests.map(r => (
                  <div key={r._id} className="flex justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Patient #{r.patientId}</p>
                      <p className="text-sm text-muted-foreground">{r.bloodType} • {r.units} unité(s)</p>
                      {r.urgency === 'urgent' && <Badge variant="destructive" className="mt-1">Urgent</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'fulfilled' && (
                        <>
                          <CheckCircle className="w-5 h-5 text-secondary" />
                          <Badge variant="secondary">Réalisée</Badge>
                        </>
                      )}
                      {r.status === 'pending' && (
                        <>
                          <AlertCircle className="w-5 h-5 text-accent" />
                          <Badge className="bg-accent text-accent-foreground">En attente</Badge>
                        </>
                      )}
                      {r.status === 'processing' && (
                        <>
                          <Clock className="w-5 h-5 text-primary" />
                          <Badge variant="outline">En cours</Badge>
                        </>
                      )}
                      <Button size="sm" variant="outline">Détails</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button className="w-full mt-4" onClick={handleNewRequest} disabled={requestLoading}>
              Nouvelle demande
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;