"use client";

import { useState } from "react";
import { AsciiDna } from "./ascii-dna";
import { Copy, Check } from "lucide-react";

const codeExamples = [
  {
    label: "Initialize SDK",
    code: `import { createNullClient } from '@nullfi/sdk'
import { sepolia } from 'viem/chains'

const client = createNullClient({
  chain: sepolia,
  transport: http()
})`,
  },
  {
    label: "Borrow",
    code: `const tx = await client.borrow({
  pool: NULL_POOL_ADDRESS,
  amount: 500n, // Auto-wrapped euint128
  collateral: 'WETH'
})

// Position is encrypted on-chain`,
  },
  {
    label: "Health Check",
    code: `// Encrypted health check via Zama Gateway
const isHealthy = await client.isHealthy({
  address: userAccount.address,
  pool: NULL_POOL_ADDRESS
})

if (isHealthy) {
  console.log("Position is null")
}`,
  },
];

const features = [
  { 
    title: "fhEVM Native", 
    description: "Built for Zama's fhEVM runtime with native handle support."
  },
  { 
    title: "Safe Decryption", 
    description: "Integrated with Zama Gateway for trustless, async health updates."
  },
  { 
    title: "Viem Extension", 
    description: "Lightweight Viem extension for homomorphic contract calls."
  },
  { 
    title: "Immutable Solvency", 
    description: "Protocol health is enforced by math, not public auditors."
  },
];

export function DevelopersSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="relative py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <div>
            <p className="text-sm font-mono text-primary mb-3">// FOR DEVELOPERS</p>
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6 text-balance">
              Confidentiality as Code.
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              NullFi provides a type-safe SDK for building privacy-first lending 
              experiences on Top of fhEVM. Handle encrypted balances as native bigint handles.
            </p>
            
            {/* Features list */}
            <div className="grid gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-1 bg-primary/30 rounded-full shrink-0" />
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Code block */}
          <div className="lg:sticky lg:top-32">
            <div className="rounded-xl overflow-hidden bg-card border border-border card-shadow">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-2 border-b border-border bg-secondary/30">
                {codeExamples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                      activeTab === idx
                        ? "bg-card text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {example.label}
                  </button>
                ))}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              {/* Code content */}
              <div className="p-6 font-mono text-sm overflow-x-auto min-h-[240px]">
                <pre className="text-muted-foreground">
                  <code>
                    {codeExamples[activeTab].code.split('\n').map((line, i) => (
                      <div key={`${activeTab}-${i}`} className="leading-relaxed animate-in fade-in transition-all">
                        <span className="text-muted-foreground/40 select-none w-8 inline-block">{i + 1}</span>
                        <span 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightSyntax(line) 
                          }} 
                        />
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
              
              {/* Terminal output */}
              <div className="border-t border-border p-4 bg-secondary/20">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-2">
                  <span className="text-green-500">$</span>
                  <span>npm install @nullfi/sdk</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground/60">
                  added 1 package in 0.4s
                </div>
              </div>
            </div>
            
            {/* Docs link */}
            <div className="mt-6 flex items-center gap-4 text-sm px-1">
              <a href="#" className="text-primary hover:underline font-mono">
                Read the docs
              </a>
              <span className="text-border">|</span>
              <a href="#" className="text-muted-foreground hover:text-foreground font-mono">
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function highlightSyntax(line: string): string {
  const tokens = [
    { regex: /(\/\/.+$)/g, class: "text-muted-foreground/50" }, // Comments
    { regex: /(".*?"|'.*?')/g, class: "text-green-400" },      // Strings
    { regex: /\b(import|from|const|await|for|if|else|createNullClient|sepolia|http|n|in)\b/g, class: "text-primary" }, // Keywords
    { regex: /(\.\w+)/g, class: "text-primary" },             // Methods
    { regex: /([{}()\[\]:;,])/g, class: "text-muted-foreground" }, // Braces/Operators
  ];

  let result = line;
  const placeholders: string[] = [];

  tokens.forEach((token, idx) => {
    result = result.replace(token.regex, (match) => {
      const id = `__PLACEHOLDER_${idx}_${placeholders.length}__`;
      placeholders.push(`<span class="${token.class}">${match}</span>`);
      return id;
    });
  });

  placeholders.forEach((html, idx) => {
    const id = new RegExp(`__PLACEHOLDER_\\d+_${idx}__`, 'g');
    result = result.replace(id, html);
  });

  return result;
}
