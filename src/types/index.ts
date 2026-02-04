/**
 * Platform types for creator social media platforms
 */
export type Platform = 'instagram' | 'youtube' | 'tiktok' | 'blog';

/**
 * Product categories and creator expertise areas
 */
export type Category =
  | 'Beauty'
  | 'Fashion'
  | 'Lifestyle'
  | 'Food'
  | 'Tech'
  | 'HomeLiving'
  | 'Health'
  | 'BabyKids'
  | 'Pet'
  | 'Stationery';

/**
 * Season types for seasonal pattern analysis
 */
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

/**
 * Creator information
 */
export interface Creator {
  id: string;
  name: string;
  profileImage: string;
  platform: Platform;
  followers: number;
  engagementRate: number;
  categories: string[];
  joinedAt: string;
  totalSales: number;
  totalRevenue: number;
}

/**
 * Product information
 */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  description: string;
  imageUrl: string;
  tags: string[];
  targetAudience: string[];
  seasonality: string[];
  avgCommissionRate: number;
}

/**
 * Sale record for creator-product transactions
 */
export interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  originalPrice: number;
  discountRate: number;
  quantity: number;
  revenue: number;
  commission: number;
  commissionRate: number;
  date: string;
  platform: string;
}

/**
 * Category performance score
 */
export interface CategoryScore {
  category: string;
  score: number;
  salesCount: number;
  totalRevenue: number;
}

/**
 * Price bucket distribution
 */
export interface PriceBucket {
  range: string;
  count: number;
  revenue: number;
}

/**
 * Seasonal sales data (monthly)
 */
export interface SeasonalData {
  month: number;
  salesCount: number;
  revenue: number;
  topCategory: string;
}

/**
 * Revenue prediction for creator-product combination
 */
export interface RevenuePrediction {
  minimum: number;
  expected: number;
  maximum: number;
  predictedQuantity: number;
  predictedCommission: number;
  basis: string;
}

/**
 * AI-recommended product match
 */
export interface ProductMatch {
  product: Product;
  matchScore: number;
  matchBreakdown: {
    categoryFit: number;
    priceFit: number;
    seasonFit: number;
    audienceFit: number;
  };
  predictedRevenue: RevenuePrediction;
  reasoning: string;
  confidence: number;
}

/**
 * Creator performance insight analysis
 */
export interface CreatorInsight {
  creatorId: string;
  analyzedAt: string;
  topCategories: CategoryScore[];
  priceRange: {
    min: number;
    max: number;
    sweetSpot: number;
    distribution: PriceBucket[];
  };
  seasonalPattern: SeasonalData[];
  conversionMetrics: {
    avgConversionRate: number;
    bestConversionCategory: string;
    followerToPurchaseRatio: number;
  };
  summary: string;
  strengths: string[];
  recommendations: string[];
}

/**
 * API Request/Response Types
 */

export interface GetCreatorInsightRequest {
  creatorId: string;
}

export interface GetCreatorInsightResponse {
  success: boolean;
  data: CreatorInsight | null;
  error?: string;
}

export interface GetProductMatchesRequest {
  creatorId: string;
  limit?: number;
}

export interface GetProductMatchesResponse {
  success: boolean;
  data: ProductMatch[];
  error?: string;
}

export interface GetRevenuePredictionRequest {
  creatorId: string;
  productId: string;
}

export interface GetRevenuePredictionResponse {
  success: boolean;
  data: RevenuePrediction | null;
  error?: string;
}

/**
 * Pagination type for list queries
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  error?: string;
}
