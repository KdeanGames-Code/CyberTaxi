-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS cybertaxi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create the user if it doesn't exist
CREATE USER IF NOT EXISTS 'cybertaxi_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON cybertaxi_db.* TO 'cybertaxi_user'@'localhost';

-- Vehicles Table Schema
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    player_id BIGINT UNSIGNED NOT NULL,  -- Foreign key to players table (add later)
    type ENUM('Model Y', 'RoboCab') NOT NULL,  -- Vehicle types per GDD
    status ENUM('new', 'active', 'parked', 'garage', 'ordered') NOT NULL DEFAULT 'new',  -- Statuses per Gameplay Draft; 'ordered' for awaiting delivery
    wear DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 0.00 CHECK (wear BETWEEN 0.00 AND 100.00),  -- % wear, validation 0-100
    battery DECIMAL(5,2) UNSIGNED NOT NULL DEFAULT 100.00 CHECK (battery BETWEEN 0.00 AND 100.00),  -- % battery, validation 0-100
    mileage DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,  -- Total miles for wear/degradation calcs
    tire_mileage DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0.00,  -- Miles on current tires for rotation/replacement
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- For age-based degradation
    delivery_date DATETIME DEFAULT NULL,  -- Set post-2-3 day wait if ordered
    cost DECIMAL(10,2) UNSIGNED NOT NULL,  -- Purchase cost, e.g., 50000.00
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),  -- For fast fleet queries by status
    INDEX idx_player_id (player_id)  -- For per-player vehicle lists
    -- FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE  -- Comment out for now; add after players table
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger for Wear Cap (Run After Table)
DELIMITER //
CREATE TRIGGER validate_wear_before_update BEFORE UPDATE ON vehicles
FOR EACH ROW
BEGIN
    IF NEW.wear > 100.00 THEN
        SET NEW.wear = 100.00;
    END IF;
END //
DELIMITER ;