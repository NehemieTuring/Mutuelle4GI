-- Flyway Migration V11: Add date_remboursement column to prets table
-- Database: MySQL

ALTER TABLE prets
ADD COLUMN date_remboursement DATETIME DEFAULT NULL;
