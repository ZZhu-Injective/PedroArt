'use client';
import { useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from '@/components/basic_button';

const elements = {
  eyes: [
    { name: 'None', image: '' },
    { name: 'Normal', image: '/eyes/3D Glass.png' },
    { name: 'Angry', image: '/eyes/Black Glass.png' },
    { name: 'Happy', image: '/eyes/Gold Glass.png' },
    { name: 'Sleepy', image: '/eyes/Laser Eyes.png' },
    { name: 'Summer', image: '/eyes/Summer Glass.png' },
    { name: 'Yolo', image: '/eyes/Yolo Glass.png' },
  ],
  outfit: [
    { name: 'None', image: '' },
    { name: 'Black Long Sleeve', image: '/outfit/Black Long Sleeve.png' },
    { name: 'Black Shirt', image: '/outfit/Black Shirt.png' },
    { name: 'White Shirt', image: '/outfit/White Shirt.png' },
    { name: 'White Sweater', image: '/outfit/White Sweater.png' },
    { name: 'Black Suit', image: '/outfit/Black Suit.png' },
    { name: 'Black Sweater', image: '/outfit/Black Sweater.png' },
    { name: 'Fawn Long Sleeve', image: '/outfit/Fawn Long Sleeve.png' },
    { name: 'Labcoat', image: '/outfit/Labcoat.png' },
    { name: 'Blue Long Sleeve', image: '/outfit/Light Blue Long Sleeve.png' },
    { name: 'Pink Long Sleeve', image: '/outfit/Pink Long Sleeve.png' },
    { name: 'Red Suit', image: '/outfit/Red Suit.png' },
    { name: 'White Long Sleeve', image: '/outfit/White Long Sleeve.png' },
  ],
  mouth: [
    { name: 'None', image: '' },
    { name: 'Smoke', image: '/mouth/mouth_1.png' },
    { name: 'Smoke2', image: '/mouth/mouth_2.png' },
  ],
  accessory: [
    { name: 'None', image: '' },
    { name: 'Bee', image: '/attribute/Bee.png' },
    { name: 'Bitcoin', image: '/attribute/Bitcoin.png' },
    { name: 'Drugs', image: '/attribute/Drugs.png' },
    { name: 'Duck', image: '/attribute/Duck.png' },
    { name: 'Silver Sword', image: '/attribute/Silver Sword.png' },
    { name: 'Glocks', image: '/attribute/Glocks.png' },
    { name: 'Golden Sword', image: '/attribute/Golden Sword.png' },
    { name: 'Injective', image: '/attribute/Injective.png' },
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
  });

  const [activeCategory, setActiveCategory] = useState('background');
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleElementChange = (category: keyof typeof selectedElements, index: number) => {
    setSelectedElements(prev => ({
      ...prev,
      [category]: index,
    }));
  };

  const downloadNFT = async () => {
    setIsDownloading(true);
    try {
      alert('NFT downloaded! (This would save the image in a real implementation)');
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
                PEDRO CREATOR
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* NFT Preview */}
              <div className="flex flex-col gap-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/20 shadow-lg"
                  ref={canvasRef}
                  style={getBackgroundStyle()}
                >
                  {/* Raccoon Base */}
                  <div className="absolute inset-0">
                    <Image
                      src="/raccoon/Raccoon.png"
                      alt="Raccoon"
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Eyes - Only show if not "None" */}
                  {selectedElements.eyes > 0 && (
                    <div className="absolute inset-0">
                      <Image
                        src={elements.eyes[selectedElements.eyes].image}
                        alt="Eyes"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Outfit - Only show if not "None" */}
                  {selectedElements.outfit > 0 && (
                    <div className="absolute inset-0">
                      <Image
                        src={elements.outfit[selectedElements.outfit].image}
                        alt="Outfit"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Mouth */}
                  {selectedElements.mouth > 0 && (
                    <div className="absolute inset-0">
                      <Image
                        src={elements.mouth[selectedElements.mouth].image}
                        alt="Mouth"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Accessory - Only show if not "None" */}
                  {selectedElements.accessory > 0 && (
                    <div className="absolute inset-0">
                      <Image
                        src={elements.accessory[selectedElements.accessory].image}
                        alt="Accessory"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </motion.div>

                <div className="flex justify-center">
                  <Button
                    onClick={downloadNFT}
                    disabled={isDownloading}
                    className="w-full md:w-1/2 py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                    label={isDownloading ? 'Downloading...' : 'Download Image'}
                  />
                </div>
              </div>

              {/* Customization Panel */}
              <div className="space-y-6">
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

                {/* Active Panel */}
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-black/50 p-4 rounded-lg border border-white/10 shadow-lg backdrop-blur-sm"
                >
                  {activeCategory === 'background' ? (
                    <>
                      <h3 className="text-xl font-semibold mb-3 text-white">
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
                              <>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 text-center text-xs text-white">
                                  {item.name}
                                </div>
                              </>
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
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}