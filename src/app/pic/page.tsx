'use client';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { motion, PanInfo } from 'framer-motion';
import Image from 'next/image';

const stickers = Array.from({ length: 12 }, (_, i) => `/${i + 1}.png`);

interface StickerElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export default function PedroDesignStudio() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'sticker' | null>(null);
  const [stickerElements, setStickerElements] = useState<StickerElement[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [baseStickerSize, setBaseStickerSize] = useState(96);
  const [activeHandle, setActiveHandle] = useState<'resize' | 'rotate' | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isImageSelected, setIsImageSelected] = useState(false);
  const lastTouchDistance = useRef<number | null>(null);

  // Add keyboard shortcuts for resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSticker) return;
      
      const scaleFactor = e.shiftKey ? 10 : 5;

      if (e.key === '+') {
        setStickerElements(stickerElements.map(item => 
          item.id === selectedSticker ? { 
            ...item, 
            width: Math.min(500, item.width + scaleFactor),
            height: Math.min(500, item.height + scaleFactor)
          } : item
        ));
      } else if (e.key === '-') {
        setStickerElements(stickerElements.map(item => 
          item.id === selectedSticker ? { 
            ...item, 
            width: Math.max(30, item.width - scaleFactor),
            height: Math.max(30, item.height - scaleFactor)
          } : item
        ));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSticker, stickerElements]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedSticker(null);
      setIsImageSelected(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const containerWidth = canvasRef.current?.parentElement?.clientWidth || 800;
          const containerHeight = window.innerHeight * 0.7;
          
          const scale = Math.min(
            containerWidth / img.naturalWidth,
            containerHeight / img.naturalHeight,
            1
          );
          
          const displayWidth = img.naturalWidth * scale;
          const displayHeight = img.naturalHeight * scale;
          
          const avgDimension = (img.naturalWidth + img.naturalHeight) / 2;
          const calculatedSize = Math.max(48, Math.min(150, avgDimension * 0.1));
          
          setBaseStickerSize(calculatedSize);
          setOriginalDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          setDisplayDimensions({
            width: displayWidth,
            height: displayHeight
          });
          setUploadedImage(event.target?.result as string);
          setSelectedSticker(null);
          setImageScale(1);
          setImagePosition({ x: 0, y: 0 });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageResize = (info: PanInfo, corner: string) => {
    const minScale = 0.3;
    const maxScale = 3;
    const sensitivity = 0.005;
    
    setImageScale(prev => {
      let scaleChange = 0;
      
      if (corner.includes('right')) {
        scaleChange = info.delta.x * sensitivity;
      } else if (corner.includes('left')) {
        scaleChange = -info.delta.x * sensitivity;
      }
      
      if (corner.includes('bottom')) {
        scaleChange += info.delta.y * sensitivity;
      } else if (corner.includes('top')) {
        scaleChange += -info.delta.y * sensitivity;
      }
      
      return Math.min(maxScale, Math.max(minScale, prev + scaleChange));
    });
  };

  const handleImageDrag = (info: PanInfo) => {
    if (activeHandle) return;
    
    setImagePosition({
      x: imagePosition.x + info.delta.x,
      y: imagePosition.y + info.delta.y
    });
  };

  const handleAddSticker = (sticker: string) => {
    if (!canvasRef.current) return;
    
    const centerX = displayDimensions.width / 2;
    const centerY = displayDimensions.height / 2;
    
    let initialWidth, initialHeight;
    
    if (uploadedImage) {
      const scaleFactor = 0.3;
      initialWidth = displayDimensions.width * scaleFactor;
      initialHeight = displayDimensions.height * scaleFactor;
    } else {
      initialWidth = baseStickerSize;
      initialHeight = baseStickerSize;
    }

    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      src: sticker,
      x: centerX,
      y: centerY,
      width: initialWidth,
      height: initialHeight,
      rotation: 0
    };
    
    setStickerElements([...stickerElements, newSticker]);
    setSelectedSticker(newSticker.id);
    setActiveTool(null);
    setIsImageSelected(false);
  };

  const handleDragSticker = (id: string, info: PanInfo) => {
    if (activeHandle) return;
    
    setStickerElements(stickerElements.map(item => 
      item.id === id ? { 
        ...item, 
        x: info.point.x,
        y: info.point.y
      } : item
    ));
  };

  const handleResize = (id: string, info: PanInfo, corner: string) => {
    setStickerElements(stickerElements.map(item => {
      if (item.id !== id) return item;
      
      const minSize = 30;
      let newWidth = item.width;
      let newHeight = item.height;
      let newX = item.x;
      let newY = item.y;
      
      switch (corner) {
        case 'top-left':
          newWidth = Math.max(minSize, item.width - info.delta.x);
          newHeight = Math.max(minSize, item.height - info.delta.y);
          newX = item.x + (item.width - newWidth) / 2;
          newY = item.y + (item.height - newHeight) / 2;
          break;
        case 'top-right':
          newWidth = Math.max(minSize, item.width + info.delta.x);
          newHeight = Math.max(minSize, item.height - info.delta.y);
          newX = item.x - (newWidth - item.width) / 2;
          newY = item.y + (item.height - newHeight) / 2;
          break;
        case 'bottom-left':
          newWidth = Math.max(minSize, item.width - info.delta.x);
          newHeight = Math.max(minSize, item.height + info.delta.y);
          newX = item.x + (item.width - newWidth) / 2;
          newY = item.y - (newHeight - item.height) / 2;
          break;
        case 'bottom-right':
          newWidth = Math.max(minSize, item.width + info.delta.x);
          newHeight = Math.max(minSize, item.height + info.delta.y);
          newX = item.x - (newWidth - item.width) / 2;
          newY = item.y - (newHeight - item.height) / 2;
          break;
      }

      return { 
        ...item, 
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      };
    }));
  };

  const handleRotate = (id: string, centerX: number, centerY: number, mouseX: number, mouseY: number) => {
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
    setStickerElements(stickerElements.map(item => 
      item.id === id ? { 
        ...item, 
        rotation: angle
      } : item
    ));
  };

  const handleHandleDrag = (id: string, info: PanInfo, handleType: 'resize' | 'rotate', corner?: string) => {
    if (handleType === 'resize' && corner) {
      handleResize(id, info, corner);
    } else if (handleType === 'rotate') {
      const sticker = stickerElements.find(item => item.id === id);
      if (!sticker) return;
      handleRotate(id, sticker.x, sticker.y, info.point.x, info.point.y);
    }
  };

  const handleTouch = (id: string, e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (lastTouchDistance.current) {
        const scale = distance / lastTouchDistance.current;
        const sticker = stickerElements.find(item => item.id === id);
        if (sticker) {
          setStickerElements(stickerElements.map(item => 
            item.id === id ? { 
              ...item, 
              width: Math.max(30, Math.min(800, item.width * scale)),
              height: Math.max(30, Math.min(800, item.height * scale))
            } : item
          ));
        }
      }
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    lastTouchDistance.current = null;
  };

  const handleDownload = async () => {
    if (!canvasRef.current || !uploadedImage) return;
    
    setIsDownloading(true);
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalDimensions.width;
      tempCanvas.height = originalDimensions.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      const img = new window.Image();
      img.src = uploadedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const scaledWidth = originalDimensions.width * imageScale;
      const scaledHeight = originalDimensions.height * imageScale;
      const offsetX = (originalDimensions.width - scaledWidth) / 2 + (imagePosition.x * (originalDimensions.width / displayDimensions.width));
      const offsetY = (originalDimensions.height - scaledHeight) / 2 + (imagePosition.y * (originalDimensions.height / displayDimensions.height));
      
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      await Promise.all(stickerElements.map(async (item) => {
        const stickerImg = new window.Image();
        stickerImg.src = item.src;
        await new Promise((resolve) => {
          stickerImg.onload = resolve;
        });
        
        const scaleFactor = originalDimensions.width / displayDimensions.width;
        const originalX = item.x * scaleFactor;
        const originalY = item.y * scaleFactor;
        const originalWidth = item.width * scaleFactor;
        const originalHeight = item.height * scaleFactor;
        
        ctx.save();
        ctx.translate(originalX, originalY);
        ctx.rotate(item.rotation * Math.PI / 180);
        ctx.drawImage(
          stickerImg,
          -originalWidth / 2,
          -originalHeight / 2,
          originalWidth,
          originalHeight
        );
        ctx.restore();
      }));

      const link = document.createElement('a');
      link.download = 'pedro-meme.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const removeElement = (id: string) => {
    setStickerElements(stickerElements.filter(item => item.id !== id));
    if (selectedSticker === id) {
      setSelectedSticker(null);
    }
  };

  return (
    <>
      <Head>
        <title>Pedro MEME Studio</title>
        <meta name="description" content="Create your own Pedro designs" />
        <meta property="og:image" content="/pedro-social-preview.jpg" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .sticker-handle {
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #facc15;
            border: 2px solid black;
            box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
            cursor: pointer;
            z-index: 100;
          }
          .image-handle {
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #facc15;
            border: 2px solid black;
            cursor: pointer;
            z-index: 100;
          }
          .sticker-handle:hover, .image-handle:hover {
            transform: scale(1.3);
          }
          .resize-handle-tl {
            left: -8px;
            top: -8px;
            cursor: nwse-resize;
          }
          .resize-handle-tr {
            right: -8px;
            top: -8px;
            cursor: nesw-resize;
          }
          .resize-handle-bl {
            left: -8px;
            bottom: -8px;
            cursor: nesw-resize;
          }
          .resize-handle-br {
            right: -8px;
            bottom: -8px;
            cursor: nwse-resize;
          }
          .rotate-handle {
            left: 50%;
            bottom: -24px;
            transform: translateX(-50%);
            background: #3b82f6;
            cursor: grab;
          }
          .delete-button {
            position: absolute;
            right: -10px;
            top: -10px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            color: black;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            z-index: 100;
          }
          .delete-button:hover {
            background: #ef4444;
            color: white;
            transform: scale(1.2);
          }
          .sticker-outline, .image-outline {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 2px dashed rgba(255, 255, 255, 0.7);
            pointer-events: none;
          }
        `}</style>
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0">
            <Image
              src="/wallpaper4.png"
              alt="Background texture"
              fill
              priority
              style={{
                objectFit: 'cover',
                opacity: 0.2,
                mixBlendMode: 'overlay'
              }}
            />
          </div>
        </div>

        <div className="relative z-10">
          <motion.header 
            className="border-b border-white/10 py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="container mx-auto px-6 flex justify-between items-center">
              <motion.h1 
                className="text-2xl md:text-3xl font-bold tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                PEDRO MEME STUDIO
              </motion.h1>
              <motion.button 
                onClick={handleDownload}
                disabled={!uploadedImage || isDownloading}
                className="border border-white/30 px-6 py-2 text-sm hover:bg-white hover:text-black transition-all duration-300 hover:shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: uploadedImage && !isDownloading ? 1.05 : 1 }}
                whileTap={{ scale: uploadedImage && !isDownloading ? 0.95 : 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {isDownloading ? 'PROCESSING...' : 'DOWNLOAD MEME'}
              </motion.button>
            </div>
          </motion.header>

          <motion.div 
            className="container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="w-full md:w-80 space-y-6"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div 
                className="p-4 border border-white/10 rounded-lg bg-black/50 backdrop-blur-sm"
                whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm uppercase tracking-wider mb-3 opacity-70">Upload Image</h2>
                <label className="block w-full cursor-pointer">
                  <div className="border border-white/10 hover:border-white/30 transition-colors rounded p-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm">Click to upload image</span>
                      <span className="text-xs opacity-50">PNG, JPG, JPEG</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              </motion.div>

              <motion.div 
                className="p-4 border border-white/10 rounded-lg bg-black/50 backdrop-blur-sm"
                whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-sm uppercase tracking-wider mb-3 opacity-70">Add Stickers</h2>
                <div className="space-y-4">
                  <motion.div layout className="space-y-2">
                    <motion.button
                      onClick={() => setActiveTool(activeTool === 'sticker' ? null : 'sticker')}
                      className={`w-full py-3 text-left px-4 text-sm border ${activeTool === 'sticker' ? 'border-white bg-white/10' : 'border-white/10'} hover:border-white transition-all duration-300 rounded flex items-center justify-between`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span>Sticker Library ({stickers.length})</span>
                      <motion.span
                        animate={{ rotate: activeTool === 'sticker' ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs"
                      >
                        ▼
                      </motion.span>
                    </motion.button>

                    {activeTool === 'sticker' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="h-64 overflow-y-auto pr-2 custom-scrollbar">
                          <div className="grid grid-cols-3 gap-3">
                            {stickers.map((sticker, index) => (
                              <motion.button
                                key={index}
                                onClick={() => handleAddSticker(sticker)}
                                className="p-1 border border-white/10 hover:border-white transition-all duration-300 rounded bg-black/50 aspect-square overflow-hidden group relative"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <img 
                                  src={sticker} 
                                  alt={`Sticker ${index + 1}`} 
                                  className="w-full h-full object-contain transition-transform group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex-1 flex justify-center"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div 
                ref={canvasRef}
                className="relative bg-black/50 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm"
                style={{
                  width: `${displayDimensions.width}px`,
                  height: `${displayDimensions.height}px`,
                  minWidth: uploadedImage ? `${displayDimensions.width}px` : '500px',
                  minHeight: uploadedImage ? `${displayDimensions.height}px` : '500px'
                }}
                onClick={handleCanvasClick}
                whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                {uploadedImage && (
                  <motion.div
                    className="absolute inset-0 origin-center"
                    style={{
                      scale: imageScale,
                      x: imagePosition.x,
                      y: imagePosition.y,
                      zIndex: isImageSelected ? 5 : 0
                    }}
                    drag
                    dragConstraints={canvasRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={(e, info) => handleImageDrag(info)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsImageSelected(true);
                      setSelectedSticker(null);
                    }}
                  >
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded content" 
                      className="w-full h-full object-contain"
                    />
                    
                    {isImageSelected && (
                      <>
                        <div className="image-outline" />
                        
                        <motion.div
                          className="image-handle resize-handle-tl"
                          drag
                          dragConstraints={canvasRef}
                          dragElastic={0}
                          onDragStart={() => setActiveHandle('resize')}
                          onDragEnd={() => setActiveHandle(null)}
                          onDrag={(e, info) => handleImageResize(info, 'top-left')}
                        />
                        
                        <motion.div
                          className="image-handle resize-handle-tr"
                          drag
                          dragConstraints={canvasRef}
                          dragElastic={0}
                          onDragStart={() => setActiveHandle('resize')}
                          onDragEnd={() => setActiveHandle(null)}
                          onDrag={(e, info) => handleImageResize(info, 'top-right')}
                        />
                        
                        <motion.div
                          className="image-handle resize-handle-bl"
                          drag
                          dragConstraints={canvasRef}
                          dragElastic={0}
                          onDragStart={() => setActiveHandle('resize')}
                          onDragEnd={() => setActiveHandle(null)}
                          onDrag={(e, info) => handleImageResize(info, 'bottom-left')}
                        />
                        
                        <motion.div
                          className="image-handle resize-handle-br"
                          drag
                          dragConstraints={canvasRef}
                          dragElastic={0}
                          onDragStart={() => setActiveHandle('resize')}
                          onDragEnd={() => setActiveHandle(null)}
                          onDrag={(e, info) => handleImageResize(info, 'bottom-right')}
                        />
                      </>
                    )}
                  </motion.div>
                )}

                {stickerElements.map((item) => (
                  <motion.div
                    key={item.id}
                    className="absolute cursor-move"
                    style={{ 
                      left: 0,
                      top: 0,
                      transform: `translate(${item.x}px, ${item.y}px)`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      zIndex: selectedSticker === item.id ? 100 : 1,
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSticker(item.id);
                      setIsImageSelected(false);
                    }}
                    onDoubleClick={() => {
                      setStickerElements(stickerElements.map(s => 
                        s.id === item.id ? { 
                          ...s, 
                          width: baseStickerSize,
                          height: baseStickerSize 
                        } : s
                      ));
                    }}
                    onTouchStart={(e) => handleTouch(item.id, e)}
                    onTouchMove={(e) => handleTouch(item.id, e)}
                    onTouchEnd={handleTouchEnd}
                    drag
                    dragConstraints={canvasRef}
                    dragElastic={0}
                    dragMomentum={false}
                    onDrag={(e, info) => handleDragSticker(item.id, info)}
                  >
                    <div className="relative w-full h-full">
                      {selectedSticker === item.id && (
                        <>
                          <div className="sticker-outline" />
                          <button 
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(item.id);
                            }}
                          >
                            ×
                          </button>
                          
                          {/* Resize Handles */}
                          <motion.div
                            className="sticker-handle resize-handle-tl"
                            drag
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            onDragStart={() => setActiveHandle('resize')}
                            onDragEnd={() => setActiveHandle(null)}
                            onDrag={(e, info) => handleHandleDrag(item.id, info, 'resize', 'top-left')}
                          />
                          
                          <motion.div
                            className="sticker-handle resize-handle-tr"
                            drag
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            onDragStart={() => setActiveHandle('resize')}
                            onDragEnd={() => setActiveHandle(null)}
                            onDrag={(e, info) => handleHandleDrag(item.id, info, 'resize', 'top-right')}
                          />
                          
                          <motion.div
                            className="sticker-handle resize-handle-bl"
                            drag
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            onDragStart={() => setActiveHandle('resize')}
                            onDragEnd={() => setActiveHandle(null)}
                            onDrag={(e, info) => handleHandleDrag(item.id, info, 'resize', 'bottom-left')}
                          />
                          
                          <motion.div
                            className="sticker-handle resize-handle-br"
                            drag
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            onDragStart={() => setActiveHandle('resize')}
                            onDragEnd={() => setActiveHandle(null)}
                            onDrag={(e, info) => handleHandleDrag(item.id, info, 'resize', 'bottom-right')}
                          />
                          
                          {/* Rotate Handle */}
                          <motion.div
                            className="sticker-handle rotate-handle"
                            drag
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            onDragStart={() => setActiveHandle('rotate')}
                            onDragEnd={() => setActiveHandle(null)}
                            onDrag={(e, info) => handleHandleDrag(item.id, info, 'rotate')}
                          />
                        </>
                      )}
                      <motion.img 
                        src={item.src} 
                        alt="Sticker" 
                        className="w-full h-full object-contain drop-shadow-lg pointer-events-none"
                        style={{ 
                          transform: `rotate(${item.rotation}deg)`,
                          filter: selectedSticker === item.id ? 
                            'drop-shadow(0 0 8px rgba(255,255,255,0.7))' : 
                            'drop-shadow(0 0 4px rgba(0,0,0,0.5))'
                        }}
                      />
                    </div>
                  </motion.div>
                ))}

                {!uploadedImage && stickerElements.length === 0 && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center text-white/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p>Upload an image or add stickers to start designing</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}