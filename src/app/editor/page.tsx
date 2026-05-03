'use client';
import { useState, useRef, useEffect } from 'react';
import Head from "next/head";
import Image from "next/image";
import Button from '@/components/basic_button';
import { motion } from "framer-motion";

interface Layer {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  naturalWidth: number;
  naturalHeight: number;
  isBackground?: boolean;
}

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

export default function ImageEditor() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialLayerPos, setInitialLayerPos] = useState({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0, 
    rotate: 0,
    startAngle: 0 
  });
  const [showStickers, setShowStickers] = useState(true);
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);

  const stickers = [
    '/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png',
    '/7.png', '/8.png', '/9.png', '/10.png', '/11.png', '/12.png',
    '/13.png', '/14.png', '/15.png', '/16.png', '/17.png', '/18.png', 
    '/19.png', '/20.png', '/21.png', '/22.png', '/23.png', '/24.png', 
    '/25.png', '/26.png', '/27.png', '/28.png', '/29.png', '/30.png', 
    '/31.png', '/32.png', '/33.png', 
  ];

  const createLayer = (url: string, x: number, y: number, width?: number, isBackground = false) => {
    const img = new window.Image();
    img.src = url;
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;

      if (isBackground) {
        if (canvasRef.current) {
          const canvasWidth = canvasRef.current.clientWidth;
          const canvasHeight = canvasRef.current.clientHeight;
          const imgRatio = img.width / img.height;
          const canvasRatio = canvasWidth / canvasHeight;
          
          if (imgRatio > canvasRatio) {
            newHeight = canvasHeight;
            newWidth = canvasHeight * imgRatio;
          } else {
            newWidth = canvasWidth;
            newHeight = newWidth / imgRatio;
          }
        } else {
          newWidth = img.width;
          newHeight = img.height;
        }
      } else {
        newWidth = width || Math.min(300, img.width);
        newHeight = newWidth / aspectRatio;
      }

      const newLayer: Layer = {
        id: Math.random().toString(36).substring(2, 9),
        url: url,
        x: isBackground ? (canvasRef.current ? (canvasRef.current.clientWidth - newWidth) / 2 : 0) : x - newWidth / 2,
        y: isBackground ? (canvasRef.current ? (canvasRef.current.clientHeight - newHeight) / 2 : 0) : y - newHeight / 2,
        width: newWidth,
        height: newHeight,
        rotate: 0,
        naturalWidth: img.width,
        naturalHeight: img.height,
        isBackground: isBackground
      };

      if (isBackground) {
        setLayers(prev => [
          newLayer,
          ...prev.filter(l => !l.isBackground)
        ]);
      } else {
        setLayers(prev => [...prev, newLayer]);
      }
      setActiveLayerId(isBackground ? null : newLayer.id);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (canvasRef.current && event.target?.result) {
          createLayer(event.target.result as string, 0, 0, undefined, true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (canvasRef.current && event.target?.result) {
          const rect = canvasRef.current.getBoundingClientRect();
          createLayer(event.target.result as string, rect.width / 2, rect.height / 2, 150);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStickerClick = (url: string) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      createLayer(url, rect.width / 2, rect.height / 2, 150);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, layerId: string, interactionType: 'move' | 'resize' | 'rotate' = 'move') => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) return;

    setActiveLayerId(layerId);
    
    if (interactionType === 'resize') {
      setIsResizing(true);
    } else if (interactionType === 'rotate') {
      setIsRotating(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      setInitialLayerPos({ 
        ...layer,
        rotate: layer.rotate,
        startAngle
      });
    } else {
      setIsDragging(true);
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayerPos(prev => ({ 
      ...prev,
      x: layer.x, 
      y: layer.y, 
      width: layer.width, 
      height: layer.height,
      rotate: layer.rotate
    }));
  };

  const handleDoubleClick = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) return;

    setLayers(prev => {
      const layerIndex = prev.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prev;
      
      return [
        ...prev.slice(0, layerIndex),
        ...prev.slice(layerIndex + 1),
        prev[layerIndex]
      ];
    });
    setActiveLayerId(layerId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeLayerId || (!isDragging && !isResizing && !isRotating)) return;
    
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.isBackground) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    if (isDragging) {
      setLayers(prev =>
        prev.map(l =>
          l.id === activeLayerId
            ? { ...l, x: initialLayerPos.x + dx, y: initialLayerPos.y + dy }
            : l
        )
      );
    } else if (isResizing) {
      const aspectRatio = layer.naturalWidth / layer.naturalHeight;
      const newWidth = initialLayerPos.width + dx;
      const newHeight = newWidth / aspectRatio;
      
      setLayers(prev =>
        prev.map(l =>
          l.id === activeLayerId
            ? { 
                ...l, 
                width: newWidth, 
                height: newHeight,
                x: initialLayerPos.x - (newWidth - initialLayerPos.width) / 2,
                y: initialLayerPos.y - (newHeight - initialLayerPos.height) / 2
              }
            : l
        )
      );
    } else if (isRotating) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      
      const angleDiff = angle - (initialLayerPos.startAngle || 0);
      const newRotation = (initialLayerPos.rotate + angleDiff) % 360;
      
      setLayers(prev =>
        prev.map(l =>
          l.id === activeLayerId
            ? { ...l, rotate: newRotation }
            : l
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  const moveLayerForward = () => {
    if (!activeLayerId) return;
    
    setLayers(prev => {
      const layerIndex = prev.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1 || layerIndex === prev.length - 1) return prev;
      
      const newLayers = [...prev];
      const [layer] = newLayers.splice(layerIndex, 1);
      newLayers.splice(layerIndex + 1, 0, layer);
      
      return newLayers;
    });
  };

  const moveLayerBackward = () => {
    if (!activeLayerId) return;
    
    setLayers(prev => {
      const layerIndex = prev.findIndex(l => l.id === activeLayerId);
      if (layerIndex <= 0) return prev;
      
      const newLayers = [...prev];
      const [layer] = newLayers.splice(layerIndex, 1);
      newLayers.splice(layerIndex - 1, 0, layer);
      
      return newLayers;
    });
  };

  const bringLayerToFront = () => {
    if (!activeLayerId) return;
    
    setLayers(prev => {
      const layerIndex = prev.findIndex(l => l.id === activeLayerId);
      if (layerIndex === -1 || layerIndex === prev.length - 1) return prev;
      
      const newLayers = [...prev];
      const [layer] = newLayers.splice(layerIndex, 1);
      newLayers.push(layer);
      
      return newLayers;
    });
  };

  const sendLayerToBack = () => {
    if (!activeLayerId) return;
    
    setLayers(prev => {
      const layerIndex = prev.findIndex(l => l.id === activeLayerId);
      if (layerIndex <= 0) return prev;
      
      const newLayers = [...prev];
      const [layer] = newLayers.splice(layerIndex, 1);
      newLayers.unshift(layer);
      
      const bgIndex = newLayers.findIndex(l => l.isBackground);
      if (bgIndex > 0) {
        const [bgLayer] = newLayers.splice(bgIndex, 1);
        newLayers.unshift(bgLayer);
      }
      
      return newLayers;
    });
  };

  const deleteActiveLayer = () => {
    if (activeLayerId) {
      setLayers(prev => prev.filter(layer => layer.id !== activeLayerId));
      setActiveLayerId(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, layerId: string, interactionType: 'move' | 'resize' | 'rotate' = 'move') => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseDown({
      clientX: touch.clientX,
      clientY: touch.clientY,
      stopPropagation: () => e.stopPropagation(),
      currentTarget: e.currentTarget
    } as unknown as React.MouseEvent, layerId, interactionType);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => e.preventDefault(),
      currentTarget: e.currentTarget
    } as unknown as React.MouseEvent);
  };

  const saveImage = async () => {
    if (layers.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const backgroundLayer = layers.find(layer => layer.isBackground);
    
    if (backgroundLayer) {
      canvas.width = backgroundLayer.naturalWidth;
      canvas.height = backgroundLayer.naturalHeight;
    } else {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    try {
      if (backgroundLayer) {
        const bgImg = await loadImage(backgroundLayer.url);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      }

      for (const layer of layers.filter(l => !l.isBackground)) {
        const img = await loadImage(layer.url);
        
        ctx.save();
        
        let drawX, drawY, drawWidth, drawHeight;
        if (backgroundLayer) {
          const scaleX = canvas.width / backgroundLayer.width;
          const scaleY = canvas.height / backgroundLayer.height;
          drawX = (layer.x - backgroundLayer.x) * scaleX;
          drawY = (layer.y - backgroundLayer.y) * scaleY;
          drawWidth = layer.width * scaleX;
          drawHeight = layer.height * scaleY;
        } else {
          drawX = layer.x;
          drawY = layer.y;
          drawWidth = layer.width;
          drawHeight = layer.height;
        }
        
        ctx.translate(drawX + drawWidth / 2, drawY + drawHeight / 2);
        ctx.rotate((layer.rotate * Math.PI) / 180);
        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );
        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'pedro-creator.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && activeLayerId) {
        deleteActiveLayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayerId]);

  return (
    <>
      <Head>
        <title>Pedro | Meme Creator</title>
        <meta name="description" content="Create your own memes with the Pedro meme creator" />
        <meta property="og:image" content="/pedro-social-preview.jpg" />
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
          <section className="flex items-center justify-center py-16 sm:py-20 text-center relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="px-6 max-w-4xl relative z-10"
              >
                <motion.h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-mono mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  PEDRO EDIT
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.2, duration: 1.2, ease: "circOut" }}
                  className="h-px w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-6"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-mono"
                >
                  CREATE YOUR UNIQUE MEMES
                </motion.p>
              </motion.div>
          </section>

          <div className='container mx-auto px-4 sm:px-5 py-8 sm:py-10 max-w-7xl'>
            <section className="px-3 sm:px-6 py-4 sm:py-6 bg-black/60 backdrop-blur-xl rounded-2xl border border-gray-800/60 shadow-2xl mb-3 sm:mb-5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-10 font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">HOW IT WORKS</h2>

              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-black/40 p-4 sm:p-5 rounded-2xl border border-gray-800/60 transition-colors duration-300 hover:border-white/40">
                  <h3 className="text-base sm:text-lg font-bold mb-3 text-white font-mono tracking-tight">Editing Features</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-300">
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">✓</span>
                      <span><strong className="text-white">Move:</strong> Click and drag any layer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">✓</span>
                      <span><strong className="text-white">Resize:</strong> Drag the corner handle</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">✓</span>
                      <span><strong className="text-white">Rotate:</strong> Drag the center handle or use slider</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">✓</span>
                      <span><strong className="text-white">Layer Order:</strong> Use layer controls in toolbar</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">✓</span>
                      <span><strong className="text-white">Pedro:</strong> Be yourself and share your daily photo!</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/40 p-4 sm:p-5 rounded-2xl border border-gray-800/60 transition-colors duration-300 hover:border-white/40">
                  <h3 className="text-base sm:text-lg font-bold mb-3 text-white font-mono tracking-tight">Monthly Contest</h3>
                  <ul className="space-y-2 text-sm sm:text-base text-gray-300">
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">★</span>
                      <span>Post with "GInjective" + <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-xs border border-gray-700">$INJ #Myself @injpedro</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">#</span>
                      <span>Max 2 entries per person (MONTHLY)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">$</span>
                      <span>Prize: <span className="font-bold text-white">1 $INJ + 100,000 $PEDRO</span></span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">@</span>
                      <span>Minimum 10 participants required</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-white/10 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 text-xs border border-gray-700">~</span>
                      <span>New (RANDOM) winner every month!</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 bg-black/40 border border-gray-700/60 rounded-xl text-xs text-gray-400 font-mono">
                    <strong className="text-white">Important:</strong> Contest requires minimum 10 unique participants to be valid
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          <div className="container mx-auto px-4 sm:px-5 pb-16 max-w-7xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-gray-800/60 shadow-lg w-full md:w-20 lg:w-24 transition-all duration-300 hover:border-white/30">
                <div className="flex md:hidden items-center justify-between space-x-2 overflow-x-auto py-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group p-2 rounded-lg flex flex-col items-center justify-center hover:bg-white/10 text-white transition-colors duration-200"
                    title="Add Background"
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center group-hover:bg-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </button>
                  
                  <button
                    onClick={saveImage}
                    disabled={layers.length === 0}
                    className={`group p-2 rounded-lg flex flex-col items-center justify-center ${layers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                    title="Download"
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${layers.length === 0 ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={deleteActiveLayer}
                    disabled={!activeLayerId}
                    className={`group p-2 rounded-lg flex flex-col items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                    title="Delete"
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${!activeLayerId ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={moveLayerForward}
                    disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) === layers.length - 1}
                    className={`group p-2 rounded-lg flex flex-col items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                    title="Move Forward"
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${!activeLayerId ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setLayers([])}
                    disabled={layers.length === 0}
                    className={`group p-2 rounded-lg flex flex-col items-center justify-center ${layers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                    title="Delete All"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${layers.length === 0 ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'} transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="hidden md:flex flex-col items-center space-y-4">
                  <div className="text-center mb-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest font-mono">Tools</h2>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group p-3 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 text-white transition-colors duration-200"
                    title="Add Background Image"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs mt-1 hidden lg:block">Background</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={saveImage}
                    disabled={layers.length === 0}
                    className={`group p-3 rounded-xl flex flex-col items-center justify-center ${layers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'} transition-colors duration-200`}
                    title="Download"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${layers.length === 0 ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'} transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </div>
                    <span className="text-xs mt-1 hidden lg:block">Download</span>
                  </button>

                  <button
                    onClick={deleteActiveLayer}
                    disabled={!activeLayerId}
                    className={`group p-3 rounded-xl flex flex-col items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'} transition-colors duration-200`}
                    title="Delete"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${!activeLayerId ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'} transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="text-xs mt-1 hidden lg:block">Delete</span>
                  </button>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>

                  <div className="grid grid-cols-2 gap-2 w-full px-2">
                    <button
                      onClick={moveLayerForward}
                      disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) === layers.length - 1}
                      className={`p-2 rounded-lg flex items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                      title="Move Forward"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={moveLayerBackward}
                      disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) <= 0}
                      className={`p-2 rounded-lg flex items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                      title="Move Backward"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={bringLayerToFront}
                      disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) === layers.length - 1}
                      className={`p-2 rounded-lg flex items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                      title="Bring to Front"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>

                    <button
                      onClick={sendLayerToBack}
                      disabled={!activeLayerId || layers.findIndex(l => l.id === activeLayerId) <= 0}
                      className={`p-2 rounded-lg flex items-center justify-center ${!activeLayerId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'}`}
                      title="Send to Back"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                  </div>

                  <div className="w-full px-4 pt-2">
                    <div className="text-xs text-gray-500 mb-1 font-mono uppercase tracking-wider">Rotate</div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={activeLayerId ? layers.find(l => l.id === activeLayerId)?.rotate || 0 : 0}
                      onChange={(e) => {
                        if (!activeLayerId) return;
                        setLayers(prev =>
                          prev.map(layer =>
                            layer.id === activeLayerId
                              ? { ...layer, rotate: parseInt(e.target.value) }
                              : layer
                          )
                        );
                      }}
                      disabled={!activeLayerId}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50 accent-white"
                    />
                    <div className="text-xs text-gray-400 text-center mt-1 font-mono">
                      {activeLayerId ? `${Math.round(layers.find(l => l.id === activeLayerId)?.rotate || 0)}°` : '0°'}
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>

                  <button
                    onClick={() => setLayers([])}
                    disabled={layers.length === 0}
                    className={`group p-3 rounded-xl flex flex-col items-center justify-center ${layers.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-white'} transition-colors duration-200`}
                    title="Clear All"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${layers.length === 0 ? 'bg-white/5' : 'bg-white/10 group-hover:bg-white/20'} transition-colors duration-200`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-xs mt-1 hidden lg:block">Clear All</span>
                  </button>

                  <div className="flex-1"></div>
                  <div className="text-center pt-4 w-full">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-3"></div>
                    <span className="text-xs text-gray-500 font-mono">Pedro Pic Creator</span>
                    <span className="block text-xs text-gray-600 font-mono">v1.30</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-gray-800/60 shadow-lg transition-colors duration-300 hover:border-white/30">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">PEDRO THE RACCOON</h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setZoom(prev => Math.min(prev + 10, 200))}
                        disabled={zoom >= 200}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-gray-800 hover:border-white/40 disabled:opacity-50 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-300 font-mono">{zoom}%</span>
                      <button
                        onClick={() => setZoom(prev => Math.max(prev - 10, 50))}
                        disabled={zoom <= 50}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-gray-800 hover:border-white/40 disabled:opacity-50 transition-colors duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  ref={canvasRef}
                  className={`bg-black/60 backdrop-blur-xl p-1 sm:p-2 rounded-2xl border border-gray-800/60 shadow-lg flex-1 min-h-[500px] h-[40vh] relative overflow-hidden touch-none transition-colors duration-300 hover:border-white/30 ${
                    layers.length === 0 ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => layers.length === 0 && fileInputRef.current?.click()}
                  onTouchMove={handleTouchMove}
                  onMouseMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  onMouseUp={handleMouseUp}
                  onTouchCancel={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    transform: `scale(${zoom/100})`,
                    transformOrigin: 'center',
                  }}
                >
                  {layers.length === 0 ? (
                    <div className="absolute inset-0 border border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-black/30 p-2 text-center font-mono">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 sm:h-10 sm:w-10 mb-3 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm sm:text-base font-bold tracking-tight text-white">UPLOAD BACKGROUND</span>
                      <span className="text-xs mt-1 text-gray-500">or tap to select</span>
                    </div>
                  ) : (
                    layers.map((layer) => (
                      <div
                        key={layer.id}
                        className={`absolute ${activeLayerId === layer.id && !layer.isBackground ? 'ring-1 ring-white/80' : ''}`}
                        style={{
                          left: `${layer.x}px`,
                          top: `${layer.y}px`,
                          width: `${layer.width}px`,
                          height: `${layer.height}px`,
                          transform: `rotate(${layer.rotate}deg)`,
                          cursor: layer.isBackground ? 'default' : 'move',
                          touchAction: 'none',
                          transformOrigin: 'center',
                        }}
                        onDoubleClick={() => handleDoubleClick(layer.id)}
                        onTouchStart={layer.isBackground ? undefined : (e) => handleTouchStart(e, layer.id)}
                        onMouseDown={layer.isBackground ? undefined : (e) => handleMouseDown(e, layer.id)}
                      >
                        <img
                          src={layer.url}
                          alt={layer.isBackground ? "Background" : "Layer"}
                          className="w-full h-full object-contain select-none pointer-events-none"
                          draggable="false"
                        />
                        {activeLayerId === layer.id && !layer.isBackground && (
                          <>
                            <div
                              className="absolute bottom-0 right-0 w-5 h-5 bg-white cursor-nwse-resize rounded-full border border-black shadow-lg"
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                handleTouchStart(e, layer.id, 'resize');
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, layer.id, 'resize');
                              }}
                            />
                            <div
                              className="absolute top-1/2 left-1/2 w-5 h-5 bg-gray-300 cursor-grab rounded-full border border-black shadow-lg"
                              style={{
                                transform: `translate(-50%, -50%) rotate(${-layer.rotate}deg)`,
                              }}
                              onTouchStart={(e) => {
                                e.stopPropagation();
                                handleTouchStart(e, layer.id, 'rotate');
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleMouseDown(e, layer.id, 'rotate');
                              }}
                            />
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-gray-800/60 shadow-lg w-full md:w-80 lg:w-96 h-[800px] overflow-hidden flex flex-col transition-colors duration-300 hover:border-white/30">
                <div className="border-b border-gray-800/60">
                  <div className="flex">
                    <button
                      onClick={() => setShowStickers(true)}
                      className={`flex-1 py-3 px-4 text-center font-bold font-mono tracking-tight uppercase text-sm ${showStickers ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white border-b-2 border-transparent'} transition-colors duration-200`}
                    >
                      Stickers
                    </button>
                    <button
                      onClick={() => setShowStickers(false)}
                      className={`flex-1 py-3 px-4 text-center font-bold font-mono tracking-tight uppercase text-sm ${!showStickers ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-white border-b-2 border-transparent'} transition-colors duration-200`}
                    >
                      Layers
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {showStickers ? (
                    <>
                      <p className="text-xs text-gray-500 mb-4 font-mono uppercase tracking-wider">
                        Click on a sticker to add it to your canvas
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {stickers.map((sticker, index) => (
                          <div
                            key={index}
                            className="p-2 rounded-xl border border-gray-800/60 hover:border-white/40 hover:bg-white/5 cursor-pointer transition-colors duration-200 group"
                            onClick={() => handleStickerClick(sticker)}
                          >
                            <div className="aspect-square bg-black/40 rounded-lg overflow-hidden flex items-center justify-center">
                              <img
                                src={sticker}
                                alt={`Sticker ${index + 1}`}
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                                crossOrigin="anonymous"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      {layers.filter(l => !l.isBackground).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 font-mono text-sm">
                          No layers added yet
                        </div>
                      ) : (
                        [...layers].reverse().filter(l => !l.isBackground).map((layer, index) => (
                          <div
                            key={layer.id}
                            onClick={() => setActiveLayerId(layer.id)}
                            className={`p-3 rounded-xl flex items-center cursor-pointer ${activeLayerId === layer.id ? 'bg-white/10 border border-white/40' : 'hover:bg-white/5 border border-gray-800/60 hover:border-white/30'} transition-colors duration-200`}
                          >
                            <div className="w-10 h-10 bg-black/40 border border-gray-800 rounded-lg mr-3 overflow-hidden">
                              <img
                                src={layer.url}
                                alt="Layer thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate font-mono">Layer {layers.length - index}</p>
                              <p className="text-xs text-gray-500 font-mono">{Math.round(layer.width)} × {Math.round(layer.height)}</p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLayers(prev => prev.filter(l => l.id !== layer.id));
                                if (activeLayerId === layer.id) setActiveLayerId(null);
                              }}
                              className="p-1 text-gray-500 hover:text-white transition-colors duration-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-800/60 text-center">
                  <button
                    onClick={() => stickerFileInputRef.current?.click()}
                    className="w-full px-6 py-3 border-2 border-gray-400 bg-transparent text-gray-300 text-sm font-mono uppercase tracking-tight hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                  >
                    Upload Sticker
                  </button>
                  <input
                    type="file"
                    ref={stickerFileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleStickerUpload}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </>
  );
}