'use client';

import Image from 'next/image';

/**
 * Collection component displaying NFT gallery
 * Features:
 * - Grid layout of all images
 * - Hover effects
 * - Responsive design
 */
export default function Collection() {
  const images = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <section id="collection" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-gray-900 mb-4">
            The Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our exclusive NFT collection featuring unique digital artwork.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((imageNum) => (
            <div
              key={imageNum}
              className="group relative aspect-video rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Image
                src={`/img/${imageNum}.jpg`}
                alt={`NFT ${imageNum}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-lg">
                    La Dolfina #{imageNum}
                  </p>
                  <p className="text-gray-200 text-sm">
                    Limited Edition
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
