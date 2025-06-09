'use client';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AltHomePage() {
  const artImages = Array.from({ length: 8 }, (_, i) => `/Pedro${i + 1}.png`);
  const [typingComplete, setTypingComplete] = useState(false);

  const textToType = "This is a sacred space where we celebrate our $PEDRO artists, meme creators, and NFT visionaries. A permanent digital gallery showcasing their work for all time. Together we'll light the creative spark and elevate each other's art to new heights.";

  return (
    <>
      <Head>
        <title>PEDRO×ART</title>
        <meta name="description" content="Explore Pedro's art in pure black and white" />
      </Head>

      <div 
        className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black"
      >
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10" />
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
          
          <div 
            className="absolute inset-0"
            style={{
              maskImage: 'radial-gradient(ellipse at center, transparent 0%, black 100%)'
            }}
          />
        </div>

        <section className="relative flex items-center justify-center h-screen text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="px-6 max-w-4xl"
          >
            <motion.h1 
              className="text-5xl md:text-8xl font-bold mb-6 tracking-tighter font-mono"
              whileHover={{ scale: 1.02 }}
            >
              PEDRO × <span className="text-white font-mono bg-clip-text bg-gradient-to-r">ART</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl opacity-80 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Art is freedom
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-px w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent my-5 md:my-12"
            />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex justify-center mt-8"
            >
              <motion.a
                href="https://drive.google.com/drive/folders/1Zq7sQ0iAAvxNz-3woP8amSMNj1b-TJZE"
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-8 py-3 border-2 border-gray-400 bg-transparent text-gray-300 text-lg font-mono hover:bg-white hover:text-black hover:border-white transition-all duration-300">
                  MEDIA KIT
                </button>
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        <section className="relative py-32 px-6 max-w-4xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-32"
          >
            <h2 className="text-3xl md:text-5xl text-center font-bold tracking-tighter mb-12">
              <span className="text-white bg-clip-text bg-gradient-to-r">CREATOR SANCTUARY</span>
            </h2>
            
            <motion.div 
              className="text-xl md:text-2xl leading-relaxed text-center text-gray-300 font-light"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <TypingText 
                text={textToType} 
                speed={20} 
                onComplete={() => setTypingComplete(true)}
              />
              
              {typingComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-12"
                >
                  <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent my-8" />
                  <p className="text-lg italic opacity-70">
                    Recognition for creators
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </section>

        <section className="relative py-64 px-6 max-w-7xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl text-center font-bold tracking-tighter mb-6">
              <span className="text-white bg-clip-text bg-gradient-to-r">PEDRO NFT</span>
            </h2>
            <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {artImages.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                className="group relative overflow-hidden rounded-none aspect-square"
              >
                <div className="absolute inset-0 border border-gray-600 opacity-40 group-hover:border-gray-300 group-hover:opacity-70 transition-all duration-300 z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10" />
                <Image
                  src={src}
                  alt={`Pedro Art ${index + 1}`}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-0"
                  priority={index < 4}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                  <p className="text-gray-300 text-sm font-mono">PEDRO #{index + 1}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative py-16 md:py-64 px-4 sm:px-6 max-w-4xl mx-auto z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-6 md:mb-8">
              JOIN PEDRO <span className="text-white bg-clip-text bg-gradient-to-r">TODAY</span>
            </h2>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl opacity-80 mb-8 md:mb-12 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
            >
              Become part of our community on Injective.
            </motion.p>

            <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-gray-500 to-transparent my-8" />

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.a
                href="https://injective.talis.art/collection/67abd09e5bb1ebd34c3f2585"
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="px-6 sm:px-8 py-2 sm:py-3 border-2 border-gray-400 bg-transparent text-gray-300 text-base sm:text-lg font-mono hover:bg-white hover:text-black hover:border-white transition-all duration-300">
                  BUY NFT
                </button>
              </motion.a>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </>
  );
}

const TypingText = ({ text, speed, onComplete }: { text: string; speed: number; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className="typing-text">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="ml-1"
      >
        |
      </motion.span>
    </div>
  );
};