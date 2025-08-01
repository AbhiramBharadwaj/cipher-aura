import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Key, Zap, Eye, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-navy-deep to-navy-medium">
      {/* Navigation */}
      <nav className="glass-nav p-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-primary security-pulse" />
            <span className="text-2xl font-bold neon-text">CipherAura</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Features
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Security
            </Button>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-card mb-6 security-pulse">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Protect your conversations with hybrid encryption
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Advanced security through multi-layered encryption combining Caesar, Vigenère, and AES algorithms. 
              Experience enterprise-grade protection with an intuitive interface.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              className="gradient-primary text-white font-semibold px-8 py-4 hover-lift neon-glow"
              onClick={() => navigate("/dashboard")}
            >
              Start Encrypting
              <Key className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4 hover-lift"
              onClick={() => navigate("/register")}
            >
              Learn More
              <Eye className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card p-8 hover-lift border-navy-light">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Triple-Layer Security</h3>
            <p className="text-muted-foreground">
              Combine Caesar cipher, Vigenère encryption, and AES-256 for unbreakable protection.
            </p>
          </Card>

          <Card className="glass-card p-8 hover-lift border-navy-light">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Optimized algorithms ensure rapid encryption and decryption without compromising security.
            </p>
          </Card>

          <Card className="glass-card p-8 hover-lift border-navy-light">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg gradient-primary mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Team Ready</h3>
            <p className="text-muted-foreground">
              Share encrypted messages securely with your team using advanced key management.
            </p>
          </Card>
        </div>
      </section>

      {/* Security Metrics */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Trusted by Security Professionals</h2>
          <p className="text-muted-foreground">Industry-leading encryption standards</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { label: "Encryption Strength", value: "AES-256", desc: "Military Grade" },
            { label: "Speed", value: "< 50ms", desc: "Average Processing" },
            { label: "Security Score", value: "99.9%", desc: "Entropy Rating" },
            { label: "Users Protected", value: "10K+", desc: "Active Users" }
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold neon-text mb-2">{metric.value}</div>
              <div className="text-foreground font-medium">{metric.label}</div>
              <div className="text-sm text-muted-foreground">{metric.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;