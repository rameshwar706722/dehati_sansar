import OfferCarousel from '../components/OfferCarousel';
import HeroSection from '../components/HeroSection';
import ProductCatalog from '../components/ProductCatalog';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Carousel */}
      <OfferCarousel />

      {/* 2. Hero */}
      <HeroSection />

      {/* 3. Product Catalog */}
      <ProductCatalog />

 
    </div>
  );
}