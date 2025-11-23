// src/pages/Index.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Heart, Activity, Users, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-pink-600 to-purple-700 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-20 px-6 text-center">
        <div className="container mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-xl rounded-full px-8 py-4 mb-8">
            <Sparkles className="w-8 h-8" />
            <span className="text-2xl font-bold">Sauvez des vies en 1 clic</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
            BLOODLINK
          </h1>
          <p className="text-3xl md:text-5xl font-light mb-12 max-w-4xl mx-auto">
            La plateforme qui connecte donneurs, médecins et banques de sang en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Button asChild size="lg" className="h-24 px-16 text-4xl font-black rounded-full bg-white text-red-600 hover:bg-gray-100 shadow-3xl transform hover:scale-110 transition-all">
              <Link to="/register">Commencer maintenant</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-24 px-16 text-4xl font-black rounded-full border-4 border-white backdrop-blur-xl hover:bg-white/20">
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6">
        <div className="container mx-auto max-w-7xl grid md:grid-cols-3 gap-12">
          {[
            { icon: Heart, title: "Donneurs", desc: "Inscrivez-vous, donnez, sauvez des vies" },
            { icon: Activity, title: "Médecins", desc: "Demandez du sang en urgence" },
            { icon: Droplet, title: "Banques", desc: "Gérez votre stock en temps réel" },
          ].map((item, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-2xl border-0 shadow-3xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-16 text-center">
                <item.icon className="w-32 h-32 mx-auto mb-8 text-white" />
                <h3 className="text-5xl font-black mb-6">{item.title}</h3>
                <p className="text-2xl opacity-90">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-32 text-center">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-8xl font-black mb-12">Chaque goutte compte</h2>
          <Button asChild size="lg" className="h-32 px-24 text-5xl font-black rounded-full bg-white text-red-600 shadow-3xl hover:scale-110 transition-all">
            <Link to="/register">Rejoignez-nous aujourd'hui <ArrowRight className="ml-6 w-16 h-16" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;