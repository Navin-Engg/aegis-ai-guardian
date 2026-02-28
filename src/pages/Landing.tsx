import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Brain, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-illustration.jpg";

const features = [
  { icon: Mail, title: "Email Threat Detection", desc: "AI-powered analysis detects phishing, malware, and tampering in real-time." },
  { icon: Brain, title: "Smart AI Analysis", desc: "Deep learning models trained on millions of threat patterns for accurate classification." },
  { icon: Lock, title: "Two-Factor Security", desc: "Multi-layer authentication with OTP verification keeps your account safe." },
  { icon: Shield, title: "Explainable Results", desc: "Understand exactly why an email is flagged with plain-language threat indicators." },
];

const stats = [
  { value: "99.7%", label: "Detection Accuracy" },
  { value: "<2s", label: "Analysis Time" },
  { value: "10M+", label: "Emails Scanned" },
  { value: "24/7", label: "Active Protection" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background dark">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">AegisAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                AI-Powered Email Security
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-foreground">
                Protect Your Inbox with{" "}
                <span className="text-gradient">AegisAI</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Detect phishing, malware, and email tampering instantly. 
                AegisAI uses advanced AI to keep students and institutions safe from digital threats.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="gap-2 text-base">
                    Start Free Analysis <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="text-base">
                    Sign In
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                {["No credit card", "Free tier available", "Instant setup"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden glow-primary border border-primary/20">
                <img src={heroImage} alt="AegisAI cybersecurity email threat detection visualization" className="w-full h-auto" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Enterprise-Grade Email Security</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for students and institutions — simple, explainable, and effective digital protection.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6 hover:glow-primary transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>AegisAI &copy; {new Date().getFullYear()}</span>
          </div>
          <span>AI + Cybersecurity & Privacy</span>
        </div>
      </footer>
    </div>
  );
}
