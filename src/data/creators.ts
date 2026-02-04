import type { Creator } from '../types';

/**
 * Mock creator data (20 creators)
 *
 * Distribution:
 * - Instagram: 8
 * - YouTube: 7
 * - TikTok: 5
 *
 * Follower distribution:
 * - Micro (10K-50K): 6
 * - Mid (50K-200K): 8
 * - Large (200K-1M): 6
 */
export const creators: Creator[] = [
  // Instagram creators (8)
  {
    id: 'creator-001',
    name: '김지은',
    platform: 'Instagram',
    followerCount: 250000,
    categories: ['Beauty', 'Fashion'],
    email: 'jieun.kim@example.com',
    joinedAt: '2025-01-15T09:00:00Z',
  },
  {
    id: 'creator-002',
    name: '이서연',
    platform: 'Instagram',
    followerCount: 380000,
    categories: ['Fashion', 'Lifestyle'],
    email: 'seoyeon.lee@example.com',
    joinedAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'creator-003',
    name: '박민지',
    platform: 'Instagram',
    followerCount: 125000,
    categories: ['Beauty', 'Health'],
    email: 'minji.park@example.com',
    joinedAt: '2024-11-10T10:30:00Z',
  },
  {
    id: 'creator-004',
    name: '정수진',
    platform: 'Instagram',
    followerCount: 45000,
    categories: ['Fashion', 'Stationery'],
    email: 'sujin.jung@example.com',
    joinedAt: '2025-03-20T14:20:00Z',
  },
  {
    id: 'creator-005',
    name: '최예린',
    platform: 'Instagram',
    followerCount: 620000,
    categories: ['Beauty', 'Lifestyle'],
    email: 'yerin.choi@example.com',
    joinedAt: '2024-09-05T11:45:00Z',
  },
  {
    id: 'creator-006',
    name: '강은비',
    platform: 'Instagram',
    followerCount: 88000,
    categories: ['Fashion', 'Pet'],
    email: 'eunbi.kang@example.com',
    joinedAt: '2024-12-15T09:30:00Z',
  },
  {
    id: 'creator-007',
    name: '윤지아',
    platform: 'Instagram',
    followerCount: 32000,
    categories: ['Lifestyle', 'HomeLiving'],
    email: 'jia.yoon@example.com',
    joinedAt: '2025-04-08T16:00:00Z',
  },
  {
    id: 'creator-008',
    name: '한소희',
    platform: 'Instagram',
    followerCount: 175000,
    categories: ['Beauty', 'Fashion'],
    email: 'sohee.han@example.com',
    joinedAt: '2024-10-22T10:15:00Z',
  },

  // YouTube creators (7)
  {
    id: 'creator-009',
    name: '박준호',
    platform: 'YouTube',
    followerCount: 580000,
    categories: ['Tech', 'Lifestyle'],
    email: 'junho.park@example.com',
    joinedAt: '2024-11-20T10:30:00Z',
  },
  {
    id: 'creator-010',
    name: '정하은',
    platform: 'YouTube',
    followerCount: 450000,
    categories: ['Beauty', 'Health', 'Lifestyle'],
    email: 'haeun.jung@example.com',
    joinedAt: '2024-10-05T11:45:00Z',
  },
  {
    id: 'creator-011',
    name: '김도현',
    platform: 'YouTube',
    followerCount: 295000,
    categories: ['Food', 'Health'],
    email: 'dohyun.kim@example.com',
    joinedAt: '2025-01-30T13:20:00Z',
  },
  {
    id: 'creator-012',
    name: '이민석',
    platform: 'YouTube',
    followerCount: 720000,
    categories: ['Tech', 'Food'],
    email: 'minseok.lee@example.com',
    joinedAt: '2024-08-15T09:00:00Z',
  },
  {
    id: 'creator-013',
    name: '서지우',
    platform: 'YouTube',
    followerCount: 150000,
    categories: ['Lifestyle', 'HomeLiving'],
    email: 'jiwoo.seo@example.com',
    joinedAt: '2024-12-01T15:30:00Z',
  },
  {
    id: 'creator-014',
    name: '조민수',
    platform: 'YouTube',
    followerCount: 65000,
    categories: ['Health', 'Food'],
    email: 'minsu.jo@example.com',
    joinedAt: '2025-02-18T10:00:00Z',
  },
  {
    id: 'creator-015',
    name: '배서윤',
    platform: 'YouTube',
    followerCount: 18000,
    categories: ['BabyKids', 'Pet'],
    email: 'seoyoon.bae@example.com',
    joinedAt: '2025-03-05T14:45:00Z',
  },

  // TikTok creators (5)
  {
    id: 'creator-016',
    name: '최민수',
    platform: 'TikTok',
    followerCount: 120000,
    categories: ['Food', 'Health'],
    email: 'minsu.choi@example.com',
    joinedAt: '2024-12-10T14:20:00Z',
  },
  {
    id: 'creator-017',
    name: '송하늘',
    platform: 'TikTok',
    followerCount: 340000,
    categories: ['Fashion', 'Beauty'],
    email: 'haneul.song@example.com',
    joinedAt: '2024-09-25T11:00:00Z',
  },
  {
    id: 'creator-018',
    name: '임재현',
    platform: 'TikTok',
    followerCount: 85000,
    categories: ['Tech', 'Lifestyle'],
    email: 'jaehyun.lim@example.com',
    joinedAt: '2025-01-08T09:30:00Z',
  },
  {
    id: 'creator-019',
    name: '권나영',
    platform: 'TikTok',
    followerCount: 25000,
    categories: ['Stationery', 'Lifestyle'],
    email: 'nayoung.kwon@example.com',
    joinedAt: '2025-04-12T16:20:00Z',
  },
  {
    id: 'creator-020',
    name: '안지훈',
    platform: 'TikTok',
    followerCount: 195000,
    categories: ['Pet', 'Lifestyle'],
    email: 'jihoon.ahn@example.com',
    joinedAt: '2024-11-28T12:00:00Z',
  },
];
