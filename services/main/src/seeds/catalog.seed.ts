/**
 * Seed del catálogo de CloudCart.
 *
 * Elimina los productos de prueba y siembra un catálogo realista (~16 productos
 * en 6 categorías) con imágenes, rating y precios de descuento para que el
 * storefront luzca a nivel de marketplace.
 *
 * Uso: pnpm seed   (o: tsx --env-file=.env src/seeds/catalog.seed.ts)
 */
import { connect, connection, model } from 'mongoose';
import { Product, ProductSchema } from '../modules/catalog/domain/product.schema';

interface SeedProduct {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviewCount?: number;
    currency: string;
    category: string;
    tags: string[];
    stock: number;
    attributes: Record<string, unknown>;
    images: string[];
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=800&q=80`;

const PRODUCTS: SeedProduct[] = [
    // ── Electrónica ────────────────────────────────────────────────
    {
        name: 'Auriculares Inalámbricos Pro',
        description:
            'Auriculares over-ear con cancelación activa de ruido (ANC), 30hs de batería y sonido de alta fidelidad. Bluetooth 5.3 y multipunto.',
        price: 79.99,
        originalPrice: 129.99,
        rating: 4.8,
        reviewCount: 342,
        currency: 'USD',
        category: 'Electrónica',
        tags: ['audio', 'bluetooth', 'anc'],
        stock: 120,
        attributes: { color: 'negro', conexión: 'Bluetooth 5.3', batería: '30 hs' },
        images: [unsplash('photo-1505740420928-5e560c06d30e')],
    },
    {
        name: 'Smartwatch Serie X',
        description:
            'Smartwatch con GPS, monitor de ritmo cardíaco, oxígeno en sangre y más de 40 modos deportivos. Resistente al agua 5ATM.',
        price: 149.99,
        originalPrice: 199.99,
        rating: 4.6,
        reviewCount: 210,
        currency: 'USD',
        category: 'Electrónica',
        tags: ['smartwatch', 'fitness', 'gps'],
        stock: 85,
        attributes: { pantalla: '1.8" AMOLED', batería: '10 días', correa: 'silicón' },
        images: [unsplash('photo-1523275335684-37898b6baf30')],
    },
    {
        name: 'Smartphone Nova 5G',
        description:
            'Celular 5G con pantalla OLED 120Hz, triple cámara de 108MP y carga rápida de 66W. 256GB de almacenamiento.',
        price: 599.99,
        originalPrice: 749.99,
        rating: 4.5,
        reviewCount: 508,
        currency: 'USD',
        category: 'Electrónica',
        tags: ['celular', '5g', 'android'],
        stock: 60,
        attributes: { pantalla: '6.7" OLED', cámara: '108 MP', almacenamiento: '256 GB' },
        images: [unsplash('photo-1598327105666-5b89351aff97')],
    },
    {
        name: 'Notebook Ultra 14"',
        description:
            'Ultrabook de 14" con procesador de última generación, 16GB RAM y SSD de 512GB. Ideal para trabajo y estudio.',
        price: 899.99,
        originalPrice: 1099.99,
        rating: 4.7,
        reviewCount: 156,
        currency: 'USD',
        category: 'Electrónica',
        tags: ['notebook', 'ultrabook', 'trabajo'],
        stock: 32,
        attributes: { pantalla: '14" IPS', ram: '16 GB', disco: '512 GB SSD' },
        images: [unsplash('photo-1496181133206-80ce9b88a853')],
    },

    // ── Zapatillas ─────────────────────────────────────────────────
    {
        name: 'Zapatilla Running Pro',
        description:
            'Zapatilla de running con amortiguación de respuesta, mesh transpirable y suela de agarre para largas distancias.',
        price: 89.99,
        originalPrice: 119.99,
        rating: 4.9,
        reviewCount: 421,
        currency: 'USD',
        category: 'Zapatillas',
        tags: ['running', 'deporte', 'ligera'],
        stock: 150,
        attributes: { talla: '42', color: 'rojo', tipo: 'running' },
        images: [unsplash('photo-1542291026-7eec264c27ff')],
    },
    {
        name: 'Zapatilla Urbana Classic',
        description:
            'Zapatilla casual de estilo urbano con cuero sintético premium y plantilla acolchada para el uso diario.',
        price: 69.99,
        originalPrice: 89.99,
        rating: 4.4,
        reviewCount: 198,
        currency: 'USD',
        category: 'Zapatillas',
        tags: ['urbana', 'casual', 'cómoda'],
        stock: 210,
        attributes: { talla: '41', color: 'blanco', tipo: 'casual' },
        images: [unsplash('photo-1595950653106-6c9ebd614d3a')],
    },
    {
        name: 'Botas Trekking Impermeables',
        description:
            'Botas de trekking impermeables con protección de tobillo, ideales para senderismo en cualquier clima.',
        price: 129.99,
        originalPrice: 159.99,
        rating: 4.7,
        reviewCount: 87,
        currency: 'USD',
        category: 'Zapatillas',
        tags: ['trekking', 'impermeable', 'montaña'],
        stock: 45,
        attributes: { talla: '43', color: 'marrón', tipo: 'trekking' },
        images: [unsplash('photo-1608256246200-53e635b5b65f')],
    },

    // ── Moda ───────────────────────────────────────────────────────
    {
        name: 'Campera de Jean',
        description:
            'Campera de jean clásica con corte oversize, botones de metal y bolsillos frontales. Un básico que nunca falla.',
        price: 54.99,
        originalPrice: 79.99,
        rating: 4.3,
        reviewCount: 264,
        currency: 'USD',
        category: 'Moda',
        tags: ['jean', 'oversize', 'campera'],
        stock: 95,
        attributes: { talla: 'M', material: 'denim', color: 'azul' },
        images: [unsplash('photo-1543076447-215ad9ba6923')],
    },
    {
        name: 'Remera Oversize Básica',
        description:
            'Remera de algodón orgánico con corte oversize y cuello redondo. Suave, transpirable y perfecta para el día a día.',
        price: 24.99,
        originalPrice: 34.99,
        rating: 4.5,
        reviewCount: 733,
        currency: 'USD',
        category: 'Moda',
        tags: ['remera', 'algodón', 'básica'],
        stock: 320,
        attributes: { talla: 'L', material: 'algodón orgánico', color: 'blanco' },
        images: [unsplash('photo-1576566588028-4147f3842f27')],
    },
    {
        name: 'Vestido Elegante',
        description:
            'Vestido midi elegante con cintura definida y tela fluida. Ideal para eventos y salidas especiales.',
        price: 69.99,
        originalPrice: 99.99,
        rating: 4.6,
        reviewCount: 145,
        currency: 'USD',
        category: 'Moda',
        tags: ['vestido', 'elegante', 'evento'],
        stock: 58,
        attributes: { talla: 'S', material: 'viscosa', color: 'negro' },
        images: [unsplash('photo-1595777457583-95e059d581b8')],
    },

    // ── Libros ─────────────────────────────────────────────────────
    {
        name: 'Clean Architecture',
        description:
            'El clásico de Robert C. Martin sobre arquitectura de software: límites, estructura y diseño de sistemas mantenibles.',
        price: 34.5,
        rating: 4.8,
        reviewCount: 1290,
        currency: 'USD',
        category: 'Libros',
        tags: ['software', 'arquitectura', 'clean code'],
        stock: 200,
        attributes: { autor: 'Robert C. Martin', idioma: 'inglés', formato: 'tapa blanda' },
        images: [unsplash('photo-1512820790803-83ca734da794')],
    },
    {
        name: 'Pack 3 Libros de Negocios',
        description:
            'Trilogía esencial de negocios: hábitos atómicos, cómo ganar amigos y el arte de la guerra. Incluye tres títulos.',
        price: 45.99,
        originalPrice: 59.99,
        rating: 4.4,
        reviewCount: 89,
        currency: 'USD',
        category: 'Libros',
        tags: ['negocios', 'hábitos', 'pack'],
        stock: 74,
        attributes: { idioma: 'español', formato: 'tapa blanda', contenido: '3 libros' },
        images: [unsplash('photo-1544716278-ca5e3f4abd8c')],
    },

    // ── Deportes ───────────────────────────────────────────────────
    {
        name: 'Botella Térmica 1L',
        description:
            'Botella térmica de acero inoxidable que mantiene tu bebida fría 24hs o caliente 12hs. Libre de BPA y a prueba de fugas.',
        price: 29.99,
        originalPrice: 39.99,
        rating: 4.7,
        reviewCount: 512,
        currency: 'USD',
        category: 'Deportes',
        tags: ['hidratación', 'térmica', 'gym'],
        stock: 400,
        attributes: { capacidad: '1 L', material: 'acero inoxidable', color: 'mate' },
        images: [unsplash('photo-1602143407151-7111542de6e8')],
    },
    {
        name: 'Set de Mancuernas Ajustables',
        description:
            'Par de mancuernas ajustables de 2.5 a 24kg cada una. Ahorra espacio y cubre todos tus ejercicios de fuerza.',
        price: 119.99,
        originalPrice: 159.99,
        rating: 4.6,
        reviewCount: 76,
        currency: 'USD',
        category: 'Deportes',
        tags: ['fuerza', 'gym', 'mancuernas'],
        stock: 28,
        attributes: { peso: '2.5–24 kg', material: 'hierro fundido', incluye: 'par' },
        images: [unsplash('photo-1571019613454-1cb2f99b2d8b')],
    },

    // ── Hogar ──────────────────────────────────────────────────────
    {
        name: 'Lámpara LED Minimalista',
        description:
            'Lámpara de escritorio LED con temperatura de color regulable, brazo articulado y carga USB integrada.',
        price: 42.99,
        originalPrice: 59.99,
        rating: 4.5,
        reviewCount: 233,
        currency: 'USD',
        category: 'Hogar',
        tags: ['lámpara', 'led', 'escritorio'],
        stock: 140,
        attributes: { color: 'blanco', luz: 'regulable', puerto: 'USB' },
        images: [unsplash('photo-1507473885765-e6ed057f782c')],
    },
    {
        name: 'Silla Ergonómica',
        description:
            'Silla de oficina ergonómica con soporte lumbar, apoyabrazos ajustables y respaldo de malla transpirable.',
        price: 189.99,
        originalPrice: 249.99,
        rating: 4.8,
        reviewCount: 104,
        currency: 'USD',
        category: 'Hogar',
        tags: ['oficina', 'ergonómica', 'silla'],
        stock: 22,
        attributes: { material: 'malla', ajustes: 'lumbar y brazos', color: 'negro' },
        images: [unsplash('photo-1592078615290-033ee584e267')],
    },
];

const TEST_PRODUCT_NAMES = [
    'T',
    'Test Admin',
    'Clean Architecture', // versión vieja de prueba (el seed inserta la real)
    'Laptop UltraBook 14',
];

async function seed(): Promise<void> {
    const mongoUri =
        process.env.MONGODB_URI ||
        'mongodb://cloudcart:cloudcart_dev_password@localhost:27017/cloudcart?authSource=admin';

    console.log('Conectando a MongoDB...');
    await connect(mongoUri);
    const ProductModel = model(Product.name, ProductSchema);

    const seedNames = PRODUCTS.map((p) => p.name);
    const toDelete = [...new Set([...TEST_PRODUCT_NAMES, ...seedNames])];

    const deleted = await ProductModel.deleteMany({ name: { $in: toDelete } });
    console.log(`  Eliminados: ${deleted.deletedCount} (pruebas + re-seed)`);

    const inserted = await ProductModel.insertMany(
        PRODUCTS.map((p) => ({ ...p, isActive: true })),
    );
    console.log(`  Insertados: ${inserted.length} productos`);

    console.log('\nCatálogo sembrado:');
    for (const p of PRODUCTS) {
        const discount = p.originalPrice
            ? ` (${Math.round((1 - p.price / p.originalPrice) * 100)}% OFF)`
            : '';
        console.log(
            `  • [${p.category}] ${p.name} — $${p.price}${discount} — ★${p.rating} (${p.reviewCount})`,
        );
    }

    await connection.close();
    console.log('\n✓ Seed completado');
}

seed().catch((err) => {
    console.error('Error en el seed:', err);
    process.exit(1);
});
