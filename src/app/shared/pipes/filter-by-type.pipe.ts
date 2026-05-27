import { Pipe, PipeTransform } from '@angular/core';
import { FinancialStatementItem } from '../../core/services/accounting.service';

@Pipe({
  name: 'filterByType',
  standalone: true
})
export class FilterByTypePipe implements PipeTransform {
  transform(
    items: FinancialStatementItem[],
    ...types: string[]
  ): FinancialStatementItem[] {
    if (!items || !types || types.length === 0) {
      return [];
    }
    return items.filter(item => types.includes(item.type));
  }
}
