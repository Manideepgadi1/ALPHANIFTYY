import React from 'react';

interface NumericTableFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Numeric Table Filter Component
 * 
 * Handles numeric filtering with comparison operators:
 * - Direct number: "50" means >= 50
 * - With operator: ">50", "<100", ">=50", "<=100"
 * - Range: "50-100" means between 50 and 100
 */
export const NumericTableFilter: React.FC<NumericTableFilterProps> = ({
  value,
  onChange,
  placeholder = 'Filter...',
  className = ''
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`px-2 py-1 border rounded text-sm ${className}`}
      title="Examples: 50, >50, <100, >=50, 50-100"
    />
  );
};

/**
 * Check if a numeric value matches the filter criteria
 * 
 * @param cellValue - The actual numeric value from the table cell
 * @param filterValue - The filter string entered by user
 * @returns true if the value matches the filter criteria
 */
export function matchesNumericFilter(cellValue: number | string | null | undefined, filterValue: string): boolean {
  // If no filter, show all
  if (!filterValue || filterValue.trim() === '') {
    return true;
  }

  // Convert cell value to number
  const numValue = typeof cellValue === 'number' ? cellValue : parseFloat(String(cellValue));
  
  // If cell value is not a valid number, don't match
  if (isNaN(numValue)) {
    return false;
  }

  const filter = filterValue.trim();

  // Handle range: "50-100"
  if (filter.includes('-') && !filter.startsWith('-')) {
    const [min, max] = filter.split('-').map(v => parseFloat(v.trim()));
    if (!isNaN(min) && !isNaN(max)) {
      return numValue >= min && numValue <= max;
    }
  }

  // Handle comparison operators
  if (filter.startsWith('>=')) {
    const threshold = parseFloat(filter.substring(2).trim());
    return !isNaN(threshold) && numValue >= threshold;
  }

  if (filter.startsWith('<=')) {
    const threshold = parseFloat(filter.substring(2).trim());
    return !isNaN(threshold) && numValue <= threshold;
  }

  if (filter.startsWith('>')) {
    const threshold = parseFloat(filter.substring(1).trim());
    return !isNaN(threshold) && numValue > threshold;
  }

  if (filter.startsWith('<')) {
    const threshold = parseFloat(filter.substring(1).trim());
    return !isNaN(threshold) && numValue < threshold;
  }

  // Default: Direct number means >= that number
  const threshold = parseFloat(filter);
  if (!isNaN(threshold)) {
    return numValue >= threshold;
  }

  // If we can't parse it, don't match
  return false;
}

/**
 * Check if a text value matches the filter criteria (case-insensitive substring match)
 */
export function matchesTextFilter(cellValue: string | null | undefined, filterValue: string): boolean {
  if (!filterValue || filterValue.trim() === '') {
    return true;
  }

  const value = String(cellValue || '').toLowerCase();
  const filter = filterValue.toLowerCase().trim();
  
  return value.includes(filter);
}

export default NumericTableFilter;
