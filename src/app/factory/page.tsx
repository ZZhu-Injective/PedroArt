'use client';
import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from '@/components/basic_button';
import { toPng } from 'html-to-image';

const elements = {
  eyes: [
    { image: '' },
    { image: '/eyes/1.png' },
    { image: '/eyes/2.png' },
    { image: '/eyes/3.png' },
    { image: '/eyes/4.png' },
    { image: '/eyes/5.png' },
    { image: '/eyes/6.png' },
    { image: '/eyes/7.png' },
    { image: '/eyes/8.png' },
    { image: '/eyes/9.png' },
    { image: '/eyes/10.png' },
    { image: '/eyes/11.png' },
    { image: '/eyes/12.png' },
    { image: '/eyes/13.png' },
    { image: '/eyes/14.png' },
    { image: '/eyes/15.png' },
    { image: '/eyes/16.png' },
    { image: '/eyes/17.png' },
    { image: '/eyes/20.png' },
    { image: '/eyes/21.png' },
  ],
  outfit: [
    { image: '' },
    { image: '/outfit/1.png' },
    { image: '/outfit/2.png' },
    { image: '/outfit/3.png' },
    { image: '/outfit/4.png' },
    { image: '/outfit/5.png' },
    { image: '/outfit/6.png' },
    { image: '/outfit/7.png' },
    { image: '/outfit/8.png' },
    { image: '/outfit/9.png' },
    { image: '/outfit/10.png' },
    { image: '/outfit/11.png' },
    { image: '/outfit/12.png' },
    { image: '/outfit/13.png' },
    { image: '/outfit/14.png' },
    { image: '/outfit/15.png' },
    { image: '/outfit/16.png' },
    { image: '/outfit/17.png' },
    { image: '/outfit/18.png' },
    { image: '/outfit/19.png' },
  ],
  hat: [
    { image: '' },
    { image: '/hat/1.png' },
    { image: '/hat/2.png' },
    { image: '/hat/3.png' },
    { image: '/hat/4.png' },
    { image: '/hat/5.png' },
    { image: '/hat/6.png' },
    { image: '/hat/7.png' },
    { image: '/hat/8.png' },
    { image: '/hat/9.png' },
    { image: '/hat/10.png' },
    { image: '/hat/11.png' },
    { image: '/hat/12.png' },
    { image: '/hat/13.png' },
    { image: '/hat/14.png' },
    { image: '/hat/15.png' },
    { image: '/hat/16.png' },
    { image: '/hat/17.png' },
    { image: '/hat/18.png' },
    { image: '/hat/19.png' },
  ],
  accessory: [
    { image: '' },
    { image: '/attribute/1.png' },
    { image: '/attribute/2.png' },
    { image: '/attribute/3.png' },
    { image: '/attribute/4.png' },
    { image: '/attribute/5.png' },
    { image: '/attribute/6.png' },
    { image: '/attribute/7.png' },
    { image: '/attribute/8.png' },
    { image: '/attribute/9.png' },
    { image: '/attribute/10.png' },
    { image: '/attribute/11.png' },
    { image: '/attribute/12.png' },
    { image: '/attribute/13.png' },
    { image: '/attribute/14.png' },
    { image: '/attribute/15.png' },
    { image: '/attribute/16.png' },
    { image: '/attribute/17.png' },
    { image: '/attribute/18.png' },
    { image: '/attribute/19.png' },
  ],
  mouth: [
    { image: '' },
    { image: '/mouth/1.png' },
    { image: '/mouth/2.png' },
  ],
};

const backgroundColors = [
  { name: 'Soft White', value: '#f8f9fa' },
  { name: 'Pearl', value: '#f0f0f0' },
  { name: 'Light Gray', value: '#e0e0e0' },
  { name: 'Lavender Mist', value: '#e6e6fa' },
  { name: 'Powder Blue', value: '#b0e0e6' },
  { name: 'Mint Cream', value: '#f5fffa' },
  { name: 'Alice Blue', value: '#f0f8ff' },
  { name: 'Honeydew', value: '#f0fff0' },
  { name: 'Seashell', value: '#fff5ee' },
  { name: 'Linen', value: '#faf0e6' },
  { name: 'Light Cyan', value: '#e0ffff' },
  { name: 'Pale Turquoise', value: '#afeeee' },
  { name: 'Light Sky Blue', value: '#87cefa' },
  { name: 'Light Steel Blue', value: '#b0c4de' },
  { name: 'Pale Lavender', value: '#dcd0ff' },
  { name: 'Pink Lace', value: '#ffddf4' },
  { name: 'Light Coral', value: '#f08080' },
  { name: 'Peach Puff', value: '#ffdab9' },
  { name: 'Pale Goldenrod', value: '#eee8aa' },
  { name: 'Light Yellow', value: '#ffffe0' },
  { name: 'Ivory', value: '#fffff0' },
  { name: 'Azure Mist', value: '#f0ffff' },
  { name: 'Baby Blue', value: '#89cff0' },
  { name: 'Pastel Pink', value: '#ffd1dc' },
  { name: 'Light Salmon', value: '#ffa07a' },
  { name: 'Blush', value: '#f5c3c2' },
  { name: 'Sky Blue Gradient', value: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)' },
  { name: 'Pastel Gradient', value: 'linear-gradient(to bottom, #f5f7fa, #c3cfe2)' },
  { name: 'Sunrise Gradient', value: 'linear-gradient(to bottom, #ffefba, #ffffff)' },
  { name: 'Cotton Candy', value: 'linear-gradient(to bottom, #ffb6c1, #f0f8ff)' },
  { name: 'Slate Gray', value: '#708090' },
  { name: 'Cadet Blue', value: '#5f9ea0' },
  { name: 'Cool Gray', value: '#8c92ac' },
  { name: 'Dusty Rose', value: '#b38b6d' },
  { name: 'Taupe', value: '#483c32' },
  { name: 'Sage Green', value: '#8a9a5b' },
  { name: 'Muted Teal', value: '#5f9f9f' },
  { name: 'Deep Lavender', value: '#9370db' },
  { name: 'Dusky Pink', value: '#cc7e8c' },
  { name: 'Moss Green', value: '#8a9a5b' },
  { name: 'Muted Indigo', value: '#4b5b6f' },
  { name: 'Charcoal Blue', value: '#36454f' },
];

export default function NFTCreator() {
  const [selectedElements, setSelectedElements] = useState({
    backgroundColor: 0,
    eyes: 0,
    outfit: 0,
    mouth: 0,
    accessory: 0,
    hat: 0,
  });

  const [activeCategory, setActiveCategory] = useState('background');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const generateRandomCombination = () => {
    return {
      eyes: Math.floor(Math.random() * (elements.eyes.length - 1)) + 1,
      outfit: Math.floor(Math.random() * (elements.outfit.length - 1)) + 1,
      hat: Math.floor(Math.random() * (elements.hat.length - 1)) + 1,
      accessory: Math.floor(Math.random() * (elements.accessory.length - 1)) + 1,
      mouth: Math.floor(Math.random() * (elements.mouth.length - 1)) + 1,
      backgroundColor: Math.floor(Math.random() * backgroundColors.length)
    };
  };

  const [randomCombinations, setRandomCombinations] = useState(() => 
    Array(6).fill(0).map(() => generateRandomCombination())
  );

  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = [
        '/raccoon/Raccoon.png',
        ...elements.eyes.filter(e => e.image).map(e => e.image),
        ...elements.outfit.filter(e => e.image).map(e => e.image),
        ...elements.hat.filter(e => e.image).map(e => e.image),
        ...elements.accessory.filter(e => e.image).map(e => e.image),
        ...elements.mouth.filter(e => e.image).map(e => e.image),
      ];

      const loadPromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.src = url;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(loadPromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, []);

  const handleElementChange = (category: keyof typeof selectedElements, index: number) => {
    setSelectedElements(prev => ({
      ...prev,
      [category]: index,
    }));
  };

  const downloadNFT = async () => {
    if (!imagesLoaded) {
      alert('Images are still loading. Please wait a moment and try again.');
      return;
    }
  
    setIsDownloading(true);
    try {
      const preview = canvasRef.current;
      if (!preview) return;
  
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => button.style.visibility = 'hidden');
  
      const imgs = preview.querySelectorAll('img');
      await Promise.all(
        Array.from(imgs).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
  
      await new Promise(resolve => setTimeout(resolve, 300));
  
      const bgValue = backgroundColors[selectedElements.backgroundColor].value;
      
      const dataUrl = await toPng(preview, {
        quality: 1,
        pixelRatio: 3,
        skipFonts: true,
        backgroundColor: bgValue.startsWith('linear-gradient') 
          ? '#00000000' 
          : bgValue,    
      });
  
      buttons.forEach(button => button.style.visibility = 'visible');
  
      const link = document.createElement('a');
      link.download = 'pedro-nft.png';
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('Error generating NFT:', error);
      alert('Error generating NFT. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getBackgroundStyle = () => {
    const bgValue = backgroundColors[selectedElements.backgroundColor].value;
    if (bgValue.startsWith('linear-gradient')) {
      return { backgroundImage: bgValue };
    }
    return { backgroundColor: bgValue };
  };

  return (
    <>
      <Head>
        <title>Pedro PF Creator</title>
        <meta name="description" content="Create your custom Pedro raccoon NFT" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono">
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
              <motion.h1 className="text-4xl md:text-7xl font-bold mb-5 bg-clip-text text-white">
                PEDRO CRAFT
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <div className="sm:py-8 py-2 px-2 mx-auto max-w-[1500px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 order-1 lg:order-none">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/50 p-6 rounded-xl border border-gray-700 shadow-lg relative overflow-hidden"
                >                  
                  <h2 className="text-2xl font-bold text-center mb-6 text-white">
                    HOW IT WORKS
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      {
                        icon: "1.",
                        title: "Select Category",
                        text: "Choose from Background, Eyes, Outfit and more"
                      },
                      {
                        icon: "2.",
                        title: "Mix & Match",
                        text: "Combine different elements to create your unique Pedro"
                      },
                      {
                        icon: "3.",
                        title: "Download",
                        text: "Save your creation with one click"
                      },
                      {
                        icon: "!",
                        title: "Important",
                        text: "Pedro NFTs are free for personal use"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all group"
                      >
                        <span className="font-mono text-gray-400 mr-4 text-lg group-hover:text-white transition-colors">
                          {item.icon}
                        </span>
                        <div>
                          <h3 className="font-semibold text-white">{item.title}</h3>
                          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                            {item.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 text-center text-xs text-gray-500 font-mono"
                  >
                    CREATE • CUSTOMIZE • DOWNLOAD
                  </motion.div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 shadow-lg"
                  ref={canvasRef}
                  style={{
                    ...getBackgroundStyle(),
                    isolation: 'isolate' 
                  }}
                >
                  <div className="absolute inset-0">
                    <img
                      src="/raccoon/Raccoon.png"
                      alt="Raccoon"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {selectedElements.eyes > 0 && (
                    <div className="absolute inset-0">
                      <img
                        src={elements.eyes[selectedElements.eyes].image}
                        alt="Eyes"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {selectedElements.outfit > 0 && (
                    <div className="absolute inset-0">
                      <img
                        src={elements.outfit[selectedElements.outfit].image}
                        alt="Outfit"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {selectedElements.mouth > 0 && (
                    <div className="absolute inset-0">
                      <img
                        src={elements.mouth[selectedElements.mouth].image}
                        alt="Mouth"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {selectedElements.hat > 0 && (
                    <div className="absolute inset-0">
                      <img
                        src={elements.hat[selectedElements.hat].image}
                        alt="Hat"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {selectedElements.accessory > 0 && (
                    <div className="absolute inset-0">
                      <img
                        src={elements.accessory[selectedElements.accessory].image}
                        alt="Accessory"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              <div className="space-y-6 order-2">
                <div className="flex overflow-x-auto pb-2 gap-2">
                  <button
                    onClick={() => setActiveCategory('background')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                      activeCategory === 'background' 
                        ? 'bg-white text-black font-bold' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    Background
                  </button>
                  {Object.keys(elements).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap capitalize transition-all ${
                        activeCategory === category 
                          ? 'bg-white text-black font-bold' 
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-black/50 p-4 rounded-lg border border-gray-700 shadow-lg backdrop-blur-sm"
                >

                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white">Combinations</h3>
                      <button
                        onClick={() => {
                          const newCombinations = Array(6).fill(0).map(() => generateRandomCombination());
                          setRandomCombinations(newCombinations);
                        }}
                        className="px-3 py-1 text-sm text-black hover:text-white bg-white hover:bg-black rounded-full"
                      >
                        Random
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {randomCombinations.map((combo, index) => (
                        <div 
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedElements(combo)}
                        >
                          <div 
                            className="aspect-square rounded-lg overflow-hidden border-2 border-white/20"
                            style={{
                              backgroundColor: backgroundColors[combo.backgroundColor].value.startsWith('linear-gradient') 
                                ? '#00000000'
                                : backgroundColors[combo.backgroundColor].value,
                              backgroundImage: backgroundColors[combo.backgroundColor].value.startsWith('linear-gradient') 
                                ? backgroundColors[combo.backgroundColor].value
                                : undefined
                            }}
                          >
                            <div className="absolute inset-0">
                              <img src="/raccoon/Raccoon.png" className="w-full h-full object-contain" />
                            </div>
                            {combo.eyes > 0 && <img src={elements.eyes[combo.eyes].image} className="absolute inset-0 w-full h-full object-contain" />}
                            {combo.outfit > 0 && <img src={elements.outfit[combo.outfit].image} className="absolute inset-0 w-full h-full object-contain" />}
                            {combo.hat > 0 && <img src={elements.hat[combo.hat].image} className="absolute inset-0 w-full h-full object-contain" />}
                            {combo.accessory > 0 && <img src={elements.accessory[combo.accessory].image} className="absolute inset-0 w-full h-full object-contain" />}
                            {combo.mouth > 0 && <img src={elements.mouth[combo.mouth].image} className="absolute inset-0 w-full h-full object-contain" />}
                          </div>
                        </div>
                      ))}
                    </div>

                  {activeCategory === 'background' ? (
                    <>
                      <h3 className="text-xl font-semibold mb-3 mt-6 text-white">
                        Background Color
                      </h3>
                      <div className="grid grid-cols-6 gap-2">
                        {backgroundColors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => handleElementChange('backgroundColor', index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedElements.backgroundColor === index
                                ? 'border-white ring-2 ring-white'
                                : 'border-white/20 hover:border-white/50'
                            }`}
                            style={color.value.startsWith('linear-gradient') ? 
                              { backgroundImage: color.value } : 
                              { backgroundColor: color.value }}
                            title={color.name}
                          >
                            {selectedElements.backgroundColor === index && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold mb-3 capitalize text-white">
                        {activeCategory}
                      </h3>
                      <div className="grid grid-cols-4 gap-3">
                        {elements[activeCategory as keyof typeof elements].map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleElementChange(activeCategory as keyof typeof selectedElements, index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedElements[activeCategory as keyof typeof selectedElements] === index
                                ? 'border-white ring-2 ring-white'
                                : 'border-white/20 hover:border-white/50'
                            }`}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                                <span className="text-xs text-white/70">None</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  </div>
                </motion.div>

                <div className="hidden lg:flex justify-center items-center p-5">
                  <Button
                    onClick={downloadNFT}
                    disabled={isDownloading || !imagesLoaded}
                    className="w-full md:w-1/2 py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    label={isDownloading ? 'Downloading...' : 'DOWNLOAD IMAGE'}
                  />
                </div>

                <div className="lg:hidden flex justify-center items-center p-10">
                  <Button
                    onClick={downloadNFT}
                    disabled={isDownloading || !imagesLoaded}
                    className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    label={isDownloading ? 'Downloading...' : 'Download Image'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}