// src/pages/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
    userType: "" as "donor" | "doctor" | "blood-bank" | "",
    bloodType: "", hospital: "", cni: "", licenseNumber: "",
    // Champs spécifiques blood-bank (on les garde ici pour le formulaire)
    hospitalName: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let response;

      // === CAS BLOOD-BANK : on appelle directement la route dédiée ===
      if (formData.userType === "blood-bank") {
        if (!formData.hospitalName || !formData.address) {
          toast({ title: "Erreur", description: "Nom de l'établissement et adresse sont requis", variant: "destructive" });
          setLoading(false);
          return;
        }

        response = await fetch("http://localhost:5000/api/auth/bloodbank/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hospitalName: formData.hospitalName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Échec de la création de la banque de sang");
        }

        toast({ title: "Succès !", description: "Banque de sang créée avec succès" });
        response = data; // pour garder la même structure plus bas
      }
      // === AUTRES UTILISATEURS : on garde l’ancien authService.register ===
      else {
        response = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          userType: formData.userType as any,
          bloodType: formData.bloodType || undefined,
          hospital: formData.hospital || undefined,
          cni: formData.cni || undefined,
          licenseNumber: formData.licenseNumber || undefined,
        });

        toast({ title: "Succès !", description: "Compte créé avec succès" });
      }

      console.log("REGISTER RESPONSE:", response);

      // Mise à jour auth + redirection
      refetch();

      const route =
        formData.userType === "blood-bank" ? "/blood-bank/dashboard" :
        formData.userType === "donor" ? "/donor/dashboard" : "/doctor/dashboard";

      navigate(route, { replace: true });
    } catch (error: any) {
      console.error("REGISTER ERROR:", error);
      toast({
        title: "Échec de l'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>Rejoignez BloodLink pour sauver des vies</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">

            {/* Champs communs */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@hopital.sn" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" placeholder="+221 77 123 4567" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-type">Je suis</Label>
              <Select value={formData.userType}
                onValueChange={(v) => setFormData({
                  ...formData,
                  userType: v as any,
                  bloodType: "", hospital: "", cni: "", licenseNumber: "", hospitalName: "", address: ""
                })}
                required disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor">Donneur de sang</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="blood-bank">Banque de sang / Hôpital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Donneur */}
            {formData.userType === "donor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" placeholder="Moustapha Diallo" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-type">Groupe sanguin</Label>
                  <Select value={formData.bloodType} onValueChange={(v) => setFormData({ ...formData, bloodType: v })} required disabled={loading}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Médecin */}
            {formData.userType === "doctor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" placeholder="Dr. Awa Ndiaye" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hôpital</Label>
                  <Input id="hospital" placeholder="Hôpital Principal de Dakar" value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cni">Numéro CNI</Label>
                  <Input id="cni" placeholder="123456789012" value={formData.cni}
                    onChange={(e) => setFormData({ ...formData, cni: e.target.value })} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">Numéro de licence</Label>
                  <Input id="license" placeholder="MED-SN-2025-001" value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} required disabled={loading} />
                </div>
              </>
            )}

            {/* Banque de sang */}
            {formData.userType === "blood-bank" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Nom de l'établissement</Label>
                  <Input id="hospitalName" placeholder="Hôpital Général de Grand Yoff" value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète</Label>
                  <Input id="address" placeholder="Route de l'Aéroport, Dakar" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} required disabled={loading} />
                </div>
              </>
            )}

            {/* Mots de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input id="confirm-password" type="password" value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required disabled={loading} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création..." : "Créer le compte"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Déjà un compte ? <Link to="/login" className="text-primary hover:underline">Se connecter</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;