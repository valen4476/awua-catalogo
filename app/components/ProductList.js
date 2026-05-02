'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAndParseCSV } from '../../utils/csvParser';

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchAndParseCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vRo4COSXmE_q_pW5OJUQTj8aKxbqEsEXZZ4-iXc7N5fwz92UfnfdrgyvRVAgtlruBtKL9Pcw8jNY2Yv/pub?output=csv');
      setAllProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const uniqueCategorias = useMemo(() => {
    const categorias = [...new Set(allProducts.map(p => p.categoria).filter(Boolean))];
    return categorias;
  }, [allProducts]);

  const uniqueMarcas = useMemo(() => {
    const marcas = [...new Set(allProducts.map(p => p.marca).filter(Boolean))];
    return marcas;
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesCategoria = !selectedCategoria || product.categoria === selectedCategoria;
      const matchesMarca = !selectedMarca || product.marca === selectedMarca;
      return matchesCategoria && matchesMarca;
    });
  }, [allProducts, selectedCategoria, selectedMarca]);

  if (loading) return <p style={{ textAlign: 'center', padding: '20px', fontSize: '1.2em', color: '#880e4f' }}>Loading products...</p>;

  return (
    <div>
      <div className="filters">
        <label>
          Filtrar por Categoría:
          <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}>
            <option value="">Todas</option>
            {uniqueCategorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </label>
        <label>
          Filtrar por Marca:
          <select value={selectedMarca} onChange={(e) => setSelectedMarca(e.target.value)}>
            <option value="">Todas</option>
            {uniqueMarcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
          </select>
        </label>
      </div>
      <div className="product-grid">
        {filteredProducts.map((product, index) => (
          <div key={index} className="product-card">
            <h3>{product.nombre}</h3>
            <p><strong>Marca:</strong> {product.marca}</p>
            <p><strong>Categoria:</strong> {product.categoria}</p>
            <p><strong>Precio Detal:</strong> {product.precio_detal}</p>
            <p><strong>Precio Mayor:</strong> {product.precio_mayor}</p>
            <p><strong>Ganancia:</strong> {product.ganancia}</p>
            <a href={`https://wa.me/57XXXXXXXXXX?text=Hola quiero pedir ${encodeURIComponent(product.nombre)}`} className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
              Pedir por WhatsApp
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}