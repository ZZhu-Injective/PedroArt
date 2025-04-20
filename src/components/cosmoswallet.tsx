"use client";

import React, { useState, useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import Modal from "@/components/modal";

declare global {
  interface Window extends KeplrWindow {}
}

const CosmosWallet: React.FC = () => {
  const [chainId, setChainId] = useState<string>("injective-1");
  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeWalletType, setActiveWalletType] = useState<"keplr" | "leap" | null>(null);

  useEffect(() => {
    const savedWalletType = localStorage.getItem("connectedWalletType");
    if (savedWalletType) {
      setConnectedWalletType(savedWalletType);
    }
  }, []);

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
  
      const client = await SigningStargateClient.connectWithSigner(
        "https://sentry.tm.injective.network:443",
        offlineSigner
      );
  
      const message = "Welcome to the Pedro Dashboard!\n\nHere, you can find all the information about the latest trends in blue-chip memecoins and NFTs. This is a fun, casual project I'm working on in my free time, so enjoy exploring and keep it cool! Join me on this exciting journey, and let's build something awesome together!\n\nPeace Raccoon Fam!\n\n~Pedro";
      const signature = await wallet.signArbitrary(chainId, accounts[0].address, message);
  
      const response = await fetch(`https://api.pedroinjraccoon.online/check/${accounts[0].address}/`);
      const result = await response.text();
  
      if (result.trim() === '"yes"') {
        localStorage.setItem("connectedWalletType", walletType);
        localStorage.setItem("connectedWalletAddress", accounts[0].address);
        setConnectedWalletType(walletType);
        window.location.href = '/dashboard/mywallet';
      } else {
        setModalMessage("Not enough $PEDRO or any Pedro NFT");
        setIsModalOpen(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setModalMessage(`${walletType}: ${error.message}`);
      } else {
        setModalMessage(`${walletType}: An unknown error occurred.`);
      }
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
      setActiveWalletType(null);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-black">
      <div className="p-6">
        <h2 className="text-xl font-bold text-black text-center mb-3">
          Connect Wallet
        </h2>
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => connectWallet("keplr")}
            className="w-full px-6 py-2 text-black font-semibold rounded-lg border-2 border-black hover:bg-black hover:text-white transition-transform transform hover:scale-105 text-center flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || activeWalletType === "leap"}
          >
            {isLoading && activeWalletType === "keplr" ? (
              <span className="animate-pulse">Checking...</span>
            ) : (
              <>
                <img src="/keplr logo.png" alt="Keplr Logo" className="w-6 h-6 mr-3" />
                Connect Keplr
              </>
            )}
          </button>
          <button
            onClick={() => connectWallet("leap")}
            className="w-full px-6 py-2 text-black font-semibold rounded-lg border-2 border-black hover:bg-black hover:text-white transition-transform transform hover:scale-105 text-center flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || activeWalletType === "keplr"}
          >
            {isLoading && activeWalletType === "leap" ? (
              <span className="animate-pulse">Checking...</span>
            ) : (
              <>
                <img src="/leap logo.png" alt="Leap Logo" className="w-6 h-6 mr-3" />
                Connect Leap
              </>
            )}
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p className="text-white text-center text-lg">{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default CosmosWallet;