'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAndParseCSV } from '../../utils/csvParser';
import { parsePrice, formatCurrency } from '../../utils/currency';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRo4COSXmE_q_pW5OJUQTj8aKxbqEsEXZZ4-iXc7N5fwz92UfnfdrgyvRVAgtlruBtKL9Pcw8jNY2Yv/pub?output=csv';

export default function ProductList() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});
  const [draftQuantities, setDraftQuantities] = useState({});

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchAndParseCSV(CSV_URL);
      setAllProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const uniqueCategorias = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.categoria).filter(Boolean))].sort();
  }, [allProducts]);

  const uniqueMarcas = useMemo(() => {
    return [...new Set(allProducts.map((p) => p.marca).filter(Boolean))].sort();
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.nombre && p.nombre.trim())
      .filter((p) => {
        const matchesCategoria = !selectedCategoria || p.categoria === selectedCategoria;
        const matchesMarca = !selectedMarca || p.marca === selectedMarca;
        return matchesCategoria && matchesMarca;
      });
  }, [allProducts, selectedCategoria, selectedMarca]);

  const handleImageError = (productKey) => () => {
    setFailedImages((prev) => ({ ...prev, [productKey]: true }));
  };

  const startDraft = (productName) => {
    setDraftQuantities((prev) => ({
      ...prev,
      [productName]: prev[productName] || 1,
    }));
  };

  const changeDraftQuantity = (productName, delta) => {
    setDraftQuantities((prev) => ({
      ...prev,
      [productName]: Math.max(1, (prev[productName] || 1) + delta),
    }));
  };

  const cancelDraft = (productName) => {
    setDraftQuantities((prev) => {
      const copy = { ...prev };
      delete copy[productName];
      return copy;
    });
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.nombre === product.nombre);
      if (existing) {
        return prev.map((item) =>
          item.nombre === product.nombre
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const confirmAddToCart = (product) => {
    const qty = draftQuantities[product.nombre] || 1;
    addToCart(product, qty);
    cancelDraft(product.nombre);
    setCartOpen(true);
  };

  const updateCartQuantity = (productName, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.nombre !== productName));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.nombre === productName ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productName) => {
    setCart((prev) => prev.filter((item) => item.nombre !== productName));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + parsePrice(item.precio_mayor) * item.quantity;
    }, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // ── Mensaje WhatsApp simplificado: solo productos, cantidad y total ──
  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return '';

    const items = cart
      .map((item) => `• ${item.nombre} x${item.quantity}`)
      .join('\n');

    return `Hola Awua, quiero hacer este pedido mayorista:\n\n${items}\n\nTotal: ${formatCurrency(cartTotal)}`;
  };

  if (loading) return <p className="loading-text">Cargando productos...</p>;

  return (
    <>
      {/* FILTROS */}
      <div className="filters-section">
        <div className="filters">
          <label>
            Categoría:
            <select value={selectedCategoria} onChange={(e) => setSelectedCategoria(e.target.value)}>
              <option value="">Todas</option>
              {uniqueCategorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <label>
            Marca:
            <select value={selectedMarca} onChange={(e) => setSelectedMarca(e.target.value)}>
              <option value="">Todas</option>
              {uniqueMarcas.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="product-grid">
        {filteredProducts.map((product, index) => {
          const productKey = `${product.nombre}-${index}`;
          const imageUrl = (product.imagen || product.imagen_url || product.foto || '').trim();
          const showImage = imageUrl && !failedImages[productKey];
          const draftQty = draftQuantities[product.nombre] || 1;

          return (
            <div key={productKey} className="product-card">
              <div className="product-image-container">
                {showImage ? (
                  <img
                    src={imageUrl}
                    alt={product.nombre}
                    className="product-image"
                    onError={handleImageError(productKey)}
                  />
                ) : (
                  <div className="product-image-placeholder">Imagen pendiente</div>
                )}
              </div>

              <div className="product-info">
                <h3>{product.nombre}</h3>
                {product.marca    && <p className="product-marca">Marca: {product.marca}</p>}
                {product.categoria && <p className="product-categoria">Categoría: {product.categoria}</p>}

                <div className="product-prices">
                  <p>
                    <span className="label">Precio Detal: </span>
                    <span className="price">
                      {product.precio_detal ? formatCurrency(parsePrice(product.precio_detal)) : 'Consultar'}
                    </span>
                  </p>
                  <p>
                    <span className="label">Precio Mayorista: </span>
                    <span className="price-mayor">
                      {product.precio_mayor ? formatCurrency(parsePrice(product.precio_mayor)) : 'Consultar'}
                    </span>
                  </p>
                  <p>
                    <span className="label">Ganancia: </span>
                    <span className="price">
                      {product.ganancia ? formatCurrency(parsePrice(product.ganancia)) : 'Consultar'}
                    </span>
                  </p>
                </div>

                <div className="product-actions">
                  {draftQuantities[product.nombre] ? (
                    <div className="card-qty-editor">
                      <button type="button" className="qty-btn"
                        onClick={() => changeDraftQuantity(product.nombre, -1)}>−</button>
                      <span className="qty-value">{draftQty}</span>
                      <button type="button" className="qty-btn"
                        onClick={() => changeDraftQuantity(product.nombre, 1)}>+</button>
                      <button type="button" className="btn-confirm"
                        onClick={() => confirmAddToCart(product)} title="Confirmar">✓</button>
                      <button type="button" className="btn-cancel"
                        onClick={() => cancelDraft(product.nombre)} title="Cancelar">✕</button>
                    </div>
                  ) : (
                    <button type="button" className="btn-agregar"
                      onClick={() => startDraft(product.nombre)}>
                      Agregar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTÓN FLOTANTE CARRITO */}
      {cartCount > 0 && (
        <button type="button" className="floating-cart-btn"
          onClick={() => setCartOpen(true)} aria-label="Abrir carrito">
          🛒
          <span className="cart-count">{cartCount}</span>
        </button>
      )}

      {/* MODAL CARRITO */}
      {cartOpen && (
        <div className="cart-modal-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>

            <div className="cart-header">
              <h2>Tu pedido mayorista</h2>
              <button type="button" className="btn-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <p className="empty-cart">Aún no has agregado productos.</p>
              ) : (
                cart.map((item, idx) => {
                  const unitPrice = parsePrice(item.precio_mayor);
                  const itemTotal = unitPrice * item.quantity;
                  return (
                    <div key={`${item.nombre}-${idx}`} className="cart-item">
                      <div className="cart-item-main">
                        <div className="cart-item-info">
                          <h4>{item.nombre}</h4>
                          {item.marca && <p className="cart-item-marca">{item.marca}</p>}
                          <p className="cart-item-price">
                            Precio x mayor: <strong>{formatCurrency(unitPrice)}</strong>
                          </p>
                        </div>
                        <div className="cart-item-right">
                          <div className="cart-item-controls">
                            <button type="button" className="qty-btn"
                              onClick={() => updateCartQuantity(item.nombre, item.quantity - 1)}>−</button>
                            <span className="qty-value">{item.quantity}</span>
                            <button type="button" className="qty-btn"
                              onClick={() => updateCartQuantity(item.nombre, item.quantity + 1)}>+</button>
                          </div>
                          <p className="cart-item-subtotal">
                            Subtotal: <strong>{formatCurrency(itemTotal)}</strong>
                          </p>
                        </div>
                      </div>
                      <button type="button" className="btn-remove"
                        onClick={() => removeFromCart(item.nombre)}>Eliminar</button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cart-summary">
              <div className="cart-total-row">
                <span>Total:</span>
                <span className="total-amount">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <div className="cart-actions">
              <a
                href={`https://wa.me/573147183219?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                className="btn-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Pedir por WhatsApp
              </a>
              <button type="button" className="btn-continue" onClick={() => setCartOpen(false)}>
                Seguir comprando
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}