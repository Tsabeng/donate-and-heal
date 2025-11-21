// src/pages/doctor/Dashboard.tsx
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
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  X,
  Plus,
  Calendar,
  Droplet,
  AlertOctagon,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Request {
  _id: string;
  patientId: string;
  bloodType: string;
  units: number;
  status: "pending" | "processing" | "fulfilled";
  urgency: "normal" | "urgent";
  createdAt: string;
  hospital: string | { _id: string };
  requestedBy?: { name: string };
}

const DoctorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Formulaire nouvelle demande
  const [form, setForm] = useState({
    patientId: `PAT-${Date.now()}`,
    bloodType: "",
    units: "",
    urgency: "normal" as "normal" | "urgent",
  });

  const loadRequests = async () => {
    if (!user?.hospital) {
      setLoadingRequests(false);
      return;
    }

    try {
      setLoadingRequests(true);
      const res = await api.get<{ data: Request[] }>("/api/requests");
      const allRequests = res.data?.data || res.data || [];

      const myRequests = allRequests.filter((r: any) =>
        String(r.hospital?._id || r.hospital) === String(user.hospital)
      );

      setRequests(myRequests);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes",
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) loadRequests();
  }, [authLoading, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !loadingRequests) loadRequests();
    }, 120000);
    return () => clearInterval(interval);
  }, [user, loadingRequests]);

  const handleCreateRequest = async () => {
    if (!form.bloodType || !form.units || Number(form.units) < 1 || Number(form.units) > 10) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir correctement tous les champs (1 à 10 unités)",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.post("/api/requests", {
        patientId: form.patientId || `PAT-${Date.now()}`,
        bloodType: form.bloodType,
        units: Number(form.units),
        urgency: form.urgency,
      });

      toast({ title: "Succès", description: "Demande créée avec succès !" });
      setNewRequestOpen(false);
      setForm({ patientId: `PAT-${Date.now()}`, bloodType: "", units: "", urgency: "normal" });
      loadRequests();
    } catch (error: any) {
      toast({
        title: "Échec",
        description: error.response?.data?.message || "Erreur lors de la création",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, urgency: string) => {
    if (status === "pending") return <Badge className="bg-orange-100 text-orange-800">En attente</Badge>;
    if (status === "processing") return <Badge variant="outline">En cours</Badge>;
    if (status === "fulfilled") return <Badge variant="secondary">Réalisée</Badge>;
    return <Badge>{status}</Badge>;
  };

  const stats = {
    active: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    thisMonth: requests.filter((r) => new Date(r.createdAt).getMonth() === new Date().getMonth()).length,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header + Profil */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              {authLoading ? (
                <>
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : user ? (
                <>
                  <h1 className="text-xl font-semibold">
                    Dr. {user.name?.replace(/^Dr\.?\s*/i, "") || "Médecin"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {user.hospitalName || "Hôpital Principal de Dakar"}
                  </p>
                </>
              ) : null}
            </div>
          </button>
        </div>
      </header>

      {/* Profil Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="left" className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Profil Médecin
              <Button size="icon" variant="ghost" onClick={() => setProfileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </SheetTitle>
            <SheetDescription>Vos informations personnelles</SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">
                Dr. {user?.name?.replace(/^Dr\.?\s*/i, "") || "Médecin"}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div className="space-y-5 text-sm bg-muted/30 p-5 rounded-lg">
              <div className="flex justify-between"><span className="text-muted-foreground">Téléphone</span><span>{user?.phone || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">CNI</span><span>{user?.cni || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Licence</span><span>{user?.licenseNumber || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hôpital</span><span className="font-medium text-primary">{user?.hospitalName || "Hôpital Principal de Dakar"}</span></div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6">
          {authLoading || loadingRequests ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3"><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-10 w-16" /></CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Demandes actives</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{stats.active}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">En attente</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-orange-600">{stats.pending}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Réalisées</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">{stats.fulfilled}</div></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Ce mois-ci</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-blue-600">{stats.thisMonth}</div></CardContent></Card>
            </>
          )}
        </div>

        {/* Demandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Mes demandes récentes</CardTitle>
            <CardDescription>{loadingRequests ? "Chargement..." : `${requests.length} demande(s)`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {loadingRequests ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-36" /></div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))
              ) : requests.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Aucune demande pour le moment</p>
              ) : (
                requests.slice(0, 10).map((r) => (
                  <div key={r._id} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg hover:bg-muted transition-all">
                    <div>
                      <p className="font-semibold">Patient #{r.patientId}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{r.bloodType}</span> • {r.units} unité{r.units > 1 ? "s" : ""} • {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(r.status, r.urgency)}
                        {r.urgency === "urgent" && <Badge variant="destructive"><AlertOctagon className="w-3 h-3 mr-1" />Urgent</Badge>}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setSelectedRequest(r)}>
                      Détails
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button className="w-full" onClick={() => setNewRequestOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle demande de sang
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Détails de la demande */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>Demande #{selectedRequest?.patientId}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Groupe sanguin</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Droplet className="w-6 h-6 text-red-600" />
                    {selectedRequest.bloodType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unités demandées</p>
                  <p className="text-2xl font-bold">{selectedRequest.units}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Statut</span>
                  {getStatusBadge(selectedRequest.status, selectedRequest.urgency)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Urgence</span>
                  <Badge variant={selectedRequest.urgency === "urgent" ? "destructive" : "secondary"}>
                    {selectedRequest.urgency === "urgent" ? "Urgent" : "Normal"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date de création</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedRequest.createdAt).toLocaleString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedRequest(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Nouvelle demande (inchangé) */}
      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de sang</DialogTitle>
            <DialogDescription>Saisissez les détails de la demande</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ID Patient</Label>
              <Input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} placeholder="PAT-2025-001" />
            </div>
            <div className="space-y-2">
              <Label>Groupe sanguin</Label>
              <Select value={form.bloodType} onValueChange={(v) => setForm({ ...form, bloodType: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir le groupe" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre d'unités</Label>
              <Input type="number" min="1" max="10" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="2" />
            </div>
            <div className="space-y-2">
              <Label>Urgence</Label>
              <Select value={form.urgency} onValueChange={(v: "normal" | "urgent") => setForm({ ...form, urgency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequestOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateRequest}>Créer la demande</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDashboard;