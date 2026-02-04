import { describe, it, expect, vi } from 'vitest';
import { GET as getCreators } from '@/app/api/creators/route';
import { GET as getCreatorById } from '@/app/api/creators/[id]/route';
import { NextRequest } from 'next/server';

describe('GET /api/creators', () => {
  it('should return creators list', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
  });

  it('should paginate results', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?page=1&limit=5');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.length).toBeLessThanOrEqual(5);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(5);
  });

  it('should filter by platform', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?platform=Instagram');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((creator: any) => {
      expect(creator.platform).toBe('Instagram');
    });
  });

  it('should filter by category', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?category=Beauty');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    data.data.forEach((creator: any) => {
      expect(creator.categories).toContain('Beauty');
    });
  });

  it('should sort by followers', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?sort=followers&order=desc');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].followerCount).toBeGreaterThanOrEqual(data.data[1].followerCount);
    }
  });

  it('should sort by name ascending', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?sort=name&order=asc');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].name.localeCompare(data.data[1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should sort by engagement descending', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?sort=engagement&order=desc');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      const firstEngagement = data.data[0].engagementRate || 0;
      const secondEngagement = data.data[1].engagementRate || 0;
      expect(firstEngagement).toBeGreaterThanOrEqual(secondEngagement);
    }
  });

  it('should sort by createdAt ascending', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?sort=createdAt&order=asc');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1 && data.data[0].createdAt && data.data[1].createdAt) {
      const firstDate = new Date(data.data[0].createdAt).getTime();
      const secondDate = new Date(data.data[1].createdAt).getTime();
      expect(firstDate).toBeLessThanOrEqual(secondDate);
    }
  });

  it('should use default sort when no sort parameter is provided', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    // Default sort is by name, so check name ordering
    if (data.data.length > 1) {
      expect(data.data[0].name.localeCompare(data.data[1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('should sort in descending order explicitly', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?sort=followers&order=desc');
    const response = await getCreators(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    if (data.data.length > 1) {
      expect(data.data[0].followerCount).toBeGreaterThanOrEqual(data.data[1].followerCount);
    }
  });

  it('should return 400 for invalid query parameters (ZodError)', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?page=-1');
    const response = await getCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
    expect(data.error.details).toBeDefined();
  });

  it('should return 400 for limit exceeding max value', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?limit=999');
    const response = await getCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should return 400 for invalid page type', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators?page=invalid');
    const response = await getCreators(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_REQUEST');
  });

  it('should handle generic error and return 500', async () => {
    // Mock the data module to throw an error
    const dataModule = await import('@/data');

    vi.spyOn(dataModule, 'getAllCreators').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3000/api/creators');
    const response = await getCreators(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('서버 오류가 발생했습니다.');

    // Restore original function
    vi.restoreAllMocks();
  });
});

describe('GET /api/creators/:id', () => {
  it('should return creator by ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators/creator-001');
    const response = await getCreatorById(request, {
      params: Promise.resolve({ id: 'creator-001' }),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.id).toBe('creator-001');
    expect(data.data.stats).toBeDefined();
  });

  it('should return 404 for non-existent creator', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators/creator-999');
    const response = await getCreatorById(request, {
      params: Promise.resolve({ id: 'creator-999' }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NOT_FOUND');
  });

  it('should include creator stats', async () => {
    const request = new NextRequest('http://localhost:3000/api/creators/creator-001');
    const response = await getCreatorById(request, {
      params: Promise.resolve({ id: 'creator-001' }),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.stats).toBeDefined();
    expect(typeof data.data.stats.totalSales).toBe('number');
    expect(typeof data.data.stats.totalRevenue).toBe('number');
    expect(typeof data.data.stats.averageConversionRate).toBe('number');
  });

  it('should return default stats when getCreatorStats returns null', async () => {
    // Mock the data module
    const dataModule = await import('@/data');
    const originalGetCreatorStats = dataModule.getCreatorStats;

    // Mock getCreatorStats to return null while keeping getCreatorById working
    vi.spyOn(dataModule, 'getCreatorStats').mockReturnValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/creators/creator-001');
    const response = await getCreatorById(request, {
      params: Promise.resolve({ id: 'creator-001' }),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data.stats).toBeDefined();
    expect(data.data.stats.totalSales).toBe(0);
    expect(data.data.stats.totalRevenue).toBe(0);
    expect(data.data.stats.totalCommission).toBe(0);
    expect(data.data.stats.averageConversionRate).toBe(0);
    expect(data.data.stats.topCategory).toBeNull();
    expect(data.data.stats.topProduct).toBeNull();

    // Restore original function
    vi.restoreAllMocks();
  });

  it('should handle generic error and return 500', async () => {
    // Mock the data module to throw an error
    const dataModule = await import('@/data');

    vi.spyOn(dataModule, 'getCreatorById').mockImplementationOnce(() => {
      throw new Error('Database connection failed');
    });

    const request = new NextRequest('http://localhost:3000/api/creators/creator-001');
    const response = await getCreatorById(request, {
      params: Promise.resolve({ id: 'creator-001' }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
    expect(data.error.message).toBe('서버 오류가 발생했습니다.');

    // Restore original function
    vi.restoreAllMocks();
  });
});
