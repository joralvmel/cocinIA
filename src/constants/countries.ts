/**
 * Countries with their codes and default currencies
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
  defaultCurrency: string;
}

export const countries: Country[] = [
  // Americas
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', defaultCurrency: 'ARS' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', defaultCurrency: 'BOB' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', defaultCurrency: 'BRL' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', defaultCurrency: 'CAD' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', defaultCurrency: 'CLP' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', defaultCurrency: 'COP' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷', defaultCurrency: 'CRC' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺', defaultCurrency: 'CUP' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴', defaultCurrency: 'DOP' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', defaultCurrency: 'USD' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻', defaultCurrency: 'USD' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹', defaultCurrency: 'GTQ' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳', defaultCurrency: 'HNL' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', defaultCurrency: 'MXN' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮', defaultCurrency: 'NIO' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦', defaultCurrency: 'PAB' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', defaultCurrency: 'PYG' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', defaultCurrency: 'PEN' },
  { code: 'PR', name: 'Puerto Rico', flag: '🇵🇷', defaultCurrency: 'USD' },
  { code: 'US', name: 'United States', flag: '🇺🇸', defaultCurrency: 'USD' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾', defaultCurrency: 'UYU' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', defaultCurrency: 'VES' },

  // Europe
  { code: 'AT', name: 'Austria', flag: '🇦🇹', defaultCurrency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', defaultCurrency: 'EUR' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', defaultCurrency: 'CHF' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', defaultCurrency: 'EUR' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', defaultCurrency: 'DKK' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', defaultCurrency: 'EUR' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', defaultCurrency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', defaultCurrency: 'EUR' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', defaultCurrency: 'GBP' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', defaultCurrency: 'EUR' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', defaultCurrency: 'EUR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', defaultCurrency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', defaultCurrency: 'EUR' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', defaultCurrency: 'NOK' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', defaultCurrency: 'PLN' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', defaultCurrency: 'EUR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', defaultCurrency: 'SEK' },

  // Asia & Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', defaultCurrency: 'AUD' },
  { code: 'CN', name: 'China', flag: '🇨🇳', defaultCurrency: 'CNY' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', defaultCurrency: 'HKD' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', defaultCurrency: 'IDR' },
  { code: 'IN', name: 'India', flag: '🇮🇳', defaultCurrency: 'INR' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', defaultCurrency: 'JPY' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', defaultCurrency: 'KRW' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', defaultCurrency: 'MYR' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', defaultCurrency: 'NZD' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', defaultCurrency: 'PHP' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', defaultCurrency: 'SGD' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', defaultCurrency: 'THB' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', defaultCurrency: 'TWD' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', defaultCurrency: 'VND' },

  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', defaultCurrency: 'AED' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', defaultCurrency: 'EGP' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', defaultCurrency: 'ILS' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', defaultCurrency: 'MAD' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', defaultCurrency: 'SAR' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', defaultCurrency: 'ZAR' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find((c) => c.code === code);
};
