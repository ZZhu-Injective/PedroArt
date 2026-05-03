'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { Fragment, useEffect, useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { saveAs } from 'file-saver';
import WalletAuthGuard from "@/components/WalletAuthGuard";
import { useWalletAuth } from "@/components/WalletAuthGuard";
import { MsgSend } from '@injectivelabs/sdk-ts';
import { BigNumberInBase } from '@injectivelabs/utils';
import { signAndBroadcast } from '@/lib/wallet';
import { FaLayerGroup, FaUpload, FaSlidersH, FaCog, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaFileDownload, FaFileImage, FaPercentage, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { FiLayers, FiUpload, FiSettings, FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiDownload, FiImage, FiPercent, FiSliders } from 'react-icons/fi';

const FloatingSparkles = () => {
  const [sparkles, setSparkles] = useState<{x: string, y: string, size: number, id: number, color: string, delay: number}[]>([]);

  useEffect(() => {
    const createSparkle = () => ({
      id: Date.now() + Math.random(),
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 3,
      color: `radial-gradient(circle, 
        ${Math.random() > 0.5 ? '#ffffff' : '#888888'} 0%, 
        transparent 80%)`,
      delay: Math.random() * 3000
    });

    const initialSparkles = Array.from({ length: 25 }, createSparkle);
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      const newSparkle = createSparkle();
      setSparkles(prev => [...prev, newSparkle]);
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 4000);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            background: sparkle.color,
            animationDelay: `${sparkle.delay}ms`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size}px ${sparkle.color}`
          }}
        />
      ))}
    </div>
  );
};

const AnimatedGrid = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <div className="absolute inset-0 bg-grid-animation"></div>
    </div>
  );
};

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
      className={`p-3 rounded-xl cursor-pointer flex items-center backdrop-blur-xl border ${
        isActive ? 'bg-white/10 border-white/40' : 'bg-black/40 border-gray-800/60 hover:border-white/30'
      } ${isDragging ? 'opacity-50' : 'opacity-100'} transition-all duration-300`}
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

export default function NFTGenerator() {
  const { logout } = useWalletAuth();
  const [batchSize, setBatchSize] = useState<number>(1);
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
      const msg = MsgSend.fromJSON({
        amount: {
          amount: new BigNumberInBase(baseAmount).times(new BigNumberInBase(10).pow(18)).toFixed(),
          denom: "factory/inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk/inj1c6lxety9hqn9q4khwqvjcfa24c2qeqvvfsg4fm",
        },
        srcInjectiveAddress: storedAddress,
        dstInjectiveAddress: "inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49",
      });

      const txHash = await signAndBroadcast(msg, "Send to burn wallet - PEDRO X NFT");

      try {
        await fetch('https://api.injectivepedro.com/burn/', {
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
  }, [storedAddress, baseAmount]);

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
          <AnimatedGrid />
          <FloatingSparkles />
          
          <div className="fixed inset-0 z-0 opacity-30">
            <Image
              src="/wallpaper9.webp"
              alt="Pedro The Raccoon Wallpaper"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="relative z-10">
            <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-gray-800/60">
              <div className="container mx-auto px-4 sm:px-5 max-w-7xl flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg border border-gray-700 bg-black flex items-center justify-center">
                    <span className="text-white text-base font-bold font-mono">P</span>
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-base font-bold text-white font-mono tracking-tight leading-tight">NFT Art Generator</h1>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest leading-tight">by pedro × art</p>
                  </div>
                </div>
                <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {[
                    { id: 1, label: 'Settings', icon: <FaCog size={12} /> },
                    { id: 2, label: 'Organize', icon: <FaLayerGroup size={12} /> },
                    { id: 4, label: 'Preview', icon: <FaFileImage size={12} /> },
                    { id: 5, label: 'Export', icon: <FaFileDownload size={12} /> },
                  ].map((s, idx, arr) => (
                    <Fragment key={s.id}>
                      <button
                        onClick={() => setCurrentStep(s.id)}
                        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono uppercase tracking-tight transition-all border-2 ${
                          currentStep === s.id
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent text-gray-300 border-gray-700 hover:border-white/60 hover:text-white'
                        }`}
                      >
                        {s.icon}
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                      {idx < arr.length - 1 && <span className="text-gray-600 text-xs hidden sm:inline">›</span>}
                    </Fragment>
                  ))}
                </nav>
              </div>
            </header>

            <section className="container mx-auto px-4 sm:px-5 py-6 max-w-7xl">
              <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 lg:gap-6">
                  <aside className="lg:sticky lg:top-[84px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
                    <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-3">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="New layer name"
                          value={newLayerName}
                          onChange={(e) => setNewLayerName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && newLayerName.trim()) { addLayer(); setCurrentStep(2); } }}
                          className="flex-1 min-w-0 bg-black/40 border border-gray-800/60 rounded-lg px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                        />
                        <button
                          onClick={() => { addLayer(); setCurrentStep(2); }}
                          disabled={!newLayerName.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black text-xs font-semibold uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                        >
                          <FiPlus size={12} /> Add
                        </button>
                      </div>

                      {layers.length === 0 ? (
                        <div className="text-center py-10 px-3 border border-dashed border-gray-800 rounded-lg">
                          <FaLayerGroup className="mx-auto text-gray-700 mb-2" size={20} />
                          <p className="text-xs text-gray-500 font-mono">No layers yet</p>
                          <p className="text-[10px] text-gray-600 font-mono mt-1">Name one and click Add</p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {layers.map((layer, index) => (
                            <DraggableLayer
                              key={layer.id}
                              layer={layer}
                              index={index}
                              moveLayer={(dragIndex, hoverIndex) => {
                                const updatedLayers = [...layers];
                                const [removed] = updatedLayers.splice(dragIndex, 1);
                                updatedLayers.splice(hoverIndex, 0, removed);
                                updatedLayers.forEach((l, i) => { l.zIndex = i; });
                                setLayers(updatedLayers);
                                if (activeLayerIndex === dragIndex) setActiveLayerIndex(hoverIndex);
                              }}
                              onClick={() => { handleLayerClick(index); setCurrentStep(2); }}
                              isActive={index === activeLayerIndex}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </aside>

                  <main className="min-w-0 space-y-4">
                    {currentStep === 1 && (
                      <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <FaCog className="text-white" size={14} />
                          <h2 className="text-lg font-bold text-white font-mono tracking-tight">Collection Settings</h2>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Collection name</label>
                            <input
                              type="text"
                              value={collectionName}
                              onChange={(e) => setCollectionName(e.target.value)}
                              className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Description</label>
                            <input
                              type="text"
                              value={collectionDescription}
                              onChange={(e) => setCollectionDescription(e.target.value)}
                              className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Item prefix</label>
                            <input
                              type="text"
                              value={itemPrefix}
                              onChange={(e) => setItemPrefix(e.target.value)}
                              placeholder="e.g. PEDRO"
                              className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors placeholder:text-gray-700"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Width (px)</label>
                              <input
                                type="number" min="100" max="1600"
                                value={width}
                                onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
                                className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Height (px)</label>
                              <input
                                type="number" min="100" max="1600"
                                value={height}
                                onChange={(e) => setHeight(parseInt(e.target.value) || 600)}
                                className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-1.5">Collection size</label>
                            <input
                              type="number" min="1" max="5000"
                              value={batchSize}
                              onChange={(e) => {
                                const newSize = parseInt(e.target.value) || 1;
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
                              className="w-full bg-black/40 border border-gray-800/60 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-white/60 transition-colors"
                            />
                            {totalCombinations > 0 && (
                              <p className="text-[10px] text-gray-500 mt-1 font-mono">Max unique combinations: {totalCombinations}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-black/40 border border-gray-800/60 rounded-lg">
                          <h3 className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mb-3">Wallet</h3>
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="text-gray-400">Address</div>
                            <div className="text-right text-white truncate" title={storedAddress}>
                              {storedAddress && storedAddress !== 'None' ? `${storedAddress.slice(0, 6)}…${storedAddress.slice(-4)}` : '—'}
                            </div>
                            <div className="text-gray-400">PEDRO Balance</div>
                            <div className="text-right text-white">{token_hold}</div>
                            <div className="text-gray-400">NFTs Held</div>
                            <div className="text-right text-white">{nft_hold}</div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => { setLayers([]); setPreviews([]); setBatchSize(1); setCurrentStep(1); }}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-400 bg-transparent text-gray-300 text-sm font-mono uppercase tracking-tight hover:bg-white hover:text-black hover:border-white transition-colors rounded-lg"
                          >
                            <FiTrash2 size={12} /> Reset all
                          </button>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors rounded-lg"
                          >
                            <FaLayerGroup size={12} /> Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      layers.length === 0 ? (
                        <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-12 text-center">
                          <FaLayerGroup className="mx-auto text-gray-700 mb-3" size={36} />
                          <h3 className="text-lg font-bold text-white font-mono tracking-tight mb-1">No layers yet</h3>
                          <p className="text-sm text-gray-500 font-mono">Name a layer in the sidebar and click Add to start.</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-4 sm:p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <FiLayers className="text-white shrink-0" />
                                <input
                                  type="text"
                                  value={layers[activeLayerIndex].name}
                                  onChange={(e) => updateLayerName(activeLayerIndex, e.target.value)}
                                  className="bg-transparent text-xl font-bold text-white font-mono tracking-tight border-b border-gray-800 focus:outline-none focus:border-white min-w-0 max-w-full"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => fileInputRefs.current[activeLayerIndex]?.click()}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black text-xs font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors"
                                >
                                  <FiUpload size={12} /> Add files
                                </button>
                                <div className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-gray-800/60 bg-black/40">
                                  <FiPercent size={12} className="text-gray-500" />
                                  <input
                                    type="number" min="0" max="100"
                                    value={layers[activeLayerIndex].layerRarity.toString()}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      updateLayerRarityValue(activeLayerIndex, Math.min(100, Math.max(0, value)));
                                    }}
                                    className="w-12 bg-transparent text-white font-mono text-xs text-right focus:outline-none"
                                  />
                                  <span className="text-xs text-gray-500 font-mono">%</span>
                                </div>
                                <button
                                  onClick={() => removeLayer(activeLayerIndex)}
                                  aria-label="Delete layer"
                                  className="p-1.5 rounded-lg border border-gray-800 text-gray-500 hover:text-white hover:border-white/40 transition-colors"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="flex border-b border-gray-800 mt-4 -mx-4 sm:-mx-5 px-4 sm:px-5">
                              <button
                                onClick={() => setActiveTraitTab('traits')}
                                className={`pb-3 px-3 -mb-px text-xs font-mono uppercase tracking-tight transition-colors flex items-center gap-2 ${activeTraitTab === 'traits' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white border-b-2 border-transparent'}`}
                              >
                                <FiImage size={12} /> Traits ({layers[activeLayerIndex]?.images.length || 0})
                              </button>
                              <button
                                onClick={() => setActiveTraitTab('rarity')}
                                className={`pb-3 px-3 -mb-px text-xs font-mono uppercase tracking-tight transition-colors flex items-center gap-2 ${activeTraitTab === 'rarity' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white border-b-2 border-transparent'}`}
                              >
                                <FiPercent size={12} /> Rarity
                              </button>
                            </div>

                            <input
                              type="file"
                              accept="image/png"
                              multiple
                              className="hidden"
                              onChange={(e) => { handleImageUpload(activeLayerIndex, e); setCurrentStep(2); }}
                              ref={(el) => { fileInputRefs.current[activeLayerIndex] = el; }}
                            />
                          </div>

                          {activeTraitTab === 'traits' && (
                            layers[activeLayerIndex]?.images.length === 0 ? (
                              <div
                                onClick={() => fileInputRefs.current[activeLayerIndex]?.click()}
                                className="bg-black/60 backdrop-blur-xl border-2 border-dashed border-gray-700 hover:border-white/60 rounded-xl p-12 text-center cursor-pointer transition-colors"
                              >
                                <FiUpload className="mx-auto text-gray-500 mb-3" size={28} />
                                <p className="text-sm text-white font-mono font-bold tracking-tight">Drop PNG files or click to upload</p>
                                <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">Max 2MB per image</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {layers[activeLayerIndex]?.images.map((image, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="group relative bg-black/60 border border-gray-800/60 hover:border-white/60 rounded-xl overflow-hidden transition-colors"
                                  >
                                    <div className="aspect-square bg-black/40 flex items-center justify-center">
                                      <img src={image.preview} alt={image.name} className="w-full h-full object-contain p-3" />
                                    </div>
                                    <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-gray-800/60">
                                      <input
                                        type="text"
                                        value={image.name}
                                        onChange={(e) => updateImageName(activeLayerIndex, imgIndex, e.target.value)}
                                        className="flex-1 min-w-0 bg-transparent text-white font-mono text-xs focus:outline-none truncate"
                                      />
                                      <span className="text-[10px] text-gray-500 font-mono shrink-0">{image.rarity}%</span>
                                    </div>
                                    <button
                                      onClick={() => removeImage(activeLayerIndex, imgIndex)}
                                      aria-label="Remove trait"
                                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-gray-400 hover:text-white border border-gray-800 hover:border-white/60 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <FiTrash2 size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )
                          )}

                          {activeTraitTab === 'rarity' && (
                            <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-4 sm:p-5 space-y-3">
                              {(() => {
                                const total = layers[activeLayerIndex]?.images.reduce((sum, img) => sum + img.rarity, 0) || 0;
                                const isValid = total === 100;
                                return (
                                  <div className="p-3 bg-black/40 border border-gray-800/60 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">Total rarity</span>
                                      <span className={`text-xs font-mono font-bold ${isValid ? 'text-white' : 'text-gray-500'}`}>
                                        {total}% {!isValid && <span className="text-gray-600 ml-1 normal-case tracking-normal">(should equal 100%)</span>}
                                      </span>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${isValid ? 'bg-white' : 'bg-gray-500'}`}
                                        style={{ width: `${Math.min(100, total)}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })()}

                              {layers[activeLayerIndex]?.images.map((image, imgIndex) => (
                                <div key={imgIndex} className="flex items-center gap-3 p-2.5 bg-black/40 border border-gray-800/60 rounded-lg">
                                  <div className="w-9 h-9 bg-black/40 rounded-md overflow-hidden border border-gray-800 shrink-0">
                                    <img src={image.preview} alt={image.name} className="w-full h-full object-contain" />
                                  </div>
                                  <span className="flex-1 min-w-0 text-sm text-white font-mono truncate">{image.name}</span>
                                  <input
                                    type="number" min="0" max="100"
                                    value={image.rarity}
                                    onChange={(e) => updateRarity(activeLayerIndex, imgIndex, (parseInt(e.target.value) || 0).toString())}
                                    className="w-14 bg-black/60 border border-gray-800/60 rounded-md px-2 py-1 text-white font-mono text-xs text-right focus:outline-none focus:border-white/60 transition-colors"
                                  />
                                  <span className="text-xs text-gray-500 font-mono">%</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => { generateBatchPreviews(); setCurrentStep(4); }}
                              disabled={layers.length === 0 || layers.some(l => l.images.length === 0) || isGeneratingPreviews}
                              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                            >
                              {isGeneratingPreviews ? <><FaSpinner className="animate-spin" size={12} /> Generating…</> : <><FaFileImage size={12} /> Generate NFTs</>}
                            </button>
                          </div>
                        </>
                      )
                    )}

                    {currentStep === 4 && (
                      <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-4 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <FaFileImage className="text-white" size={14} />
                            <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                              Generated · <span className="text-gray-500">{previews.length}</span>
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => generateBatchPreviews()}
                              disabled={isGeneratingPreviews || layers.length === 0}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-gray-400 bg-transparent text-gray-300 text-xs font-mono uppercase tracking-tight hover:bg-white hover:text-black hover:border-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGeneratingPreviews ? <FaSpinner className="animate-spin" size={11} /> : <FiSliders size={12} />}
                              Re-roll
                            </button>
                            <button
                              onClick={() => setCurrentStep(5)}
                              disabled={previews.length === 0}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                            >
                              <FaFileDownload size={11} /> Export
                            </button>
                          </div>
                        </div>

                        {previews.length === 0 ? (
                          <div className="py-16 text-center">
                            <FaFileImage className="mx-auto text-gray-700 mb-3" size={32} />
                            <p className="text-sm text-white font-mono font-bold tracking-tight mb-1">No NFTs generated yet</p>
                            <p className="text-xs text-gray-500 font-mono mb-4">Add layers + traits, then hit Generate.</p>
                            <button
                              onClick={() => { generateBatchPreviews(); }}
                              disabled={layers.length === 0 || layers.some(l => l.images.length === 0) || isGeneratingPreviews}
                              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-white text-black text-sm font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                            >
                              {isGeneratingPreviews ? <><FaSpinner className="animate-spin" size={12} /> Generating…</> : <><FaFileImage size={12} /> Generate NFTs</>}
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {previews.map((preview, idx) => (
                              <div key={preview.id} className="group relative bg-black/40 border border-gray-800/60 hover:border-white/60 rounded-xl overflow-hidden transition-colors">
                                <div className="aspect-square flex items-center justify-center">
                                  {preview.images.length > 0 ? (
                                    <img src={preview.images[0]} alt={`#${idx + 1}`} className="w-full h-full object-contain" />
                                  ) : (
                                    <FaSpinner className="animate-spin text-gray-500" />
                                  )}
                                </div>
                                <div className="px-3 py-2 border-t border-gray-800/60 flex items-center justify-between">
                                  <span className="text-xs text-white font-mono truncate">{itemPrefix ? `${itemPrefix}-${idx + 1}` : `NFT-${idx + 1}`}</span>
                                  <button
                                    onClick={() => downloadPreview(preview)}
                                    aria-label="Download NFT"
                                    className="p-1 rounded text-gray-500 hover:text-white transition-colors"
                                  >
                                    <FiDownload size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-5 sm:p-6">
                        <div className="flex items-center gap-2 mb-5">
                          <FaFileDownload className="text-white" size={14} />
                          <h2 className="text-lg font-bold text-white font-mono tracking-tight">Export Collection</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm font-mono mb-5">
                          <div className="p-3 bg-black/40 border border-gray-800/60 rounded-lg">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Collection</div>
                            <div className="text-white truncate">{collectionName || '—'}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-gray-800/60 rounded-lg">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Pieces</div>
                            <div className="text-white">{previews.length}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-gray-800/60 rounded-lg">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Dimensions</div>
                            <div className="text-white">{width} × {height}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-gray-800/60 rounded-lg">
                            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Cost</div>
                            <div className="text-white">{baseAmount} $PEDRO</div>
                          </div>
                        </div>

                        <button
                          onClick={handleDownloadWithPayment}
                          disabled={previews.length === 0 || isProcessingPayment || isGeneratingPreviews}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-white text-black text-sm font-mono uppercase tracking-tight hover:bg-black hover:text-white hover:border-white transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-black disabled:hover:border-black"
                        >
                          {isProcessingPayment ? <><FaSpinner className="animate-spin" size={14} /> Processing payment…</> : <><FiDownload size={14} /> Download all ({previews.length} NFTs)</>}
                        </button>

                        {hasPaid && (
                          <p className="text-xs text-center text-gray-500 font-mono mt-3 uppercase tracking-widest">Payment complete · Re-download anytime</p>
                        )}
                      </div>
                    )}
                  </main>
                </div>
              </DndProvider>

              {previews.length > 0 && (
                <div className="mt-6 bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <FiImage size={12} className="text-gray-500" />
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Live Previews · {previews.length}</span>
                    </div>
                    {currentStep !== 4 && (
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="text-[10px] text-gray-400 hover:text-white font-mono uppercase tracking-widest transition-colors"
                      >
                        View all →
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {previews.slice(0, 32).map((preview, idx) => (
                      <button
                        key={preview.id}
                        onClick={() => downloadPreview(preview)}
                        title={`Download ${itemPrefix ? `${itemPrefix}-${idx + 1}` : `NFT-${idx + 1}`}`}
                        className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-800/60 hover:border-white/60 overflow-hidden bg-black/40 transition-colors"
                      >
                        {preview.images[0] && (
                          <img src={preview.images[0]} alt={`#${idx + 1}`} className="w-full h-full object-contain" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} width={width} height={height} className="hidden" />
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
                <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-tight">Payment Required</h3>
                <p className="text-white/70">{modalMessage}</p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
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
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent origin-left"
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
                  <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-tight">Processing Payment</h3>
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
              <h3 className="text-xl font-bold text-white mb-6 font-mono tracking-tight">Preparing Download</h3>
              
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

        <style jsx global>{`
          @keyframes sparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(2) rotate(180deg); opacity: 0; }
          }

          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }

          @keyframes grid {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          .sparkle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle 1.5s ease-out forwards, float 4s ease-in-out infinite;
            z-index: 30;
            filter: blur(1px);
          }

          .bg-grid-animation {
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid 20s linear infinite;
          }

          body {
            background-color: #000;
            overflow-x: hidden;
          }

          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #000;
          }

          ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
        `}</style>
      </>
    </WalletAuthGuard>
  );
}