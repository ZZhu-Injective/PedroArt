'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Button from '@/components/basic_button';
import { useEffect, useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import WalletAuthGuard from "@/components/WalletAuthGuard";
import { useWalletAuth } from "@/components/WalletAuthGuard";
import { ChainId } from '@injectivelabs/ts-types';
import { BaseAccount, BroadcastModeKeplr, ChainRestAuthApi, ChainRestTendermintApi, CosmosTxV1Beta1Tx, createTransaction, getTxRawFromTxRawOrDirectSignResponse, MsgSend, TxRaw, TxRestApi} from '@injectivelabs/sdk-ts';
import { BigNumberInBase, DEFAULT_BLOCK_TIMEOUT_HEIGHT, getStdFee } from '@injectivelabs/utils';
import { TransactionException } from '@injectivelabs/exceptions';

type ImageLayer = {
  file: File;
  preview: string;
  rarity: number;
  name: string;
};

type Layer = {
  name: string;
  images: ImageLayer[];
  zIndex: number;
  enabled: boolean;
  layerRarity: number;
};

type Preview = {
  images: string[];
  layers: number[];
  id: string;
  usedLayers: boolean[];
};

type PaymentState = 'idle' | 'processing' | 'success' | 'failed';


export default function Art() {
  const { logout } = useWalletAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [newLayerName, setNewLayerName] = useState<string>('');
  const [totalCombinations, setTotalCombinations] = useState<number>(0);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [pedroTokens, setPedroTokens] = useState<number>(0);
  const [pedroNfts, setPedroNfts] = useState<number>(0);
  const [paymentAddress] = useState("inj14rmguhlul3p30ntsnjph48nd5y2pqx2qwwf4u9");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');


  const handleLogout = useCallback(() => {
    localStorage.removeItem("connectedWalletType");
    localStorage.removeItem("connectedWalletAddress");
    if (logout) {
      logout();
    }
    window.location.href = '/nftgenerator';
  }, [logout]);

  useEffect(() => {
    const storedAddress = localStorage.getItem("connectedWalletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setPedroTokens(100);
      setPedroNfts(1);
    }
  }, [walletAddress]);

  useEffect(() => {
  const combinations = layers.reduce((total, layer) => {
    if (!layer.enabled || layer.images.length === 0) return total;
    return total * layer.images.length;
  }, 1); 
  
  setTotalCombinations(combinations);
  }, [layers]);

  const baseAmount = pedroNfts ? "1" : "100.000";

  const handleDownloadWithPayment = () => {
    console.log(baseAmount)

    if (hasPaid) {
      downloadAllAsZip();
    } else {
      setModalMessage(`Downloading requires a payment of ${baseAmount} $PEDRO. Proceed to payment?`);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePayment = useCallback(async () => {
    if (!walletAddress) return;
    console.log(baseAmount)

    setPaymentState('processing');

    try {
      setIsProcessingPayment(true);

      const walletType = localStorage.getItem("connectedWalletType")
      const wallet = walletType === 'leap' ? window.leap : window.keplr;
      if (!wallet) {
        throw new Error(`${walletType} extension not installed`);
      }

      const chainId = ChainId.Mainnet;
      await wallet.enable(chainId);
      const [account] = await wallet.getOfflineSigner(chainId).getAccounts();
      const injectiveAddress = account.address;
  
      const restEndpoint = "https://sentry.lcd.injective.network:443";
      const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);
      const accountDetailsResponse = await chainRestAuthApi.fetchAccount(injectiveAddress);
      if (!accountDetailsResponse) {
        throw new Error("Failed to fetch account details");
      }
      const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);
  
      const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint);
      const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
      const latestHeight = latestBlock.header.height;
      const timeoutHeight = new BigNumberInBase(latestHeight).plus(DEFAULT_BLOCK_TIMEOUT_HEIGHT);

      const msg = MsgSend.fromJSON({
        amount: {
          amount: new BigNumberInBase(baseAmount).times(new BigNumberInBase(10).pow(18)).toFixed(),
          denom: "factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1c6lxety9hqn9q4khwqvjcfa24c2qeqvvfsg4fm",
        },
        srcInjectiveAddress: walletAddress,
        dstInjectiveAddress: "inj1x6u08aa3plhk3utjk7wpyjkurtwnwp6dhudh0j",
      });

      const pubKey = await wallet.getKey(chainId);
      if (!pubKey || !pubKey.pubKey) {
        throw new Error("Failed to retrieve public key from wallet");
      }
  
      const { txRaw: finalTxRaw, signDoc } = createTransaction({
        pubKey: Buffer.from(pubKey.pubKey).toString('base64'),
        chainId,
        fee: getStdFee(),
        message: msg,
        sequence: baseAccount.sequence,
        timeoutHeight: timeoutHeight.toNumber(),
        accountNumber: baseAccount.accountNumber,
        memo: "Multisend to different wallets",
      });
  
      const offlineSigner = wallet.getOfflineSigner(chainId);
      const directSignResponse = await offlineSigner.signDirect(injectiveAddress, signDoc);
  
      const txRawSigned = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);
  
      const broadcastTx = async (chainId: string, txRaw: TxRaw) => {
        const result = await wallet.sendTx(
          chainId,
          CosmosTxV1Beta1Tx.TxRaw.encode(txRaw).finish(),
          BroadcastModeKeplr.Sync,
        );
  
        if (!result || result.length === 0) {
          throw new TransactionException(
            new Error('Transaction failed to be broadcasted'),
            { contextModule: 'Wallet' },
          );
        }
  
        return Buffer.from(result).toString('hex');
      };
  
      const txHash = await broadcastTx(ChainId.Mainnet, txRawSigned);

      if (txHash) {
        setPaymentState('success');
        setHasPaid(true);
        setModalMessage("Payment successful! You can now download your NFTs.");
        setIsWarningModalOpen(true)
      }
    } catch (error) {
      setPaymentState('failed');
      setModalMessage("Payment failed. Please try again.");
      setIsWarningModalOpen(true)
    }
  }, [walletAddress, paymentAddress]);

  const calculateAllCombinations = useCallback(() => {
    if (layers.length === 0) return [];
    
    const combinations: number[][] = [];
    const layerIndices = layers.map(layer => 
      layer.images.map((_, i) => i)
    );

    function generateCombinations(current: number[], layerIndex: number) {
      if (layerIndex === layers.length) {
        combinations.push([...current]);
        return;
      }
      
      for (let i = 0; i < layerIndices[layerIndex].length; i++) {
        current[layerIndex] = i;
        generateCombinations(current, layerIndex + 1);
      }
    }

    generateCombinations([], 0);
    return combinations;
  }, [layers]);

  const addLayer = useCallback(() => {
    if (!newLayerName.trim()) return;
    
    const newLayer: Layer = {
      name: newLayerName.trim(),
      images: [],
      zIndex: layers.length,
      enabled: true,
      layerRarity: 100 
    };
    
    setLayers([...layers, newLayer]);
    setNewLayerName('');
  }, [newLayerName, layers]);

  const removeLayer = useCallback((index: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(index, 1);
    setLayers(updatedLayers);
  }, [layers]);

  const handleImageUpload = useCallback((layerIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const updatedLayers = [...layers];
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      rarity: Math.floor(100 / (updatedLayers[layerIndex].images.length + files.length + 1)),
      name: file.name.split('.')[0]
    }));

    const totalImages = updatedLayers[layerIndex].images.length + newImages.length;
    const equalRarity = Math.floor(100 / totalImages);
    
    updatedLayers[layerIndex].images = [
      ...updatedLayers[layerIndex].images.map(img => ({
        ...img,
        rarity: equalRarity
      })),
      ...newImages.map(img => ({
        ...img,
        rarity: equalRarity
      }))
    ];
    
    setLayers(updatedLayers);
  }, [layers]);

  const updateRarity = useCallback((layerIndex: number, imageIndex: number, value: string) => {
    const updatedLayers = [...layers];
    const numValue = parseInt(value) || 0;
    updatedLayers[layerIndex].images[imageIndex].rarity = Math.min(100, Math.max(0, numValue));
    
    const layer = updatedLayers[layerIndex];
    const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
    
    if (totalRarity > 100) {
      const excess = totalRarity - 100;
      const otherImages = layer.images.filter((_, i) => i !== imageIndex);
      const totalOtherRarity = otherImages.reduce((sum, img) => sum + img.rarity, 0);
      
      if (totalOtherRarity > 0) {
        const scaleFactor = (totalOtherRarity - excess) / totalOtherRarity;
        layer.images.forEach((img, i) => {
          if (i !== imageIndex) {
            img.rarity = Math.max(0, Math.floor(img.rarity * scaleFactor));
          }
        });
      } else {
        layer.images[imageIndex].rarity = 100;
      }
    }
    
    setLayers(updatedLayers);
  }, [layers]);

  const removeImage = useCallback((layerIndex: number, imageIndex: number) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].images.splice(imageIndex, 1);
    
    if (updatedLayers[layerIndex].images.length > 0) {
      const equalRarity = Math.floor(100 / updatedLayers[layerIndex].images.length);
      updatedLayers[layerIndex].images.forEach(img => {
        img.rarity = equalRarity;
      });
    }
    
    setLayers(updatedLayers);
  }, [layers]);

  const updateLayerRarity = useCallback((layerIndex: number, value: string) => {
    const updatedLayers = [...layers];
    const numValue = parseInt(value) || 0;
    updatedLayers[layerIndex].layerRarity = Math.min(100, Math.max(0, numValue));
    setLayers(updatedLayers);
  }, [layers]);

  const toggleLayerEnabled = useCallback((layerIndex: number) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].enabled = !updatedLayers[layerIndex].enabled;
    setLayers(updatedLayers);
  }, [layers]);

  const generateBatchPreviews = useCallback(() => {
    if (layers.length === 0 || batchSize < 1) return;

    const maxAllowed = Math.min(5000, totalCombinations);
    
    if (batchSize > maxAllowed) {
      alert(`You can only generate up to ${maxAllowed} NFTs at once.`);
      setBatchSize(maxAllowed);
      return;
    }

    const newPreviews: Preview[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      const usedLayers = layers.map(layer => {
        if (!layer.enabled) return false;
        return Math.random() * 100 < layer.layerRarity;
      });
      
      const selectedImages: number[] = [];
      const selectedImageUrls: string[] = [];
      
      layers.forEach((layer, layerIdx) => {
        if (!usedLayers[layerIdx] || layer.images.length === 0) {
          selectedImages.push(-1);
          return;
        }
        
        const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
        let random = Math.random() * totalRarity;
        let cumulative = 0;
        let selectedIndex = 0;
        
        for (let j = 0; j < layer.images.length; j++) {
          cumulative += layer.images[j].rarity;
          if (random <= cumulative) {
            selectedIndex = j;
            break;
          }
        }
        
        selectedImages.push(selectedIndex);
        selectedImageUrls.push(layer.images[selectedIndex].preview);
      });
      
      newPreviews.push({
        images: selectedImageUrls.filter(url => url !== undefined),
        layers: selectedImages.filter(idx => idx !== -1),
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        usedLayers
      });
    }
    
    setPreviews(newPreviews);
    setActiveTab('preview');
  }, [batchSize, layers, calculateAllCombinations]);

  const downloadPreview = useCallback((preview: Preview) => {
    if (!preview || preview.images.length === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const layersToDraw = [...preview.layers]
      .map((imgIdx, i) => ({ 
        layerIdx: i,
        imgIdx,
        zIndex: layers[i]?.zIndex || 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
    
    let imagesLoaded = 0;
    const totalImages = preview.images.length;
    
    layersToDraw.forEach(({ imgIdx }) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        imagesLoaded++;
        
        if (imagesLoaded === totalImages) {
          const link = document.createElement('a');
          link.download = `nft-${preview.id}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
      img.onerror = () => {
        console.error('Failed to load image for download');
        imagesLoaded++;
      };
      img.src = preview.images[imgIdx];
    });
  }, [layers]);

  const downloadAllAsZip = useCallback(async () => {
    if (previews.length === 0) return;
    
    setIsGeneratingZip(true);
    setDownloadProgress(0);
    const zip = new JSZip();
    const imgFolder = zip.folder("nfts");
    
    let metadataContent = 'Filename;';
    metadataContent += layers.map(layer => layer.name).join(';') + '\n';
    
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingZip(false);
      return;
    }

    const totalItems = previews.length;
    let processedItems = 0;

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      const fileName = `nft-${i + 1}.png`;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const layersToDraw = preview.layers
        .map((imgIdx, layerIdx) => ({ 
          layerIdx,
          imgIdx,
          zIndex: layers[layerIdx]?.zIndex || 0
        }))
        .sort((a, b) => a.zIndex - b.zIndex);
      
      let metadataRow = `${fileName};`;
      
      for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
        if (!preview.usedLayers[layerIdx]) {
          metadataRow += 'None;';
          continue;
        }
        
        const imgIdx = preview.layers[layerIdx];
        if (imgIdx === -1 || !layers[layerIdx].images[imgIdx]) {
          metadataRow += 'None;';
          continue;
        }
        
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = () => {
            console.error('Failed to load image for ZIP');
            resolve();
          };
          img.src = layers[layerIdx].images[imgIdx].preview;
        });
        
        metadataRow += layers[layerIdx].images[imgIdx]?.name || 'None';
        metadataRow += ';';
      }
      
      metadataRow = metadataRow.slice(0, -1) + '\n';
      metadataContent += metadataRow;
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
      
      if (blob) {
        imgFolder?.file(fileName, blob);
      }

      processedItems++;
      setDownloadProgress(Math.round((processedItems / totalItems) * 100));
    }

    zip.file("metadata.csv", metadataContent);
    
    const content = await zip.generateAsync({ 
      type: 'blob',
      streamFiles: true,
    }, (metadata) => {
      setDownloadProgress(metadata.percent);
    });
    
    saveAs(content, 'nft-collection.zip');
    setIsGeneratingZip(false);
    setDownloadProgress(0);
  }, [previews, layers]);


  const updateImageName = useCallback((layerIndex: number, imageIndex: number, newName: string) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].images[imageIndex].name = newName;
    setLayers(updatedLayers);
  }, [layers]);

  return (
    <WalletAuthGuard>
      <>
        <Head>
          <title>Pedro | NFT Builder</title>
          <meta name="description" content="Build your own NFT with layers" />
          <meta property="og:image" content="/pedro_logo4.png" />
        </Head>

        <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
          {isGeneratingZip && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-medium mb-4">Downloading...</h3>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-300 text-center">
                  {Math.round(downloadProgress)}% complete
                </p>
              </div>
            </div>
          )}

          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0">
              <Image
                src="/wallpaper4.png"
                alt="Background texture"
                layout="fill"
                objectFit="cover"
                className="opacity-20 mix-blend-overlay"
                priority
              />
            </div>
          </div>

          <div className="relative z-10">
            <section className="flex items-center justify-center py-12 text-center relative overflow-hidden px-2">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="px-6 max-w-4xl relative z-10"
              >
                <div className="flex flex-col items-center mb-5">
                  <motion.h1
                    className="text-4xl md:text-7xl font-bold mb-5 bg-clip-text text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    NFT GENERATOR
                  </motion.h1>
                </div>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                  className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
                />
              </motion.div>
            </section>

            <div className="relative px-2 py-3 sm:py-5 mx-auto max-w-[1500px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-black/50 p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-center w-full">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Wallet Address</h3>
                      <p className="text-sm font-mono text-white truncate px-2" title={walletAddress || ''}>
                        {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-black/50 p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center"
                >
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">PEDRO Tokens</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <p className="text-xl font-bold text-white">{pedroTokens.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-black/50 p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center"
                >
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Pedro NFTs</h3>
                    <div className="flex items-center justify-center space-x-2">
                      <p className="text-xl font-bold text-white">{pedroNfts}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-black/50 p-4 rounded-lg border border-white/10 flex flex-col items-center justify-center"
                >
                  <div className="text-center w-full">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Wallet Disconnect</h3>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-full transition-colors w-full mx-auto max-w-[180px]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-medium">Disconnect</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className='px-2'>
              <section className="max-w-[1500px] mx-auto px-2 sm:px-6 py-3 sm:py-5 bg-black/50 rounded-xl border border-white/10 mb-3 sm:mb-5">
                <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-10 text-white">HOW IT WORKS</h2>
                
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-400">Getting Started</h3>
                    <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base text-white/80">
                      <li className="mb-1 sm:mb-2">
                        <span className="font-medium">Add Layers</span> - Create different layers for your NFT
                      </li>
                      <li className="mb-1 sm:mb-2">
                        <span className="font-medium">Upload Images</span> - Add variations for each layer
                      </li>
                      <li className="mb-1 sm:mb-2">
                        <span className="font-medium">Set Rarity</span> - Adjust percentage chance for each image + layer
                      </li>
                      <li>
                        <span className="font-medium">Generate NFTs</span> - Create random combinations
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-400">Key Features</h3>
                    <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-white/80">
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                        <span><strong>Layer Rarity</strong> - Control how often each layer appears</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                        <span><strong>Image Rarity</strong> - Set individual image probabilities</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                        <span><strong>Complete Metadata</strong> - Includes "None" for unused layers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                        <span><strong>Usable</strong> - Ready to use on Talis Protocol!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>

            <div className="container max-w-[1500px] mx-auto px-2 pb-16 sm:pb-20">
              <div className="flex border-b border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
                <button
                  className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'builder' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('builder')}
                >
                  Builder
                </button>
                <button
                  className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'preview' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('preview')}
                  disabled={
                    previews.length >= totalCombinations || 
                    layers.filter(l => l.enabled && l.images.length > 0).length === 0
                  }                >
                  Preview
                </button>
              </div>

              {activeTab === 'builder' ? (
                <div className="space-y-6 sm:space-y-8">
                  <div className="bg-black/50 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                      <input
                        type="text"
                        value={newLayerName}
                        onChange={(e) => setNewLayerName(e.target.value)}
                        placeholder="New layer name"
                        className="w-full sm:flex-1 bg-white border border-gray-700 rounded px-3 py-2 sm:px-4 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                        onKeyDown={(e) => e.key === 'Enter' && addLayer()}
                      />
                      <Button
                        onClick={addLayer}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors py-2 sm:py-3 px-4 text-sm sm:text-base" 
                        label={"Add Layer"}
                      />
                    </div>

                    {layers.length === 0 && (
                      <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                        No layers added yet. Add your first layer to get started.
                      </div>
                    )}

                    <div className="space-y-4 sm:space-y-6">
                      {layers.map((layer, layerIndex) => (
                        <div key={layerIndex} className="bg-black/30 bg-opacity-50 p-3 sm:p-5 rounded-lg border border-gray-700">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <input
                                type="checkbox"
                                checked={layer.enabled}
                                onChange={() => toggleLayerEnabled(layerIndex)}
                                className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                              />
                              <h3 className="text-lg sm:text-xl font-semibold truncate max-w-[180px] sm:max-w-none">{layer.name}</h3>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                  <span className="text-xs mr-1 text-gray-400">Layers Z:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="1000"
                                    value={layer.zIndex}
                                    onChange={(e) => {
                                      const updatedLayers = [...layers];
                                      updatedLayers[layerIndex].zIndex = parseInt(e.target.value) || 0;
                                      setLayers(updatedLayers);
                                    }}
                                    className="w-12 sm:w-16 bg-gray-700 border border-gray-600 rounded px-1 sm:px-2 py-1 text-center text-xs sm:text-sm"
                                    title="Z-Index (stacking order)"
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs mr-1 text-gray-400">Unique %:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={layer.layerRarity}
                                    onChange={(e) => updateLayerRarity(layerIndex, e.target.value)}
                                    className="w-12 sm:w-16 bg-gray-700 border border-gray-600 rounded px-1 sm:px-2 py-1 text-center text-xs sm:text-sm"
                                    title="Layer appearance chance"
                                  />
                                </div>
                              </div>
                              <button
                                onClick={() => removeLayer(layerIndex)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Remove layer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          <div className="mb-3 sm:mb-4">
                            <input
                              type="file"
                              ref={(el: HTMLInputElement | null) => {
                                if (el) {
                                  fileInputRefs.current[layerIndex] = el;
                                }
                              }}
                              onChange={(e) => handleImageUpload(layerIndex, e)}
                              multiple
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRefs.current[layerIndex]?.click()}
                              className="bg-gray-500 hover:bg-white text-white hover:text-black px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm"
                            >
                              Add Images
                            </button>
                            {layer.images.length > 0 && (
                              <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-400">
                                {layer.images.length} image{layer.images.length !== 1 ? 's' : ''} (Total rarity: {layer.images.reduce((sum, img) => sum + img.rarity, 0)}%)
                              </span>
                            )}
                          </div>

                          {layer.images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                              {layer.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative group bg-black/40 rounded-lg overflow-hidden border border-gray-700">
                                 <div key={imageIndex} className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                    <div className="aspect-square bg-gray-800 flex items-center justify-center">
                                      <img
                                        src={image.preview}
                                        alt={image.name}
                                        className="object-contain max-h-full max-w-full"
                                      />
                                    </div>
                                    <div className="p-1 sm:p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <input
                                          type="text"
                                          value={image.name}
                                          onChange={(e) => updateImageName(layerIndex, imageIndex, e.target.value)}
                                          className="text-xs bg-gray-800 border border-gray-700 rounded px-1 w-full mr-2 h-8 py-1"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <button
                                          onClick={() => removeImage(layerIndex, imageIndex)}
                                          className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                          title="Remove image"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                      </div>
                                      <div className="flex items-center space-x-1 sm:space-x-2">
                                        <input
                                          type="range"
                                          min="0"
                                          max="100"
                                          value={image.rarity}
                                          onChange={(e) => updateRarity(layerIndex, imageIndex, e.target.value)}
                                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="text-xs w-6 sm:w-8 text-right">{image.rarity}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
                              No images added to this layer yet.
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/50 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 sm:mb-4">Generate NFTs</h3>
                        <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                          <div className="w-full">
                            <label className="block text-xs sm:text-sm text-gray-400 mb-1">  Number to generate (max {Math.min(5000, totalCombinations)})</label>
                            <input
                              type="number"
                              min="1"
                              max={Math.min(5000, totalCombinations)}
                              value={batchSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setBatchSize(Math.min(totalCombinations, Math.max(1, val)));
                              }}
                              className="w-full bg-white border border-gray-700 rounded px-3 py-2 sm:px-4 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                            />
                          </div>
                          <Button
                            onClick={generateBatchPreviews}
                            disabled={layers.length === 0 || layers.some(layer => layer.images.length === 0)}
                            className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:py-3 rounded-lg font-medium ${layers.length === 0 || layers.some(layer => layer.images.length === 0) ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-colors text-sm sm:text-base`} 
                            label={"Generate NFTs"}
                          />
                        </div>
                      </div>
                      <div className="bg-black/30 bg-opacity-50 p-3 sm:p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold mb-2 sm:mb-3">Statistics</h3>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Layers:</span>
                            <span>{layers.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Images:</span>
                            <span>{layers.reduce((sum, layer) => sum + layer.images.length, 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Unique Combinations:</span>
                            <span>{Math.min(5000, totalCombinations).toLocaleString()} (max 5000)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Enabled Layers:</span>
                            <span>{layers.filter(l => l.enabled).length}/{layers.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-black/30 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                  {previews.length > 0 ? (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                        <h2 className="text-lg sm:text-xl font-semibold">
                          Generated Previews ({previews.length})
                        </h2>
                        <div className="flex space-x-2 sm:space-x-3">
                          <button
                            onClick={generateBatchPreviews}
                            disabled={previews.length >= totalCombinations}
                            className={`px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm ${previews.length >= totalCombinations ? 'bg-gray-700 cursor-not-allowed' : 'bg-black hover:bg-white text-white hover:text-black'}`}
                          >
                            Generate Random
                          </button>
                          <button
                            onClick={handleDownloadWithPayment}
                            disabled={isGeneratingZip || paymentState === 'processing'}
                            className={`px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm ${
                              isGeneratingZip 
                                ? 'bg-blue-700 cursor-wait' 
                                : paymentState === 'processing'
                                  ? 'bg-purple-700 cursor-wait'
                                  : hasPaid
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-black hover:bg-white text-white hover:text-black'
                            }`}
                          >
                            {isGeneratingZip 
                              ? 'Generating ZIP...' 
                              : paymentState === 'processing'
                                ? 'Processing Payment...'
                                : hasPaid
                                  ? 'Download All'
                                  : 'Download'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {previews.map((preview) => (
                          <div key={preview.id} className="bg-black/30 rounded-lg overflow-hidden border border-gray-700">
                            <div className="relative aspect-square bg-black/30">
                              {preview.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Layer ${i}`}
                                  className="absolute inset-0 w-full h-full object-contain"
                                  style={{ zIndex: layers[preview.layers[i]]?.zIndex || i }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">No previews generated yet</div>
                      <button
                        onClick={() => {
                          generateBatchPreviews();
                          setActiveTab('preview');
                        }}
                        disabled={layers.length === 0 || layers.some(layer => layer.images.length === 0)}
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base ${layers.length === 0 || layers.some(layer => layer.images.length === 0) ? 'bg-gray-700 cursor-not-allowed' : 'bg-black text-white hover:bg-white hover:text-black'} transition-colors`}
                      >
                        Generate Your First Batch
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isPaymentModalOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
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
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={() => setIsPaymentModalOpen(false)}
                      width="40%"
                      className="rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
                      label="Cancel"
                    />
                    <Button
                      onClick={() => {
                        setIsPaymentModalOpen(false);
                        handlePayment();
                      }}
                      width="40%"
                      className="rounded-lg bg-white text-black hover:bg-gray-200 font-medium transition-all duration-300"
                      label="Proceed"
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
            </div>
          )}


          {isWarningModalOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="relative z-10 w-full max-w-md bg-gradient-to-br from-black to-gray-900 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                <div className="p-6">
                  {paymentState === 'processing' ? (
                    <div className="flex justify-center mb-4">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : (
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        {paymentState === 'success' ? '✅' : paymentState === 'failed' ? '❌' : '⚠️'}
                      </div>
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold text-center text-white mb-2">
                    {paymentState === 'processing' ? 'Processing Payment' : 
                    paymentState === 'success' ? 'Payment Successful' :
                    paymentState === 'failed' ? 'Payment Failed' : 'Notice'}
                  </h3>
                  
                  <p className="text-gray-300 text-center mb-6">{modalMessage}</p>
                  
                  <div className="flex justify-center space-x-4">
                    {paymentState !== 'processing' && (
                      <Button
                        onClick={() => {
                          setIsWarningModalOpen(false);
                          if (paymentState === 'success') {
                            downloadAllAsZip();
                          }
                        }}
                        width="100%"
                        className={`rounded-lg ${
                          paymentState === 'success' 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-white hover:bg-gray-200 text-black'
                        } font-medium transition-all duration-300`}
                        label={paymentState === 'success' ? 'Download Now' : 'Try Again'}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    </WalletAuthGuard>
  );
}