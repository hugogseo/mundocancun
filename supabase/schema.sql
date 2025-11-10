-- ================================================
-- MUNDOCANCUN.COM - SUPABASE SCHEMA
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'user');
CREATE TYPE package_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE booking_mode AS ENUM ('inquiry', 'quote', 'payment');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE quote_status AS ENUM ('pending', 'sent', 'accepted', 'rejected');
CREATE TYPE inquiry_source AS ENUM ('website', 'chat', 'email', 'phone', 'other');

-- ================================================
-- TABLES
-- ================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE cat_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages
CREATE TABLE pkg_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    destination TEXT NOT NULL,
    short_description TEXT,
    long_description TEXT,
    price_base DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    duration_nights INTEGER NOT NULL,
    min_guests INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 10,
    cover_url TEXT,
    status package_status DEFAULT 'draft',
    booking_mode booking_mode DEFAULT 'inquiry',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package Images
CREATE TABLE pkg_package_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES pkg_packages(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Package Tags (many-to-many with categories)
CREATE TABLE pkg_package_tags (
    package_id UUID REFERENCES pkg_packages(id) ON DELETE CASCADE,
    category_id UUID REFERENCES cat_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (package_id, category_id)
);

-- Lead Inquiries
CREATE TABLE lead_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES pkg_packages(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    dates DATERANGE,
    guests INTEGER,
    budget DECIMAL(10, 2),
    notes TEXT,
    source inquiry_source DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Quotes
CREATE TABLE lead_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES pkg_packages(id) ON DELETE SET NULL,
    inquiry_id UUID REFERENCES lead_inquiries(id) ON DELETE SET NULL,
    price_total DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status quote_status DEFAULT 'pending',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES pkg_packages(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checkin DATE NOT NULL,
    checkout DATE NOT NULL,
    guests INTEGER NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status booking_status DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    status payment_status DEFAULT 'pending',
    raw JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    channel TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_packages_status ON pkg_packages(status);
CREATE INDEX idx_packages_slug ON pkg_packages(slug);
CREATE INDEX idx_package_images_package_id ON pkg_package_images(package_id);
CREATE INDEX idx_package_tags_package_id ON pkg_package_tags(package_id);
CREATE INDEX idx_package_tags_category_id ON pkg_package_tags(category_id);
CREATE INDEX idx_inquiries_email ON lead_inquiries(email);
CREATE INDEX idx_inquiries_created_at ON lead_inquiries(created_at DESC);
CREATE INDEX idx_quotes_inquiry_id ON lead_quotes(inquiry_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pkg_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pkg_package_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pkg_package_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ================================================
-- HELPER FUNCTIONS
-- ================================================

-- Check if user is admin or editor
CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'editor')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- POLICIES - Profiles
-- ================================================

CREATE POLICY "Profiles: Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Profiles: Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Profiles: Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Categories (Public read, admin write)
-- ================================================

CREATE POLICY "Categories: Public read"
    ON cat_categories FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Categories: Admin/Editor write"
    ON cat_categories FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Packages
-- ================================================

CREATE POLICY "Packages: Public can view published"
    ON pkg_packages FOR SELECT
    TO authenticated, anon
    USING (status = 'published');

CREATE POLICY "Packages: Admin/Editor full access"
    ON pkg_packages FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Package Images
-- ================================================

CREATE POLICY "Package Images: Public can view images of published packages"
    ON pkg_package_images FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM pkg_packages
            WHERE id = package_id AND status = 'published'
        )
    );

CREATE POLICY "Package Images: Admin/Editor full access"
    ON pkg_package_images FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Package Tags
-- ================================================

CREATE POLICY "Package Tags: Public can view tags of published packages"
    ON pkg_package_tags FOR SELECT
    TO authenticated, anon
    USING (
        EXISTS (
            SELECT 1 FROM pkg_packages
            WHERE id = package_id AND status = 'published'
        )
    );

CREATE POLICY "Package Tags: Admin/Editor full access"
    ON pkg_package_tags FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Lead Inquiries
-- ================================================

CREATE POLICY "Inquiries: Anyone can create"
    ON lead_inquiries FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Inquiries: Admin/Editor can view all"
    ON lead_inquiries FOR SELECT
    USING (is_admin_or_editor());

CREATE POLICY "Inquiries: Admin/Editor can update/delete"
    ON lead_inquiries FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Lead Quotes
-- ================================================

CREATE POLICY "Quotes: Admin/Editor full access"
    ON lead_quotes FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Bookings
-- ================================================

CREATE POLICY "Bookings: Users can view own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Bookings: Admin/Editor can view all"
    ON bookings FOR SELECT
    USING (is_admin_or_editor());

CREATE POLICY "Bookings: Authenticated users can create"
    ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Bookings: Admin/Editor full access"
    ON bookings FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Payments
-- ================================================

CREATE POLICY "Payments: Users can view own payments"
    ON payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = booking_id
            AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Payments: Admin/Editor full access"
    ON payments FOR ALL
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Chat Sessions
-- ================================================

CREATE POLICY "Chat Sessions: Users can view own sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Chat Sessions: Anyone can create sessions"
    ON chat_sessions FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Chat Sessions: Admin can view all"
    ON chat_sessions FOR SELECT
    USING (is_admin_or_editor());

-- ================================================
-- POLICIES - Chat Messages
-- ================================================

CREATE POLICY "Chat Messages: Users can view messages from their sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = session_id
            AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
        )
    );

CREATE POLICY "Chat Messages: Anyone can insert messages"
    ON chat_messages FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Chat Messages: Admin can view all"
    ON chat_messages FOR SELECT
    USING (is_admin_or_editor());

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON pkg_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON lead_quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- SEED DATA
-- ================================================

-- Insert default categories
INSERT INTO cat_categories (slug, name, description, icon) VALUES
    ('resort', 'Resort', 'All-inclusive resort experiences', 'hotel'),
    ('villa', 'Villa', 'Private villa rentals', 'home'),
    ('island', 'Island', 'Island getaways', 'palmtree'),
    ('family', 'Family', 'Family-friendly packages', 'users'),
    ('luxe', 'Luxe', 'Luxury experiences', 'star');
