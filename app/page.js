import ProductList from './components/ProductList';

export default function Home() {
  return (
    <main className="main-page">
      <header className="site-header">
        <div className="brand-header">
          <img
            src="/awua-logo.jpg"
            alt="Awua Tienda de Belleza"
            className="brand-logo"
          />

          <div className="brand-copy">
            <h1>Awua Tienda de Belleza</h1>
            <p className="brand-subtitle">Catálogo Mayorista</p>
            <p className="brand-description">
              Descubre lo que tu tienda necesita.
            </p>
          </div>
        </div>
      </header>

      <section className="catalog-water-bg">
        <ProductList />
      </section>
    </main>
  );
}
