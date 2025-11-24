

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Droplet, Heart, Stethoscope, Building2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
    userType: "" as "donor" | "doctor" | "blood-bank" | "",
    bloodType: "", hospital: "", cni: "", licenseNumber: "",
    hospitalName: "", address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    return toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
  }

  setLoading(true);
  try {
    if (formData.userType === "blood-bank") {
      await api.post("/auth/bloodbank/register", {
        hospitalName: formData.hospitalName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });
      toast({ title: "Succès", description: "Banque de sang créée !" });
    } else {
      await authService.register({
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
      toast({ title: "Succès", description: "Compte créé avec succès !" });
    }

    refetch();
    const route = formData.userType === "blood-bank" 
      ? "/blood-bank/dashboard" 
      : formData.userType === "donor" 
      ? "/donor/dashboard" 
      : "/doctor/dashboard";
    navigate(route, { replace: true });
  } catch (error: any) {
    toast({ 
      title: "Erreur", 
      description: error.message || "Inscription échouée", 
      variant: "destructive" 
    });
  } finally {
    setLoading(false);
  }
};

  const icons = {
    donor: <Heart className="w-12 h-12" />,
    doctor: <Stethoscope className="w-12 h-12" />,
    "blood-bank": <Building2 className="w-12 h-12" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-rose-700 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blobs — identique au Login */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-2xl shadow-3xl bg-white/95 backdrop-blur-2xl border-0 rounded-3xl overflow-hidden relative z-10">
        <CardHeader className="text-center pt-12 pb-8 bg-gradient-to-b from-red-50 to-transparent">
          <div className="mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-2xl mb-6">
            <Droplet className="w-20 h-20 text-white" />
          </div>
          <CardTitle className="text-5xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Créer un compte
          </CardTitle>
          <p className="text-xl text-gray-700 mt-4">Rejoignez BloodLink pour sauver des vies</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-12 pb-10">
            {/* Rôle — identique au Login */}
            <div className="space-y-4">
              <Label className="text-2xl font-bold text-gray-800">Je suis</Label>
              <Select
                value={formData.userType}
                onValueChange={(v) => setFormData({ ...formData, userType: v as any })}
                disabled={loading}
              >
                <SelectTrigger className="h-20 text-2xl rounded-2xl border-2">
                  <SelectValue placeholder="Choisir votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="donor" className="text-xl py-6 flex items-center gap-4">
                    <Heart className="w-8 h-8 text-red-600" /> Donneur de sang
                  </SelectItem>
                  <SelectItem value="doctor" className="text-xl py-6 flex items-center gap-4">
                    <Stethoscope className="w-8 h-8 text-blue-600" /> Médecin
                  </SelectItem>
                  <SelectItem value="blood-bank" className="text-xl py-6 flex items-center gap-4">
                    <Building2 className="w-8 h-8 text-purple-600" /> Banque de sang
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.userType && (
                <div className="flex justify-center -mt-4">
                  <div className="p-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl shadow-xl">
                    {icons[formData.userType]}
                  </div>
                </div>
              )}
            </div>

            {/* Champs spécifiques selon rôle */}
            {formData.userType === "donor" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-xl">Nom complet</Label>
                  <Input
                    placeholder="Moustapha Diallo"
                    className="h-16 text-xl rounded-2xl"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-xl">Groupe sanguin</Label>
                  <Select value={formData.bloodType} onValueChange={v => setFormData({ ...formData, bloodType: v })}>
                    <SelectTrigger className="h-16 text-xl rounded-2xl">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {formData.userType === "doctor" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-xl">Nom complet</Label>
                  <Input
                    placeholder="Dr. Awa Ndiaye"
                    className="h-16 text-xl rounded-2xl"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-xl">Hôpital</Label>
                  <Input
                    placeholder="Hôpital Principal de Dakar"
                    className="h-16 text-xl rounded-2xl"
                    value={formData.hospital}
                    onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {formData.userType === "blood-bank" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-xl">Nom de l'établissement</Label>
                  <Input
                    placeholder="Hôpital Général de Grand Yoff"
                    className="h-16 text-xl rounded-2xl"
                    value={formData.hospitalName}
                    onChange={e => setFormData({ ...formData, hospitalName: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label className="text-xl">Adresse complète</Label>
                  <Input
                    placeholder="Route de l'Aéroport, Dakar"
                    className="h-16 text-xl rounded-2xl"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Champs communs */}
            <div className="space-y-6">
              <div>
                <Label className="text-xl">Email</Label>
                <Input
                  type="email"
                  placeholder="contact@hopital.sn"
                  className="h-16 text-xl rounded-2xl"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-xl">Téléphone</Label>
                <Input
                  placeholder="+221 77 123 4567"
                  className="h-16 text-xl rounded-2xl"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              {/* Mot de passe avec œil */}
              <div>
                <Label className="text-xl">Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="h-16 text-xl rounded-2xl pr-12"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-600"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xl">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-16 text-xl rounded-2xl pr-12"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-6 pb-12 px-12">
            <Button
              type="submit"
              size="lg"
              className="w-full h-20 text-3xl font-black rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-2xl transform hover:scale-105 transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Création..." : "Créer mon compte"}
            </Button>

            <p className="text-center text-lg">
              Déjà un compte ?{" "}
              <Link to="/login" className="font-bold text-red-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;