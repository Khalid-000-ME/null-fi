"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Image from "next/image";
import { AsciiSphere } from "./ascii-sphere";
import { AsciiWave } from "./ascii-wave";
import { AsciiTorus } from "./ascii-torus"; // Added import for AsciiTorus

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* ASCII Wave full width and height */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <AsciiWave className="w-full h-full" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24">
        {/* Badge */}
        <div 
          className={`flex justify-center mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative group">
            <Image 
              src="/logo.png" 
              alt="null402 Hero Logo" 
              width={100} 
              height={100} 
              className="rounded-2xl shadow-xl shadow-primary/20 transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
        </div>
        
        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto mb-10">
          <h1 
            className={`text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-8 transition-all duration-700 delay-100 lg:text-7xl ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ fontFamily: 'var(--font-geist-pixel-line), monospace' }}
          >
            <span className="text-balance">Your position is not</span>
            <br />
            <span className="text-balance text-primary">hidden. It is null.</span>
          </h1>
          
          <p 
            className={`text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            The first confidential lending protocol on Ethereum using Zama's fhEVM. 
            All collateral, debt, and health factors are stored as encrypted values.
          </p>
        </div>
        
        {/* CTAs */}
        <div 
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-20 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link href="/chat">
            <Button 
              size="lg" 
              className="bg-foreground hover:bg-foreground/90 text-background px-6 h-11 text-sm font-medium group"
            >
              Start Lending
              <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
        
        {/* Stats with company logos style */}
        <div 
          className={`grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden card-shadow transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { value: "0", label: "public exposures.", company: "SECURITY" },
            { value: "100%", label: "MEV resistance.", company: "PRIVACY" },
            { value: "fhEVM", label: "powered by Zama.", company: "TECHNOLOGY" },
            { value: "$0", label: "targetable debt.", company: "STABILITY" },
          ].map((stat) => (
            <div key={stat.company} className="p-6 lg:p-8 flex justify-between min-h-[140px] bg-black shadow-none lg:py-8 flex-col">
              <div>
                <span className="text-xl lg:text-2xl font-semibold">{stat.value}</span>
                <span className="text-muted-foreground text-sm lg:text-base"> {stat.label}</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mt-4">
                {stat.company}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
