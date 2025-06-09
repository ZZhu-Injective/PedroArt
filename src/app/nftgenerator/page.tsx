'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { saveAs } from 'file-saver';
import WalletAuthGuard from "@/components/WalletAuthGuard";
import { useWalletAuth } from "@/components/WalletAuthGuard";
import { ChainId } from '@injectivelabs/ts-types';
import { BaseAccount, BroadcastModeKeplr, ChainRestAuthApi, ChainRestTendermintApi, CosmosTxV1Beta1Tx, createTransaction, getTxRawFromTxRawOrDirectSignResponse, MsgSend, TxRaw } from '@injectivelabs/sdk-ts';
import { BigNumberInBase, DEFAULT_BLOCK_TIMEOUT_HEIGHT, getStdFee } from '@injectivelabs/utils';
import { TransactionException } from '@injectivelabs/exceptions';
import { FaLayerGroup, FaUpload, FaSlidersH, FaCog, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaFileDownload, FaFileImage, FaPercentage, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiLayers, FiUpload, FiSettings, FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiDownload, FiImage, FiPercent, FiSliders } from 'react-icons/fi';

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
  id: string;
};

type Preview = {
  images: string[];
  layers: number[];
  id: string;
  usedLayers: boolean[];
};

type DragItem = {
  id: string;
  index: number;
};

type LayerCombination = {
  [layerId: string]: number;
};

type PaymentState = 'idle' | 'processing' | 'success' | 'failed';

const DraggableLayer: React.FC<{
  layer: Layer;
  index: number;
  moveLayer: (dragIndex: number, hoverIndex: number) => void;
  onClick: () => void;
  isActive: boolean;
}> = ({ layer, index, moveLayer, onClick, isActive }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'LAYER',
    item: { id: layer.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'LAYER',
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveLayer(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 0.95 }}
      whileTap={{ scale: 0.98 }}
      className={`p-3 rounded-xl cursor-pointer flex items-center ${
        isActive ? 'bg-white/10' : 'bg-black/50'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      onClick={onClick}
      style={{ cursor: 'grab' }}
    >
      <div className="flex-1 flex items-center gap-2">
        <FiLayers className="text-white/70" />
        <span className="text-white truncate">{layer.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/50">{layer.layerRarity}%</span>
        <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
          {layer.images.length}
        </span>
      </div>
    </motion.div>
  );
};

export default function NFTGenerator() {
  const { logout } = useWalletAuth();
  const [batchSize, setBatchSize] = useState<number>(100);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newLayerName, setNewLayerName] = useState<string>('');
  const [totalCombinations, setTotalCombinations] = useState<number>(0);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [storedAddress, setStoredAddress] = useState<string>('None');
  const [walletType, setStoredWallet] = useState<string>('None');
  const [nft_hold, setNftHold] = useState<string>('None');
  const [token_hold, setTokenHold] = useState<string>('None');
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [collectionName, setCollectionName] = useState<string>('My collection');
  const [collectionDescription, setCollectionDescription] = useState<string>('');
  const [itemPrefix, setItemPrefix] = useState<string>('');
  const [width, setWidth] = useState<number>(600);
  const [height, setHeight] = useState<number>(600);
  const [activeTraitTab, setActiveTraitTab] = useState<'traits' | 'rarity'>('traits');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showPreviews, setShowPreviews] = useState<boolean>(false);
  const [showAllLayers, setShowAllLayers] = useState(true);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [usedCombinations, setUsedCombinations] = useState<Set<string>>(new Set());


  const steps = [
    {
      id: 1,
      title: "Add Layers",
      description: "Create layers for your NFT collection. Each layer represents a different trait category.",
      icon: <FaLayerGroup className="text-white" size={24} />,
      completed: layers.length > 0
    },
    {
      id: 2,
      title: "Upload Images",
      description: "Add images to each layer. These will be randomly combined to create unique NFTs.",
      icon: <FaUpload className="text-white" size={24} />,
      completed: layers.some(layer => layer.images.length > 0)
    },
    {
      id: 4,
      title: "Generate NFTs",
      description: "Create your unique NFTs based on the layers and rarity settings.",
      icon: <FaFileImage className="text-white" size={24} />,
      completed: previews.length > 0
    },
    {
      id: 5,
      title: "Download NFTs",
      description: "Download your NFT collection as a zip file with metadata like on Talis Protocol.",
      icon: <FaFileDownload className="text-white" size={24} />,
      completed: hasPaid
    }
  ];

  useEffect(() => {
    const checkAddress = () => {
      const currentAddress = localStorage.getItem("connectedWalletAddress");
      const currentWalletType = localStorage.getItem("connectedWalletType");
      const currentNFT_Hold = localStorage.getItem("nft_hold");
      const currentToken_Hold = localStorage.getItem("token_hold");

      if (currentAddress && currentAddress !== storedAddress) {
        setStoredAddress(currentAddress);
      }

      if (currentWalletType && currentWalletType !== walletType) {
        setStoredWallet(currentWalletType);
      }

      if (currentNFT_Hold && currentNFT_Hold !== nft_hold) {
        setNftHold(currentNFT_Hold);
      }

      if (currentToken_Hold && currentToken_Hold !== token_hold) {
        setTokenHold(currentToken_Hold);
      }
    };

    const interval = setInterval(checkAddress, 1000);
    return () => clearInterval(interval);
  }, [storedAddress, walletType, nft_hold, token_hold]);

  useEffect(() => {
    const combinations = layers.reduce((total, layer) => {
      if (!layer.enabled || layer.images.length === 0) return total;
      return total * layer.images.length;
    }, 1); 
    
    setTotalCombinations(combinations);
  }, [layers]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (layers.length === 0) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No layers to preview', canvas.width / 2, canvas.height / 2);
      return;
    }

    if (showAllLayers) {
      layers
        .filter(layer => layer.enabled && layer.images.length > 0)
        .sort((a, b) => a.zIndex - b.zIndex)
        .forEach(layer => {
          const previewImage = layer.images[0]; 
          if (previewImage) {
            const img = new window.Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = previewImage.preview;
          }
        });
    } else {
      const activeLayer = layers[activeLayerIndex];
      if (activeLayer && activeLayer.images.length > 0) {
        const previewImage = activeLayer.images[0]; 
        const img = new window.Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = previewImage.preview;
      }
    }
  }, [layers, activeLayerIndex, width, height, showAllLayers]);

  const baseAmount = nft_hold === "0" ? "100000" : "1";

  const handleDownloadWithPayment = () => {
    if (hasPaid) {
      downloadAllAsZip();
    } else {
      setModalMessage(`Downloading requires a payment of ${baseAmount} $PEDRO. Proceed to payment?`);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePayment = useCallback(async () => {
    if (!storedAddress) return;

    setPaymentState('processing');
    setIsProcessingPayment(true);

    try {
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
        srcInjectiveAddress: storedAddress,
        dstInjectiveAddress: "inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49",
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
        memo: "Send to burn wallet - PEDRO X NFT",
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

    try {
      const response = await fetch('https://api.pedroinjraccoon.online/burn/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          burn_data: {
            srcInjectiveAddress: storedAddress,
            baseAmount: baseAmount,
            txHash: txHash,
            reason: 'NFT-Tool'
          }
        }),
      });

    } catch (apiError) {
      console.error('API error:', apiError);
    }

    if (txHash) {
      setPaymentState('success');
      setHasPaid(true);
      setModalMessage("Payment successful! You can now download your NFTs.");
      setIsWarningModalOpen(true);
    }
    
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState('failed');
      setModalMessage("Payment failed. Please try again.");
      setIsWarningModalOpen(true);
    } finally {
      setIsProcessingPayment(false);
    }
  }, [storedAddress, walletType, baseAmount]);

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
      layerRarity: 100,
      id: `layer-${Date.now()}`
    };
    
    setLayers([...layers, newLayer]);
    setNewLayerName('');
    setActiveLayerIndex(layers.length);
  }, [newLayerName, layers]);

  const removeLayer = useCallback((index: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(index, 1);
    setLayers(updatedLayers);
    if (activeLayerIndex >= updatedLayers.length) {
      setActiveLayerIndex(Math.max(0, updatedLayers.length - 1));
    }
  }, [layers, activeLayerIndex]);

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
    const maxValue = 100;
    
    const clampedValue = Math.max(0, Math.min(maxValue, numValue));
    
    updatedLayers[layerIndex].images[imageIndex].rarity = clampedValue;
    
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

  const downloadPreview = useCallback((preview: Preview) => {
    if (!preview || preview.layers.length === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const layersToDraw = layers
      .map((layer, i) => ({ 
        layer,
        imgIdx: preview.layers[i],
        zIndex: layer.zIndex
      }))
      .filter(({ imgIdx }) => imgIdx !== -1)
      .sort((a, b) => a.zIndex - b.zIndex);
    
    let imagesLoaded = 0;
    const totalImages = layersToDraw.length;
    
    if (totalImages === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    layersToDraw.forEach(({ layer, imgIdx }) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        imagesLoaded++;
        
        if (imagesLoaded === totalImages) {
          const link = document.createElement('a');
          link.download = `${itemPrefix ? `${itemPrefix}-` : ''}${preview.id}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
      img.onerror = () => {
        console.error('Failed to load image for download');
        imagesLoaded++;
      };
      img.src = layer.images[imgIdx].preview;
    });
  }, [layers, width, height, itemPrefix]);

  const downloadAllAsZip = useCallback(async () => {
    if (previews.length === 0) return;
    
    setIsGeneratingZip(true);
    setDownloadProgress(0);
    const zip = new JSZip();
    const imgFolder = zip.folder("nfts");
    
    let metadataContent = 'Filename;Title;Description;NbCopies;';
    metadataContent += layers.map(layer => layer.name).join(';') + '\n';
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingZip(false);
      return;
    }

    const totalItems = previews.length;
    let processedItems = 0;

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      const fileName = `${itemPrefix ? `${itemPrefix}-` : ''}nft-${i + 1}.png`;
      const title = `${itemPrefix ? `${itemPrefix} ` : ''}#${i + 1}`;
      const description = collectionDescription || 'NFT Art';
      const nbCopies = '1';
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const layersToDraw = preview.layers
        .map((imgIdx, layerIdx) => ({
          layerIdx,
          imgIdx,
          zIndex: layers[layerIdx]?.zIndex || 0,
          used: preview.usedLayers[layerIdx]
        }))
        .filter(({ used, imgIdx }) => used && imgIdx !== -1)
        .sort((a, b) => a.zIndex - b.zIndex);
      
      let metadataRow = `${fileName};${title};${description};${nbCopies};`;
      
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
    
    saveAs(content, `${collectionName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'nft-collection'}.zip`);
    setIsGeneratingZip(false);
    setDownloadProgress(0);
  }, [previews, layers, width, height, itemPrefix, collectionName, collectionDescription]);

  const updateImageName = useCallback((layerIndex: number, imageIndex: number, newName: string) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].images[imageIndex].name = newName;
    setLayers(updatedLayers);
  }, [layers]);

  const handleLayerClick = (index: number) => {
    setActiveLayerIndex(index);
  };

  const updateLayerName = (index: number, newName: string) => {
    const updatedLayers = [...layers];
    updatedLayers[index].name = newName;
    setLayers(updatedLayers);
  };

  const updateLayerRarityValue = (index: number, value: number) => {
    const updatedLayers = [...layers];
    updatedLayers[index].layerRarity = Math.min(100, Math.max(0, value));
    setLayers(updatedLayers);
  };

  const moveLayerUp = (index: number) => {
    if (index <= 0) return;
    const updatedLayers = [...layers];
    const temp = updatedLayers[index];
    updatedLayers[index] = updatedLayers[index - 1];
    updatedLayers[index - 1] = temp;
    updatedLayers.forEach((layer, i) => {
      layer.zIndex = i;
    });
    setLayers(updatedLayers);
    if (activeLayerIndex === index) {
      setActiveLayerIndex(index - 1);
    }
  };

  const moveLayerDown = (index: number) => {
    if (index >= layers.length - 1) return;
    const updatedLayers = [...layers];
    const temp = updatedLayers[index];
    updatedLayers[index] = updatedLayers[index + 1];
    updatedLayers[index + 1] = temp;
    updatedLayers.forEach((layer, i) => {
      layer.zIndex = i;
    });
    setLayers(updatedLayers);
    if (activeLayerIndex === index) {
      setActiveLayerIndex(index + 1);
    }
  };

  const renderPreviewCanvas = useCallback(async (preview: Preview) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawQueue = layers
      .map((layer, layerIdx) => ({
        layer,
        imgIdx: preview.layers[layerIdx],
        used: preview.usedLayers[layerIdx],
        zIndex: layer.zIndex
      }))
      .filter(({ used, imgIdx }) => used && imgIdx !== -1)
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const { layer, imgIdx } of drawQueue) {
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          img.onerror = (err) => {
            console.error(`Error loading ${layer.name} image ${imgIdx}`, err);
            reject(err);
          };
          img.src = layer.images[imgIdx].preview;
        });
      } catch (err) {
        console.warn(`Skipping failed layer ${layer.name}`);
        continue;
      }
    }

    return canvas;
  }, [layers, width, height]);
  
  const generateBatchPreviews = useCallback(async () => {
    if (layers.length === 0 || batchSize < 1) return;

    const totalPossibleCombinations = layers.reduce((total, layer) => {
      if (!layer.enabled || layer.images.length === 0) return total;
      return total * layer.images.length;
    }, 1);

    if (totalPossibleCombinations < batchSize) {
      setModalMessage(`You've requested ${batchSize} NFTs but there are only ${totalPossibleCombinations} possible unique combinations`);
      setIsWarningModalOpen(true);
      return;
    }

    setUsedCombinations(new Set());
    setIsGeneratingPreviews(true);
    setPreviews([]);

    try {
      const newPreviews: Preview[] = [];
      const combinations = new Set<string>();

      while (newPreviews.length < batchSize) {
        const selectedImages: number[] = Array(layers.length).fill(-1);
        const usedLayers: boolean[] = Array(layers.length).fill(false);
        let combinationKey = "";

        layers.forEach((layer, layerIdx) => {
          if (!layer.enabled || layer.images.length === 0) {
            usedLayers[layerIdx] = false;
            return;
          }

          if (layer.layerRarity === 100) {
            usedLayers[layerIdx] = true;
          } else {
            usedLayers[layerIdx] = Math.random() * 100 <= layer.layerRarity;
          }

          if (!usedLayers[layerIdx]) {
            combinationKey += `-`;
            return;
          }

          const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
          let random = Math.random() * totalRarity;
          let cumulative = 0;

          for (let j = 0; j < layer.images.length; j++) {
            cumulative += layer.images[j].rarity;
            if (random <= cumulative) {
              selectedImages[layerIdx] = j;
              combinationKey += `${j}:`;
              break;
            }
          }
        });

        if (combinations.has(combinationKey)) {
          continue;
        }

        combinations.add(combinationKey);

        const preview: Preview = {
          layers: selectedImages,
          usedLayers,
          id: `preview-${Date.now()}-${newPreviews.length}`,
          images: []
        };

        const canvas = await renderPreviewCanvas(preview);
        if (canvas) {
          preview.images = [canvas.toDataURL('image/png')];
          newPreviews.push(preview);
        }
      }

      setPreviews(newPreviews);
      setUsedCombinations(combinations);
    } finally {
      setIsGeneratingPreviews(false);
    }
  }, [batchSize, layers, renderPreviewCanvas]);


 return (
    <WalletAuthGuard>
      <>
        <Head>
          <title>Pedro | NFT Builder</title>
          <meta name="description" content="Build your own NFT with layers" />
        </Head>

        <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0">
              <Image
                src="/wallpaper9.webp"
                alt="Background texture"
                layout="fill"
                objectFit="cover"
                className="opacity-40 mix-blend-overlay"
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
                  className="text-4xl md:text-7xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
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

            <section className="relative px-8 mx-auto max-w-6xl mb-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-4 gap-4"
              >
                {steps.map((step) => (
                  <motion.div
                    key={step.id}
                    variants={itemVariants}
                    className={`group relative overflow-hidden rounded-2xl ${step.completed ? 'bg-green-900/20' : 'bg-black/50'} shadow-2xl transition-all duration-500 backdrop-blur-sm border ${currentStep === step.id ? 'border-white/50' : 'border-white/10'} hover:border-white/30 p-4 cursor-pointer`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full ${step.completed ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {step.icon}
                      </div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      {step.completed && (
                        <div className="ml-auto bg-green-500/20 p-1 rounded-full">
                          <FaCheck className="text-green-400" size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-white/70">{step.description}</p>
                    {currentStep === step.id && (
                      <motion.div 
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent origin-left"
                      />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </section>

            <section className="relative sm:py-8 py-2 px-2 mx-auto max-w-[1500px]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4">
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-6"
                >
                <DndProvider backend={HTML5Backend}>
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <FaLayerGroup className="text-white" />
                    Layers
                  </h3>
                  
                  <div className="space-y-2 max-h-[330px] overflow-y-auto">
                    {layers.map((layer, index) => (
                      <DraggableLayer
                        key={layer.id}
                        layer={layer}
                        index={index}
                        moveLayer={(dragIndex, hoverIndex) => {
                          const updatedLayers = [...layers];
                          const [removed] = updatedLayers.splice(dragIndex, 1);
                          updatedLayers.splice(hoverIndex, 0, removed);
                          updatedLayers.forEach((l, i) => {
                            l.zIndex = i;
                          });
                          setLayers(updatedLayers);
                          if (activeLayerIndex === dragIndex) {
                            setActiveLayerIndex(hoverIndex);
                          }
                        }}
                        onClick={() => {
                          handleLayerClick(index);
                          setCurrentStep(2);
                        }}
                        isActive={index === activeLayerIndex}
                      />
                    ))}
                  </div>
                </DndProvider>

                  <div className="mt-6">
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                      <FiPlus />
                      Create new layer
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Layer name"
                        value={newLayerName}
                        onChange={(e) => setNewLayerName(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          addLayer();
                          setCurrentStep(2); 
                        }}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white transition-all flex items-center gap-2"
                      >
                        <FiPlus size={14} />
                        Add
                      </motion.button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                      <FiImage />
                      Layer Preview
                    </h3>
                    <div className="relative w-full aspect-square bg-black/50 rounded-xl overflow-hidden border border-white/10">
                      <canvas 
                        ref={canvasRef}
                        width={width}
                        height={height}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-6"
                >
                  {layers.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <FiLayers className="text-white/70" />
                          <input
                            type="text"
                            value={layers[activeLayerIndex].name}
                            onChange={(e) => updateLayerName(activeLayerIndex, e.target.value)}
                            className="bg-transparent text-xl font-bold text-white border-b border-white/20 focus:outline-none focus:border-white/50"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPercent className="text-white/70" />
                          
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={layers[activeLayerIndex].layerRarity.toString()}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              updateLayerRarityValue(activeLayerIndex, Math.min(100, Math.max(0, value)));
                            }}
                            className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-right"
                          />

                          <span className="text-sm text-white/50">%</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeLayer(activeLayerIndex)}
                            className="text-red-400 hover:text-red-300 transition-all flex items-center gap-1"
                          >
                            <FiTrash2 size={16} />
                          </motion.button>
                        </div>
                      </div>

                      {currentStep >= 2 && (
                        <div className="mb-6">
                          <h3 className="text-white text-lg font-bold mb-3 flex items-center gap-2">
                            <FiUpload />
                            Upload Images
                          </h3>
                          <input
                            type="file"
                            accept="image/png"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              handleImageUpload(activeLayerIndex, e);
                              setCurrentStep(3);
                            }}
                            ref={(el) => {
                              fileInputRefs.current[activeLayerIndex] = el;
                            }}
                          />
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => fileInputRefs.current[activeLayerIndex]?.click()}
                            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition-all"
                          >
                            <p className="text-white/70 mb-2">Click or drop images here</p>
                            <p className="text-xs text-white/50">(PNG format, max 2MB per image)</p>
                          </motion.div>
                        </div>
                      )}

                      {currentStep >= 2 && (
                        <div>
                          <div className="flex border-b border-white/10 mb-4">
                            <button
                              className={`pb-2 px-4 flex items-center gap-2 ${activeTraitTab === 'traits' ? 'text-white border-b-2 border-white' : 'text-white/50'}`}
                              onClick={() => setActiveTraitTab('traits')}
                            >
                              <FiImage size={14} />
                              Traits ({layers[activeLayerIndex]?.images.length || 0})
                            </button>
                            <button
                              className={`pb-2 px-4 flex items-center gap-2 ${activeTraitTab === 'rarity' ? 'text-white border-b-2 border-white' : 'text-white/50'}`}
                              onClick={() => setActiveTraitTab('rarity')}
                            >
                              <FiPercent size={14} />
                              Rarity Settings
                            </button>
                          </div>

                          {activeTraitTab === 'traits' && (
                            <div className="space-y-2 max-h-[550px] overflow-y-auto">
                              {layers[activeLayerIndex]?.images.map((image, imgIndex) => (
                                <motion.div
                                  key={imgIndex}
                                  whileHover={{ scale: 0.95 }}
                                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                                >
                                  <div className="w-10 h-10 bg-black/50 rounded overflow-hidden">
                                    <img 
                                      src={image.preview} 
                                      alt={image.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={image.name}
                                    onChange={(e) => updateImageName(activeLayerIndex, imgIndex, e.target.value)}
                                    className="flex-1 bg-transparent text-white border-b border-white/10 focus:outline-none focus:border-white/30"
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeImage(activeLayerIndex, imgIndex)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <FiTrash2 size={16} />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {activeTraitTab === 'rarity' && (
                            <div className="space-y-3 max-h-[550px] overflow-y-auto">
                              <div className="p-3 bg-white/5 rounded-lg border border-white/10 mb-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-white/80">Total Rarity</span>
                                  <span className={`text-sm font-mono ${
                                    layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0) !== 100 
                                      ? 'text-yellow-400' 
                                      : 'text-green-400'
                                  }`}>
                                    {layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0)}%
                                    {layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0) !== 100 && (
                                      <span className="ml-2 text-xs">(Should total 100%)</span>
                                    )}
                                  </span>
                                </div>

                                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0) !== 100
                                        ? 'bg-yellow-500/50' 
                                        : 'bg-green-500/50'
                                    }`} 
                                    style={{ 
                                      width: `${Math.min(100, layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0) || 0)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {layers[activeLayerIndex]?.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="p-3 bg-white/5 rounded-lg">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-white/80 truncate flex items-center gap-2">
                                      <FiImage size={12} />
                                      {image.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={image.rarity}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value) || 0;
                                          updateRarity(activeLayerIndex, imgIndex, value.toString());
                                        }}
                                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-right"
                                      />
                                      <span className="text-sm text-white/50">%</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <FaLayerGroup className="text-white/50" size={48} />
                      <h3 className="text-xl text-white mb-2">No layers added yet</h3>
                      <p className="text-white/50">Create your first layer to get started</p>
                    </div>
                  )}
                </motion.div>

                {showPreviews && previews.length > 0 ? (
                  <motion.div
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-2xl bg-black/50 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-6"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white text-xl font-bold flex items-center gap-2">
                        <FiImage />
                        Generated Previews ({previews.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowPreviews(false)}
                          className="text-white/50 hover:text-white"
                        >
                          <FiSettings size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-2">
                      {previews.map((preview, idx) => (
                        <div key={preview.id} className="relative group">
                          <div className="aspect-square bg-black/50 rounded-lg overflow-hidden border border-white/10 relative">
                            {preview.images.length > 0 ? (
                              <img 
                                src={preview.images[0]} 
                                alt={`Preview ${idx}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaSpinner className="animate-spin" />
                              </div>
                            )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-xs text-white truncate w-full">
                              {itemPrefix ? `${itemPrefix}-${idx + 1}` : `NFT-${idx + 1}`}
                            </span>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => downloadPreview(preview)}
                            className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm"
                            title="Download this NFT"
                          >
                            <FiDownload size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <label className="block text-sm text-white/70 mb-1">Collection name</label>
                        <input
                          type="text"
                          value={collectionName}
                          onChange={(e) => setCollectionName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-sm"
                        />
                      </div>

                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <label className="block text-sm text-white/70 mb-1">Item name prefix</label>
                        <input
                          type="text"
                          value={itemPrefix}
                          onChange={(e) => setItemPrefix(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-sm"
                          placeholder="e.g., MyNFT"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownloadWithPayment}
                        disabled={isProcessingPayment}
                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          isProcessingPayment
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-white text-black hover:opacity-90'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <FaSpinner className="animate-spin" size={14} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiDownload size={14} />
                            Download All ({previews.length} NFTs)
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowPreviews(false);
                          setCurrentStep(4);
                        }}
                        className="w-full bg-transparent border border-white/20 hover:border-white/40 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FiSliders size={14} />
                        Adjust Settings
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                <motion.div
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl bg-black/50 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 p-6"
                >
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <FiSettings />
                    Collection Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-1 flex items-center gap-2">
                        <FiImage size={14} />
                        Collection name
                      </label>
                      <input
                        type="text"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-1">Description</label>
                      <input
                        type="text"
                        value={collectionDescription}
                        onChange={(e) => setCollectionDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-white/70 mb-1">Item name prefix</label>
                      <input
                        type="text"
                        value={itemPrefix}
                        onChange={(e) => setItemPrefix(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        placeholder="e.g., MyNFT"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/70 mb-1">Width</label>
                        <div className="flex">
                          <input
                            type="number"
                            min="100"
                            max="1600"
                            value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
                            className="w-full bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-white focus:outline-none"
                          />
                          <span className="bg-white/10 border border-l-0 border-white/10 rounded-r-lg px-3 py-2 text-sm text-white/70">px</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/70 mb-1">Height</label>
                        <div className="flex">
                          <input
                            type="number"
                            min="100"
                            max="1600"
                            value={height}
                            onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
                            className="w-full bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-white focus:outline-none"
                          />
                          <span className="bg-white/10 border border-l-0 border-white/10 rounded-r-lg px-3 py-2 text-sm text-white/70">px</span>
                        </div>
                      </div>
                    </div>

                    {currentStep >= 2 && (
                      <div>
                        <label className="block text-sm text-white/70 mb-1">Collection size</label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={batchSize}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value) || 100;
                            const totalCombos = layers.reduce((total, layer) => {
                              if (!layer.enabled || layer.images.length === 0) return total;
                              return total * layer.images.length;
                            }, 1);
                            
                            if (newSize > totalCombos && totalCombos > 0) {
                              setModalMessage(`You can't generate more than ${totalCombos} unique NFTs with your current layers.`);
                              setIsWarningModalOpen(true);
                              setBatchSize(totalCombos);
                            } else {
                              setBatchSize(newSize);
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        {totalCombinations > 0 && (
                          <p className="text-xs text-white/50 mt-1">
                            Max unique combinations: {totalCombinations}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-white/70">Wallet:</div>
                      <div className="text-right font-mono" title={storedAddress}>
                        {storedAddress ? `${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}` : 'Not connected'}
                      </div>
                      <div className="text-white/70">PEDRO Balance:</div>
                      <div className="text-right">{token_hold}</div>
                      <div className="text-white/70">NFTs Held:</div>
                      <div className="text-right">{nft_hold}</div>
                    </div>
                  </div>

                  {currentStep >= 2 && (
                    <div className="mt-6 space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setLayers([]);
                          setPreviews([]);
                          setBatchSize(100);
                          setCurrentStep(1);
                        }}
                        className="w-full bg-transparent border border-white/20 hover:border-white/40 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <FiTrash2 size={14} />
                        Reset All
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          generateBatchPreviews();
                          setCurrentStep(5);
                        }}
                        disabled={layers.length === 0 || layers.some(l => l.images.length === 0) || isGeneratingPreviews}
                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          layers.length === 0 || layers.some(l => l.images.length === 0) || isGeneratingPreviews
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-white text-black hover:bg-white/90'
                        }`}
                      >
                        {isGeneratingPreviews ? (
                          <>
                            <FaSpinner className="animate-spin" size={14} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FiImage size={14} />
                            Generate NFTs
                          </>
                        )}
                      </motion.button>

                      {previews.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowPreviews(true)}
                          disabled={isGeneratingPreviews}
                          className={`w-full bg-white text-black border border-white/20 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            isGeneratingPreviews ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <FiImage size={14} />
                          View Previews
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDownloadWithPayment}
                        disabled={previews.length === 0 || isProcessingPayment || isGeneratingPreviews}
                        className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                          previews.length === 0 || isProcessingPayment || isGeneratingPreviews
                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                            : 'bg-gradient-to-r bg-white text-black hover:opacity-90'
                        }`}
                      >
                        {isProcessingPayment ? (
                          <>
                            <FaSpinner className="animate-spin" size={14} />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FiDownload size={14} />
                            Download All
                          </>
                        )}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
              </div>
            </section>
          </div>
        </div>

        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative max-w-md w-full bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileDownload className="text-black" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Required</h3>
                <p className="text-white/70">{modalMessage}</p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaTimes size={14} />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    handlePayment();
                  }}
                  className="flex-1 bg-white text-black py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <FaCheck size={14} />
                  Proceed
                </motion.button>
              </div>

              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent origin-left"
              />
            </motion.div>
          </div>
        )}

        {isWarningModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-md w-full bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl text-center"
            >
              {paymentState === 'processing' ? (
                <div className="mb-6">
                  <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4 flex items-center justify-center">
                    <FaSpinner className="text-purple-500" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Processing Payment</h3>
                </div>
              ) : (
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    paymentState === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {paymentState === 'success' ? (
                      <FaCheck className="text-green-400" size={24} />
                    ) : (
                      <FaTimes className="text-red-400" size={24} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {paymentState === 'success' ? 'Success!' : 'Error'}
                  </h3>
                </div>
              )}

              <p className="text-white/70 mb-6">{modalMessage}</p>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setIsWarningModalOpen(false);
                  if (paymentState === 'success') {
                    downloadAllAsZip();
                  }
                }}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  paymentState === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                } text-white hover:opacity-90 transition-all`}
              >
                {paymentState === 'success' ? (
                  <>
                    <FiDownload size={14} />
                    Download Now
                  </>
                ) : (
                  <>
                    <FaTimes size={14} />
                    Try Again
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        )}

        {isGeneratingZip && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-md w-full bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <FiDownload className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-6">Preparing Download</h3>
              
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-black to-white rounded-full"
                />
              </div>
              
              <p className="text-white/70 mb-1">
                {Math.round(downloadProgress)}% complete
              </p>
              <p className="text-white/50 text-sm">
                Generating {previews.length} NFTs...
              </p>
            </motion.div>
          </div>
        )}
      </>
    </WalletAuthGuard>
  );
}

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