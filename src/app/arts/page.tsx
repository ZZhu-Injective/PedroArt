'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from 'react';

interface GalleryImage {
  url: string;
  title: string;
  link: string;
}

interface CardProps {
  imageUrl: string;
  title: string;
  link: string;
  index: number;
}

const images: GalleryImage[] = [
  { url: 'fan80.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },  
  { url: 'fan79.jpg', title: 'Mary_Inj', link: 'https://x.com/Mary_Inj' },
  { url: 'fan78.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },  
  { url: 'fan77.jpg', title: 'NwudeChris1', link: 'https://x.com/NwudeChris1' },  
  { url: 'fan76.jpg', title: 'ZaynaharX9639', link: 'https://x.com/ZaynaharX9639' },
  { url: 'fan75.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },
  { url: 'fan74.jpg', title: 'amstar_art', link: 'https://x.com/amstar_art' },
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } },
};

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const Card = ({ imageUrl, title, link, index }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      initial={{ opacity: 0.6 }}
      whileHover={{ 
        scale: 1.08,
        zIndex: 10,
        opacity: 1,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl bg-black/20 shadow-2xl hover:shadow-white/20 transition-all duration-500 backdrop-blur-sm border border-white/10 hover:border-white/30 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        animate={{
          background: isHovered 
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15), transparent 70%)`
            : 'transparent'
        }}
      />
      
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/40 transition-all duration-500 z-20 pointer-events-none rounded-2xl" />
      
      {isHovered && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              initial={{
                opacity: 0,
                scale: 0,
                x: Math.random() * 100,
                y: Math.random() * 100,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 0.5 + Math.random() * 0.5, 0],
                x: Math.random() * 100,
                y: Math.random() * 100,
              }}
              transition={{
                duration: 1.5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              style={{
                width: `${1 + Math.random() * 4}px`,
                height: `${1 + Math.random() * 4}px`,
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl">
        <Image 
          src={`/${imageUrl}`}
          alt={title}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 6}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="bg-gradient-to-t from-black/95 via-black/70 p-5 to-transparent rounded-b-2xl">
        <motion.h3 
          className="text-white text-xl font-bold text-center py-3 tracking-tight"
        >
          {title}
        </motion.h3>
        
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <button
              onClick={() => window.open(link, '_blank')}
              className="flex items-center gap-2 bg-black/80 hover:bg-black text-white hover:text-white text-sm font-medium px-6 py-3 rounded-full border border-white/30 hover:border-white transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <XIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="relative z-10">VIEW PROFILE</span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/20 rounded-full transition-all duration-300" />
            </button>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
        animate={{
          x: isHovered ? mousePosition.x * 0.03 : 0,
          y: isHovered ? mousePosition.y * 0.03 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Image 
          src={`/${imageUrl}`}
          alt={title}
          fill
          className="object-cover blur-[2px] opacity-0 group-hover:opacity-20 scale-110"
        />
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
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (galleryRef.current) {
      observer.observe(galleryRef.current);
    }

    return () => {
      if (galleryRef.current) {
        observer.unobserve(galleryRef.current);
      }
    };
  }, []);

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
                className="text-4xl md:text-7xl font-bold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
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
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent mb-4"
              />
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
              >
                THANK YOU FAM
              </motion.p>
            </motion.div>
          </section>

          <section className="relative py-4 px-4 mx-auto max-w-[1500px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"
            >
              {[
                { label: 'ART PIECES', value: images.length },
                { label: 'ARTISTS', value: new Set(images.map(img => img.title)).size },
                { label: 'COMMUNITY', value: '800+' },
                { label: 'INSPIRATION', value: '100%' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300"
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="relative py-8 px-4 mx-auto max-w-[1500px]" ref={galleryRef}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {images.map((image, index) => (
                <Card 
                  key={index}
                  imageUrl={image.url} 
                  title={image.title}
                  link={image.link}
                  index={index}
                />
              ))}
            </motion.div>
          </section>
        </div>

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