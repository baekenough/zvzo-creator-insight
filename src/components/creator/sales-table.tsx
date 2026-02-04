'use client';

import { useState, useMemo } from 'react';
import type { SaleRecord } from '@/types';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface SalesTableProps {
  sales: SaleRecord[];
  pageSize?: number;
  className?: string;
}

type SortField = 'date' | 'productName' | 'category' | 'price' | 'quantity' | 'revenue';
type SortDirection = 'asc' | 'desc';

export function SalesTable({ sales, pageSize = 10, className }: SalesTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sales, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedSales.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSales = sortedSales.slice(startIndex, endIndex);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  날짜 <SortIcon field="date" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center gap-1">
                  상품명 <SortIcon field="productName" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  카테고리 <SortIcon field="category" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  가격 <SortIcon field="price" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center justify-end gap-1">
                  수량 <SortIcon field="quantity" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('revenue')}
              >
                <div className="flex items-center justify-end gap-1">
                  매출 <SortIcon field="revenue" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedSales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {formatDate(sale.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="max-w-xs truncate">{sale.productName}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {sale.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right whitespace-nowrap">
                  {formatCurrency(sale.price)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right">
                  {formatNumber(sale.quantity)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  {formatCurrency(sale.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            총 {sales.length}건 중 {startIndex + 1}-{Math.min(endIndex, sales.length)}건 표시
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded text-sm font-medium transition-colors',
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                'px-3 py-1 rounded text-sm font-medium transition-colors',
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
