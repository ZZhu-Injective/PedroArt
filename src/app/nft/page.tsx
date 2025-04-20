'use client';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Image from 'next/image';

const stickers = Array.from({ length: 15 }, (_, i) => `/${i + 1}.png`);

export default function PedroDesignStudio() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'sticker' | null>(null);
  const [stickerElements, setStickerElements] = useState<Array<{id: string, src: string, x: number, y: number, size: number}>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{type: string, id: string} | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const containerWidth = canvasRef.current?.clientWidth || 800;
          const scale = Math.min(1, containerWidth / img.naturalWidth);
          setCurrentScale(scale);
          
          setOriginalDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
          setUploadedImage(event.target?.result as string);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSticker = (sticker: string) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      src: sticker,
      x: 100,
      y: 100,
      size: 96
    };
    setStickerElements([...stickerElements, newSticker]);
    setActiveTool(null);
  };

  const handleMouseDown = (e: React.MouseEvent, type: string, id: string) => {
    setIsDragging(true);
    setDragItem({ type, id });
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });

    if (!isDragging || !dragItem) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragItem.type === 'sticker') {
      setStickerElements(stickerElements.map(item => 
        item.id === dragItem.id ? { ...item, x, y } : item
      ));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragItem(null);
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
      ctx.drawImage(img, 0, 0, originalDimensions.width, originalDimensions.height);

      await Promise.all(stickerElements.map(async (item) => {
        const stickerImg = new window.Image();
        stickerImg.src = item.src;
        await new Promise((resolve) => {
          stickerImg.onload = resolve;
        });
        
        const originalX = item.x / currentScale;
        const originalY = item.y / currentScale;
        const originalSize = item.size * currentScale;
        
        ctx.drawImage(
          stickerImg,
          originalX - (originalSize / 2),
          originalY - (originalSize / 2),
          originalSize,
          originalSize
        );
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
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <Head>
        <title>Pedro MEME Studio</title>
        <meta name="description" content="Create your own Pedro designs" />
        <meta property="og:image" content="/pedro-social-preview.jpg" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
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
          
          <motion.div 
            className="absolute w-[300px] h-[300px] rounded-full bg-white opacity-[0.02] blur-[100px]"
            animate={{
              x: mousePosition.x - 150,
              y: mousePosition.y - 150,
            }}
            transition={{ type: "spring", damping: 30, stiffness: 100 }}
          />
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
              className="w-full md:w-72 space-y-6"
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
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="w-full text-xs bg-black/50 border border-white/10 p-2 rounded hover:border-white/30 transition-colors"
                />
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
                      className={`w-full py-3 text-left px-4 text-sm border ${activeTool === 'sticker' ? 'border-white bg-white/10' : 'border-white/10'} hover:border-white transition-all duration-300 rounded`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Add Sticker
                    </motion.button>

                    {activeTool === 'sticker' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3">
                          {stickers.map((sticker, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleAddSticker(sticker)}
                              className="p-1 border border-white/10 hover:border-white transition-all duration-300 rounded bg-black/50 aspect-square overflow-hidden"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img 
                                src={sticker} 
                                alt={`Sticker ${index + 1}`} 
                                className="w-full h-full object-contain" 
                              />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex-1"
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div 
                ref={canvasRef}
                className="relative bg-black/50 border border-white/10 rounded-lg w-full max-h-[80vh] overflow-hidden backdrop-blur-sm flex items-center justify-center"
                style={{
                  aspectRatio: uploadedImage ? `${originalDimensions.width}/${originalDimensions.height}` : '1/1'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
                transition={{ duration: 0.3 }}
              >
                {uploadedImage && (
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded content" 
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                )}

                {stickerElements.map((item) => (
                  <motion.div
                    key={item.id}
                    className="absolute cursor-move"
                    style={{ 
                      left: `${item.x}px`, 
                      top: `${item.y}px`,
                      transform: 'translate(-50%, -50%)',
                      width: `${item.size * currentScale}px`,
                      height: `${item.size * currentScale}px`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'sticker', item.id)}
                    whileHover={{ scale: 1.1 }}
                    drag={isDragging && dragItem?.id === item.id}
                    dragConstraints={canvasRef}
                    dragElastic={0.1}
                  >
                    <div className="relative group w-full h-full">
                      <img 
                        src={item.src} 
                        alt="Sticker" 
                        className="w-full h-full object-contain drop-shadow-lg"
                      />
                      <motion.button
                        onClick={() => removeElement(item.id)}
                        className="absolute -right-2 -top-2 bg-black border border-white/10 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white hover:text-black"
                        whileHover={{ scale: 1.2 }}
                      >
                        ×
                      </motion.button>
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