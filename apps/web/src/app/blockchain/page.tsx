"use client";

import queryBlockInfoApi from "@/api/blockchain/query-block-info.api";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

export default function BlockchainPage() {
  const [blockNumberInput, setBlockNumberInput] = useState("");
  const [blockData, setBlockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!blockNumberInput || isNaN(Number(blockNumberInput))) {
      toast.error("Please enter a valid block number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching block info for:", blockNumberInput);
      const response = await queryBlockInfoApi(blockNumberInput);
      setBlockData(response.data);
      toast.success("Block information loaded successfully!");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch block information";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <main className="flex flex-col items-center space-y-6 sm:space-y-8">
          <Image
            src="/solana.png"
            alt="Solana Logo"
            width={400}
            height={100}
            priority
            className="w-64 sm:w-80 lg:w-96 h-auto"
          />

          {/* Search Section */}
          <div className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <input
                  className="w-full bg-gray-800 placeholder:text-gray-400 text-white text-base border border-gray-600 rounded-lg p-3 sm:p-4 transition duration-300 ease focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 hover:border-gray-500 shadow-sm focus:shadow-md"
                  placeholder="Enter Block Number..."
                  type="text"
                  value={blockNumberInput}
                  onChange={(e) => setBlockNumberInput(e.target.value)}
                />
              </div>
              <button
                className="relative overflow-hidden bg-gradient-to-r from-green-400 via-blue-500 via-purple-500 to-green-400 bg-[length:200%_100%] animate-gradient-flow text-white font-medium px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                type="button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Searching...</span>
                    <span className="sm:hidden">...</span>
                  </div>
                ) : (
                  "Search"
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="w-full max-w-2xl">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 sm:p-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Block Information</h3>

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 sm:p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-gray-400 text-xs sm:text-sm mb-1">Block Number</div>
                  <div className="text-white text-lg sm:text-xl font-mono">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-600 rounded animate-pulse"></div>
                        <div className="w-20 sm:w-24 h-4 sm:h-6 bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    ) : blockData ? (
                      blockData.blockHeight?.toLocaleString() || "N/A"
                    ) : (
                      <span className="text-gray-500">No data</span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                  <div className="text-gray-400 text-xs sm:text-sm mb-1">Transaction Count</div>
                  <div className="text-white text-lg sm:text-xl font-mono">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-gray-600 rounded animate-pulse"></div>
                        <div className="w-14 sm:w-16 h-4 sm:h-6 bg-gray-600 rounded animate-pulse"></div>
                      </div>
                    ) : blockData ? (
                      blockData.transactionCount?.toLocaleString() || "N/A"
                    ) : (
                      <span className="text-gray-500">No data</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-gray-400 text-xs sm:text-sm mb-1">Block Hash</div>
                <div className="text-white text-xs sm:text-sm font-mono break-all">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="w-full h-3 sm:h-4 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-3/4 h-3 sm:h-4 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  ) : blockData ? (
                    blockData.blockhash || "N/A"
                  ) : (
                    <span className="text-gray-500">No data</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-gray-400 text-xs sm:text-sm mb-1">Block Time</div>
                <div className="text-white text-sm sm:text-base">
                  {loading ? (
                    <div className="w-48 sm:w-64 h-4 sm:h-5 bg-gray-600 rounded animate-pulse"></div>
                  ) : blockData && blockData.blockTime ? (
                    <div className="break-words">
                      {new Date(blockData.blockTime * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </div>
                  ) : blockData ? (
                    "N/A"
                  ) : (
                    <span className="text-gray-500">No data</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="text-center pt-4">
            <p className="text-xs sm:text-sm text-gray-400">© 2025 Solana Playground</p>
          </footer>
        </main>
      </div>
    </div>
  );
}