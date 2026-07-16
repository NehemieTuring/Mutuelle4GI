-- Flyway Migration V2: Add password column to membres table
-- Database: MySQL

ALTER TABLE membres 
ADD COLUMN mot_de_passe VARCHAR(255) NOT NULL;
