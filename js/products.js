/*
 * DE LA BOSS OUTFITS — demonstration catalogue
 * ------------------------------------------------------------------
 * Every product, price, colour, size and stock figure in this file is
 * SAMPLE DATA created for the website demonstration. It is not the real
 * inventory of DE LA BOSS OUTFITS.
 *
 * Replace the objects below with the shop owner's confirmed products, or
 * manage products from the demonstration admin dashboard.
 */
(function () {
  'use strict';

  window.DELA_CATEGORIES = [
    {
      id: 'men',
      name: 'Men',
      title: "Men's Fashion",
      description: 'Shirts, layers and tailored everyday pieces.',
      image: 'assets/images/categories/men.jpg',
      alt: 'Editorial menswear photograph of a man wearing a dark shirt and light trousers.'
    },
    {
      id: 'women',
      name: 'Women',
      title: "Women's Fashion",
      description: 'Dresses, separates and confident silhouettes.',
      image: 'assets/images/categories/women.jpg',
      alt: 'Editorial portrait of a woman wearing a white shirt in an outdoor setting.'
    },
    {
      id: 'shoes',
      name: 'Shoes',
      title: 'Shoes',
      description: 'Sneakers, leather classics and statement soles.',
      image: 'assets/images/categories/shoes.jpg',
      alt: 'Pair of high-top sneakers photographed against a clean background.'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      title: 'Accessories',
      description: 'Bags, watches and finishing details.',
      image: 'assets/images/categories/accessories.jpg',
      alt: 'Flat lay of a watch, sunglasses and everyday accessories.'
    },
    {
      id: 'essentials',
      name: 'Essentials',
      title: 'Everyday Essentials',
      description: 'The foundation pieces that do the most work.',
      image: 'assets/images/categories/essentials.jpg',
      alt: 'Folded denim jeans photographed on a neutral background.'
    },
    {
      id: 'new',
      name: 'New',
      title: 'New Arrivals',
      description: 'The latest additions to the sample collection.',
      image: 'assets/images/categories/new.jpg',
      alt: 'Fashion editorial portrait of a woman in a black outfit and boots.'
    }
  ];

  window.DELA_DEFAULT_PRODUCTS = [
    {
      id: 'db-001',
      name: 'The Kehancha Oxford Shirt',
      category: 'Men',
      subcategory: 'Shirts',
      price: 3200,
      compareAt: null,
      stock: 12,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Ocean Blue', hex: '#34596B' },
        { name: 'Bone', hex: '#D8CEBD' }
      ],
      images: ['assets/images/products/db-001.jpg', 'assets/images/products/db-001-detail.jpg'],
      description: 'A clean button-down shirt with an easy point collar and a relaxed everyday shape. Styled for workdays, weekends and everything in between.',
      details: ['Relaxed sample fit', 'Button front and chest pocket', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: true,
      newArrival: false,
      dateAdded: '2026-09-14'
    },
    {
      id: 'db-002',
      name: 'Migori Tailored Trousers',
      category: 'Men',
      subcategory: 'Trousers',
      price: 2800,
      compareAt: null,
      stock: 8,
      sizes: ['30', '32', '34', '36', '38'],
      colors: [{ name: 'Bone', hex: '#E3DDD2' }],
      images: ['assets/images/products/db-002.jpg', 'assets/images/products/db-002-detail.jpg'],
      description: 'A straight-leg trouser with a polished line and a quiet, versatile finish. Designed to move easily from daytime to evening.',
      details: ['Straight-leg sample silhouette', 'Side pockets', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-08'
    },
    {
      id: 'db-003',
      name: 'Sunset Puffer Jacket',
      category: 'Men',
      subcategory: 'Jackets',
      price: 5400,
      compareAt: null,
      stock: 5,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Black', hex: '#171717' },
        { name: 'Rust', hex: '#A5573B' }
      ],
      images: ['assets/images/products/db-003.jpg', 'assets/images/products/db-003-detail.jpg'],
      description: 'A lightweight puffer with a confident volume and a clean zip front. A practical layer for cool mornings and late nights.',
      details: ['Quilted sample outer', 'Zip front and side pockets', 'Sample catalogue item — insulation and fit to be confirmed with the store'],
      featured: true,
      newArrival: false,
      dateAdded: '2026-08-30'
    },
    {
      id: 'db-004',
      name: 'Heritage Denim Jacket',
      category: 'Men',
      subcategory: 'Jackets',
      price: 4900,
      compareAt: 5900,
      stock: 6,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Indigo', hex: '#354A60' }],
      images: ['assets/images/products/db-004.jpg', 'assets/images/products/db-004-detail.jpg'],
      description: 'A timeless denim layer with a boxy shape and room for a hoodie underneath. Built for repeat wear and easy styling.',
      details: ['Classic collared sample jacket', 'Button front and flap pockets', 'Sample sale price shown for demonstration only'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-08-21'
    },
    {
      id: 'db-005',
      name: 'Noir Leather Jacket',
      category: 'Men',
      subcategory: 'Outerwear',
      price: 6800,
      compareAt: null,
      stock: 4,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#141414' }],
      images: ['assets/images/products/db-005.jpg', 'assets/images/products/db-005-detail.jpg'],
      description: 'A sharp black outer layer with a minimal zip front and an effortless edge. The piece that finishes a simple outfit.',
      details: ['Slim sample silhouette', 'Asymmetric zip detail', 'Sample catalogue item — material and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-08-12'
    },
    {
      id: 'db-006',
      name: 'Amani Print Midi Dress',
      category: 'Women',
      subcategory: 'Dresses',
      price: 4200,
      compareAt: null,
      stock: 9,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Earth Print', hex: '#8B6345' }],
      images: ['assets/images/products/db-006.jpg', 'assets/images/products/db-006-detail.jpg'],
      description: 'An easy midi dress with a graphic earth-toned print and a fluid line. Dress it up with heels or keep it grounded in sandals.',
      details: ['Relaxed sample fit', 'Round neckline and short sleeves', 'Sample catalogue item — print scale and fit to be confirmed with the store'],
      featured: true,
      newArrival: true,
      dateAdded: '2026-10-16'
    },
    {
      id: 'db-007',
      name: 'Sienna Column Dress',
      category: 'Women',
      subcategory: 'Dresses',
      price: 3900,
      compareAt: null,
      stock: 7,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Oyster', hex: '#D7CEC1' },
        { name: 'Black', hex: '#181818' }
      ],
      images: ['assets/images/products/db-007.jpg', 'assets/images/products/db-007-detail.jpg'],
      description: 'A clean column silhouette with a contour waist and an elegant neckline. Understated, sculptural and made for an entrance.',
      details: ['Column sample silhouette', 'Contrast waist detail', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-25'
    },
    {
      id: 'db-008',
      name: 'Nia Long-Sleeve Mini Dress',
      category: 'Women',
      subcategory: 'Dresses',
      price: 3600,
      compareAt: null,
      stock: 6,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#151515' }],
      images: ['assets/images/products/db-008.jpg', 'assets/images/products/db-008-detail.jpg'],
      description: 'A close-cut mini dress with long sleeves and a confident simplicity. Wear it as a standalone statement or under a tailored layer.',
      details: ['Fitted sample silhouette', 'Long sleeves', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-02'
    },
    {
      id: 'db-009',
      name: 'Lulu Belted Shirt Dress',
      category: 'Women',
      subcategory: 'Dresses',
      price: 4100,
      compareAt: null,
      stock: 5,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#161616' }],
      images: ['assets/images/products/db-009.jpg', 'assets/images/products/db-009-detail.jpg'],
      description: 'A modern shirt dress with a defined waist and a playful back detail. Easy to style, impossible to overlook.',
      details: ['Belted sample waist', 'Button back detail', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: true,
      newArrival: true,
      dateAdded: '2026-10-12'
    },
    {
      id: 'db-010',
      name: 'Zuri Wide-Leg Trousers',
      category: 'Women',
      subcategory: 'Trousers',
      price: 2900,
      compareAt: null,
      stock: 8,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Brick', hex: '#A84432' },
        { name: 'Black', hex: '#171717' }
      ],
      images: ['assets/images/products/db-010.jpg', 'assets/images/products/db-010-detail.jpg'],
      description: 'A fluid wide-leg trouser that brings instant movement to a simple top. The kind of piece that makes getting dressed feel easy.',
      details: ['High-rise sample fit', 'Wide leg', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-11'
    },
    {
      id: 'db-011',
      name: 'Malaika Everyday Blouse',
      category: 'Women',
      subcategory: 'Tops',
      price: 2400,
      compareAt: null,
      stock: 10,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Rose', hex: '#C47A83' }],
      images: ['assets/images/products/db-011.jpg', 'assets/images/products/db-011-detail.jpg'],
      description: 'A softly textured blouse with a neat neckline and an easy drape. An effortless partner for denim, tailoring or a favourite skirt.',
      details: ['Relaxed sample fit', 'Short sleeves', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-18'
    },
    {
      id: 'db-012',
      name: 'Nairobi Layered Blouse',
      category: 'Women',
      subcategory: 'Tops',
      price: 2600,
      compareAt: null,
      stock: 4,
      sizes: ['XS', 'S', 'M', 'L'],
      colors: [{ name: 'Ivory', hex: '#EEE7DB' }],
      images: ['assets/images/products/db-012.jpg', 'assets/images/products/db-012-detail.jpg'],
      description: 'A light layering piece with a relaxed collar and an airy finish. Add it over a simple base for an instant change of mood.',
      details: ['Relaxed overshirt sample fit', 'Button front', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-05'
    },
    {
      id: 'db-013',
      name: 'Court Classic Sneakers',
      category: 'Shoes',
      subcategory: 'Sneakers',
      price: 4800,
      compareAt: null,
      stock: 14,
      sizes: ['39', '40', '41', '42', '43', '44'],
      colors: [{ name: 'White / Blue', hex: '#DCE4ED' }],
      images: ['assets/images/products/db-013.jpg', 'assets/images/products/db-013-detail.jpg'],
      description: 'A clean court-inspired sneaker with a high-top profile and a confident colour block. The everyday pair that does more than one job.',
      details: ['High-top sample silhouette', 'Cushioned collar', 'Sample catalogue item — sizing and materials to be confirmed with the store'],
      featured: true,
      newArrival: true,
      dateAdded: '2026-10-14'
    },
    {
      id: 'db-014',
      name: 'Street High-Top Sneakers',
      category: 'Shoes',
      subcategory: 'Sneakers',
      price: 5200,
      compareAt: null,
      stock: 9,
      sizes: ['39', '40', '41', '42', '43', '44', '45'],
      colors: [{ name: 'Black', hex: '#191919' }],
      images: ['assets/images/products/db-014.jpg', 'assets/images/products/db-014-detail.jpg'],
      description: 'A monochrome high-top with a canvas attitude and an easy everyday sole. Pair it with denim, tailoring or a dress.',
      details: ['High-top sample silhouette', 'Lace-up front', 'Sample catalogue item — sizing and materials to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-08-28'
    },
    {
      id: 'db-015',
      name: 'Trail Runner Sneakers',
      category: 'Shoes',
      subcategory: 'Sneakers',
      price: 4500,
      compareAt: 5200,
      stock: 6,
      sizes: ['39', '40', '41', '42', '43', '44'],
      colors: [{ name: 'Bone', hex: '#D9D1C3' }],
      images: ['assets/images/products/db-015.jpg', 'assets/images/products/db-015-detail.jpg'],
      description: 'A sculpted runner with a chunky sole and a soft neutral finish. Comfort-first styling with a little extra presence.',
      details: ['Chunky sample sole', 'Padded collar', 'Sample sale price shown for demonstration only'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-09'
    },
    {
      id: 'db-016',
      name: 'Kijani Retro Runners',
      category: 'Shoes',
      subcategory: 'Sneakers',
      price: 5600,
      compareAt: null,
      stock: 8,
      sizes: ['39', '40', '41', '42', '43', '44', '45'],
      colors: [{ name: 'Green / Black', hex: '#24523A' }],
      images: ['assets/images/products/db-016.jpg', 'assets/images/products/db-016-detail.jpg'],
      description: 'A retro basketball-inspired runner in deep green and black. A strong finish for a simple outfit, or the main event on its own.',
      details: ['Retro high-top sample silhouette', 'Contrast sole', 'Sample catalogue item — sizing and materials to be confirmed with the store'],
      featured: true,
      newArrival: true,
      dateAdded: '2026-10-10'
    },
    {
      id: 'db-017',
      name: 'Heritage Leather Oxfords',
      category: 'Shoes',
      subcategory: 'Formal',
      price: 6200,
      compareAt: null,
      stock: 5,
      sizes: ['40', '41', '42', '43', '44', '45'],
      colors: [{ name: 'Cognac', hex: '#8A4E2F' }],
      images: ['assets/images/products/db-017.jpg', 'assets/images/products/db-017-detail.jpg'],
      description: 'A polished leather Oxford with a warm patina and a timeless profile. For the days that call for something considered.',
      details: ['Lace-up sample silhouette', 'Leather-look finish', 'Sample catalogue item — materials and sizing to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-08-19'
    },
    {
      id: 'db-018',
      name: 'Savannah Leather Loafers',
      category: 'Shoes',
      subcategory: 'Formal',
      price: 5800,
      compareAt: null,
      stock: 4,
      sizes: ['40', '41', '42', '43', '44', '45'],
      colors: [{ name: 'Brown', hex: '#6C452C' }],
      images: ['assets/images/products/db-018.jpg', 'assets/images/products/db-018-detail.jpg'],
      description: 'A woven leather loafer with an easy slip-on shape. Smart enough for work, relaxed enough for the rest of the day.',
      details: ['Woven sample upper', 'Slip-on silhouette', 'Sample catalogue item — materials and sizing to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-01'
    },
    {
      id: 'db-019',
      name: 'Kesi Leather Tote',
      category: 'Accessories',
      subcategory: 'Bags',
      price: 4400,
      compareAt: null,
      stock: 7,
      sizes: ['One Size'],
      colors: [{ name: 'Tan', hex: '#B77A49' }],
      images: ['assets/images/products/db-019.jpg', 'assets/images/products/db-019-detail.jpg'],
      description: 'A structured tote with a top handle and a warm tan finish. Roomy enough for the day, clean enough to carry anywhere.',
      details: ['Top-handle sample tote', 'Structured body', 'Sample catalogue item — dimensions and materials to be confirmed with the store'],
      featured: true,
      newArrival: false,
      dateAdded: '2026-09-22'
    },
    {
      id: 'db-020',
      name: 'Mara Chain Shoulder Bag',
      category: 'Accessories',
      subcategory: 'Bags',
      price: 3800,
      compareAt: null,
      stock: 3,
      sizes: ['One Size'],
      colors: [{ name: 'Cognac', hex: '#8C5434' }],
      images: ['assets/images/products/db-020.jpg', 'assets/images/products/db-020-detail.jpg'],
      description: 'A compact shoulder bag with a chain detail and a rich cognac tone. The easiest way to finish a look.',
      details: ['Chain shoulder sample strap', 'Compact body', 'Sample catalogue item — dimensions and materials to be confirmed with the store'],
      featured: false,
      newArrival: true,
      dateAdded: '2026-10-08'
    },
    {
      id: 'db-021',
      name: 'Solstice Watch Set',
      category: 'Accessories',
      subcategory: 'Watches',
      price: 3500,
      compareAt: 4300,
      stock: 2,
      sizes: ['One Size'],
      colors: [{ name: 'Black / Gold', hex: '#9C7B45' }],
      images: ['assets/images/products/db-021.jpg', 'assets/images/products/db-021-detail.jpg'],
      description: 'A clean watch-and-frames pairing for everyday finishing. Quiet details that bring a look together.',
      details: ['Sample watch and eyewear set', 'Adjustable strap', 'Sample sale price shown for demonstration only'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-16'
    },
    {
      id: 'db-022',
      name: 'The Accessories Edit',
      category: 'Accessories',
      subcategory: 'Sets',
      price: 4900,
      compareAt: null,
      stock: 3,
      sizes: ['One Size'],
      colors: [{ name: 'Black', hex: '#171717' }],
      images: ['assets/images/products/db-022.jpg', 'assets/images/products/db-022-detail.jpg'],
      description: 'A considered edit of everyday accessories — watch, eyewear and finishing pieces styled together. One easy gift to yourself.',
      details: ['Curated sample accessories set', 'Set contents may vary', 'Sample catalogue item — exact contents to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-06'
    },
    {
      id: 'db-023',
      name: 'Everyday Denim',
      category: 'Essentials',
      subcategory: 'Denim',
      price: 3300,
      compareAt: null,
      stock: 11,
      sizes: ['30', '32', '34', '36', '38'],
      colors: [
        { name: 'Mid Blue', hex: '#4C6B8A' },
        { name: 'Indigo', hex: '#2F4661' }
      ],
      images: ['assets/images/products/db-023.jpg', 'assets/images/products/db-023-detail.jpg'],
      description: 'A dependable straight-leg denim with an easy rise and a lived-in blue wash. The piece you reach for without thinking.',
      details: ['Straight-leg sample fit', 'Classic five-pocket styling', 'Sample catalogue item — fabric and fit to be confirmed with the store'],
      featured: false,
      newArrival: false,
      dateAdded: '2026-09-03'
    },
    {
      id: 'db-024',
      name: 'The Essential Cotton Tee',
      category: 'Essentials',
      subcategory: 'Tops',
      price: 1500,
      compareAt: null,
      stock: 18,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'White', hex: '#F1EEE7' },
        { name: 'Black', hex: '#181818' }
      ],
      images: ['assets/images/products/db-024.jpg', 'assets/images/products/db-024-detail.jpg'],
      description: 'A clean crew-neck tee with a relaxed shape and an easy finish. The foundation of a wardrobe that works hard.',
      details: ['Relaxed sample fit', 'Crew neckline', 'Sample catalogue item — fabric weight and fit to be confirmed with the store'],
      featured: true,
      newArrival: true,
      dateAdded: '2026-10-18'
    },
    {
      id: 'db-025',
      name: 'Canvas Market Tote',
      category: 'Essentials',
      subcategory: 'Bags',
      price: 1900,
      compareAt: null,
      stock: 0,
      sizes: ['One Size'],
      colors: [{ name: 'Natural', hex: '#C9B28D' }],
      images: ['assets/images/products/db-025.jpg', 'assets/images/products/db-025-detail.jpg'],
      description: 'A simple canvas tote with leather handles and a generous everyday shape. Designed for errands, markets and everything in between.',
      details: ['Canvas sample body', 'Leather-look handles', 'Sample catalogue item — dimensions and materials to be confirmed with the store'],
      featured: false,
      newArrival: true,
      dateAdded: '2026-10-15'
    }
  ];

  /*
   * Three clearly labelled demonstration orders are preloaded so that the
   * admin dashboard can demonstrate a realistic workflow on first open.
   * They are built from the sample products above, never from real customers.
   */
  window.DELA_SAMPLE_ORDERS = [
    {
      reference: 'DB-DEMO-1001',
      status: 'Pending',
      createdDaysAgo: 1,
      createdTime: '10:15',
      customer: {
        name: 'Sample Customer 01',
        phone: '+254 700 000 001',
        email: 'sample01@example.com'
      },
      fulfilment: 'delivery',
      county: 'Migori',
      town: 'Kehancha',
      address: 'Sample delivery area (demonstration only)',
      notes: 'Preloaded sample order for the admin demonstration.',
      items: [{ productId: 'db-006', size: 'M', color: 'Earth Print', qty: 1 }],
      inventoryDeducted: false,
      sample: true
    },
    {
      reference: 'DB-DEMO-1002',
      status: 'Confirmed',
      createdDaysAgo: 3,
      createdTime: '16:40',
      customer: {
        name: 'Sample Customer 02',
        phone: '+254 700 000 002',
        email: ''
      },
      fulfilment: 'collection',
      county: 'Migori',
      town: 'Kehancha',
      address: '',
      notes: 'Preloaded sample order. Collection arrangements would be confirmed by the store.',
      items: [
        { productId: 'db-013', size: '42', color: 'White / Blue', qty: 1 },
        { productId: 'db-024', size: 'M', color: 'White', qty: 2 }
      ],
      inventoryDeducted: true,
      sample: true
    },
    {
      reference: 'DB-DEMO-1003',
      status: 'Completed',
      createdDaysAgo: 6,
      createdTime: '12:05',
      customer: {
        name: 'Sample Customer 03',
        phone: '+254 700 000 003',
        email: 'sample03@example.com'
      },
      fulfilment: 'delivery',
      county: 'Migori',
      town: 'Kehancha',
      address: 'Sample delivery area (demonstration only)',
      notes: 'Preloaded sample order for the admin demonstration.',
      items: [
        { productId: 'db-019', size: 'One Size', color: 'Tan', qty: 1 },
        { productId: 'db-021', size: 'One Size', color: 'Black / Gold', qty: 1 }
      ],
      inventoryDeducted: true,
      sample: true
    }
  ];
})();
