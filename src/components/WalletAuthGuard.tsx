'use client';

import React, { useState, useEffect, createContext, useContext } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import Modal from "@/components/modal";
import { motion } from "framer-motion";
import Image from "next/image";

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
    <div className="min-h-screen bg-black text-white overflow-hidden font-mono">
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

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 p-6"
        >
          <motion.h1
            className="text-3xl font-bold text-white text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            NFT GENERATOR
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
            className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent mb-6"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => connectWallet("keplr")}
              className="w-full px-6 py-3 bg-white hover:bg-black text-black hover:text-white font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading && activeWalletType !== "keplr"}
            >
              {isLoading && activeWalletType === "keplr" ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <img src="/keplr logo.png" alt="Keplr Logo" className="w-6 h-6 mr-3" />
                  Connect Keplr
                </>
              )}
            </button>
            
            <button
              onClick={() => connectWallet("leap")}
              className="w-full px-6 py-3 bg-white hover:bg-black text-black hover:text-white font-semibold rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading && activeWalletType !== "leap"}
            >
              {isLoading && activeWalletType === "leap" ? (
                <span className="animate-pulse">Connecting...</span>
              ) : (
                <>
                  <img src="/leap logo.png" alt="Leap Logo" className="w-6 h-6 mr-3" />
                  Connect Leap
                </>
              )}
            </button>
          </div>

        </motion.div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <p className="text-white text-center text-lg">{modalMessage}</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WalletAuthGuard;