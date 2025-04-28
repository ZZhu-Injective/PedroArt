'use client';
import { motion } from "framer-motion";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef } from 'react';
import Button from '@/components/basic_button';

interface GalleryImage {
  url: string;
  link: string;
}

interface CardProps {
  imageUrl: string;
  link: string;
  index: number;
}

const images: GalleryImage[] = [
  { url: 'meme2.jpg', link: 'https://x.com/MahmoudH0110' },
  { url: 'meme3.jpg', link: 'https://x.com/felixx_78' },
  { url: 'meme4.jpg', link: 'https://x.com/the_crannberry' },
  { url: 'meme5.jpg', link: 'https://x.com/MahmoudH0110' },
  { url: 'meme6.jpg', link: 'https://x.com/felixx_78' },
  { url: 'meme7.jpg', link: 'https://x.com/the_crannberry' },
  { url: 'meme8.jpg', link: 'https://x.com/MahmoudH0110' },
  { url: 'meme9.jpg', link: 'https://x.com/felixx_78' },
  { url: 'meme10.jpg', link: 'https://x.com/the_crannberry' },
  { url: 'meme11.jpg', link: 'https://x.com/MahmoudH0110' },
  { url: 'meme12.jpg', link: 'https://x.com/felixx_78' },
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

const Card = ({ imageUrl, link, index }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      variants={itemVariants}
      initial={{ opacity: 0.8 }}
      whileHover={{ 
        scale: 1.05, 
        zIndex: 10,
        opacity: 1
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="group relative overflow-hidden rounded-lg bg-black/80 shadow-lg hover:shadow-xl hover:shadow-white/10 transition-all duration-300"
    >
      <div className="absolute inset-0 border-2 border-white/20 group-hover:border-white/50 transition-all duration-500 z-20 pointer-events-none rounded-lg" />
      <div className="relative w-full aspect-square overflow-hidden rounded-lg">
        <Image 
          src={`/${imageUrl}`}
          alt={"art"}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 6}
        />
      </div>
      
      <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 rounded-b-lg">
        <div className="flex justify-center">
          <Button 
            onClick={() => window.open(link, '_blank')}
            className="text-white hover:text-black hover:bg-white text-sm font-medium px-4 py-2 rounded-full border border-white/30 hover:border-white transition-all"
            label={"Follow Creator"}
          />
        </div>
      </div>
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
        <title>Pedro | Meme Gallery</title>
        <meta name="description" content="Explore meme from the Pedro community" />
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
                MEME JOKER
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "circOut" }}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </motion.div>
          </section>

          <section className="relative py-5 px-6 max-w-7xl mx-auto" ref={galleryRef}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {images.map((image, index) => (
                <Card 
                  key={index}
                  imageUrl={image.url} 
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