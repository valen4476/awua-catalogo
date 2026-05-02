import ProductList from './components/ProductList';

export default function Home() {
  return (
    <main>
      <h1 style={{ textAlign: 'center', padding: '20px', color: '#880e4f' }}>Welcome to Next.js 14</h1>
      <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.1em' }}>This is a basic homepage.</p>
      <ProductList />
    </main>
  )
}