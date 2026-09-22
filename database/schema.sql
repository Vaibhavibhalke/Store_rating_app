-
CREATE DATABASE IF NOT EXISTS store_rating_app;
USE store_rating_app;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role ENUM('admin', 'normal_user', 'store_owner') NOT NULL DEFAULT 'normal_user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_name (name)
);

-- Stores table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL,
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_address (address)
);

-- Ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_store_rating (user_id, store_id),
    INDEX idx_store_id (store_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
);


INSERT INTO users (name, email, password, role) 
VALUES ('System Administrator', 'admin@storeapp.com', '$2a$10$9Gbgq9eTIJFiHHsWsjd1jOOVfD36XeCIy5aaOMVfwTfgowfQ3l85C', 'admin');


CREATE VIEW store_ratings_summary AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    s.owner_id,
    COUNT(r.id) as total_ratings,
    COALESCE(AVG(r.rating), 0) as average_rating,
    s.created_at
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at;
