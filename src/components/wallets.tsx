import React from 'react';
import KeplrWallet from '@/components/keplrwallet';
import LeapWallet from '@/components/leapwallet';

const Web3Modal: React.FC = () => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Connect Wallet
        </h2>
        <div className="space-y-4">
          <LeapWallet />
          <KeplrWallet />
        </div>
      </div>
    </div>
  );
};

export default Web3Modal;