import ProductList from './components/ProductList';

export default function Home() {
  return (
    <main>
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'linear-gradient(135deg, #e6f0ff 0%, #f0e6ff 100%)', borderBottom: '2px solid #d4af37' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#d4af37', fontSize: '2.5em' }}>AWUA Catálogo</h1>
        <p style={{ margin: 0, fontSize: '1.1em', color: '#3d3d5c' }}>Descubre nuestros productos</p>
      </div>
      <ProductList />
    </main>
  )
}