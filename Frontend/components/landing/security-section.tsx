"use client";

import { useEffect, useState, useRef } from "react";
import { AsciiTorus } from "./ascii-torus";

const securityFeatures = [
  {
    title: "Homomorphic Encryption",
    description: "Computations on encrypted handles (euint128). Collateral and debt stay hidden.",
    ascii: `  ┌─┐
  │H│
  └─┘`
  },
  {
    title: "MEV Resistance",
    description: "Searchers cannot see your health factor. Atomic front-running is impossible.",
    ascii: `  ╔═╗
  │P│
  ╚═╝`
  },
  {
    title: "Zero Liquidation Hunting",
    description: "Your positions are invisible. Predatory bots cannot target your debt.",
    ascii: `  ┌Z┐
  └─┘`
  },
  {
    title: "Zama Gateway Secure",
    description: "Integrated with Zama's Gateway for secure, async health status checks.",
    ascii: `  [G]
  [S]`
  },
  {
    title: "Protocol Transparency",
    description: "Open source and audited. Privacy doesn't mean lack of accountability.",
    ascii: `  ◈◈
  ◈◈`
  },
  {
    title: "Immutable Solvency",
    description: "Protocol health is mathematically guaranteed by the fhEVM runtime.",
    ascii: `  ≋≋
  ≋≋`
  },
];

const certifications = [
  { name: "FHE", status: "Enabled" },
  { name: "fhEVM", status: "Powered" },
  { name: "Zama", status: "Partner" },
  { name: "Sepolia", status: "Live" },
];

export function SecuritySection() {
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
    <section id="security" ref={sectionRef} className="relative py-32 bg-muted/30 overflow-hidden">
      {/* ASCII Torus Background */}
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
        <AsciiTorus className="w-[500px] h-[450px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-sm font-mono text-primary mb-4">// PROTOCOL SECURITY</p>
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-6 text-balance">
            Privacy is the ultimate security.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            By using fully homomorphic encryption, NullFi ensures that your lending 
            positions remain invisible to everyone—even the protocol logic itself.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-card rounded-xl p-6 border border-border card-shadow transition-all duration-500 hover:border-primary/50 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* ASCII Icon */}
              <pre className="font-mono text-sm text-primary mb-4 leading-tight h-12 flex items-center">
                {feature.ascii}
              </pre>

              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Certifications Bar */}
        <div
          className={`rounded-xl bg-card border border-border card-shadow p-8 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Certified & Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Independently verified security and compliance standards
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-muted/50 border border-border"
                >
                  <span className="font-mono text-xs text-primary">{cert.name}</span>
                  <span className="text-xs text-muted-foreground">{cert.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div
          className={`mt-8 p-6 rounded-xl bg-foreground/5 border border-primary/20 transition-all duration-700 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-start gap-4">
            <pre className="font-mono text-2xl text-primary mt-1">🔒</pre>
            <div>
              <h4 className="font-semibold mb-2">Bug Bounty Program</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We work with security researchers worldwide to identify and fix vulnerabilities. 
                Report security issues and get rewarded. 
                <a href="#" className="text-primary hover:underline ml-1">Learn more →</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
