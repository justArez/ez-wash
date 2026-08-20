-- Migration: 0002_decouple_phone_and_plate.sql
-- Remove unique constraints on phone and (customer_id, plate) so customer, plate, phone, email are not strictly bound

ALTER TABLE "loyalty_customers" ALTER COLUMN "phone" DROP NOT NULL;
ALTER TABLE "loyalty_customers" DROP CONSTRAINT IF EXISTS "loyalty_customers_phone_unique";
DROP INDEX IF EXISTS "vehicles_customer_plate_idx";
