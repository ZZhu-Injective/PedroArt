import { ChainId, EthereumChainId } from '@injectivelabs/ts-types';
import { Network } from '@injectivelabs/networks';
import {
  MsgBroadcaster,
  Wallet,
  WalletStrategy,
} from '@injectivelabs/wallet-ts';
import { getInjectiveAddress, Msgs, TxResponse } from '@injectivelabs/sdk-ts';

export type SupportedWallet = 'keplr' | 'metamask' | 'trust-wallet';

export const WALLET_LABEL: Record<SupportedWallet, string> = {
  keplr: 'Keplr',
  metamask: 'MetaMask',
  'trust-wallet': 'Trust Wallet',
};

const WELCOME_MESSAGE =
  "Welcome to Pedro's NFT Generator! Sign this message to confirm you " +
  'want to connect your wallet. No transaction is sent.';

const STORAGE_TYPE = 'connectedWalletType';
const STORAGE_INJ = 'connectedWalletAddress';
const STORAGE_ETH = 'connectedEthereumAddress';

let walletStrategy: WalletStrategy | null = null;
let msgBroadcaster: MsgBroadcaster | null = null;

function toStrategyWallet(w: SupportedWallet): Wallet {
  if (w === 'keplr') return Wallet.Keplr;
  if (w === 'metamask') return Wallet.Metamask;
  return Wallet.TrustWallet;
}

function getWalletStrategy(): WalletStrategy {
  if (walletStrategy) return walletStrategy;
  walletStrategy = new WalletStrategy({
    chainId: ChainId.Mainnet,
    ethereumOptions: {
      ethereumChainId: EthereumChainId.Mainnet,
    },
  });
  return walletStrategy;
}

function getMsgBroadcaster(): MsgBroadcaster {
  if (msgBroadcaster) return msgBroadcaster;
  msgBroadcaster = new MsgBroadcaster({
    walletStrategy: getWalletStrategy(),
    network: Network.Mainnet,
    ethereumChainId: EthereumChainId.Mainnet,
    simulateTx: true,
  });
  return msgBroadcaster;
}

export interface ConnectedAddresses {
  walletType: SupportedWallet;
  injectiveAddress: string;
  ethereumAddress?: string;
}

export function getStoredConnection(): ConnectedAddresses | null {
  if (typeof window === 'undefined') return null;
  const type = localStorage.getItem(STORAGE_TYPE) as SupportedWallet | null;
  const inj = localStorage.getItem(STORAGE_INJ);
  if (!type || !inj || !inj.startsWith('inj1')) return null;
  if (type !== 'keplr' && type !== 'metamask' && type !== 'trust-wallet') {
    return null;
  }
  const eth = localStorage.getItem(STORAGE_ETH) || undefined;
  return { walletType: type, injectiveAddress: inj, ethereumAddress: eth || undefined };
}

function persist(c: ConnectedAddresses | null) {
  if (typeof window === 'undefined') return;
  if (c) {
    localStorage.setItem(STORAGE_TYPE, c.walletType);
    localStorage.setItem(STORAGE_INJ, c.injectiveAddress);
    if (c.ethereumAddress) {
      localStorage.setItem(STORAGE_ETH, c.ethereumAddress);
    } else {
      localStorage.removeItem(STORAGE_ETH);
    }
  } else {
    localStorage.removeItem(STORAGE_TYPE);
    localStorage.removeItem(STORAGE_INJ);
    localStorage.removeItem(STORAGE_ETH);
  }
}

export const WALLET_CHANGED_EVENT = 'pedro:wallet-changed';

function dispatchChange(c: ConnectedAddresses | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(WALLET_CHANGED_EVENT, {
      detail: { address: c?.injectiveAddress ?? null, connection: c },
    }),
  );
}

export async function connectWallet(
  walletType: SupportedWallet,
): Promise<ConnectedAddresses> {
  const strategy = getWalletStrategy();
  strategy.setWallet(toStrategyWallet(walletType));

  await strategy.enable();
  const addresses = await strategy.getAddresses();
  if (!addresses?.length) {
    throw new Error('Wallet returned no addresses');
  }

  const primary = addresses[0];
  let injectiveAddress: string;
  let ethereumAddress: string | undefined;

  if (walletType === 'keplr') {
    injectiveAddress = primary;
  } else {
    ethereumAddress = primary;
    injectiveAddress = getInjectiveAddress(primary);
  }

  const signer = walletType === 'keplr' ? injectiveAddress : (ethereumAddress as string);
  await strategy.signArbitrary(signer, WELCOME_MESSAGE);

  const connection: ConnectedAddresses = {
    walletType,
    injectiveAddress,
    ethereumAddress,
  };
  persist(connection);
  dispatchChange(connection);
  return connection;
}

export async function disconnectWallet(): Promise<void> {
  const strategy = getWalletStrategy();
  try {
    await strategy.disconnect();
  } catch {
    // best-effort
  }
  persist(null);
  dispatchChange(null);
}

export function restoreWalletStrategy(): ConnectedAddresses | null {
  const stored = getStoredConnection();
  if (!stored) return null;
  const strategy = getWalletStrategy();
  strategy.setWallet(toStrategyWallet(stored.walletType));
  return stored;
}

export async function signAndBroadcast(
  msgs: Msgs | Msgs[],
  memo?: string,
): Promise<string> {
  const stored = getStoredConnection();
  if (!stored) {
    throw new Error('No wallet connected');
  }
  const strategy = getWalletStrategy();
  strategy.setWallet(toStrategyWallet(stored.walletType));

  const broadcaster = getMsgBroadcaster();
  const response: TxResponse = await broadcaster.broadcastV2({
    msgs,
    injectiveAddress: stored.injectiveAddress,
    ethereumAddress: stored.ethereumAddress,
    memo,
  });
  return response.txHash;
}

export function getCurrentInjectiveAddress(): string | null {
  return getStoredConnection()?.injectiveAddress ?? null;
}
