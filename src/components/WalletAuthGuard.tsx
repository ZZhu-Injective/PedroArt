'use client';
import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from '@/components/basic_button';
import Head from "next/head";

interface PedroApiResponse {
  wallet: string;
  nft_hold: number;
  token_hold: number;
  check: string; 
}

declare global {
  interface Window extends KeplrWindow {}
}

function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
    };

    checkIfMobile();

    const listener = () => checkIfMobile();
    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
  }, []);

  return isMobile;
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

const WalletAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chainId] = useState<string>("injective-1");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeWalletType, setActiveWalletType] = useState<"keplr" | "leap" | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
  };

  const logout = () => {
    setIsAuthenticated(false);
    setWalletAddress(null);
  };

  const connectWallet = async (walletType: "keplr" | "leap") => {
    setActiveWalletType(walletType);
    const wallet = walletType === "leap" ? window.leap : window.keplr;
  
    if (!wallet) {
      setModalMessage(`Please install the ${walletType} extension!`);
      setIsModalOpen(true);
      setActiveWalletType(null);
      return;
    }
  
    setIsLoading(true);
  
    try {
      await wallet.enable(chainId);
      const offlineSigner = wallet.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;

      const message = "Welcome to Pedro's NFT Generator!";
      await wallet.signArbitrary(chainId, address, message);

      localStorage.setItem("connectedWalletType", walletType);
      localStorage.setItem("connectedWalletAddress", address);
      setWalletAddress(address);
      
      const response = await fetch(`https://api.pedroinjraccoon.online/check_pedro/${address}/`);
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
      setIsLoading(false);
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
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <Image
            src="/wallpaper9.webp"
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="opacity-40"
          />
        </div>

        <div className="relative z-10">
          <section className="flex items-center justify-center py-16 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-6 max-w-4xl relative z-10"
            >
              <motion.h1
                className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                PEDRO X NFT
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <section className="relative sm:py-8 py-2 px-6 mx-auto max-w-7xl">
            <div className="flex items-center gap-8">
              <div className="hidden md:block flex-1">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="relative h-full"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <span className="text-2xl">🔑</span>
                  </div>
                </motion.div>
              </div>

              <div className="flex-1">
                <motion.div
                  ref={cardRef}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-8"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center text-white">Connect Wallet</h2>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        onClick={() => connectWallet("keplr")}
                        width="100%"
                        disabled={isLoading && activeWalletType !== "keplr"}
                        className="w-full rounded-lg text-white bg-black/80 hover:bg-white hover:text-black text-sm font-medium border border-white/50 hover:border-white transition-all duration-300"
                        label={
                          isLoading && activeWalletType === "keplr" ? (
                            <span className="flex items-center justify-center">
                              <span className="loading-spinner mr-2"></span>
                              CONNECTING...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <img src="/keplr logo.png" alt="Keplr Logo" className="w-5 h-5 mr-3" />
                              CONNECT KEPLR
                            </span>
                          )
                        }
                      />
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Button
                        onClick={() => connectWallet("leap")}
                        disabled={isLoading && activeWalletType !== "leap"}
                        width="100%"
                        className="w-full rounded-lg text-white bg-black/50 hover:bg-white hover:text-black text-sm font-medium border border-white/50 hover:border-white transition-all duration-300"
                        label={
                          isLoading && activeWalletType === "leap" ? (
                            <span className="flex items-center justify-center">
                              <span className="loading-spinner mr-2"></span>
                              CONNECTING...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <img src="/leap logo.png" alt="Leap Logo" className="w-5 h-5 mr-3" />
                              CONNECT LEAP
                            </span>
                          )
                        }
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div className="hidden md:block flex-1">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="relative h-full"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    <span className="text-2xl">🦝</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="relative py-16 px-6 mx-auto max-w-[1500px]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div
                ref={cardRef}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 10,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="p-6">
                  <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Simple Pricing</h3>
                  <p className="text-gray-300 text-sm">
                    <span className="block mb-1">• 1 $PEDRO for holders</span>
                    <span className="block">• 100,000 $PEDRO for others</span>
                  </p>
                </div>
              </motion.div>

              <motion.div
                ref={cardRef}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 10,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="p-6">
                  <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Powerful Features</h3>
                  <p className="text-gray-300 text-sm">
                    <span className="block mb-1">• No-code solution</span>
                    <span className="block">• Up to 5,000 NFTs per collection</span>
                  </p>
                </div>
              </motion.div>

              <motion.div
                ref={cardRef}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 10,
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="p-6">
                  <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">Easy to Use</h3>
                  <p className="text-gray-300 text-sm">
                    <span className="block mb-1">• PNG/JPEG layers support</span>
                    <span className="block">• Full metadata for Talis Protocol</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section className="relative py-6 overflow-hidden">
            <div className="scrolling-images-container w-full py-8">
              <div className="scrolling-images flex space-x-8">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={`pedro-${i+1}`}
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    <Image
                      src={`/Pedro${i+1}.png`}
                      alt={`Pedro ${i+1}`}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover h-48 w-48"
                    />
                  </motion.div>
                ))}
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={`pedro-dupe-${i+1}`}
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                  >
                    <Image
                      src={`/Pedro${i+1}.png`}
                      alt={`Pedro ${i+1}`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover h-24 w-24"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isModalOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isModalOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black"
                onClick={() => setIsModalOpen(false)}
              />
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={isModalOpen ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative z-10 w-full max-w-md bg-gradient-to-br from-black to-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-center text-white mb-2">Notice</h3>
                <p className="text-gray-300 text-center mb-6">{modalMessage}</p>
                
                <div className="flex justify-center">
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    width="50%"
                    className="rounded-lg bg-white text-black hover:bg-gray-200 font-medium transition-all duration-300"
                    label="Got it"
                  />
                </div>
              </div>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .scrolling-images-container {
          overflow: hidden;
          position: relative;
        }
        
        .scrolling-images {
          display: flex;
          animation: scroll 30s linear infinite;
        }
        
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .modal-enter {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
        }
        .modal-enter-active {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: opacity 300ms, transform 300ms;
        }
        .modal-exit {
          opacity: 1;
        }
        .modal-exit-active {
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          transition: opacity 300ms, transform 300ms;
        }
      `}</style>
    </>
  );
};

export default WalletAuthGuard;