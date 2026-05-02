function normalizeKey(key) {
  return key
    .toLowerCase()
    .trim()
    .replace(/[áàâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[_\s-]/g, '');
}

function normalizeHeaders(headers) {
  const mapping = {};
  const normalized = headers.map(h => normalizeKey(h));
  
  normalized.forEach((norm, idx) => {
    if (/^(nombre|producto|productonombre)/.test(norm)) {
      mapping[idx] = 'nombre';
    } else if (/^marca/.test(norm)) {
      mapping[idx] = 'marca';
    } else if (/^categor/.test(norm)) {
      mapping[idx] = 'categoria';
    } else if (/^(preciodet|detal|precio$|preciodetal)/.test(norm)) {
      mapping[idx] = 'precio_detal';
    } else if (/^(preciomay|mayor|preciomayorist|mayorist)/.test(norm)) {
      mapping[idx] = 'precio_mayor';
    } else if (/^ganancia/.test(norm)) {
      mapping[idx] = 'ganancia';
    } else if (/^(image|foto|imagen|imagenurl|urlimage)/.test(norm)) {
      mapping[idx] = 'imagen';
    } else {
      mapping[idx] = headers[idx];
    }
  });
  
  return mapping;
}

export async function fetchAndParseCSV(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const headerMapping = normalizeHeaders(headers);
    const products = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length > 0 && values.some(v => v)) {
        const product = {};
        Object.entries(headerMapping).forEach(([index, key]) => {
          product[key] = (values[index] || '').trim();
        });
        
        if (product.nombre && product.nombre.trim()) {
          products.push(product);
        }
      }
    }

    return products;
  } catch (error) {
    console.error('Error fetching or parsing CSV:', error);
    return [];
  }
}