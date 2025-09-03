-- Initialize Albadil Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions for better performance
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create custom functions for audit logging
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add some custom ones here

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE albadil_prod TO albadil_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO albadil_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO albadil_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO albadil_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO albadil_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO albadil_user;
