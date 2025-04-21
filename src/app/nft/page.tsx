'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from 'react';

export default function Art() {
  const [layers, setLayers] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRefs = useRef({});
  const [activeTab, setActiveTab] = useState('builder');
  const [newLayerName, setNewLayerName] = useState('');

  const addLayer = () => {
    if (!newLayerName.trim()) return;
    
    const newLayer = {
      name: newLayerName.trim(),
      images: [],
      zIndex: layers.length // To manage stacking order
    };
    
    setLayers([...layers, newLayer]);
    setNewLayerName('');
  };

  const removeLayer = (index) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(index, 1);
    setLayers(updatedLayers);
    if (preview && preview.layers.includes(index)) {
      setPreview(null); // Clear preview if it used this layer
    }
  };

  const handleImageUpload = (layerIndex, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const updatedLayers = [...layers];
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      rarity: 10, // Default rarity (10%)
      name: file.name.split('.')[0] // Remove extension
    }));

    updatedLayers[layerIndex].images = [...updatedLayers[layerIndex].images, ...newImages];
    setLayers(updatedLayers);
  };

  const updateRarity = (layerIndex, imageIndex, value) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].images[imageIndex].rarity = parseInt(value) || 0;
    setLayers(updatedLayers);
  };

  const removeImage = (layerIndex, imageIndex) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].images.splice(imageIndex, 1);
    setLayers(updatedLayers);
  };

  const generatePreview = () => {
    if (layers.length === 0) return;

    const selectedImages = [];
    const selectedLayers = [];

    layers.forEach((layer, layerIndex) => {
      if (layer.images.length === 0) return;

      // Calculate total rarity weight
      const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
      let random = Math.random() * totalRarity;
      let currentSum = 0;

      // Select image based on rarity
      for (let i = 0; i < layer.images.length; i++) {
        currentSum += layer.images[i].rarity;
        if (random <= currentSum) {
          selectedImages.push(layer.images[i].preview);
          selectedLayers.push(layerIndex);
          break;
        }
      }
    });

    setPreview({
      images: selectedImages,
      layers: selectedLayers
    });
  };

  const downloadPreview = () => {
    if (!preview) return;
    
    // Create a canvas to composite the images
    const canvas = document.createElement('canvas');
    canvas.width = 1000; // Set your desired dimensions
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    // Draw each image in order (respecting zIndex)
    const layersToDraw = [...preview.layers]
      .map((layerIdx, i) => ({ layerIdx, zIndex: layers[layerIdx].zIndex, imgIndex: i }))
      .sort((a, b) => a.zIndex - b.zIndex);
    
    let imagesLoaded = 0;
    const totalImages = preview.images.length;
    
    layersToDraw.forEach(({ imgIndex }) => {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        imagesLoaded++;
        
        if (imagesLoaded === totalImages) {
          // All images loaded, trigger download
          const link = document.createElement('a');
          link.download = 'nft-preview.png';
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
      img.src = preview.images[imgIndex];
    });
  };

  return (
    <>
      <Head>
        <title>Pedro | NFT Builder</title>
        <meta name="description" content="Build your own NFT with layers" />
        <meta property="og:image" content="/pedro_logo4.png" />
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
                NFT BUILDER
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <div className="container mx-auto px-4 pb-20">
            <div className="flex border-b border-gray-700 mb-6">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'builder' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('builder')}
              >
                Builder
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'preview' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </button>
            </div>

            {activeTab === 'builder' ? (
              <div className="space-y-8">
                <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center space-x-4 mb-6">
                    <input
                      type="text"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      placeholder="New layer name"
                      className="bg-gray-800 border border-gray-700 rounded px-4 py-2 flex-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={addLayer}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                    >
                      Add Layer
                    </button>
                  </div>

                  {layers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No layers added yet. Add your first layer to get started.
                    </div>
                  )}

                  <div className="space-y-6">
                    {layers.map((layer, layerIndex) => (
                      <div key={layerIndex} className="bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold">{layer.name}</h3>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              min="0"
                              max="1000"
                              value={layer.zIndex}
                              onChange={(e) => {
                                const updatedLayers = [...layers];
                                updatedLayers[layerIndex].zIndex = parseInt(e.target.value) || 0;
                                setLayers(updatedLayers);
                              }}
                              className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-center text-sm"
                              title="Z-Index (stacking order)"
                            />
                            <button
                              onClick={() => removeLayer(layerIndex)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove layer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <input
                            type="file"
                            ref={el => fileInputRefs.current[layerIndex] = el}
                            onChange={(e) => handleImageUpload(layerIndex, e)}
                            multiple
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRefs.current[layerIndex].click()}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors text-sm"
                          >
                            Add Images
                          </button>
                        </div>

                        {layer.images.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {layer.images.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                                  <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="object-contain max-h-full max-w-full"
                                  />
                                </div>
                                <div className="p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs truncate">{image.name}</span>
                                    <button
                                      onClick={() => removeImage(layerIndex, imageIndex)}
                                      className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remove image"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={image.rarity}
                                      onChange={(e) => updateRarity(layerIndex, imageIndex, e.target.value)}
                                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8 text-right">{image.rarity}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-sm">
                            No images added to this layer yet.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={generatePreview}
                    disabled={layers.length === 0}
                    className={`px-6 py-3 rounded-lg font-medium ${layers.length === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
                  >
                    Generate Preview
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl border border-gray-700">
                {preview ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 mb-6 bg-gray-800 rounded-xl overflow-hidden">
                      {preview.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Layer ${i}`}
                          className="absolute inset-0 w-full h-full object-contain"
                          style={{ zIndex: layers[preview.layers[i]]?.zIndex || i }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={generatePreview}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors"
                      >
                        Generate Another
                      </button>
                      <button
                        onClick={downloadPreview}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
                      >
                        Download Preview
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No preview generated yet</div>
                    <button
                      onClick={() => {
                        generatePreview();
                        setActiveTab('preview');
                      }}
                      disabled={layers.length === 0}
                      className={`px-6 py-2 rounded-lg ${layers.length === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
                    >
                      Generate Your First Preview
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}