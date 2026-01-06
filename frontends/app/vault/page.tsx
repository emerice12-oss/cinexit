"use client";

import { useState } from "react";
import { useVault } from "@/hooks/useVault";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ConnectWallet } from "@/components/ConnectWallet";
import { formatUnits } from "viem";

export default function VaultPage() {
  const [amount, setAmount] = useState("");
  const { usdcBalance, approve, deposit, withdraw } = useVault();

  return (
    <NetworkGuard>
      <main>
        <h1>Participation Vault</h1>

        <ConnectWallet />

        <p>
          USDC Balance:{" "}
          {usdcBalance.data
            ? formatUnits(usdcBalance.data, 6)
            : "—"}
        </p>

        <input
          placeholder="Amount (USDC)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => approve(amount)}>
            Approve
          </button>

          <button onClick={() => deposit(amount)}>
            Deposit
          </button>

          <button onClick={() => withdraw(amount)}>
            Withdraw
          </button>
        </div>
      </main>
    </NetworkGuard>
  );
}
