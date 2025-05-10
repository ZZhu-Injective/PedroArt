'use client';

import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import Modal from "@/components/modal";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from '@/components/basic_button';
import Head from "next/head";

declare global {
  interface Window extends KeplrWindow {}
}

// Custom mobile detection hook
function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
    };

    // Initial check
    checkIfMobile();

    // Listener for changes
    const listener = () => checkIfMobile();
    window.addEventListener('resize', listener);

    // Cleanup
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
  const isMobile = useMobileDetect();

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

  const FloatingPedro = ({ id }: { id: number }) => {
    const size = isMobile ? 40 + Math.random() * 60 : 80 + Math.random() * 120;
    // Start from center positions
    const startX = 50;
    const startY = 50;
    
    // Generate random corner or edge positions
    const endX = Math.random() > 0.5 ? 
      (Math.random() > 0.5 ? 10 : 90) : 
      Math.random() * 80 + 10;
    const endY = Math.random() > 0.5 ? 
      (Math.random() > 0.5 ? 10 : 90) : 
      Math.random() * 80 + 10;

    return (
      <motion.div
        className="absolute pointer-events-none"
        initial={{ 
          x: 0,
          y: 0,
          rotate: 0,
          scale: isMobile ? 0.3 + Math.random() * 0.4 : 0.5 + Math.random() * 0.7,
          opacity: isMobile ? 0.2 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4
        }}
        animate={{
          x: [0, endX - startX, 0],
          y: [0, endY - startY, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 60 + Math.random() * 60, // Slower movement
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
        style={{
          left: `${startX}%`,
          top: `${startY}%`,
          zIndex: -1,
          filter: `blur(${isMobile ? Math.random() * 2 : Math.random() * 3}px)`,
        }}
      >
        <Image
          src={`/pedro${id}.png`}
          alt={`Pedro ${id}`}
          width={size}
          height={size}
          className="object-contain"
        />
      </motion.div>
    );
  };

  const logout = () => {
    localStorage.removeItem("connectedWalletType");
    localStorage.removeItem("connectedWalletAddress");
    setIsAuthenticated(false);
    setWalletAddress(null);
    window.location.reload();
  };

  useEffect(() => {
    const savedWalletType = localStorage.getItem("connectedWalletType");
    const savedWalletAddress = localStorage.getItem("connectedWalletAddress");
    
    if (savedWalletType && savedWalletAddress) {
      checkWalletAuth(savedWalletType as "keplr" | "leap", savedWalletAddress);
    }
  }, []);

  const checkWalletAuth = async (walletType: "keplr" | "leap", address: string) => {
    const wallet = walletType === "keplr" ? window.keplr : window.leap;
    if (!wallet) return false;

    try {
      await wallet.enable(chainId);
      const response = await fetch(`https://api.pedroinjraccoon.online/check/${address}/`);
      const result = await response.text();
      
      if (result.trim() === '"yes"') {
        setIsAuthenticated(true);
        setWalletAddress(address);
        return true;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
    return false;
  };

  const connectWallet = async (walletType: "keplr" | "leap") => {
    setActiveWalletType(walletType);
    const wallet = walletType === "keplr" ? window.keplr : window.leap;
  
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
  
      const response = await fetch(`https://api.pedroinjraccoon.online/check/${address}/`);
      const result = await response.text();
  
      if (result.trim() === '"yes"') {
        localStorage.setItem("connectedWalletType", walletType);
        localStorage.setItem("connectedWalletAddress", address);
        setIsAuthenticated(true);
        setWalletAddress(address);
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
        {/* Floating Elements - Reduced on Mobile */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Regular Pedros - fewer on mobile */}
          {[...Array(isMobile ? 12 : 48)].map((_, i) => (
            <FloatingPedro key={`pedro-${i}`} id={(i % 24) + 1} />
          ))}
          
          {/* Special Pedros - fewer and centered */}
          {(isMobile ? [1, 13] : [1, 7, 13, 19]).map((id) => (
            <motion.div
              key={`special-pedro-${id}`}
              className="absolute pointer-events-none"
              initial={{
                x: 0,
                y: 0,
                rotate: 0,
                scale: isMobile ? 0.8 : 1.2,
                opacity: isMobile ? 0.4 : 0.6
              }}
              animate={{
                x: [0, 30, 0, -30, 0],
                y: [0, 20, 0, -20, 0],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 80, // Even slower for special pedros
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              style={{
                left: "50%",
                top: "50%",
                zIndex: -1,
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
              }}
            >
              <Image
                src={`/pedro${id}.png`}
                alt={`Special Pedro ${id}`}
                width={isMobile ? 120 : 200}
                height={isMobile ? 120 : 200}
                className="object-contain"
              />
            </motion.div>
          ))}

          {/* Particles - fewer on mobile */}
          {[...Array(isMobile ? 30 : 100)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full bg-white"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                opacity: 0.1 * Math.random(),
                scale: 0.1 + Math.random() * 0.5
              }}
              animate={{
                y: [null, (Math.random() * 200) - 100],
                x: [null, (Math.random() * 200) - 100],
              }}
              transition={{
                duration: 20 + Math.random() * 40,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              style={{
                width: `${1 + Math.random() * (isMobile ? 1 : 3)}px`,
                height: `${1 + Math.random() * (isMobile ? 1 : 3)}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="flex items-center justify-center py-12 text-center relative overflow-hidden">
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

          <section className="relative py-12 px-6 mx-auto max-w-6xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div
                ref={cardRef}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-black/50 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
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
                className="group relative overflow-hidden rounded-2xl bg-black/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
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
                className="group relative overflow-hidden rounded-2xl bg-black/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30"
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
                    <span className="block mb-1">• PNG layers support</span>
                    <span className="block">• Full metadata included</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Wallet Connection Section */}
          <section className="relative py-12 px-6 mx-auto max-w-md">
            <motion.div
              ref={cardRef}
              className="group relative overflow-hidden rounded-2xl bg-black/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            >
              <h2 className="text-2xl font-bold mb-6 text-center text-white">Get Started</h2>
              <div className="space-y-4 mb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Button
                    onClick={() => connectWallet("keplr")}
                    disabled={isLoading && activeWalletType !== "keplr"}
                    className="w-full rounded-lg text-white bg-black/80 hover:bg-white hover:text-black text-sm font-medium border border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-white/30"
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
                    className="w-full rounded-lg text-white bg-black/50 hover:bg-white hover:text-black text-sm font-medium border border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-white/30"
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

              <p className="text-xs text-gray-500 text-center">
                By connecting, you agree to our Terms of Service
              </p>
            </motion.div>
          </section>
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6 text-center max-w-md">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-white">{modalMessage}</h3>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-white bg-black/50 hover:bg-white hover:text-black text-sm font-medium border border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-white/30 w-full"
                  label="UNDERSTOOD"
                />
              </motion.div>
            </div>
          </div>
        </Modal>
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
      `}</style>
    </>
  );
};

export default WalletAuthGuard;