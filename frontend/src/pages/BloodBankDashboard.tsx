// src/pages/bloodbank/Dashboard.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Droplet, TrendingUp, AlertTriangle } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface Inventory {
  bloodType: string;
  units: number;
  capacity: number;
}

interface Activity {
  _id: string;
  type: 'donation' | 'distribution';
  donor?: string;
  hospital?: string;
  bloodType: string;
  units: number;
  createdAt: string;
}

const BloodBankDashboard = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, actRes] = await Promise.all([
        api.get<{ data: Inventory[] }>('/inventory'),
        api.get<{ data: Activity[] }>('/activities'),
      ]);
      setInventory(invRes.data.data);
      setActivities(actRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const totalUnits = inventory.reduce((a, b) => a + b.units, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{user?.hospitalName}</h1>
              <p className="text-sm text-muted-foreground">{user?.address}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid md:grid-cols-4 gap-6">
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Unités totales</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Droplet className="w-8 h-8 text-primary" /><span className="text-3xl font-bold">{totalUnits}</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Donneurs actifs</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><Users className="w-8 h-8 text-secondary" /><span className="text-3xl font-bold">342</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Demandes en attente</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><AlertTriangle className="w-8 h-8 text-accent" /><span className="text-3xl font-bold">7</span></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Ce mois</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><TrendingUp className="w-8 h-8 text-primary" /><span className="text-3xl font-bold">128</span></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Inventaire</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              {inventory.map(b => {
                const percent = (b.units / b.capacity) * 100;
                const status = percent < 20 ? "critical" : percent < 40 ? "low" : "normal";
                return (
                  <div key={b.bloodType} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold w-12">{b.bloodType}</span>
                      <span className="text-sm text-muted-foreground">{b.units} / {b.capacity}</span>
                      <Badge variant={status === "critical" ? "destructive" : status === "low" ? "secondary" : "outline"}>
                        {status === "critical" ? "Critique" : status === "low" ? "Faible" : "Normal"}
                      </Badge>
                    </div>
                    <Progress value={percent} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activité récente</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a._id} className="flex justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {a.type === 'donation' ? `Don de ${a.donor}` : `Distribution à ${a.hospital}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.bloodType} • {a.units} unité(s)</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(a.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Button className="flex-1">Enregistrer don</Button>
              <Button variant="outline" className="flex-1">Traiter demande</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BloodBankDashboard;