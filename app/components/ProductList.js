'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAndParseCSV } from '../../utils/csvParser';

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [cart, setCart] = useState([]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.nombre === product.nombre);
      if (existing) {
        return prev.map(item => item.nombre === product.nombre ? { ...item, quantity: item.quantity + quantity } : item);
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
    setExpandedProduct(null);
    setTempQuantity(1);
  };

  const updateCartQuantity = (productName, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.nombre !== productName));
    } else {
      setCart(prev => prev.map(item => item.nombre === productName ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleAgregarClick = (productName) => {
    if (expandedProduct === productName) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productName);
      setTempQuantity(1);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseFloat(item.precio_detal) || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const total = calculateTotal();

  const generateWhatsAppMessage = () => {
    const items = cart.map(item => {
      const price = parseFloat(item.precio_detal) || 0;
      const itemTotal = price * item.quantity;
      return `- ${item.nombre} x${item.quantity} - $${itemTotal.toLocaleString('es-CO')}`;
    }).join('\n');
    return `Hola quiero pedir:\n${items}\n\nTotal: $${total.toLocaleString('es-CO')}`;
  };

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
            <div className="product-info">
              <h3>{product.nombre}</h3>
              <p><strong>Marca:</strong> {product.marca}</p>
              <p><strong>Categoría:</strong> {product.categoria}</p>
              <p><strong>Precio Detal:</strong> ${product.precio_detal}</p>
              <p><strong>Precio Mayor:</strong> ${product.precio_mayor}</p>
            </div>
            <div className="product-actions">
              {expandedProduct === product.nombre ? (
                <div className="quantity-controls">
                  <button onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))} className="qty-btn">−</button>
                  <span className="qty-value">{tempQuantity}</span>
                  <button onClick={() => setTempQuantity(tempQuantity + 1)} className="qty-btn">+</button>
                  <button onClick={() => addToCart(product, tempQuantity)} className="qty-confirm">✓</button>
                </div>
              ) : (
                <button onClick={() => handleAgregarClick(product.nombre)} className="add-btn">Agregar</button>
              )}
            </div>
          </div>
        ))}
      </div>
      {cart.length > 0 && (
        <div className="cart-section">
          <h2>Carrito</h2>
          <div className="cart-items">
            {cart.map((item, index) => {
              const itemPrice = parseFloat(item.precio_detal) || 0;
              const itemTotal = itemPrice * item.quantity;
              return (
                <div key={index} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.nombre}</span>
                    <span className="cart-item-price">${itemTotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateCartQuantity(item.nombre, item.quantity - 1)} className="cart-qty-btn">−</button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.nombre, item.quantity + 1)} className="cart-qty-btn">+</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="cart-total">
            <span>Total:</span>
            <span className="total-amount">${total.toLocaleString('es-CO')}</span>
          </div>
          <a href={`https://wa.me/573147183219?text=${encodeURIComponent(generateWhatsAppMessage())}`} className="order-btn" target="_blank" rel="noopener noreferrer">
            💬 Pedir por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}