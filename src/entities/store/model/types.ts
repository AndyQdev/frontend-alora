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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  socialMedia?: {
    facebookUrl?: string;
    instagramUrl?: string;
  };
  delivery?: {
    type: 'pending' | 'free' | 'fixed' | 'calculated';
    value: number;
  };
  aboutUs?: string;
  features?: object;
  category?: string;
  themeId?: string;
  currency?: string;
}
