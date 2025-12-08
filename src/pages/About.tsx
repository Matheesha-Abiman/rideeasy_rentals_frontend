import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Bike, Shield, Star, Users, Phone, Mail } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold">About RideEasy</h1>
          <p className="mx-auto max-w-2xl text-lg opacity-90">
            We are redefining the bike rental experience with premium rides,
            affordable prices, and customer-first service.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20">
        <div className="container mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-2">
          {/* Left Content */}
          <div>
            <h2 className="mb-4 text-3xl font-bold">Who We Are</h2>
            <p className="mb-6 text-muted-foreground leading-relaxed">
              RideEasy is a premium bike rental service built for adventure
              lovers, city riders, and explorers. We provide fully insured,
              well-maintained bikes with flexible rental plans designed for your
              comfort and safety.
            </p>

            <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to make travel simple, affordable, and exciting by
              delivering reliable bikes and unmatched customer service.
            </p>
          </div>

          {/* Right Feature Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <Bike className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Premium Bikes</h3>
              <p className="text-sm text-muted-foreground">
                High-quality bikes for every journey
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <Shield className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Fully Insured</h3>
              <p className="text-sm text-muted-foreground">
                Ride with confidence and safety
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <Star className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Best Prices</h3>
              <p className="text-sm text-muted-foreground">
                No hidden fees, only value
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">Trusted by Riders</h3>
              <p className="text-sm text-muted-foreground">
                Thousands of happy customers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">Ready to Start Your Ride?</h2>
          <p className="mb-8 text-muted-foreground">
            Join RideEasy today and experience premium bike rentals like never
            before.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/bikes">
              <Button size="lg">Browse Bikes</Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Contact Footer */}
      <footer className="border-t bg-card py-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-2xl font-semibold">Contact Us</h3>

          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+94 77 123 4567</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@rideeasy.lk</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            © 2025 RideEasy Rentals. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
