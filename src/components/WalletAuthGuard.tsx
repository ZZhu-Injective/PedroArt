'use client';
import React, { useState, createContext, useContext } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Head from "next/head";
import { FaLayerGroup, FaFileImage, FaFileDownload, FaCheck } from "react-icons/fa";
import { connectWallet as connectWalletStrategy, disconnectWallet, SupportedWallet, WALLET_LABEL } from "@/lib/wallet";

interface PedroApiResponse {
  wallet: string;
  nft_hold: number;
  token_hold: number;
  check: string;
}

interface AuthContextType {
  logout: () => void;
  walletAddress: string | null;
}

const AuthContext = createContext<AuthContextType>({
  logout: () => {},
  walletAddress: null,
});

export const useWalletAuth = () => useContext(AuthContext);

const WALLETS: SupportedWallet[] = ['keplr', 'metamask', 'trust-wallet'];

const WALLET_LOGO: Record<SupportedWallet, string> = {
  keplr: '/keplr logo.png',
  metamask: '/metamask.svg',
  'trust-wallet': '/trust.svg',
};

const WALLET_LOGO_EXTRA: Partial<Record<SupportedWallet, string>> = {
  'trust-wallet': 'scale-[2.4]',
};

const WalletAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [activeWalletType, setActiveWalletType] = useState<SupportedWallet | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const logout = () => {
    void disconnectWallet();
    setIsAuthenticated(false);
    setWalletAddress(null);
  };

  const connectWallet = async (walletType: SupportedWallet) => {
    setActiveWalletType(walletType);

    try {
      const connection = await connectWalletStrategy(walletType);
      const address = connection.injectiveAddress;
      setWalletAddress(address);

      const response = await fetch(`https://api.injectivepedro.com/check_pedro/${address}/`);
      const result: PedroApiResponse = await response.json();

      if (result.check === "yes") {
        setIsAuthenticated(true);
        localStorage.setItem('nft_hold', result.nft_hold.toString());
        localStorage.setItem('token_hold', result.token_hold.toString());
      } else {
        setModalMessage("Not enough $PEDRO or any Pedro NFT");
        setIsModalOpen(true);
      }
    } catch (error) {
      setModalMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setIsModalOpen(true);
    } finally {
      setActiveWalletType(null);
    }
  };

  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={{ logout, walletAddress }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <>
      <Head>
        <title>Pedro | NFT Generator</title>
        <meta name="description" content="Generate your NFT collection with Pedro" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="/wallpaper9.webp"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        </div>

        <main className="relative z-10 container mx-auto px-4 sm:px-5 py-10 sm:py-14 md:py-20 max-w-7xl">
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-800/60 bg-black/40 backdrop-blur-md text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live on Injective Mainnet
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-mono mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
              NFT Art Generator
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Build a full NFT collection from layered art. No code, no spreadsheets — connect your wallet to start.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="max-w-2xl mx-auto mb-16 sm:mb-20"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 hover:border-white/40 transition-colors rounded-2xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">Connect your wallet</h2>
                <p className="text-sm text-gray-400 mt-1.5">Sign in to enter the generator. We never custody funds.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {WALLETS.map((w) => {
                  const isActive = activeWalletType === w;
                  const isDisabled = activeWalletType !== null && !isActive;
                  return (
                    <button
                      key={w}
                      onClick={() => connectWallet(w)}
                      disabled={isDisabled}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold text-black hover:bg-black hover:text-white hover:border-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                    >
                      {isActive ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <img
                          src={WALLET_LOGO[w]}
                          alt=""
                          aria-hidden="true"
                          className={`w-4 h-4 object-contain ${WALLET_LOGO_EXTRA[w] ?? ""}`}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <span>{WALLET_LABEL[w]}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 pt-5 border-t border-gray-800/60 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-mono">
                <FaCheck size={9} className="text-white" />
                <span>$PEDRO holders pay 1 token · others pay 100k</span>
              </div>
            </div>
          </motion.section>

          <section className="mb-16 sm:mb-20">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight font-mono mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                How it works
              </h2>
              <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  num: '01',
                  icon: <FaLayerGroup className="text-white" size={16} />,
                  title: 'Upload your layers',
                  body: 'Drop transparent PNGs into named layers — backgrounds, bodies, hats, accessories. Set the rarity per trait.',
                },
                {
                  num: '02',
                  icon: <FaFileImage className="text-white" size={16} />,
                  title: 'Generate the collection',
                  body: 'We roll up to 5,000 unique combinations weighted by your rarity. Re-roll until the spread looks right.',
                },
                {
                  num: '03',
                  icon: <FaFileDownload className="text-white" size={16} />,
                  title: 'Export with metadata',
                  body: 'Download a zip with images plus Talis-Protocol-compatible JSON metadata, ready for the Injective marketplace.',
                },
              ].map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="group relative bg-black/60 backdrop-blur-xl border border-gray-800/60 hover:border-white/40 rounded-2xl p-6 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-gray-800 group-hover:border-white/40 flex items-center justify-center transition-colors">
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-gray-600">STEP {step.num}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.body}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="mb-16 sm:mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Max Collection', value: '5,000' },
                { label: 'Layers Supported', value: 'Unlimited' },
                { label: 'Output Format', value: 'PNG + JSON' },
                { label: 'Standard', value: 'Talis' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-black/40 backdrop-blur-xl border border-gray-800/60 hover:border-white/40 rounded-2xl p-4 sm:p-5 text-center transition-colors"
                >
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-mono tracking-tight mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between mb-5 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight font-mono text-white">Built with Pedro</h2>
                <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">A few of the existing Pedro NFTs in the wild.</p>
              </div>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-gray-600 font-mono">Sample</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i - 1) * 0.04, duration: 0.4 }}
                  className="aspect-square rounded-xl overflow-hidden border border-gray-800/60 hover:border-white/60 transition-colors bg-black/40"
                >
                  <Image
                    src={`/Pedro${i}.png`}
                    alt={`Pedro ${i}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </section>
        </main>

        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              className="absolute inset-0 bg-black backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800/60 shadow-2xl"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-bold text-white font-mono tracking-tight mb-2">Notice</h3>
                <p className="text-sm text-gray-400 mb-6 font-mono">{modalMessage}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-black bg-white text-black text-sm font-semibold font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </div>

    </>
  );
};

export default WalletAuthGuard;