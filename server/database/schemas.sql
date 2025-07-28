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

-- Finalize Vehicles Table Schema Additions (as of July 28, 2025)
ALTER TABLE vehicles
    -- Add coords for current location (precision ~1cm, null for non-positioned like garage/ordered)
    ADD COLUMN lat DECIMAL(10,7) DEFAULT NULL,
    ADD COLUMN lng DECIMAL(10,7) DEFAULT NULL,
    -- Add dest for destination during active rides (null if not en route)
    ADD COLUMN dest_lat DECIMAL(10,7) DEFAULT NULL,
    ADD COLUMN dest_lng DECIMAL(10,7) DEFAULT NULL,
    -- Rename delivery_date to delivery_timestamp (preserves data, for 2-3 day delays)
    CHANGE COLUMN delivery_date delivery_timestamp DATETIME DEFAULT NULL,
    -- Confirm purchase_date (already exists, ensure default for age-based degradation)
    MODIFY COLUMN purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add composite index on coords for geospatial queries (e.g., nearest vehicle)
ALTER TABLE vehicles
    ADD INDEX idx_coords (lat, lng);
    -- Vehicles Table Schema Finalized (as of July 28, 2025)
-- Added: lat/lng/dest_lat/dest_lng DECIMAL(10,7) NULL for coords/dest precision
-- Renamed: delivery_date to delivery_timestamp DATETIME NULL for 2-3 day delays
-- Confirmed: purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP for age degradation
-- Index: idx_coords (lat, lng) for geospatial queries
-- No changes to wear DECIMAL(5,2) CHECK 0-100 (0.1% per mile base +10% weather/+20% traffic/protests)
-- No changes to battery DECIMAL(5,2) CHECK 0-100 (20-30% degradation triggers)
-- No changes to mileage/tire_mileage DECIMAL(10,2) (30,000-50,000 tire lifespan with rotations)