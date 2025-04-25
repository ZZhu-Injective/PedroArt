'use client';
import { useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Button from '@/components/basic_button';

// Element categories and their options
const elements = {
  background: [
    { name: 'Space', image: '/background/space.jpg' },
    { name: 'Forest', image: '/background/forest.jpg' },
    { name: 'City', image: '/background/city.jpg' },
    { name: 'Beach', image: '/background/beach.jpg' },
  ],
  raccoon: [
    { name: 'Normal', image: '/raccoon/normal.png' },
    { name: 'Angry', image: '/raccoon/angry.png' },
    { name: 'Happy', image: '/raccoon/happy.png' },
    { name: 'Sleepy', image: '/raccoon/sleepy.png' },
  ],
  outfit: [
    { name: 'None', image: '/outfit/none.png' },
    { name: 'T-Shirt', image: '/outfit/tshirt.png' },
    { name: 'Suit', image: '/outfit/suit.png' },
    { name: 'Hoodie', image: '/outfit/hoodie.png' },
  ],
  mouth: [
    { name: 'Default', image: '/mouth/default.png' },
    { name: 'Smile', image: '/mouth/smile.png' },
    { name: 'Tongue', image: '/mouth/tongue.png' },
    { name: 'Fangs', image: '/mouth/fangs.png' },
  ],
  necklace: [
    { name: 'None', image: '/necklace/none.png' },
    { name: 'Gold Chain', image: '/necklace/gold.png' },
    { name: 'Silver Chain', image: '/necklace/silver.png' },
    { name: 'Diamond', image: '/necklace/diamond.png' },
  ],
  attribute: [
    { name: 'None', image: '/attribute/none.png' },
    { name: 'Hat', image: '/attribute/hat.png' },
    { name: 'Glasses', image: '/attribute/glasses.png' },
    { name: 'Headphones', image: '/attribute/headphones.png' },
  ],
};

export default function NFTCreator() {
  const [selectedElements, setSelectedElements] = useState({
    background: 0,
    raccoon: 0,
    outfit: 0,
    mouth: 0,
    necklace: 0,
    attribute: 0,
  });

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
      // In a real implementation, you would use html-to-image or similar library
      // to capture the canvasRef and download it as an image
      alert('NFT downloaded! (This would save the image in a real implementation)');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pedro | NFT Creator</title>
        <meta name="description" content="Create your custom Pedro raccoon NFT" />
      </Head>

      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-8 text-center"
          >
            Create Your Raccoon NFT
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NFT Preview */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border-2 border-white/20"
              ref={canvasRef}
            >
              {/* Background */}
              <div className="absolute inset-0">
                <Image
                  src={elements.background[selectedElements.background].image}
                  alt="Background"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Raccoon Base */}
              <div className="absolute inset-0">
                <Image
                  src={elements.raccoon[selectedElements.raccoon].image}
                  alt="Raccoon"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Outfit */}
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
              <div className="absolute inset-0">
                <Image
                  src={elements.mouth[selectedElements.mouth].image}
                  alt="Mouth"
                  fill
                  className="object-contain"
                />
              </div>

              {/* Necklace */}
              {selectedElements.necklace > 0 && (
                <div className="absolute inset-0">
                  <Image
                    src={elements.necklace[selectedElements.necklace].image}
                    alt="Necklace"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Attribute */}
              {selectedElements.attribute > 0 && (
                <div className="absolute inset-0">
                  <Image
                    src={elements.attribute[selectedElements.attribute].image}
                    alt="Attribute"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </motion.div>

            {/* Customization Panel */}
            <div className="space-y-6">
              {Object.keys(elements).map((category) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900/50 p-4 rounded-lg border border-white/10"
                >
                  <h3 className="text-xl font-semibold mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {elements[category as keyof typeof elements].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleElementChange(category as keyof typeof selectedElements, index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedElements[category as keyof typeof selectedElements] === index
                            ? 'border-white ring-2 ring-white'
                            : 'border-white/20 hover:border-white/50'
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 text-center text-xs">
                          {item.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button
                  onClick={downloadNFT}
                  disabled={isDownloading}
                  className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  {isDownloading ? 'Creating NFT...' : 'Mint Your NFT'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}