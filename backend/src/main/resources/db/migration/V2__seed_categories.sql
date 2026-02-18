-- Seed repair categories
INSERT INTO categories (name, icon_name, service_type) VALUES
('Instalator', 'plumbing', 'REPAIR'),
('Electrician', 'electrical', 'REPAIR'),
('Centrală termică', 'heating', 'REPAIR'),
('Aer condiționat', 'ac', 'REPAIR'),
('Tâmplărie', 'carpentry', 'REPAIR'),
('Zugrăvit', 'painting', 'REPAIR'),
('Altele', 'other', 'REPAIR');

-- Seed renovation categories
INSERT INTO categories (name, icon_name, service_type) VALUES
('Renovare baie', 'bathroom', 'RENOVATION'),
('Renovare bucătărie', 'kitchen', 'RENOVATION'),
('Renovare apartament', 'apartment', 'RENOVATION'),
('Renovare casă', 'house', 'RENOVATION'),
('Renovare pardoseală', 'flooring', 'RENOVATION'),
('Renovare fațadă', 'facade', 'RENOVATION');

-- Seed construction categories
INSERT INTO categories (name, icon_name, service_type) VALUES
('Casă unifamilială', 'house', 'CONSTRUCTION'),
('Duplex', 'duplex', 'CONSTRUCTION'),
('Bloc mic', 'building', 'CONSTRUCTION'),
('Anexă / Garaj', 'garage', 'CONSTRUCTION'),
('Piscină', 'pool', 'CONSTRUCTION'),
('Terasă', 'terrace', 'CONSTRUCTION');
