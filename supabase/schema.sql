-- ============================================================================
-- TÁPIO - Schema SQL para Supabase (PostgreSQL + Row Level Security)
-- ============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase gratuito quando
-- estiver pronto para migrar do banco JSON local para a nuvem.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Restaurantes (Tenants)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'Restaurante',
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  logo_url TEXT,
  cover_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#c2410c',
  theme_mode TEXT NOT NULL DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'trial', 'blocked')),
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 79.90,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL DEFAULT '',
  owner_phone TEXT NOT NULL DEFAULT '',
  owner_pin TEXT NOT NULL DEFAULT '1234',
  allow_owner_edit BOOLEAN NOT NULL DEFAULT true,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  opening_hours TEXT NOT NULL DEFAULT '',
  is_open_now BOOLEAN NOT NULL DEFAULT true,
  wifi_ssid TEXT,
  wifi_password TEXT,
  instagram TEXT,
  service_fee_notice TEXT,
  highlight_banner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Categorias do Cardápio
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Produtos / Pratos
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  addons_info TEXT,
  serves TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Tags NFC / QR Codes Dinâmicos (/m/[code])
CREATE TABLE IF NOT EXISTS public.nfc_tags (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  target_slug TEXT NOT NULL REFERENCES public.restaurants(slug) ON UPDATE CASCADE ON DELETE CASCADE,
  scans_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance instantânea na leitura de mesa
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_items_restaurant_category ON public.menu_items(restaurant_id, category_id, sort_order);

-- ============================================================================
-- SEGURANÇA: Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para identificar o Master Admin via JWT claim ou email
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'role') = 'master_admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- LEITURA PÚBLICA (Cliente na mesa lê apenas lojas não bloqueadas)
CREATE POLICY "Público lê restaurantes ativos ou demo"
  ON public.restaurants FOR SELECT
  USING (status IN ('active', 'trial') OR auth.uid() = owner_id OR public.is_master_admin());

CREATE POLICY "Público lê categorias de lojas ativas"
  ON public.categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.status IN ('active', 'trial') OR r.owner_id = auth.uid() OR public.is_master_admin())
    )
  );

CREATE POLICY "Público lê itens de lojas ativas"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id
        AND (r.status IN ('active', 'trial') OR r.owner_id = auth.uid() OR public.is_master_admin())
    )
  );

CREATE POLICY "Público lê redirecionamento NFC"
  ON public.nfc_tags FOR SELECT
  USING (true);

-- ESCRITA RESTRITA AO DONO DA LOJA (quando allow_owner_edit = true) OU MASTER ADMIN
CREATE POLICY "Dono edita próprio restaurante"
  ON public.restaurants FOR UPDATE
  USING (public.is_master_admin() OR (auth.uid() = owner_id AND allow_owner_edit = true));

CREATE POLICY "Master gerencia restaurantes"
  ON public.restaurants FOR ALL
  USING (public.is_master_admin());

CREATE POLICY "Dono gerencia próprias categorias"
  ON public.categories FOR ALL
  USING (
    public.is_master_admin() OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid() AND r.allow_owner_edit = true
    )
  );

CREATE POLICY "Dono gerencia próprios itens"
  ON public.menu_items FOR ALL
  USING (
    public.is_master_admin() OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_id = auth.uid() AND r.allow_owner_edit = true
    )
  );

CREATE POLICY "Apenas Master gerencia tags NFC"
  ON public.nfc_tags FOR ALL
  USING (public.is_master_admin());
