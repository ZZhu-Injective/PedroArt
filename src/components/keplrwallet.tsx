import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    keplr?: any;
  }
}

interface Account {
  address: string;
  algo: string;
  pubkey: Uint8Array;
}

const getKeplr = () => {
  if (!window.keplr) {
    throw new Error('Keplr extension not installed');
  }
  return window.keplr;
};

const KeplrWallet: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    setNotification(null);

    try {
      const keplr = getKeplr();
      const chainId = 'injective-1';
      await keplr.enable(chainId);
      const accounts: Account[] = await keplr.getOfflineSigner(chainId).getAccounts();
      const keplrAddresses = accounts.map((account: Account) => account.address);

      const message = "Welcome to the Pedro Dashboard.";
      const signature = await keplr.signArbitrary(chainId, keplrAddresses[0], message);
      console.log('Signature:', signature);

      const cachedData = localStorage.getItem(`walletInfo_${keplrAddresses[0]}`);
      if (cachedData) {
        setNotification("Wallet connected successfully");
        window.location.href = '/dashboard/mywallet';
        return;
      }

      const response = await fetch(`https://api.pedroinjraccoon.online/check/${keplrAddresses[0]}/`);
      console.log(response);
      const result = await response.text();

      if (result.trim() === '"yes"') {
        setNotification("Wallet connected successfully");
        localStorage.setItem(`walletInfo_${keplrAddresses[0]}`, result);
        window.location.href = '/dashboard/mywallet';
      } else {
        setError("You don't have enough Pedro");
        setNotification("You don't have enough Pedro");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error:', err);
        setError(err.message);
        setNotification(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div>
      <button
        onClick={fetchAddresses}
        className=" w-full mt-3 rounded-md flex items-center justify-center border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        type="button" disabled
      >
        <img src="/keplr logo.png" alt="Keplr" className="h-5 w-5 mr-2" />
        Keplr Wallet
      </button>

      {loading && (
        <div className="mt-3 p-4 border-l-4 border-blue-500 bg-blue-100 text-blue-800">
          Loading...
        </div>
      )}

      {error && (
        <div className="mt-3 p-4 border-l-4 border-red-500 bg-red-100 text-red-800">
          Error: {error}
        </div>
      )}

      {notification && (
        <div className="fixed top-4 left-4 bg-blue-500 text-white p-3 rounded-md shadow-md transition-transform transform translate-x-0 animate-slide-in">
          {notification}
        </div>
      )}
    </div>
  );
};

export default KeplrWallet;
