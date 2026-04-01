"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useWallet } from "@/lib/wallet";

const landingLinks = [
  { name: "null402 Agent", href: "/chat" },
  { name: "Borrow", href: "/borrow" },
  { name: "Dashboard", href: "/dashboard" },
];

const appLinks = [
  { name: "null402 Chat", href: "/chat" },
  { name: "Borrow", href: "/borrow" },
  { name: "Dashboard", href: "/dashboard" },
];

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, disconnect, chainId, error } = useWallet();
  const isSepolia = chainId === 11155111;

  const isLandingPage = pathname === "/";
  const navLinks = isLandingPage ? landingLinks : appLinks;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background/95 backdrop-blur-xl border-b border-border/50"
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
              <span className="font-mono text-primary font-bold text-lg relative z-10">
                0
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10" />
            </div>
            <span className="text-xl font-bold tracking-tight">null402</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-4 py-2 text-sm transition-colors duration-200 rounded-lg hover:bg-secondary/50 ${pathname === link.href ? "text-primary font-medium bg-secondary/30" : "text-muted-foreground hover:text-foreground"}`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex flex-col items-end gap-1 relative">
            <div className="flex items-center gap-3">
              {isConnected && address ? (
                <>
                  <Button variant="ghost" size="sm" onClick={disconnect} className="text-muted-foreground">
                    {formatAddress(address)}
                  </Button>
                  <Button size="sm" variant="outline" className={`border-border text-xs ${isSepolia ? "text-green-500" : "text-red-500"}`}>
                    {isSepolia ? "Sepolia" : `Chain: ${chainId}`}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={connect} 
                  disabled={isConnecting}
                  className="border-border hover:bg-secondary/50"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
              {isLandingPage && (
                <Link href="/borrow">
                  <Button
                    size="sm"
                    className="bg-foreground hover:bg-foreground/90 text-background"
                  >
                    Launch App
                  </Button>
                </Link>
              )}
            </div>
            {error && (
              <div className="absolute top-12 right-0 bg-red-950/80 border border-red-900 text-red-400 text-xs px-3 py-1.5 rounded-md max-w-[250px]">
                {error}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[500px] pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg transition-colors ${pathname === link.href ? "text-primary bg-secondary/50" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/50">
              {isConnected && address ? (
                <>
                   <Button variant="ghost" onClick={disconnect} className="justify-start text-muted-foreground">
                    Disconnect {formatAddress(address)}
                   </Button>
                   <Button variant="outline" className={`justify-start ${isSepolia ? "text-green-500" : "text-red-500"}`}>
                    {isSepolia ? "Sepolia" : `Chain: ${chainId}`}
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={connect} 
                  disabled={isConnecting}
                  className="justify-start text-muted-foreground border border-border"
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
              {isLandingPage && (
                <Link href="/borrow">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Launch App
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
