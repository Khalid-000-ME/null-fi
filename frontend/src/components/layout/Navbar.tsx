"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@/lib/wallet";

function formatAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, error, connect, disconnect, chainId } = useWallet();

  const isSepolia = chainId === 11155111;

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Image src="/logo.png" alt="null402" width={36} height={36} className="rounded-xl" />
        NULL402
      </Link>

      <div className="navbar-nav">

        <Link
          href="/borrow"
          className={`navbar-link ${pathname === "/borrow" ? "active" : ""}`}
        >
          Borrow
        </Link>
        <Link
          href="/dashboard"
          className={`navbar-link ${pathname === "/dashboard" ? "active" : ""}`}
        >
          Dashboard
        </Link>
      </div>

      <div className="navbar-actions">
        {isConnected && address ? (
          <>
            <button
              className="wallet-pill"
              onClick={disconnect}
              title="Click to disconnect"
              style={{ cursor: "pointer" }}
            >
              {formatAddress(address)}
            </button>
            <span className={`chain-badge ${isSepolia ? "" : "error"}`}>
              {isSepolia ? "Sepolia" : `Chain ${chainId}`}
            </span>
          </>
        ) : (
          <>
            <button
              id="btn-connect-wallet"
              className="bg-[#FFE500] hover:bg-[#FFE500]/90 text-black font-semibold rounded-lg transition-colors px-6 py-2.5 mx-2 shadow-sm"
              style={{ fontSize: "14px", marginLeft: "1rem" }}
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
            <Link
              href="/borrow"
              className="btn btn-primary"
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              Launch App
            </Link>
          </>
        )}
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "48px",
            background: "var(--error-bg, #3a1a1a)",
            border: "1px solid var(--error-border, #5a2a2a)",
            color: "var(--error-color, #ff8888)",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            maxWidth: "320px",
            zIndex: 1000,
            marginTop: "8px",
          }}
        >
          {error}
        </div>
      )}
    </nav>
  );
}
