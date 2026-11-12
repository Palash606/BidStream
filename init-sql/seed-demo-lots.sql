-- BidStream Demo Seeding: 5 High-Value Auction Lots with Active Countdowns
\c auction_db;

-- Ensure category table exists
CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    description TEXT
);

-- Ensure product table exists
CREATE TABLE IF NOT EXISTS product (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    initial_price DOUBLE PRECISION,
    current_highest_bid DOUBLE PRECISION,
    status VARCHAR(50),
    auction_type VARCHAR(50),
    auction_end_time TIMESTAMP,
    category_id BIGINT REFERENCES category(id),
    manufacturer VARCHAR(255),
    weight VARCHAR(100),
    dimensions VARCHAR(100),
    seller_id UUID,
    winner_id UUID,
    payment_transaction_id VARCHAR(255),
    payment_settled_at TIMESTAMP
);

-- 1. Insert Categories
INSERT INTO category (id, name, description) VALUES
(1, 'Luxury Watches', 'Horological masterpieces, rare chronographs, and vintage timepieces')
ON CONFLICT (id) DO NOTHING;

INSERT INTO category (id, name, description) VALUES
(2, 'Fine Art', 'Museum-grade oil paintings, modern canvas art, and rare sculptures')
ON CONFLICT (id) DO NOTHING;

INSERT INTO category (id, name, description) VALUES
(3, 'Vintage Automobiles', 'Classic collector sports cars and restored historic automobiles')
ON CONFLICT (id) DO NOTHING;

INSERT INTO category (id, name, description) VALUES
(4, 'Rare Collectibles', 'Historical artifacts, rare coins, signed memorabilia, and comic relics')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 5 Active Auction Lots (Active Status, Ready for Bidding)
INSERT INTO product (
    id, name, description, initial_price, current_highest_bid, status, auction_type,
    auction_end_time, category_id, manufacturer, weight, dimensions, seller_id
) VALUES
-- Lot 1: Luxury Watch (Rolex Daytona)
(
    'a1111111-1111-1111-1111-111111111111',
    'Rolex Cosmograph Daytona 116500LN "Panda"',
    'Cerachrom tachymetric bezel, white dial with black subdials. Calibre 4130 automatic chronograph movement with 72-hour power reserve. Mint condition with original box and guarantee card.',
    2850000.0,
    2850000.0,
    'ACTIVE',
    'THREE_HAMMER',
    NOW() + INTERVAL '2 hours',
    1,
    'Rolex S.A.',
    '145g',
    '40mm Diameter, 12.2mm Thickness',
    '00000000-0000-0000-0000-000000000001'
),
-- Lot 2: Rare Art (Oil on Canvas)
(
    'a2222222-2222-2222-2222-222222222222',
    'Midnight Odyssey (Original Oil on Canvas, 1984)',
    'Captivating neo-expressionist oil painting on heavy Belgian linen. Signed and dated by master artist. Includes certificate of authenticity and provenance dossier from Galerie Vivienne, Paris.',
    1450000.0,
    1450000.0,
    'ACTIVE',
    'THREE_HAMMER',
    NOW() + INTERVAL '3 hours',
    2,
    'Atelier Vivienne Paris',
    '8.5kg',
    '120cm x 90cm Custom Oak Framed',
    '00000000-0000-0000-0000-000000000001'
),
-- Lot 3: Vintage Automobile (1967 Mustang Shelby GT500)
(
    'a3333333-3333-3333-3333-333333333333',
    '1967 Shelby GT500 "Eleanor" Fastback',
    'Numbers-matching 428ci Police Interceptor V8 engine, dual 4-barrel Holley carburetors, 4-speed Toploader manual transmission. Finished in Pepper Gray metallic with black Le Mans stripes.',
    12500000.0,
    12500000.0,
    'ACTIVE',
    'THREE_HAMMER',
    NOW() + INTERVAL '5 hours',
    3,
    'Shelby American Inc.',
    '1520kg',
    '4740mm L x 1800mm W x 1310mm H',
    '00000000-0000-0000-0000-000000000001'
),
-- Lot 4: Fine Watch (Patek Philippe Nautilus)
(
    'a4444444-4444-4444-4444-444444444444',
    'Patek Philippe Nautilus 5711/1A-010 Stainless Steel',
    'Iconic blue horizontally embossed dial, sapphire crystal caseback displaying self-winding Caliber 324 S C. Highly coveted discontinued collector reference.',
    8900000.0,
    8900000.0,
    'ACTIVE',
    'THREE_HAMMER',
    NOW() + INTERVAL '1 hour',
    1,
    'Patek Philippe Geneve',
    '120g',
    '40mm x 8.3mm Ultra-thin',
    '00000000-0000-0000-0000-000000000001'
),
-- Lot 5: Rare Collectible (1999 1st Edition Charizard Holographic)
(
    'a5555555-5555-5555-5555-555555555555',
    '1999 Base Set 1st Edition Shadowless Charizard (PSA Gem Mint 10)',
    'The pinnacle of modern trading card collecting. Certified PSA Gem Mint 10 with subgrades: Centering 10, Corners 10, Edges 9.5, Surface 10. Preserved in tamper-evident ultrasonic slab.',
    3200000.0,
    3200000.0,
    'ACTIVE',
    'THREE_HAMMER',
    NOW() + INTERVAL '4 hours',
    4,
    'Wizards of the Coast / Nintendo',
    '85g (Slabbed)',
    '85mm x 135mm UV Slab',
    '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (id) DO NOTHING;
