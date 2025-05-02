'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import Button from '@/components/basic_button';
import { useEffect, useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
};

type Preview = {
  images: string[];
  layers: number[];
  id: string;
  usedLayers: boolean[];
};

export default function Art() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [batchSize, setBatchSize] = useState<number>(1);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder');
  const [newLayerName, setNewLayerName] = useState<string>('');
  const [totalCombinations, setTotalCombinations] = useState<number>(0);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  useEffect(() => {
    const combinations = layers.reduce((total, layer) => {
      return total * (layer.images.length || 1);
    }, 1);
    setTotalCombinations(combinations);
  }, [layers]);

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
      layerRarity: 100 
    };
    
    setLayers([...layers, newLayer]);
    setNewLayerName('');
  }, [newLayerName, layers]);

  const removeLayer = useCallback((index: number) => {
    const updatedLayers = [...layers];
    updatedLayers.splice(index, 1);
    setLayers(updatedLayers);
  }, [layers]);

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
    updatedLayers[layerIndex].images[imageIndex].rarity = Math.min(100, Math.max(0, numValue));
    
    const layer = updatedLayers[layerIndex];
    const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
    
    if (totalRarity > 100) {
      const excess = totalRarity - 100;
      const otherImages = layer.images.filter((_, i) => i !== imageIndex);
      const totalOtherRarity = otherImages.reduce((sum, img) => sum + img.rarity, 0);
      
      if (totalOtherRarity > 0) {
        const scaleFactor = (totalOtherRarity - excess) / totalOtherRarity;
        layer.images.forEach((img, i) => {
          if (i !== imageIndex) {
            img.rarity = Math.max(0, Math.floor(img.rarity * scaleFactor));
          }
        });
      } else {
        layer.images[imageIndex].rarity = 100;
      }
    }
    
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

  const generateBatchPreviews = useCallback(() => {
    if (layers.length === 0 || batchSize < 1) return;

    const allCombinations = calculateAllCombinations();
    const maxPossible = allCombinations.length;
    
    if (batchSize > maxPossible) {
      alert(`You can only generate up to ${maxPossible} unique combinations.`);
      setBatchSize(maxPossible);
      return;
    }

    const newPreviews: Preview[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      const usedLayers = layers.map(layer => {
        if (!layer.enabled) return false;
        return Math.random() * 100 < layer.layerRarity;
      });
      
      const selectedImages: number[] = [];
      const selectedImageUrls: string[] = [];
      
      layers.forEach((layer, layerIdx) => {
        if (!usedLayers[layerIdx] || layer.images.length === 0) {
          selectedImages.push(-1);
          return;
        }
        
        const totalRarity = layer.images.reduce((sum, img) => sum + img.rarity, 0);
        let random = Math.random() * totalRarity;
        let cumulative = 0;
        let selectedIndex = 0;
        
        for (let j = 0; j < layer.images.length; j++) {
          cumulative += layer.images[j].rarity;
          if (random <= cumulative) {
            selectedIndex = j;
            break;
          }
        }
        
        selectedImages.push(selectedIndex);
        selectedImageUrls.push(layer.images[selectedIndex].preview);
      });
      
      newPreviews.push({
        images: selectedImageUrls.filter(url => url !== undefined),
        layers: selectedImages.filter(idx => idx !== -1),
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        usedLayers
      });
    }
    
    setPreviews(newPreviews);
    setActiveTab('preview');
  }, [batchSize, layers, calculateAllCombinations]);

  const downloadPreview = useCallback((preview: Preview) => {
    if (!preview || preview.images.length === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const layersToDraw = [...preview.layers]
      .map((imgIdx, i) => ({ 
        layerIdx: i,
        imgIdx,
        zIndex: layers[i]?.zIndex || 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
    
    let imagesLoaded = 0;
    const totalImages = preview.images.length;
    
    layersToDraw.forEach(({ imgIdx }) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        imagesLoaded++;
        
        if (imagesLoaded === totalImages) {
          const link = document.createElement('a');
          link.download = `nft-${preview.id}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };
      img.onerror = () => {
        console.error('Failed to load image for download');
        imagesLoaded++;
      };
      img.src = preview.images[imgIdx];
    });
  }, [layers]);

  const downloadAllAsZip = useCallback(async () => {
    if (previews.length === 0) return;
    
    setIsGeneratingZip(true);
    setDownloadProgress(0);
    const zip = new JSZip();
    const imgFolder = zip.folder("nfts");
    
    let metadataContent = 'Filename;';
    metadataContent += layers.map(layer => layer.name).join(';') + '\n';
    
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingZip(false);
      return;
    }

    const totalItems = previews.length;
    let processedItems = 0;

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      const fileName = `nft-${i + 1}.png`;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const layersToDraw = preview.layers
        .map((imgIdx, layerIdx) => ({ 
          layerIdx,
          imgIdx,
          zIndex: layers[layerIdx]?.zIndex || 0
        }))
        .sort((a, b) => a.zIndex - b.zIndex);
      
      let metadataRow = `${fileName};`;
      
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
    
    saveAs(content, 'nft-collection.zip');
    setIsGeneratingZip(false);
    setDownloadProgress(0);
  }, [previews, layers]);

  return (
    <>
      <Head>
        <title>Pedro | NFT Builder</title>
        <meta name="description" content="Build your own NFT with layers" />
        <meta property="og:image" content="/pedro_logo4.png" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
        {isGeneratingZip && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Downloading...</h3>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-300 text-center">
                {Math.round(downloadProgress)}% complete
              </p>
            </div>
          </div>
        )}

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
          <section className="flex items-center justify-center py-4 sm:py-7 text-center relative overflow-hidden px-2">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-4 sm:px-6 max-w-4xl relative z-10"
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                NFT GENERATOR
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <div className='px-2 sm:px-0'>
            <section className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 bg-black/50 rounded-xl border border-white/10 mb-3 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 sm:mb-3 text-white">How It Works</h2>
              
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-400">Getting Started</h3>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-3 text-sm sm:text-base text-white/80">
                    <li className="mb-1 sm:mb-2">
                      <span className="font-medium">Add Layers</span> - Create different layers for your NFT
                    </li>
                    <li className="mb-1 sm:mb-2">
                      <span className="font-medium">Upload Images</span> - Add variations for each layer
                    </li>
                    <li className="mb-1 sm:mb-2">
                      <span className="font-medium">Set Rarity</span> - Adjust percentage chance for each image + layer
                    </li>
                    <li>
                      <span className="font-medium">Generate NFTs</span> - Create random combinations
                    </li>
                  </ol>
                </div>

                <div className="bg-white/5 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-blue-400">Key Features</h3>
                  <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-white/80">
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                      <span><strong>Layer Rarity</strong> - Control how often each layer appears</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                      <span><strong>Image Rarity</strong> - Set individual image probabilities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                      <span><strong>Complete Metadata</strong> - Includes "None" for unused layers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-500/20 text-blue-400 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center mr-2 mt-0.5 text-xs sm:text-sm">✓</span>
                      <span><strong>Free</strong> - For now there is no cost till 10-05-2025!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="container max-w-7xl mx-auto px-3 sm:px-4 pb-16 sm:pb-20">
            <div className="flex border-b border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
              <button
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'builder' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('builder')}
              >
                Builder
              </button>
              <button
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base font-medium ${activeTab === 'preview' ? 'text-white border-b-2 border-white' : 'text-gray-400'}`}
                onClick={() => setActiveTab('preview')}
                disabled={previews.length === 0 && layers.length === 0}
              >
                Preview
              </button>
            </div>

            {activeTab === 'builder' ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-black/50 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                    <input
                      type="text"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      placeholder="New layer name"
                      className="w-full sm:flex-1 bg-white border border-gray-700 rounded px-3 py-2 sm:px-4 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                      onKeyDown={(e) => e.key === 'Enter' && addLayer()}
                    />
                    <Button
                      onClick={addLayer}
                      className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors py-2 sm:py-3 px-4 text-sm sm:text-base" 
                      label={"Add Layer"}
                    />
                  </div>

                  {layers.length === 0 && (
                    <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                      No layers added yet. Add your first layer to get started.
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-6">
                    {layers.map((layer, layerIndex) => (
                      <div key={layerIndex} className="bg-gray-800 bg-opacity-50 p-3 sm:p-5 rounded-lg border border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <input
                              type="checkbox"
                              checked={layer.enabled}
                              onChange={() => toggleLayerEnabled(layerIndex)}
                              className="h-4 w-4 sm:h-5 sm:w-5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                            />
                            <h3 className="text-lg sm:text-xl font-semibold truncate max-w-[180px] sm:max-w-none">{layer.name}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                <span className="text-xs mr-1 text-gray-400">Z:</span>
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
                                  className="w-12 sm:w-16 bg-gray-700 border border-gray-600 rounded px-1 sm:px-2 py-1 text-center text-xs sm:text-sm"
                                  title="Z-Index (stacking order)"
                                />
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs mr-1 text-gray-400">%:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={layer.layerRarity}
                                  onChange={(e) => updateLayerRarity(layerIndex, e.target.value)}
                                  className="w-12 sm:w-16 bg-gray-700 border border-gray-600 rounded px-1 sm:px-2 py-1 text-center text-xs sm:text-sm"
                                  title="Layer appearance chance"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeLayer(layerIndex)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Remove layer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="mb-3 sm:mb-4">
                          <input
                            type="file"
                            ref={(el: HTMLInputElement | null) => {
                              if (el) {
                                fileInputRefs.current[layerIndex] = el;
                              }
                            }}
                            onChange={(e) => handleImageUpload(layerIndex, e)}
                            multiple
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            onClick={() => fileInputRefs.current[layerIndex]?.click()}
                            className="bg-black hover:bg-white text-white hover: text-black px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm"
                          >
                            Add Images
                          </button>
                          {layer.images.length > 0 && (
                            <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-400">
                              {layer.images.length} image{layer.images.length !== 1 ? 's' : ''} (Total rarity: {layer.images.reduce((sum, img) => sum + img.rarity, 0)}%)
                            </span>
                          )}
                        </div>

                        {layer.images.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                            {layer.images.map((image, imageIndex) => (
                              <div key={imageIndex} className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                                  <img
                                    src={image.preview}
                                    alt={image.name}
                                    className="object-contain max-h-full max-w-full"
                                  />
                                </div>
                                <div className="p-1 sm:p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs truncate">{image.name}</span>
                                    <button
                                      onClick={() => removeImage(layerIndex, imageIndex)}
                                      className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                                      title="Remove image"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="flex items-center space-x-1 sm:space-x-2">
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      value={image.rarity}
                                      onChange={(e) => updateRarity(layerIndex, imageIndex, e.target.value)}
                                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-6 sm:w-8 text-right">{image.rarity}%</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
                            No images added to this layer yet.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/50 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 sm:mb-4">Generate NFTs</h3>
                      <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="w-full">
                          <label className="block text-xs sm:text-sm text-gray-400 mb-1">Number to generate (max {totalCombinations})</label>
                          <input
                            type="number"
                            min="1"
                            max={totalCombinations}
                            value={batchSize}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setBatchSize(Math.min(totalCombinations, Math.max(1, val)));
                            }}
                            className="w-full bg-white border border-gray-700 rounded px-3 py-2 sm:px-4 sm:py-3 text-black focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base"
                          />
                        </div>
                        <Button
                          onClick={generateBatchPreviews}
                          disabled={layers.length === 0 || layers.some(layer => layer.images.length === 0)}
                          className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 sm:py-3 rounded-lg font-medium ${layers.length === 0 || layers.some(layer => layer.images.length === 0) ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-colors text-sm sm:text-base`} 
                          label={"Generate NFTs"}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold mb-2 sm:mb-3">Statistics</h3>
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Layers:</span>
                          <span>{layers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Images:</span>
                          <span>{layers.reduce((sum, layer) => sum + layer.images.length, 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Unique Combinations:</span>
                          <span>{totalCombinations.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Enabled Layers:</span>
                          <span>{layers.filter(l => l.enabled).length}/{layers.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900 bg-opacity-50 p-4 sm:p-6 rounded-xl border border-gray-700">
                {previews.length > 0 ? (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Generated Previews ({previews.length}/{totalCombinations})
                      </h2>
                      <div className="flex space-x-2 sm:space-x-3">
                        <button
                          onClick={generateBatchPreviews}
                          disabled={previews.length >= totalCombinations}
                          className={`px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm ${previews.length >= totalCombinations ? 'bg-gray-700 cursor-not-allowed' : 'bg-black hover:bg-white text-white hover:text-black'}`}
                        >
                          Generate More
                        </button>
                        <button
                          onClick={downloadAllAsZip}
                          disabled={isGeneratingZip}
                          className={`px-3 py-1 sm:px-4 sm:py-2 rounded transition-colors text-xs sm:text-sm ${isGeneratingZip ? 'bg-blue-700 cursor-wait' : 'bg-black hover:bg-white text-white hover:text-black'}`}
                        >
                          {isGeneratingZip ? 'Processing...' : 'Download All'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {previews.map((preview) => (
                        <div key={preview.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                          <div className="relative aspect-square bg-gray-900">
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
                          <div className="p-2 sm:p-3">
                            <button
                              onClick={() => downloadPreview(preview)}
                              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-1 sm:py-2 rounded transition-colors text-xs sm:text-sm"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">No previews generated yet</div>
                    <button
                      onClick={() => {
                        generateBatchPreviews();
                        setActiveTab('preview');
                      }}
                      disabled={layers.length === 0 || layers.some(layer => layer.images.length === 0)}
                      className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base ${layers.length === 0 || layers.some(layer => layer.images.length === 0) ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
                    >
                      Generate Your First Batch
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