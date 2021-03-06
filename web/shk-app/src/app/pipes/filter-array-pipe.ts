import { Pipe } from '@angular/core';

// Filter Array of Objects
@Pipe({
    name: 'filter',
    pure: false
})
export class FilterArrayPipe {
    transform(value: any, filter: {[key: string]: string}): any {
        if (filter && Array.isArray(value)) {
            const filterKeys = Object.keys(filter);
            return value.filter(item =>
                filterKeys.reduce((memo, keyName) =>
                memo && item[keyName] === filter[keyName], true));
        } else {
            return value;
        }
    }
}
