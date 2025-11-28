import Hero from './components/Hero';
import ManifoldCollection from './components/ManifoldCollection';

/**
 * Home page component
 * Features:
 * - Hero section with image gallery
 * - Collection grid with Manifold auction tokens
 * - Responsive design for all screen sizes
 */
export default function Home() {
  return (
    <main>
      <div id="home">
        <Hero />
      </div>
      <ManifoldCollection />
    </main>
  );
}
