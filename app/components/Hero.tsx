'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Hero component inspired by Mootown design
 * Features:
 * - Main large image display
 * - Vertical thumbnail gallery on the right
 * - Image selection and navigation
 * - Responsive layout
 */
export default function Hero() {
  const [selectedImage, setSelectedImage] = useState(1);

  // Array of images from public/img folder
  const images = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <section className="min-h-[calc(100vh-64px)] bg-[#001e37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Title and Description */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-serif font-light text-white mb-6">
                La Dolfina
              </h1>
              <p className="text-base sm:text-xs text-gray-200 leading-relaxed">
                La Dolfina is one of the most prestigious polo clubs in Argentina, renowned for its excellence in the sport and commitment to tradition.
                This official NFT collection celebrates the legacy and heritage of La Dolfina, featuring exclusive digital artwork that captures the
                spirit of polo, the beauty of the Argentine countryside, and the passion that defines this legendary club.
              </p>
            </div>
          </div>

          {/* Right Column - Main Image and Thumbnails */}
          <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
            {/* Main Image */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-xl">
              <Image
                src={`/img/${selectedImage}.jpg`}
                alt={`NFT Collection Image ${selectedImage}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Thumbnail Gallery - Hidden scrollbar */}
            <div className="flex flex-col gap-2 h-full overflow-y-scroll max-h-[600px] scrollbar-hide">
              {images.map((imageNum) => (
                <button
                  key={imageNum}
                  onClick={() => setSelectedImage(imageNum)}
                  className={`
                    relative flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden
                    transition-all duration-300 border-2
                    ${selectedImage === imageNum
                      ? 'border-white shadow-md scale-105'
                      : 'border-transparent hover:border-gray-300 hover:shadow-sm opacity-70 hover:opacity-100'
                    }
                  `}
                >
                  <Image
                    src={`/img/${imageNum}.jpg`}
                    alt={`Thumbnail ${imageNum}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
