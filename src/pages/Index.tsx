import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Bike, Clock, Shield, Star } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const features = [
    {
      icon: <Bike className="h-8 w-8" />,
      title: "Wide Selection",
      description: "Choose from a diverse fleet of well-maintained bikes",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Rentals",
      description: "Rent by the day with easy pickup and return",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Fully Insured",
      description: "All bikes are fully insured for your peace of mind",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Best Prices",
      description: "Competitive rates with no hidden fees",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Motorcycle adventure" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold text-background md:text-6xl lg:text-7xl">
            Your Journey Starts Here
          </h1>
          <p className="mb-8 text-xl text-background/90 md:text-2xl">
            Rent premium bikes at unbeatable prices. Adventure awaits!
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/bikes">
              <Button size="lg" className="group">
                Browse Bikes
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Why Choose RideEasy?</h2>
            <p className="text-xl text-muted-foreground">
              Experience the best bike rental service in town
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 transition-all hover:border-primary hover:shadow-glow">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Ride?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands of satisfied riders and start your adventure today
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 RideEasy Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
