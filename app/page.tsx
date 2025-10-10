import Hero from './components/Hero';
import Collection from './components/Collection';

/**
 * Home page component
 * Features:
 * - Hero section with image gallery
 * - Collection grid
 * - Responsive design for all screen sizes
 */
export default function Home() {
  return (
    <main>
      <div id="home">
        <Hero />
      </div>
      <Collection />
    </main>
  );
}
