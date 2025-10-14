-- Migration: create routes table
-- Generated manually for initial Route model
CREATE TABLE IF NOT EXISTS "routes" (
  "id" text PRIMARY KEY,
  "code" text UNIQUE,
  "origin" text NOT NULL,
  "destination" text NOT NULL,
  "state" text NOT NULL,
  "city" text NOT NULL,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp(3) DEFAULT current_timestamp,
  "updatedAt" timestamp(3) DEFAULT current_timestamp
);
