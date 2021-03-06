import {Injectable} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {share} from 'rxjs/operators';
import {filter} from 'rxjs/internal/operators';

import {NotificationService} from '../../toastr/notification.service';


import * as _ from 'lodash';

import {FormMessService} from './notify-mess';

@Injectable()
export class FormValidationService {

  private stream: {
    validationForm?: Subject<Object>
  } = {};

  private _subscriptions: {
    [propName: string]: Subscription;
  } = {};

  private _isValid: {
    [propName: string]: boolean;
  } = {};

  protected validations = [
    {
      id: 'require',
      mess: this.messInfo.MessValidate('This is required field')
    },
    {
      id: 'email',
      mess: this.messInfo.MessValidate('Please enter a valid email address')
    },
    {
      id: 'p-number',
      mess: this.messInfo.MessValidate('This is positive number field')
    },
    {
      id: 'i-number',
      mess: this.messInfo.MessValidate('This is number field')
    },
    {
      id: 'is-number',
      mess: this.messInfo.MessValidate('This is number field')
    },
    {
      id: 'p-not-decimal-num',
      mess: this.messInfo.MessValidate('This is integer number field')
    }
  ];

  constructor(
    public messInfo: FormMessService,
    private toasInfo: NotificationService,
  ) {}

  getValidationFormStream() {
    if (!this.stream.hasOwnProperty('validationForm')) {
      this.stream.validationForm = new Subject();
      this.stream.validationForm.asObservable().pipe(share());
    }
    return this.stream.validationForm;
  }

  /*  Submit form */
  submit(eventKey, callBack: () => any, forceChangeCallBack: boolean = false): void {
    this._isValid[eventKey] = true;
    if (!this._subscriptions.hasOwnProperty(eventKey) || forceChangeCallBack) {
      if (this._subscriptions.hasOwnProperty(eventKey)) {
        this._subscriptions[eventKey].unsubscribe();
      }
      this._subscriptions[eventKey] = this.getValidationFormStream()
                                          .pipe(filter(object => object['eventKey'] === eventKey))
                                          .subscribe((data) => {
                                            if (this._isValid[eventKey] && !(data.hasOwnProperty('cancel') && data['cancel'] === true)) {
                                              this.toasInfo.success('Data shown successfully !!', 'Notification');
                                              callBack();
                                            } else if (!this._isValid[eventKey]) {
                                              this.toasInfo.warning('Form Invalid', 'Oops!');
                                            }
                                          });
    }
    this.getValidationFormStream().next({eventKey: eventKey, needValidate: true});
  }

  /* Cancel form */
  cancel(eventKey, callBack?: () => any): void {
    this._isValid[eventKey] = true;
    if (callBack) {
      callBack();
    }
    this.getValidationFormStream().next({eventKey: eventKey, needValidate: false, cancel: true});
  }

  /* Element in form add handle */
  onSubmitOrCancel(eventKey: string, whenSubmit: () => boolean, whenCancel?: () => any): Subscription {
    return this.getValidationFormStream()
               .asObservable()
               .pipe(filter(object => object['eventKey'] === eventKey))
               .subscribe(
                 (object: Object) => {
                   if (object['needValidate']) {
                     const isValid = whenSubmit();
                     if (!isValid) {
                       this._isValid[eventKey] = isValid;
                     }
                   } else {
                     if (whenCancel) {
                       whenCancel();
                     }
                   }
                 }
               );
  }

  validate(validations: string, value: any): Object {
    let validationInfo: Object = {
      isValid: true,
      mess: ''
    };
    let mess: any;
    _.forEach(validations.split(','), (validation) => {
      switch (validation) {
        case 'required':
        case 'require':
          mess = _.find(this.validations, (v) => v['id'] === 'require');
          if (mess) {
            mess = mess['mess'];
          }
          if (value === '' || value == null) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          if (_.isArray(value)) {
            if (_.size(value) === 0) {
              validationInfo = {
                isValid: false,
                mess: !!mess ? mess : ''
              };

              return false;
            }
          }
          break;

        case 'email':
          mess = _.find(this.validations, (v) => v['id'] === 'email');
          if (mess) {
            mess = mess['mess'];
          }
          const regexEmail =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          const _isEmail = regexEmail.test(value);
          if (_isEmail === false) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          break;

        case 'p-number':
          mess = _.find(this.validations, (v) => v['id'] === 'p-number');
          if (mess) {
            mess = mess['mess'];
          }
          if (value === '' || isNaN(value) || parseFloat(value) <= 0) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          break;

        case 'i-number':
          mess = _.find(this.validations, (v) => v['id'] === 'i-number');
          if (mess) {
            mess = mess['mess'];
          }
          if (isNaN(value) || parseFloat(value) < 0) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          break;

        case 'is-number':
          mess = _.find(this.validations, (v) => v['id'] === 'is-number');
          if (mess) {
            mess = mess['mess'];
          }
          if (isNaN(value) || isNaN(parseFloat(value))) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          break;

        case 'p-not-decimal-num':
          mess = _.find(this.validations, (v) => v['id'] === 'p-not-decimal-num');
          if (mess) {
            mess = mess['mess'];
          }
          const decimal    = /^(?:[-+]?[0-9]|)+\.[0-9]+$/;
          const _isDecimal = decimal.test(value);
          if (value === '' || isNaN(value) || parseFloat(value) <= 0 || _isDecimal) {
            validationInfo = {
              isValid: false,
              mess: !!mess ? mess : ''
            };
            return false;
          }
          break;
      }
    });
    return validationInfo;
  }
}
