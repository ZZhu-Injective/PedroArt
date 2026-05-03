'use client';
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from 'react';

interface GalleryImage {
  url: string;
  title: string;
  link: string;
}

const images: GalleryImage[] = [
  { url: 'fan83.jpg', title: 'Dee_vinchi', link: 'https://x.com/Dee_vinchi' },  
  { url: 'fan82.jpg', title: 'singularity_66', link: 'https://x.com/singularity_66' },  
  { url: 'fan81.jpg', title: 'afro_v1', link: 'https://x.com/afro_v1' },  
  { url: 'fan80.jpg', title: 'kayd_kova', link: 'https://x.com/kayd_kova' },  
  { url: 'fan79.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan78.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },  
  { url: 'fan77.jpg', title: 'NwudeChris1', link: 'https://x.com/NwudeChris1' },  
  { url: 'fan76.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan75.jpg', title: 'NwudeChris1', link: 'https://x.com/NwudeChris1' },
  { url: 'fan74.jpg', title: '?', link: 'https://x.com/?' },
  { url: 'fan73.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan72.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan71.jpg', title: 'web3rana', link: 'https://x.com/web3rana' },  
  { url: 'fan70.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan69.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan68.jpg', title: 'Varsha2527', link: 'https://x.com/Varsha2527' },  
  { url: 'fan67.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },
  { url: 'fan66.jpg', title: 'Dee_vinchi', link: 'https://x.com/Dee_vinchi' },
  { url: 'fan65.jpg', title: 'Clarkson_Es', link: 'https://x.com/Clarkson_Es' },
  { url: 'fan64.jpg', title: 'adam_nevergone', link: 'https://x.com/adam_nevergone' },
  { url: 'fan63.jpg', title: 'Dayve17_', link: 'https://x.com/Dayve17_' },
  { url: 'fan62.jpg', title: '123SAINTe', link: 'https://x.com/123SAINTe' },
  { url: 'fan61.jpg', title: 'felixx_78', link: 'https://x.com/felixx_78' },
  { url: 'fan60.jpg', title: 'Dayve17_', link: 'https://x.com/Dayve17_' },
  { url: 'fan59.jpg', title: 'adam_nevergone', link: 'https://x.com/adam_nevergone' },
  { url: 'fan58.jpg', title: 'jayd3_official', link: 'https://x.com/jayd3_official' },
  { url: 'fan57.jpg', title: 'Varsha2527', link: 'https://x.com/Varsha2527' },
  { url: 'fan56.jpg', title: 'Jehad_S01', link: 'https://x.com/Jehad_S01' },
  { url: 'fan55.jpg', title: 'MachiyaNFT', link: 'https://x.com/MachiyaNFT' },
  { url: 'fan54.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan53.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan52.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan51.jpg', title: 'felixx_78', link: 'https://x.com/felixx_78' },
  { url: 'fan50.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan49.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan48.jpg', title: 'zar_batyshka', link: 'https://x.com/zar_batyshka' },
  { url: 'fan47.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan46.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan45.jpg', title: 'Meowza', link: 'https://x.com/Meowza' },
  { url: 'fan44.jpg', title: 'adam_nevergone', link: 'https://x.com/adam_nevergone' },
  { url: 'fan43.jpg', title: 'adam_nevergone', link: 'https://x.com/adam_nevergone' },
  { url: 'fan42.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan41.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan40.jpg', title: 'Cherry_inj', link: 'https://x.com/cherry_inj' },
  { url: 'fan39.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan38.jpg', title: 'LazorioB', link: 'https://x.com/LazorioB' },
  { url: 'fan37.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan36.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan35.jpg', title: 'zar_batyshka', link: 'https://x.com/zar_batyshka' },
  { url: 'fan34.jpg', title: 'Adam42931', link: 'https://x.com/Adam42931' },
  { url: 'fan33.jpg', title: 'Kayd_kova', link: 'https://x.com/kayd_kova' },
  { url: 'fan32.jpg', title: 'MachiyaNFT', link: 'https://x.com/MachiyaNFT' },
  { url: 'fan31.jpg', title: 'Adam42931', link: 'https://x.com/Adam42931' },
  { url: 'fan29.jpg', title: 'Adam42931', link: 'https://x.com/Adam42931' },
  { url: 'fan28.jpg', title: 'zar_batyshka', link: 'https://x.com/zar_batyshka' },
  { url: 'fan27.jpg', title: 'zar_batyshka', link: 'https://x.com/zar_batyshka' },
  { url: 'fan26.jpg', title: 'the_crannberry', link: 'https://x.com/the_crannberry' },
  { url: 'fan25.jpg', title: 'MahmoudH0110', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan24.jpg', title: 'felixx_78', link: 'https://x.com/felixx_78' },
  { url: 'fan23.jpg', title: 'OttyUbINJ', link: 'https://x.com/OttyUbINJ' },
  { url: 'fan22.jpg', title: 'mimie_jayzz', link: 'https://x.com/mimie_jayzz' },
  { url: 'fan21.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan20.jpg', title: 'pokoInj', link: 'https://x.com/Poko120141' },
  { url: 'fan19.jpg', title: 'NomberFax.inj', link: 'https://x.com/NomberFax' },
  { url: 'fan18.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan17.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan16.jpg', title: 'Adam42931', link: 'https://x.com/Adam42931' },
  { url: 'fan15.jpg', title: 'OttyUbINJ', link: 'https://x.com/OttyUbINJ' },
  { url: 'fan14.jpg', title: 'Meowza', link: 'https://x.com/Meowzakie' },
  { url: 'fan1.jpg', title: 'OttyUbINJ', link: 'https://x.com/OttyUbINJ' },
  { url: 'fan2.jpg', title: 'Amster', link: 'https://x.com/amstar_art' },
  { url: 'fan3.jpg', title: 'mimie_jayzz', link: 'https://x.com/mimie_jayzz' },
  { url: 'fan4.jpg', title: 'CryptoBrifif', link: 'https://x.com/CryptoBrifif' },
  { url: 'fan5.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan6.jpg', title: 'ShiviXBT', link: 'https://x.com/ShiviXBT' },
  { url: 'fan7.jpg', title: 'MB Fourteen', link: 'https://x.com/MahmoudH0110' },
  { url: 'fan8.jpg', title: 'NomberFax.inj', link: 'https://x.com/NomberFax' },
  { url: 'fan10.jpg', title: 'Dragon Knight', link: 'https://x.com/AltamashKPRMR' },
  { url: 'fan11.png', title: 'ProudlyMatthew', link: 'https://x.com/ProudlyMatthew' },
  { url: 'fan12.png', title: 'InjPanda', link: 'https://x.com/InjPanda' },
  { url: 'fan13.png', title: 'Socrates122263', link: 'https://x.com/Socrates122263' },
];

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const MasonryCard = ({ image, index, onView }: { image: GalleryImage; index: number; onView: () => void }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: (index % 16) * 0.04, duration: 0.5, ease: "easeOut" }}
      className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border border-gray-800/60 hover:border-white/60 transition-all duration-500 cursor-zoom-in shadow-lg hover:shadow-white/10"
      onClick={onView}
    >
      <img
        src={`/${image.url}`}
        alt={`Art by ${image.title}`}
        loading="lazy"
        className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">Artist</p>
            <p className="text-white font-bold truncate font-mono tracking-tight text-sm sm:text-base">@{image.title}</p>
          </div>
          <a
            href={image.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            aria-label={`${image.title} on X`}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 hover:border-white transition-colors backdrop-blur-md"
          >
            <XIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-2">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

const Lightbox = ({ image, onClose }: { image: GalleryImage; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative max-w-6xl w-full flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 z-10 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full max-h-[75vh] flex items-center justify-center bg-black/60 rounded-2xl border border-gray-800/60 overflow-hidden">
          <img
            src={`/${image.url}`}
            alt={`Art by ${image.title}`}
            className="w-auto h-auto max-w-full max-h-[75vh] object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-black/60 backdrop-blur-xl border border-gray-800/60 rounded-2xl p-4 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-mono">Pedro Fan Artist</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight mt-1">@{image.title}</h3>
          </div>
          <a
            href={image.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-400 bg-transparent text-gray-300 font-mono uppercase tracking-tight text-sm hover:bg-white hover:text-black hover:border-white transition-all duration-300"
          >
            <XIcon className="w-4 h-4" />
            <span>View Profile</span>
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

const FloatingSparkles = () => {
  const [sparkles, setSparkles] = useState<{x: string, y: string, size: number, id: number, color: string, delay: number}[]>([]);

  useEffect(() => {
    const createSparkle = () => ({
      id: Date.now() + Math.random(),
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      size: Math.random() * 6 + 3,
      color: `radial-gradient(circle, 
        ${Math.random() > 0.5 ? '#ffffff' : '#888888'} 0%, 
        transparent 80%)`,
      delay: Math.random() * 3000
    });

    const initialSparkles = Array.from({ length: 25 }, createSparkle);
    setSparkles(initialSparkles);

    const interval = setInterval(() => {
      const newSparkle = createSparkle();
      setSparkles(prev => [...prev, newSparkle]);
      
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 4000);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            background: sparkle.color,
            animationDelay: `${sparkle.delay}ms`,
            boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.size}px ${sparkle.color}`
          }}
        />
      ))}
    </div>
  );
};

const AnimatedGrid = () => {
  return (
    <div className="fixed inset-0 z-0 opacity-20">
      <div className="absolute inset-0 bg-grid-animation"></div>
    </div>
  );
};

export default function Art() {
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <Head>
        <title>Pedro | Fan Art Gallery</title>
        <meta name="description" content="Explore fan art from the Pedro community" />
        <meta property="og:image" content="/pedro_logo4.png" />
      </Head>

      <div className="min-h-screen bg-black text-white overflow-hidden font-mono selection:bg-white selection:text-black">
        <AnimatedGrid />
        <FloatingSparkles />
        
        <div className="fixed inset-0 z-0 opacity-30">
          <Image
            src="/wallpaper9.webp"
            alt="Pedro The Raccoon Wallpaper"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative z-10">
          <section className="flex items-center justify-center py-12 text-center relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="px-6 max-w-4xl relative z-10"
            >
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-mono mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                FANS ART
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-gray-500 to-transparent mb-6"
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-mono"
              >
                THANK YOU FAM
              </motion.p>
            </motion.div>
          </section>

          <section className="relative container mx-auto px-4 sm:px-5 py-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6"
            >
              {[
                { label: 'Art Pieces', value: images.length },
                { label: 'Artists', value: new Set(images.map(img => img.title)).size },
                { label: 'Community', value: '800+' },
                { label: 'Inspiration', value: '100%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="text-center p-4 sm:p-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-800/60 hover:border-white/40 transition-all duration-300"
                >
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 font-mono tracking-tight">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-mono uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="relative container mx-auto px-4 sm:px-5 pt-2 pb-16 max-w-7xl">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {images.map((image, index) => (
                <MasonryCard
                  key={image.url}
                  image={image}
                  index={index}
                  onView={() => setLightboxImage(image)}
                />
              ))}
            </div>
          </section>
        </div>

        <AnimatePresence>
          {lightboxImage && (
            <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
          )}
        </AnimatePresence>

        <style jsx global>{`
          @keyframes sparkle {
            0% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(2) rotate(180deg); opacity: 0; }
          }

          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }

          @keyframes grid {
            0% { background-position: 0 0; }
            100% { background-position: 50px 50px; }
          }

          .sparkle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle 1.5s ease-out forwards, float 4s ease-in-out infinite;
            z-index: 30;
            filter: blur(1px);
          }

          .bg-grid-animation {
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid 20s linear infinite;
          }

          body {
            background-color: #000;
            overflow-x: hidden;
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #000;
          }

          ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </>
  );
}