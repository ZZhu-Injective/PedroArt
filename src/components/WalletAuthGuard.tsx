'use client';

import React, { useState, useEffect, createContext, useContext } from "react";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import Modal from "@/components/modal";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from '@/components/basic_button';
import Head from "next/head";

declare global {
  interface Window extends KeplrWindow {}
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


const itemVariants = {
  hidden: { opacity: 0, y: 0 },
  show: { opacity: 1, y: 0 },
};

const WalletAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chainId] = useState<string>("injective-1");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeWalletType, setActiveWalletType] = useState<"keplr" | "leap" | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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
        <meta property="og:image" content="/pedro_logo4.png" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0">
            <Image
              src="/wallpaper4.png"
              alt="Background texture"
              fill
              className="opacity-20 mix-blend-overlay object-cover"
              priority
            />
          </div>
        </div>

        <div className="relative z-10">
          <section className="flex items-center justify-center py-12 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-6 max-w-4xl relative z-10"
            >
              <motion.h1
                className="text-4xl md:text-7xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                NFT GENERATOR
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <section className="relative py-12 mx-auto max-w-[1500px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
              <motion.div
                className="space-y-6"
              >
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">💰 Pricing</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>NFT holders: 1 $PEDRO</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>non-holders:  100.000 $PEDRO</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Create max 5k collection</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">✨ Features</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>No-code solution for artists</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Unlimited collections generation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>No watermarks or hidden fees</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Supports PNG trait layers</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">🛠️ How It Works</h2>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li>Drop traits in PNG format</li>
                      <li>Setup items rarity and collection settings</li>
                      <li>Preview and edit any item</li>
                      <li>Download assets with metadata</li>
                      <li>Ready on Talis protocol (Injective/Xion/Orai)</li>
                    </ol>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">🔑 Requirements</h2>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>Keplr or Leap wallet</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>$PEDRO tokens on $INJ</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        <span>PNG trait files (transparent background)</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>

              <div className="flex flex-col space-y-6">
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full flex-1"
                >
                  <div className="p-8 flex flex-col h-full">
                    <motion.h2 className="text-3xl font-bold text-white text-center mb-6">
                      CONNECT WALLET
                    </motion.h2>
                    
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col items-center justify-center flex-1 gap-6">
                        <div className="text-center">
                          <p className="mb-4 text-lg">Connect your wallet to access the NFT Generator</p>
                        </div>
                        
                        <div className="flex flex-col space-y-4 w-full">
                          <Button
                            onClick={() => connectWallet("keplr")}
                            disabled={isLoading && activeWalletType !== "keplr"}
                            className="w-full text-white bg-transparent hover:bg-white hover:text-black text-sm font-medium px-6 py-3 rounded-full border border-white/50 hover:border-white transition-all duration-300 relative overflow-hidden group" 
                            label={
                              isLoading && activeWalletType === "keplr" ? (
                                "CONNECTING..."
                              ) : (
                                <span className="flex items-center justify-center">
                                  <img src="/keplr logo.png" alt="Keplr Logo" className="w-6 h-6 mr-3" />
                                  CONNECT KEPLR
                                </span>
                              )
                            }
                          />
                          
                          <Button
                            onClick={() => connectWallet("leap")}
                            disabled={isLoading && activeWalletType !== "leap"}
                            className="w-full text-white bg-transparent hover:bg-white hover:text-black text-sm font-medium px-6 py-3 rounded-full border border-white/50 hover:border-white transition-all duration-300 relative overflow-hidden group" 
                            label={
                              isLoading && activeWalletType === "leap" ? (
                                "CONNECTING..."
                              ) : (
                                <span className="flex items-center justify-center">
                                  <img src="/leap logo.png" alt="Leap Logo" className="w-6 h-6 mr-3" />
                                  CONNECT LEAP
                                </span>
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="text-center text-sm text-white/70 pt-8">
                        <p>By connecting, you agree to our Terms of Service</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">ℹ️ About</h2>
                    <p className="mb-4">
                      PEDRO lets you generate with almost no charge for holders, no watermarks, etc. We've worked hard to bring a service like this to enable independent artists experiment with generative art and build amazing collections.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">💡 Need Help?</h2>
                    <div className="flex flex-col space-y-4">
                      <Button
                        onClick={() => window.open('https://discord.gg/pedro', '_blank')}
                        className="w-full text-white bg-transparent text-sm font-medium px-6 py-2.5 rounded-full border border-white/50 transition-all duration-300"
                        label="DISCORD"
                      />
                      <Button
                        onClick={() => window.open('https://docs.pedro.xyz', '_blank')}
                        className="w-full text-white bg-transparent text-sm font-medium px-6 py-2.5 rounded-full border border-white/50 transition-all duration-300"
                        label="DOCUMENTATION (SOON)"
                        disabled
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <p className="text-white text-center text-lg">{modalMessage}</p>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full border border-purple-400 shadow-lg hover:shadow-purple-500/30"
              label="CLOSE"
            />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default WalletAuthGuard;