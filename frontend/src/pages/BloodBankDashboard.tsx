// src/pages/bloodbank/Dashboard.tsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
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
  Building2,
  Droplet,
  AlertTriangle,
  Plus,
  ArrowDownToLine,
  CheckCircle,
  User,
  X,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import axios from "axios";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const bloodTypes = ["A+", "A-", "B+", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface Inventory {
  [key: string]: number;
}

interface Request {
  _id: string;
  patientId: string;
  bloodType: string;
  units: number;
  urgency: "normal" | "urgent";
  status: "pending" | "processing" | "fulfilled";
  createdAt: string;
  requestedBy?: { name: string };
}

const BloodBankDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [inventory, setInventory] = useState<Inventory>({});
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [donOpen, setDonOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [donForm, setDonForm] = useState({ bloodType: "", units: "" });

  const loadData = async () => {
  if (!user?._id) return;
  setLoading(true);
  try {
    const [invRes, reqRes] = await Promise.all([
      api.get("/api/bloodbanks/inventory"),
      api.get("/api/requests/all-pending"),
    ]);

    console.log("%c[BloodBank] Inventory reçu :", "color: green", invRes.data);
    console.log("%c[BloodBank] Demandes reçues :", "color: blue", reqRes.data);

    setInventory(
      invRes.data?.data?.inventory ||
      invRes.data?.inventory ||
      {}
    );

    setRequests(reqRes.data?.data || reqRes.data || []);

  } catch (error: any) {
    console.error("Erreur loadData banque :", error.response || error);
    toast({
      title: "Erreur",
      description: error.message || "Impossible de charger les données",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // FONCTION QUI MARCHE À 100 % (avec axios.patch)
  const handleAddDonation = async () => {
    if (!donForm.bloodType || !donForm.units || Number(donForm.units) <= 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";

      await axios.patch(
        "http://localhost:5000/api/bloodbanks/inventory",
        {
          bloodType: donForm.bloodType,
          quantity: Number(donForm.units),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({ title: "Succès !", description: `+${donForm.units} unité(s) ${donForm.bloodType} ajoutée(s)` });
      setDonOpen(false);
      setDonForm({ bloodType: "", units: "" });
      loadData();
    } catch (error: any) {
      console.error("Erreur ajout don:", error.response?.data || error);
      toast({
        title: "Échec",
        description: error.response?.data?.message || "Erreur lors de l'ajout",
        variant: "destructive",
      });
    }
  };

  const handleFulfillRequest = async (request: Request) => {
    const available = inventory[request.bloodType] || 0;
    if (available < request.units) {
      toast({
        title: "Stock insuffisant",
        description: `Seulement ${available} ${request.bloodType} disponibles`,
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token") || "";

      await axios.patch(
        "http://localhost:5000/api/bloodbanks/inventory",
        {
          bloodType: request.bloodType,
          quantity: -request.units,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({ title: "Distribution validée", description: `${request.units} ${request.bloodType} livrées` });
      loadData();
    } catch (error) {
      toast({ title: "Erreur", description: "Distribution échouée", variant: "destructive" });
    }
  };

  const totalUnits = Object.values(inventory).reduce((a, b) => a + b, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-8">
          <Skeleton className="h-16 w-96" />
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-12 w-24" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header + Profil */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-4 hover:bg-muted/50 rounded-lg p-3 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">{user?.hospitalName || "Banque de sang"}</h1>
              <p className="text-muted-foreground">{user?.address || "Adresse non définie"}</p>
            </div>
          </button>
        </div>
      </header>

      {/* Profil Sheet */}
      <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
        <SheetContent side="left" className="w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Profil Banque de sang
              <Button size="icon" variant="ghost" onClick={() => setProfileOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Building2 className="w-16 h-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold">{user?.hospitalName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div className="space-y-5 text-sm bg-muted/30 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <span>{user?.address || "Non défini"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>{user?.phone || "Non défini"}</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Stock total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <Droplet className="w-8 h-8 text-red-600" />
                {totalUnits}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Demandes en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {requests.filter((r) => r.urgency === "urgent").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Groupes critiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {bloodTypes.filter((t) => (inventory[t] || 0) <= 5).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventaire + Actions rapides */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Inventaire sanguin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                {bloodTypes.map((type) => {
                  const units = inventory[type] || 0;
                  const status = units === 0 ? "Épuisé" : units <= 5 ? "Critique" : units <= 15 ? "Faible" : "Normal";
                  const variant = units === 0 ? "destructive" : units <= 5 ? "destructive" : units <= 15 ? "secondary" : "outline";

                  return (
                    <div key={type} className="text-center space-y-3 p-6 bg-muted/30 rounded-xl">
                      <p className="text-3xl font-bold">{type}</p>
                      <p className="text-5xl font-mono font-bold">{units}</p>
                      <Badge variant={variant} className="text-lg px-4 py-1">
                        {status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Button size="lg" className="w-full h-40 text-xl font-semibold" onClick={() => setDonOpen(true)}>
              <Plus className="w-10 h-10 mr-4" />
              Enregistrer un don
            </Button>
            <Button size="lg" variant="outline" className="w-full h-40 text-xl font-semibold" onClick={() => setRequestsOpen(true)}>
              <ArrowDownToLine className="w-10 h-10 mr-4" />
              Demandes en attente ({requests.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Popup Enregistrer un don */}
      <Dialog open={donOpen} onOpenChange={setDonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un don de sang</DialogTitle>
            <DialogDescription>Ajouter des unités à l'inventaire</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Groupe sanguin</Label>
              <Select value={donForm.bloodType} onValueChange={(v) => setDonForm({ ...donForm, bloodType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le groupe" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre d'unités</Label>
              <Input
                type="number"
                min="1"
                placeholder="10"
                value={donForm.units}
                onChange={(e) => setDonForm({ ...donForm, units: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDonOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddDonation}>Ajouter au stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup Demandes en attente */}
      <Dialog open={requestsOpen} onOpenChange={setRequestsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Demandes en attente ({requests.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {requests.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucune demande pour le moment</p>
              </div>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="p-6 border rounded-xl bg-card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-xl font-semibold">Patient #{req.patientId}</p>
                      <div className="flex items-center gap-4 text-lg">
                        <span className="font-bold text-primary">{req.bloodType}</span>
                        <span>• {req.units} unité{req.units > 1 ? "s" : ""}</span>
                        {req.urgency === "urgent" && (
                          <Badge variant="destructive" className="text-lg px-4">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(req.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => handleFulfillRequest(req)}
                      disabled={(inventory[req.bloodType] || 0) < req.units}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Valider la distribution
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodBankDashboard;