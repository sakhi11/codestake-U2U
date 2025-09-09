
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/context/FlowProvider";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import CtaSection from "@/components/sections/CtaSection";
import Footer from "@/components/layout/Footer";

const Index: React.FC = () => {
  const { isConnected } = useFlow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
