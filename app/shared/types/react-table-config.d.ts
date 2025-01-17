import {
  UseFiltersColumnOptions,
  UseFiltersColumnProps,
  UseFiltersInstanceProps,
  UseFiltersOptions,
  UseFiltersState,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectState,
  UseRowStateState,
  UseSortByState,
  UseRowStateRowProps,
  UseRowStateOptions,
  UseSortByOptions,
  UseRowStateCellProps,
  UseSortByColumnOptions,
  UseSortByColumnProps,
} from 'react-table';

interface CustomColumn {
  className?: string;
}

declare module 'react-table' {
  export interface TableOptions<D extends object>
    extends UseExpandedOptions<D>,
      UseFiltersOptions<D>,
      UseRowSelectOptions<D>,
      UseRowStateOptions<D>,
      UseSortByOptions<D>,
      UsePaginationOptions<D> {}

  export interface TableInstance<D>
    extends UseColumnOrderInstanceProps<D>,
      UseExpandedInstanceProps<D>,
      UseFiltersInstanceProps<D>,
      UseRowSelectInstanceProps<D>,
      UseRowStateInstanceProps<D>,
      UseSortByInstanceProps<D>,
      UsePaginationInstanceProps<D> {}

  export interface TableState<D extends Record<string, unknown> = Record<string, unknown>>
    extends UseColumnOrderState<D>,
      UseExpandedState<D>,
      UseFiltersState<D>,
      UsePaginationState<D>,
      UseRowSelectState<D>,
      UseRowStateState<D>,
      UseSortByState<D>,
      UsePaginationState<D> {}

  export interface ColumnInterface<D extends object = {}>
    extends UseFiltersColumnOptions<D>,
      UseFiltersColumnOptions<D>,
      UseRowSelectOptions<D>,
      UseSortByColumnOptions<D>,
      CustomColumn {}

  interface Row<D extends object = {}>
    extends UseExpandedRowProps<D>,
      UseGroupByRowProps<D>,
      UseRowSelectRowProps<D>,
      UseRowStateRowProps<D>,
      UseRowStateCellProps<D>,
      UseSortByColumnProps<D> {}

  export interface ColumnInstance<D extends object = {}> extends UseFiltersColumnProps<D> {}
}
