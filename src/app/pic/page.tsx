'use client';
import { useState, useRef, useEffect } from 'react';

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

export default function ImageEditor() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialLayerPos, setInitialLayerPos] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerFileInputRef = useRef<HTMLInputElement>(null);

  const stickers = [
    '/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png',
    '/7.png', '/8.png', '/9.png', '/10.png', '/11.png', '/12.png',
    '/13.png', '/14.png', '/15.png'
  ];

  const createLayer = (url: string, x: number, y: number, width?: number, isBackground = false) => {
    const img = new Image();
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
            newHeight = canvasWidth / imgRatio;
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

  const handleMouseDown = (e: React.MouseEvent, layerId: string, isResizeHandle = false) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer || layer.isBackground) return;

    setActiveLayerId(layerId);
    
    if (isResizeHandle) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayerPos({ x: layer.x, y: layer.y, width: layer.width, height: layer.height });
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
    if (!activeLayerId || !isDragging && !isResizing) return;
    
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
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const deleteActiveLayer = () => {
    if (activeLayerId) {
      setLayers(prev => prev.filter(layer => layer.id !== activeLayerId));
      setActiveLayerId(null);
    }
  };

  const rotateLayer = (degrees: number) => {
    if (!activeLayerId) return;
    
    const layer = layers.find(l => l.id === activeLayerId);
    if (!layer || layer.isBackground) return;

    setLayers(prev =>
      prev.map(layer =>
        layer.id === activeLayerId
          ? { ...layer, rotate: (layer.rotate + degrees) % 360 }
          : layer
      )
    );
  };

  const saveImage = () => {
    if (layers.length === 0) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const backgroundLayer = layers.find(layer => layer.isBackground);
    
    if (backgroundLayer) {
      canvas.width = backgroundLayer.width;
      canvas.height = backgroundLayer.height;
    } else {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    layers.forEach(layer => {
      const img = new Image();
      img.src = layer.url;
      
      ctx.save();
      
      let drawX = layer.x;
      let drawY = layer.y;
      
      if (backgroundLayer) {
        drawX = layer.x - backgroundLayer.x;
        drawY = layer.y - backgroundLayer.y;
      }
      
      ctx.translate(drawX + layer.width / 2, drawY + layer.height / 2);
      ctx.rotate((layer.rotate * Math.PI) / 180);
      ctx.drawImage(
        img,
        -layer.width / 2,
        -layer.height / 2,
        layer.width,
        layer.height
      );
      ctx.restore();
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'meme-creator.png';
    link.href = dataUrl;
    link.click();
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
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-white p-4 rounded-lg w-full md:w-24">
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-700"
                  title="Add Background Image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </li>
              <li>
                <button
                  onClick={saveImage}
                  disabled={layers.length === 0}
                  className={`w-full p-3 rounded-lg flex items-center justify-center ${layers.length === 0 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
                  title="Save"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  onClick={deleteActiveLayer}
                  disabled={!activeLayerId}
                  className={`w-full p-3 rounded-lg flex items-center justify-center ${!activeLayerId ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  onClick={() => rotateLayer(15)}
                  disabled={!activeLayerId}
                  className={`w-full p-3 rounded-lg flex items-center justify-center ${!activeLayerId ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
                  title="Rotate Right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLayers([])}
                  disabled={layers.length === 0}
                  className={`w-full p-3 rounded-lg flex items-center justify-center ${layers.length === 0 ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
                  title="Clear All"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
              <li className="pt-4 border-t text-center border-gray-200">
                <span className="text-xs text-gray-500">V1.0</span>
              </li>
            </ul>
          </div>

          <div
            ref={canvasRef}
            className={`bg-white p-4 rounded-lg flex-1 h-[700px] relative overflow-hidden ${layers.length === 0 ? 'cursor-pointer' : ''}`}
            onClick={() => layers.length === 0 && fileInputRef.current?.click()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {layers.length === 0 ? (
              <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <span className="text-2xl mb-2">Upload a background image</span>
                <span className="text-sm mb-4">or</span>
                <span className="text-lg">Click to choose</span>
              </div>
            ) : (
              layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`absolute ${activeLayerId === layer.id && !layer.isBackground ? 'ring-2 ring-blue-500' : ''}`}
                  style={{
                    left: `${layer.x}px`,
                    top: `${layer.y}px`,
                    width: `${layer.width}px`,
                    height: `${layer.height}px`,
                    transform: `rotate(${layer.rotate}deg)`,
                    cursor: layer.isBackground ? 'default' : 'move',
                  }}
                  onMouseDown={layer.isBackground ? undefined : (e) => handleMouseDown(e, layer.id)}
                  onDoubleClick={layer.isBackground ? undefined : () => handleDoubleClick(layer.id)}
                >
                  <img
                    src={layer.url}
                    alt={layer.isBackground ? "Background" : "Layer"}
                    className="w-full h-full object-contain select-none"
                    draggable="false"
                  />
                  {activeLayerId === layer.id && !layer.isBackground && (
                    <div 
                      className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleMouseDown(e, layer.id, true);
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="bg-white p-4 rounded-lg w-full md:w-96 h-[700px] overflow-y-auto">
            <div className="mb-4">
              <button
                onClick={() => stickerFileInputRef.current?.click()}
                className="w-full p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
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
            <p className="text-sm text-center text-gray-500 mb-4">
              Click on a sticker to add it to your image
            </p>
            <div className="grid grid-cols-3 gap-2">
              {stickers.map((sticker, index) => (
                <div
                  key={index}
                  className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleStickerClick(sticker)}
                >
                  <img
                    src={sticker}
                    alt={`Sticker ${index}`}
                    className="w-full h-32 object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}