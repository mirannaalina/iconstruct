-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    user_type VARCHAR(20) NOT NULL, -- CLIENT, PROFESSIONAL
    profile_photo_url VARCHAR(500),
    company_name VARCHAR(255),
    description TEXT,
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon_name VARCHAR(50),
    service_type VARCHAR(20) NOT NULL, -- REPAIR, RENOVATION, CONSTRUCTION
    is_active BOOLEAN DEFAULT TRUE
);

-- User categories (many-to-many)
CREATE TABLE user_categories (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, category_id)
);

-- User zones (professionals cover these zones)
CREATE TABLE user_zones (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zone VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, zone)
);

-- Repair requests table
CREATE TABLE repair_requests (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES users(id),
    category_id BIGINT NOT NULL REFERENCES categories(id),
    problem_type VARCHAR(255) NOT NULL,
    problem_description TEXT,
    urgency VARCHAR(20) NOT NULL, -- URGENT, NORMAL, SCHEDULED
    city VARCHAR(100) NOT NULL,
    zone VARCHAR(100) NOT NULL,
    exact_address VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    accepted_offer_id BIGINT,
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Repair request media (photos/videos)
CREATE TABLE repair_request_media (
    request_id BIGINT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    media_url VARCHAR(500) NOT NULL
);

-- Repair offers table
CREATE TABLE repair_offers (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    professional_id BIGINT NOT NULL REFERENCES users(id),
    parts_option VARCHAR(30) NOT NULL, -- PROFESSIONAL_BRINGS, PLATFORM_PROVIDES, CLIENT_HAS
    parts_description TEXT,
    parts_price DECIMAL(10,2),
    labor_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    estimated_duration_minutes INTEGER,
    arrival_time VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    valid_until TIMESTAMP,
    adjusted_price DECIMAL(10,2),
    adjustment_reason TEXT,
    adjustment_accepted BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(request_id, professional_id)
);

-- Add foreign key for accepted offer
ALTER TABLE repair_requests
    ADD CONSTRAINT fk_accepted_offer
    FOREIGN KEY (accepted_offer_id) REFERENCES repair_offers(id);

-- Messages table (chat)
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES repair_requests(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    media_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES repair_requests(id),
    client_id BIGINT NOT NULL REFERENCES users(id),
    professional_id BIGINT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(request_id)
);

-- Review photos
CREATE TABLE review_photos (
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- NEW_REQUEST, NEW_OFFER, NEW_MESSAGE, OFFER_ACCEPTED, etc.
    reference_id BIGINT, -- ID of related entity
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_repair_requests_client ON repair_requests(client_id);
CREATE INDEX idx_repair_requests_status ON repair_requests(status);
CREATE INDEX idx_repair_requests_city_zone ON repair_requests(city, zone);
CREATE INDEX idx_repair_offers_request ON repair_offers(request_id);
CREATE INDEX idx_repair_offers_professional ON repair_offers(professional_id);
CREATE INDEX idx_messages_request ON messages(request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
