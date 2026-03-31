"use client";

import { useEffect, useState, useRef } from "react";
import { AsciiDna } from "./ascii-dna";

const regions = [
  { name: "Sepolia Network", nodes: 12, latency: "< 12s block" },
  { name: "fhEVM Runtime", nodes: 24, latency: "FHE Native" },
  { name: "Zama Gateway", nodes: 8, latency: "Async" },
  { name: "Null Nodes", nodes: 16, latency: "P2P" },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="infrastructure" ref={sectionRef} className="relative py-32 bg-muted/30 overflow-hidden">
      {/* ASCII DNA Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
        <AsciiDna className="w-[600px] h-[500px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <p className="text-sm font-mono text-primary mb-4">// DECENTRALIZED PRIVACY</p>
            <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-balance">
              Confidentiality at scale.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              The NullFi protocol runs on a decentralized network of fhEVM-compatible nodes. 
              Each node performs homomorphic operations without ever seeing your data.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <pre className="font-mono text-2xl text-primary">🛡️</pre>
                <div>
                  <h3 className="font-semibold mb-1">Zama fhEVM Core</h3>
                  <p className="text-sm text-muted-foreground italic">
                    Native support for encrypted integer operations at the EVM layer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <pre className="font-mono text-2xl text-primary">🔄</pre>
                <div>
                  <h3 className="font-semibold mb-1">Secure Gateway</h3>
                  <p className="text-sm text-muted-foreground italic">
                    Decentralized gateway for secure, asynchronous decryption triggers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <pre className="font-mono text-2xl text-primary">⚡</pre>
                <div>
                  <h3 className="font-semibold mb-1">NullOracle</h3>
                  <p className="text-sm text-muted-foreground italic">
                    Confidential price feeds that protect pool solvency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Regions Grid */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="grid grid-cols-1 gap-3">
              {regions.map((region, index) => (
                <div
                  key={region.name}
                  className="group relative bg-card rounded-lg p-5 border border-border card-shadow hover:border-primary/50 transition-all duration-300"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{region.name}</h4>
                    <span className="font-mono text-xs text-primary">{region.latency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(region.nodes, 8) }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/70 animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {region.nodes} active entities
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 p-6 rounded-lg bg-foreground/5 border border-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-mono text-xl font-semibold text-primary">EVM</div>
                  <div className="text-xs text-muted-foreground">Runtime</div>
                </div>
                <div>
                  <div className="font-mono text-xl font-semibold text-primary">Sepolia</div>
                  <div className="text-xs text-muted-foreground">Network</div>
                </div>
                <div>
                  <div className="font-mono text-xl font-semibold text-primary">Zama</div>
                  <div className="text-xs text-muted-foreground">FHE Library</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
