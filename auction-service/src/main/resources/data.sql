-- Simplified Categories Migration
-- 1. Rename existing categories
UPDATE category SET name = 'Watches' WHERE name = 'Luxury Watches & Timepieces ⌚️';
UPDATE category SET name = 'Art' WHERE name = 'Fine Art & Paintings 🖼️';
UPDATE category SET name = 'Jewellery' WHERE name = 'Vintage Jewellery & Gems 💎';
UPDATE category SET name = 'Collectibles' WHERE name = 'Rare Collectibles & Memorabilia 🏺';
UPDATE category SET name = 'Automobiles' WHERE name = 'Classic & Exotics Automobiles 🚗';
UPDATE category SET name = 'Electronics' WHERE name = 'Premium Electronics & Gadgets 📱';
UPDATE category SET name = 'Currency' WHERE name = 'Rare Coins & Currency 💰';
UPDATE category SET name = 'Furniture' WHERE name = 'Antique Furniture & Decor 🏺';
UPDATE category SET name = 'Fashion' WHERE name = 'Designer Fashion & Couture 👗';
UPDATE category SET name = 'Instruments' WHERE name = 'Musical Instruments & Gear 🎸';
UPDATE category SET name = 'Books' WHERE name = 'Rare Books & Manuscripts 📚';
UPDATE category SET name = 'Wine' WHERE name = 'Fine Wine & Spirits 🍷';
UPDATE category SET name = 'Other' WHERE name = 'Other (Unique & Rare Items 🤩)';

-- 2. Ensure new names exist (for fresh installs)
INSERT INTO category (name) VALUES ('Watches') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Art') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Jewellery') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Collectibles') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Automobiles') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Electronics') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Currency') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Furniture') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Fashion') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Instruments') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Books') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Wine') ON CONFLICT (name) DO NOTHING;
INSERT INTO category (name) VALUES ('Other') ON CONFLICT (name) DO NOTHING;
