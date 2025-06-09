'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from 'react';
import Button from '@/components/basic_button';

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
          className="text-white text-xl font-bold text-center py-5 tracking-tight"
        >
          {title}
        </motion.h3>
        
        <div className="flex justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              onClick={() => window.open(link, '_blank')}
              className="text-white bg-transparent hover:bg-white hover:text-black text-sm font-medium px-6 py-2.5 rounded-full border border-white/50 hover:border-white transition-all duration-300 relative overflow-hidden group" 
              label={"FOLLOW ARTIST"}            
            />
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
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <section className="relative sm:py-8 py-2 px-2 sm: mx-auto max-w-[1500px]" ref={galleryRef}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4"
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
      </div>
    </>
  );
}