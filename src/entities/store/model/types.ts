export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  config?: StoreConfig;
  created_at: string;
  updated_at: string;
  enabled: boolean;
}

export interface StoreConfig {
  branding?: {
    logoUrl?: string;
    bannerUrl?: string;
    faviconUrl?: string;
    colorTheme?: string;
    heroTitle?: string;
  };
  contact?: {
    phone?: string;
    currentCountry?: string;
    email?: string;
    address?: string;
    city?: string;
  };
  socialMedia?: {
    facebookUrl?: string;
    instagramUrl?: string;
  };
  aboutUs?: string;
  features?: object;
  category?: string;
  themeId?: string;
  currency?: string;
}
