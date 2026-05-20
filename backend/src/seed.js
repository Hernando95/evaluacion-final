require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product.model');

const categories = [
  "Almacén", "Lácteos", "Carnes", "Frutas y Verduras", 
  "Panadería", "Embutidos", "Tecnología", "Belleza", "Medicamentos"
];

// Generador de productos realistas para VerdeMarket
const generateProducts = () => {
  const allProducts = [];
  
  const productData = {
    "Almacén": [
      "Arroz Largo Fino", "Fideos Tirabuzón", "Aceite de Girasol", "Yerba Mate", "Azúcar Blanca",
      "Harina 0000", "Puré de Tomate", "Sal Fina", "Mayonesa Clásica", "Atún al Natural",
      "Lentejas Parranda", "Café Instantáneo", "Té en saquitos", "Mermelada de Frutilla", "Polenta Mágica",
      "Galletitas Dulces", "Leche Condensada", "Vinagre de Manzana", "Sal Gruesa", "Ketchup Picante"
    ],
    "Lácteos": [
      "Leche Entera 1L", "Yogurt de Frutilla", "Queso Cremoso", "Manteca 200g", "Dulce de Leche",
      "Crema de Leche", "Queso Parmesano", "Ricotta Fresca", "Leche Descremada", "Postre de Chocolate",
      "Queso Azul", "Yogurt Natural", "Leche de Almendras", "Queso Tybo", "Margarina Vegetal",
      "Queso de Campo", "Ricotta Magra", "Leche Chocolatada", "Kefir Natural", "Queso Brie"
    ],
    "Carnes": [
      "Carne Picada Especial", "Milanesas de Pollo", "Asado de Tira", "Pechuga de Pollo", "Bife de Chorizo",
      "Costillita de Cerdo", "Matambre de Vaca", "Chorizo Puro Cerdo", "Vacio de Novillo", "Pata y Muslo",
      "Lomo de Cerdo", "Carne para Guiso", "Pollo Entero", "Peceto", "Cuadril",
      "Bola de Lomo", "Entraña", "Bondiola de Cerdo", "Carre de Cerdo", "Alitas de Pollo"
    ],
    "Frutas y Verduras": [
      "Manzanas Rojas", "Bananas Ecuador", "Tomates Perita", "Papas Lavadas", "Cebolla Blanca",
      "Naranjas Ombligo", "Zanahorias", "Lechuga Mantecosa", "Limones", "Pera Williams",
      "Zapallo Anco", "Morrón Rojo", "Berenjenas", "Espinaca Fresca", "Palta Hass",
      "Frutillas", "Uvas Blancas", "Acelga", "Choclo", "Ajo"
    ],
    "Panadería": [
      "Pan de Molde Blanco", "Medialunas Manteca", "Pan Francés", "Prepizzas", "Pan Rallado",
      "Galletas Marineras", "Pan Integral", "Facturas Surtidas", "Bizcochos de Grasa", "Micaela",
      "Pan de Hamburguesa", "Pan de Pancho", "Grisines", "Torta de Chocolate", "Muffins de Vainilla",
      "Pan Dulce", "Budín de Limón", "Talitas", "Pan de Campo", "Chipa"
    ],
    "Embutidos": [
      "Jamón Cocido", "Salame Milán", "Queso en Fetas", "Mortadela Bocha", "Salchichas Viena",
      "Chorizo Colorado", "Panceta Ahumada", "Queso Roquefort", "Bondiola en Fetas", "Lomito Ahumado",
      "Cantimpalo", "Leberwurst", "Queso Gouda", "Jamón Crudo", "Salame Criollo",
      "Queso Fontina", "Panceta Salada", "Queso de Cerdo", "Chistorra", "Morcilla Bombón"
    ],
    "Tecnología": [
      "Smartphone Android", "Auriculares Bluetooth", "Smart TV 50", "Notebook Pro", "Mouse Gamer",
      "Tablet 10", "Smartwatch Sport", "Teclado Mecánico", "Parlante Portátil", "Cámara Web HD",
      "Disco Externo 1TB", "Cable HDMI 2m", "Cargador Rápido", "Joystick inalámbrico", "Power Bank",
      "Router Wi-Fi 6", "Micrófono Condensador", "Monitor 24", "Soporte Notebook", "Funda Tablet"
    ],
    "Belleza": [
      "Crema Facial Q10", "Shampoo Restaurador", "Acondicionador Brillo", "Máscara Pestañas", "Base Maquillaje",
      "Protector Solar", "Desodorante Roll-on", "Crema Corporal", "Esmalte de Uñas", "Agua Micelar",
      "Labial Matte", "Perfume Floral", "Gel Limpiador", "Serum Vitamina C", "Jabón Líquido",
      "Crema de Manos", "Exfoliante Corporal", "Tinte Cabello", "Cepillo Dental Eléctrico", "Mascarilla Facial"
    ],
    "Medicamentos": [
      "Paracetamol 500mg", "Vitamina C", "Ibuprofeno 400mg", "Aspirina", "Omeprazol",
      "Loratadina", "Amoxicilina", "Diclofenac", "Clonazepam", "Losartán",
      "Levotiroxina", "Buscapina", "Sertralina", "Tafirol Plus", "Reliverán",
      "Antigripal Fuerte", "Gasas Estériles", "Alcohol en Gel", "Termómetro Digital", "Venda Elástica"
    ]
  };

  const imageIds = {
    "Almacén": "1542838132-92c53300491e",
    "Lácteos": "1550583724-125581cc25fb",
    "Carnes": "1607623814075-e512199b4282",
    "Frutas y Verduras": "1610832958506-aa56368176cf",
    "Panadería": "1509440159596-0249088772ff",
    "Embutidos": "1544073627-40c9b48687ce",
    "Tecnología": "1519389950473-47ba0277781c",
    "Belleza": "1596462502278-27bfdc4033c8",
    "Medicamentos": "1584308666744-24d5c474f2ae"
  };

  categories.forEach(cat => {
    const items = productData[cat];
    items.forEach((title, index) => {
      // Usar el nombre del producto para una imagen más específica
      const searchTerms = `${title.replace(/ /g, ',')},food`;
      allProducts.push({
        title,
        description: `Producto de alta calidad de la categoría ${cat}. Ideal para tu hogar.`,
        code: `${cat.substring(0, 2).toUpperCase()}${String(index + 1).padStart(3, '0')}`,
        price: Math.floor(Math.random() * (15000 - 1000 + 1)) + 1000,
        status: true,
        stock: 60,
        category: cat,
        brand: "VerdeMarket Premium",
        sku: `SKU-${cat.substring(0, 1)}-${index + 100}`,
        thumbnails: [`https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80`] // Placeholder base por si falla
      });
    });
  });

  // Mapeo de imágenes de alta calidad por categoría (URLs permanentes)
  const categoryImages = {
    "Almacén": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    "Lácteos": "https://images.unsplash.com/photo-1550583724-125581cc25fb?w=800&q=80",
    "Carnes": "https://images.unsplash.com/photo-1607623814075-e512199b4282?w=800&q=80",
    "Frutas y Verduras": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80",
    "Panadería": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    "Embutidos": "https://images.unsplash.com/photo-1544073627-40c9b48687ce?w=800&q=80",
    "Tecnología": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    "Belleza": "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800&q=80",
    "Medicamentos": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80"
  };

  allProducts.forEach(p => {
    p.thumbnails = [categoryImages[p.category] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"];
  });

  return allProducts;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB para masificar inventario');
    
    const products = generateProducts();

    await Product.deleteMany({});
    await Product.insertMany(products);
    
    console.log(`🌱 Inventario masificado: ${products.length} productos insertados (20 por categoría)`);
    console.log('📦 Stock por producto: 60 unidades');
    process.exit();
  } catch (err) {
    console.error('❌ Error en el seeding masivo:', err);
    process.exit(1);
  }
};

seedDB();
