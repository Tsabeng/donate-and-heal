import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Heart, Users, Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Save Lives Through Blood Donation
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Connect donors, doctors, and blood banks in one seamless platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="text-lg shadow-glow hover:scale-105 transition-smooth"
              >
                <Link to="/register">Get Started</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="text-lg bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-smooth"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How BloodLink Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-medium hover:shadow-glow transition-smooth border-border/50">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Droplet className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">For Donors</h3>
                <p className="text-muted-foreground">
                  Register, schedule appointments, and track your donation history all in one place
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-glow transition-smooth border-border/50">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">For Doctors</h3>
                <p className="text-muted-foreground">
                  Access real-time blood availability and manage patient transfusion requests
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-glow transition-smooth border-border/50">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">For Blood Banks</h3>
                <p className="text-muted-foreground">
                  Manage inventory, coordinate with donors, and fulfill medical requests efficiently
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <Heart className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">
            Every Drop Counts
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of donors making a difference every day
          </p>
          <Button 
            asChild 
            size="lg" 
            className="shadow-medium hover:shadow-glow transition-smooth"
          >
            <Link to="/register">Start Saving Lives Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
