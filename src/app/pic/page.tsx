'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useState, useRef } from 'react';
import Button from '@/components/basic_button';

export default function MemeGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Array<{
    id: string;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>>([]);
  const [texts, setTexts] = useState<Array<{
    id: string;
    content: string;
    x: number;
    y: number;
    color: string;
    fontSize: number;
    fontFamily: string;
    rotation: number;
  }>>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'sticker' | 'text' | null>(null);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const canvasRef = useRef<HTMLDivElement>(null);

  const stickerOptions = Array.from({ length: 12 }, (_, i) => `sticker${i + 1}.png`);
  const fontOptions = ['Arial', 'Impact', 'Comic Sans MS', 'Courier New', 'Georgia', 'Times New Roman'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSticker = (stickerSrc: string) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      src: stickerSrc,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0
    };
    setStickers([...stickers, newSticker]);
    setSelectedElement(newSticker.id);
    setActiveTool(null);
  };

  const addText = () => {
    if (!newText.trim()) return;
    
    const newTextElement = {
      id: `text-${Date.now()}`,
      content: newText,
      x: 50,
      y: 50,
      color: textColor,
      fontSize: textSize,
      fontFamily,
      rotation: 0
    };
    setTexts([...texts, newTextElement]);
    setSelectedElement(newTextElement.id);
    setNewText('');
    setActiveTool(null);
  };

  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(id);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  const handleDragEnd = (id: string, event: any, info: { offset: { x: number; y: number } }) => {
    const { offset } = info;
    
    if (id.startsWith('sticker')) {
      setStickers(stickers.map(sticker => 
        sticker.id === id ? { 
          ...sticker, 
          x: sticker.x + offset.x,
          y: sticker.y + offset.y
        } : sticker
      ));
    } else {
      setTexts(texts.map(text => 
        text.id === id ? { 
          ...text, 
          x: text.x + offset.x,
          y: text.y + offset.y
        } : text
      ));
    }
  };

  const handleResize = (id: string, delta: number) => {
    if (id.startsWith('sticker')) {
      setStickers(stickers.map(sticker => 
        sticker.id === id ? { 
          ...sticker, 
          width: Math.max(20, sticker.width + delta),
          height: Math.max(20, sticker.height + delta)
        } : sticker
      ));
    } else {
      setTexts(texts.map(text => 
        text.id === id ? { 
          ...text, 
          fontSize: Math.max(8, text.fontSize + delta/2) 
        } : text
      ));
    }
  };

  const handleRotate = (id: string, delta: number) => {
    if (id.startsWith('sticker')) {
      setStickers(stickers.map(sticker => 
        sticker.id === id ? { 
          ...sticker, 
          rotation: (sticker.rotation + delta) % 360 
        } : sticker
      ));
    } else {
      setTexts(texts.map(text => 
        text.id === id ? { 
          ...text, 
          rotation: (text.rotation + delta) % 360 
        } : text
      ));
    }
  };

  const removeElement = (id: string) => {
    if (id.startsWith('sticker')) {
      setStickers(stickers.filter(sticker => sticker.id !== id));
    } else {
      setTexts(texts.filter(text => text.id !== id));
    }
    setSelectedElement(null);
  };

  const downloadMeme = () => {
    if (!canvasRef.current) return;
    alert('In a real implementation, this would download the meme as an image');
  };

  return (
    <>
      <Head>
        <title>Pedro | Meme Generator</title>
        <meta name="description" content="Create your own Pedro memes" />
        <meta property="og:image" content="/pedro-social-preview.jpg" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
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
          <section className="flex items-center justify-center py-7 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-6 max-w-4xl relative z-10"
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                MEME GENERATOR
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <section className="relative py-5 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Controls Panel */}
              <div className="lg:col-span-1 bg-black/50 p-6 rounded-lg border border-white/10">
                <h2 className="text-xl font-bold mb-4">Controls</h2>
                
                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">Upload Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-white/10 file:text-white
                      hover:file:bg-white/20"
                  />
                </div>
                
                {/* Stickers */}
                <div className="mb-6">
                  <Button 
                    onClick={() => setActiveTool(activeTool === 'sticker' ? null : 'sticker')}
                    className="w-full mb-2"
                    label="Add Sticker"
                  />
                  {activeTool === 'sticker' && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {stickerOptions.map((sticker, index) => (
                        <button
                          key={index}
                          onClick={() => addSticker(sticker)}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded transition"
                        >
                          <Image
                            src={`/${index+1}.png`}
                            alt={`Sticker ${index + 1}`}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Text */}
                <div className="mb-6">
                  <Button 
                    onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
                    className="w-full mb-2"
                    label="Add Text"
                  />
                  {activeTool === 'text' && (
                    <div className="space-y-4 mt-2">
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Enter your text"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1">Color</label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">Size</label>
                          <input
                            type="range"
                            min="8"
                            max="72"
                            value={textSize}
                            onChange={(e) => setTextSize(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Font</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      <Button 
                        onClick={addText}
                        className="w-full"
                        label="Add Text to Meme"
                      />
                    </div>
                  )}
                </div>
                
                {/* Download Button */}
                <Button 
                  onClick={downloadMeme}
                  className="w-full bg-green-600 hover:bg-green-700"
                  label="Download Meme"
                />
              </div>
              
              {/* Canvas Area */}
              <div className="lg:col-span-3">
                <div 
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="relative bg-black/50 rounded-lg border-2 border-white/10 aspect-square w-full overflow-hidden"
                >
                  {uploadedImage ? (
                    <Image
                      src={uploadedImage}
                      alt="Uploaded meme base"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/50">
                      Upload an image to start creating your meme
                    </div>
                  )}
                  
                  {/* Render Stickers */}
                  {stickers.map(sticker => (
                    <motion.div
                      key={sticker.id}
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      onDragEnd={(e, info) => handleDragEnd(sticker.id, e, info)}
                      onClick={(e) => handleElementClick(sticker.id, e)}
                      className={`absolute cursor-move ${selectedElement === sticker.id ? 'ring-2 ring-blue-500' : ''}`}
                      style={{
                        left: `${sticker.x}px`,
                        top: `${sticker.y}px`,
                        width: `${sticker.width}px`,
                        height: `${sticker.height}px`,
                        transform: `rotate(${sticker.rotation}deg)`
                      }}
                    >
                      <Image
                        src={`/${sticker.src}`}
                        alt="Sticker"
                        fill
                        className="object-contain"
                      />
                      {selectedElement === sticker.id && (
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2">
                          <button 
                            onClick={() => handleResize(sticker.id, 10)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleResize(sticker.id, -10)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleRotate(sticker.id, 15)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => removeElement(sticker.id)}
                            className="bg-red-500/80 hover:bg-red-500 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Render Texts */}
                  {texts.map(text => (
                    <motion.div
                      key={text.id}
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      onDragEnd={(e, info) => handleDragEnd(text.id, e, info)}
                      onClick={(e) => handleElementClick(text.id, e)}
                      className={`absolute cursor-move ${selectedElement === text.id ? 'ring-2 ring-blue-500' : ''}`}
                      style={{
                        left: `${text.x}px`,
                        top: `${text.y}px`,
                        color: text.color,
                        fontSize: `${text.fontSize}px`,
                        fontFamily: text.fontFamily,
                        transform: `rotate(${text.rotation}deg)`
                      }}
                    >
                      {text.content}
                      {selectedElement === text.id && (
                        <div className="absolute -bottom-8 left-0 right-0 flex justify-center space-x-2">
                          <button 
                            onClick={() => handleResize(text.id, 2)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleResize(text.id, -2)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleRotate(text.id, 15)}
                            className="bg-white/20 hover:bg-white/30 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => removeElement(text.id)}
                            className="bg-red-500/80 hover:bg-red-500 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}