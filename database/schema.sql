
-- Coffee Ninja Customer Inquiry Management System
-- PostgreSQL database schema

-- Staff members who can sign in to the application.
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    -- Store a secure password hash, never a plain password.
    password_hash TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer inquiries created by staff members.
CREATE TABLE inquiries (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    customer_name VARCHAR(100) NOT NULL,

    -- A customer email address or phone number.
    contact VARCHAR(255) NOT NULL,

    subject VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    -- Restrict status to the three allowed values.
    status VARCHAR(20) NOT NULL DEFAULT 'New'
        CHECK (status IN ('New', 'In Progress', 'Resolved')),

    -- Every inquiry belongs to one staff member.
    owner_id INTEGER NOT NULL
        REFERENCES users(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Improve queries that retrieve a user's inquiries.
CREATE INDEX idx_inquiries_owner_id
    ON inquiries(owner_id);

-- Improve filtering inquiries by owner and status.
CREATE INDEX idx_inquiries_owner_status
    ON inquiries(owner_id, status);
