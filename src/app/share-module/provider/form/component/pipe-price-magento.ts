import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import {AppStorage} from '../../../../services/global/storage';

@Pipe({name: 'priceMagentoFormat'})
export class PriceMagentoFormatPipe implements PipeTransform {

  protected globalPriceFormat: Object = {
    requiredPrecision: 2,
    integerRequired: 1,
    decimalSymbol: '.',
    groupSymbol: ',',
    pattern: "$%s",
    precision: 2,
    groupLength: 3
  };

  protected isShowSign = true;

  constructor(private storage: AppStorage) {

  }
  transform(amount: any, ...args: any[]): number {
    if (isNaN(amount)) {
      return 0;
    }
    let format: any = this.globalPriceFormat;

    try {
      // if (typeof args !== "undefined" && args[0] === true) {
      //   amount = StoreManager.getStore().convertPrice(amount);
      // }
      format = _.extend(this.globalPriceFormat, this.storage.localRetrieve('store').price_format);
    } catch (e) {
      // when user not yet pick store
    }

    let precision = isNaN(format.requiredPrecision = Math.abs(format.requiredPrecision)) ? 2 : format.requiredPrecision,
      integerRequired = isNaN(format.integerRequired = Math.abs(format.integerRequired)) ? 1 : format.integerRequired,
      decimalSymbol = format.decimalSymbol === undefined ? ',' : format.decimalSymbol,
      groupSymbol   = format.groupSymbol === undefined ? '.' : format.groupSymbol,
      groupLength   = format.groupLength === undefined ? 3 : format.groupLength,
      pattern       = format.pattern || '%s',
      s             = '',
      i: string, pad,
      j, re, r, am: any;

    if (this.isShowSign === undefined || this.isShowSign === true) {
      s = amount < 0 ? '-' : (this.isShowSign ? '' : '');
    } else if (this.isShowSign === false) {
      s = '';
    }
    pattern = pattern.indexOf('{sign}') < 0 ? s + pattern : pattern.replace('{sign}', s);

    // we're avoiding the usage of to fixed, and using round instead with the e representation to address
    // numbers like 1.005 = 1.01. Using ToFixed to only provide trailig zeroes in case we have a whole number
    i   = parseInt(amount = (Number(Math.round(parseFloat(Math.abs(+amount || 0) + 'e+' + precision)) + ('e-' + precision)) + ""), 10) + '';
    pad = (i.length < integerRequired) ? (integerRequired - i.length) : 0;

    i = this.stringPad('0', pad) + i;

    j  = i.length > groupLength ? i.length % groupLength : 0;
    re = new RegExp('(\\d{' + groupLength + '})(?=\\d)', 'g');

    // replace(/-/, 0) is only for fixing Safari bug which appears
    // when Math.abs(0).toFixed() executed on '0' number.
    // Result is '0.-0' :(

    am = Number(Math.round(parseFloat(Math.abs(amount - parseFloat(i)) + 'e+' + precision)) + ('e-' + precision));

    r = (j ? i.substr(0, j) + groupSymbol : '') +
      i.substr(j).replace(re, '$1' + groupSymbol) +
      (precision ? decimalSymbol + am.toFixed(2).replace(/-/, 0).slice(2) : '');

    return <any> (pattern.replace('%s', r).replace(/^\s\s*/, '').replace(/\s\s*$/, ''));
  }

  protected stringPad(string: string, times: number): string {
    return (new Array(times + 1)).join(string);
  }

}
