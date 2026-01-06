'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useBatchClaim } from '@/hooks/useBatchClaim';
import { useProtocolGuard } from '@/hooks/useProtocolGuard';
import { useEpochHistory } from '@/hooks/useEpochHistory';
import { useOracleStatus } from '@/hooks/useOracleStatus';

import {
  useApproveUsdc,
  useDepositUsdc,
  useUsdcAllowance,
  useDepositedBalance,
  USDC_ADDRESS,
  CINEXIT_MINING_ADDRESS,
} from '@/hooks/useUsdcDeposit';

import {
  useClaimableRewards,
  useClaimRewards,
  REWARD_DISTRIBUTOR,
} from '@/hooks/useRewards';

import {
  useCurrentEpoch,
  useEpochFinalized,
  useEpochRevenue,
} from '@/hooks/useEpochs';


export default function Home() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('');

  const { data: allowance } = useUsdcAllowance(address);
  const { data: deposited } = useDepositedBalance(address);

  const { data: rewards } = useClaimableRewards(address);

  const { writeContract: approve } = useApproveUsdc();
  const { writeContract: deposit } = useDepositUsdc();
  const { writeContract: claim } = useClaimRewards();

  const { data: currentEpoch } = useCurrentEpoch();

  const [batchEpochs, setBatchEpochs] = useState<string>('');

  const { writeContract: claimBatch } = useBatchClaim();

  const { paused, wrongChain } = useProtocolGuard();

  const protocolBlocked = paused || wrongChain;

  const { history, loading: historyLoading } =
  useEpochHistory();

  const oracle = useOracleStatus();



const lastEpoch =
  currentEpoch && currentEpoch > 0n
    ? currentEpoch - 1n
    : undefined;

const { data: finalized } = useEpochFinalized(lastEpoch);
const { data: revenue } = useEpochRevenue(lastEpoch);


  const parsedAmount =
    amount && Number(amount) > 0
      ? parseUnits(amount, 6)
      : 0n;

  const needsApproval =
    parsedAmount > 0n &&
    (allowance ?? 0n) < parsedAmount;

  function parseEpochs(batchEpochs: string): readonly bigint[] {
    return batchEpochs
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean)
      .map((e) => BigInt(e));
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <ConnectButton />

      {paused && (
        <div className="bg-red-600 text-white px-4 py-2 rounded">
          Protocol is paused for safety. Actions disabled.
        </div>
      )}

      {wrongChain && (
        <div className="bg-yellow-500 text-black px-4 py-2 rounded">
          Wrong network connected. Please switch chains.
        </div>
      )}

      {address && (
        <>
          {/* Deposit Panel */}
          <div className="flex gap-2">
            <input
              className="border px-3 py-2 rounded"
              placeholder="USDC amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {needsApproval ? (
              <button
                disabled={protocolBlocked}
                className={`px-4 py-2 rounded ${
                  protocolBlocked
                    ? 'bg-gray-400'
                    : 'bg-green-600 text-white'
                }`}

                onClick={() =>
                  approve({
                    address: USDC_ADDRESS,
                    abi: [
                      {
                        name: 'approve',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                          { name: 'spender', type: 'address' },
                          { name: 'amount', type: 'uint256' },
                        ],
                        outputs: [{ name: '', type: 'bool' }],
                      },
                    ],
                    functionName: 'approve',
                    args: [CINEXIT_MINING_ADDRESS, parsedAmount],
                  })
                }
              >
                Approve USDC
              </button>
            ) : (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() =>
                  deposit({
                    address: CINEXIT_MINING_ADDRESS,
                    abi: [
                      {
                        name: 'deposit',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [{ name: 'amount', type: 'uint256' }],
                        outputs: [],
                      },
                    ],
                    functionName: 'deposit',
                    args: [parsedAmount],
                  })
                }
              >
                Deposit & Mine
              </button>
            )}
          </div>

          {/* Balances */}
          <div className="text-sm text-gray-600">
            Deposited: {formatUnits(deposited ?? 0n, 6)} USDC
          </div>

          {/* Rewards */}
          <div className="border rounded p-4 w-80 text-center">
            <div className="text-lg font-semibold">
              Claimable Rewards
            </div>

            <div className="text-2xl my-2">
              {formatUnits(rewards ?? 0n, 6)} USDC
            </div>

            <button
              className="bg-purple-600 text-white px-4 py-2 rounded w-full"
                disabled={protocolBlocked || !rewards || rewards === 0n}
              onClick={() =>
                claim({
                  address: REWARD_DISTRIBUTOR,
                  abi: [
                    {
                      name: 'claim',
                      type: 'function',
                      stateMutability: 'nonpayable',
                      inputs: [],
                      outputs: [],
                    },
                  ],
                  functionName: 'claim',
                })
              }
            >
              Claim Rewards
            </button>
          </div>

            {/* Epoch Info */}
            <div className="border rounded p-4 w-80 text-center">
              <div className="text-lg font-semibold">
                Epoch Status
              </div>

              <div className="mt-2 text-sm">
                Current Epoch:{' '}
                <b>{currentEpoch?.toString() ?? '-'}</b>
              </div>

              {lastEpoch !== undefined && (
                <>
                  <div className="mt-2 text-sm">
                    Last Epoch:{' '}
                    <b>{lastEpoch.toString()}</b>
                  </div>

                  <div className="mt-1 text-sm">
                    Finalized:{' '}
                    <b>{finalized ? 'YES' : 'NO'}</b>
                  </div>

                  <div className="mt-1 text-sm">
                    Revenue:{' '}
                    <b>
                      {revenue
                        ? `${Number(revenue) / 1e6} USDC`
                        : '—'}
                    </b>
                  </div>
                </>
             )}
           </div>

           {/* Batch Claim */}
           <div className="border rounded p-4 w-80 text-center">
             <div className="text-lg font-semibold">
               Batch Claim
             </div>

            <input
              className="border px-3 py-2 rounded w-full mt-2"
              placeholder="Epochs e.g. 1,2,3"
              value={batchEpochs}
              onChange={(e) => setBatchEpochs(e.target.value)}
            />
            <button
              
              className="bg-indigo-600 text-white px-4 py-2 rounded w-full mt-3"
              disabled={protocolBlocked || !batchEpochs}
              onClick={() =>
                claimBatch({
                  address: REWARD_DISTRIBUTOR,
                  abi: [
                    {
                      name: 'claimBatch',
                      type: 'function',
                      stateMutability: 'nonpayable',
                      inputs: [
                        { name: 'epochs', type: 'uint256[]' },
                      ],
                      outputs: [],
                    },
                  ],
                  functionName: 'claimBatch',
                  args: [parseEpochs(batchEpochs)],
                })
              }
            >
              Claim Selected Epochs
            </button>

            <div className="text-xs text-gray-500 mt-2">
              Saves gas vs claiming one-by-one
            </div>
          </div>

          {/* Claim History */}
          <div className="border rounded p-4 w-full max-w-xl">
            <div className="text-lg font-semibold mb-2">
              Claim History
            </div>

            {historyLoading && (
              <div className="text-sm text-gray-500">
                Loading history…
              </div>
            )}

            {!historyLoading && history.length === 0 && (
              <div className="text-sm text-gray-500">
                No claims yet.
              </div>
            )}

            <ul className="divide-y">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex justify-between py-2 text-sm"
                >
                  <span>Epoch #{h.epoch.toString()}</span>
                  <span>
                    {(Number(h.amount) / 1e6).toFixed(2)} USDC
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Oracle Transparency */}
<div className="border rounded p-4 w-full max-w-xl">
  <div className="text-lg font-semibold mb-2">
    Oracle Status
  </div>

  <div className="text-sm space-y-1">
    <div>
      Signers: {oracle.signerCount}
    </div>
    <div>
      Quorum required: {oracle.quorum}
    </div>
    <div>
      Last settled epoch: #{oracle.lastEpoch}
    </div>
  </div>

  {oracle.signerCount > 0 &&
    oracle.quorum >
      oracle.signerCount / 2 && (
      <div className="mt-2 text-green-600 text-sm">
        ✔ Majority-secured oracle
      </div>
    )}
</div>

        </>
      )}
    </main>
  );
}
