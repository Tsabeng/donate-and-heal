// src/pages/Login.tsx
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
import { Droplet, Heart, Stethoscope, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"donor" | "doctor" | "blood-bank" | "">("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return toast({ title: "Sélectionnez votre rôle", variant: "destructive" });

    setLoading(true);
    try {
      await authService.login({ email, password, userType: userType as any });
      toast({ title: "Connexion réussie !", description: "Bienvenue" });

      setTimeout(() => {
        if (userType === "donor") navigate("/donor/dashboard");
        else if (userType === "doctor") navigate("/doctor/dashboard");
        else navigate("/blood-bank/dashboard");
      }, 800);
    } catch (error: any) {
      toast({ title: "Échec", description: error.message || "Identifiants incorrects", variant: "destructive" });
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
      {/* Background Blobs */}
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
            BloodLink
          </CardTitle>
          <p className="text-xl text-gray-700 mt-4">Connectez-vous pour sauver des vies</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-12 pb-10">
            {/* Rôle */}
            <div className="space-y-4">
              <Label className="text-2xl font-bold text-gray-800">Je suis</Label>
              <Select value={userType} onValueChange={setUserType} disabled={loading}>
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
              {userType && (
                <div className="flex justify-center -mt-4">
                  <div className="p-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl shadow-xl">
                    {icons[userType]}
                  </div>
                </div>
              )}
            </div>

            {/* Email & Mot de passe */}
            <div className="space-y-6">
              <div>
                <Label className="text-xl">Email</Label>
                <Input
                  type="email"
                  placeholder="contact@hopital.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-16 text-xl rounded-2xl"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Label className="text-xl">Mot de passe</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 text-xl rounded-2xl"
                  required
                  disabled={loading}
                />
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
              {loading ? "Connexion..." : "Se connecter"}
            </Button>

            <p className="text-center text-lg">
              Pas de compte ?{" "}
              <Link to="/register" className="font-bold text-red-600 hover:underline">
                S'inscrire
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;