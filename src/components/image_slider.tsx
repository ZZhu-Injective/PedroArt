
import { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageSlider = () => {
  const images: string[] = [
    '/pedro1.png',
    '/pedro2.png',
    '/pedro3.png',
    '/pedro4.png',
    '/pedro5.png',
    '/pedro6.png',
    '/pedro7.png',
    '/pedro8.png',
    '/pedro9.png',
    '/pedro10.png',
    '/pedro11.png',
  ];

  const getRandomIndex = (): number => Math.floor(Math.random() * images.length);

  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(getRandomIndex());
    const interval = setInterval(() => {
      setCurrentImageIndex(getRandomIndex());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (currentImageIndex === null) {
    return <div>Loading...</div>; 
  }

  return (
    <Image 
      src={images[currentImageIndex]} 
      alt={`Image ${currentImageIndex + 1}`} 
      width={400} 
      height={400} 
      className="w-full h-auto object-cover"
    />
  );
};

export default ImageSlider;
