import {
  Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy, ChangeDetectionStrategy, HostListener
} from '@angular/core';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {FormValidationService} from '../form-validation';

@Component({
              // moduleId: module.id,
              selector: 'app-select',
              templateUrl: 'select.component.html',
              styleUrls: ['select.component.scss'],
              //changeDetection: ChangeDetectionStrategy.OnPush
           })

export class ElementSelectComponent implements OnInit, OnDestroy {
  @Input() defaultText        = 'Choose an option';
  @Input('elementData') elementData: ElementData;
  @Input() formKey: string;
  @Input() disabled: boolean  = false;
  @Input() validation: string = "";

  protected _validProperty = {
    isValid: true,
    mess: ''
  };
  protected _validateSubscription: Subscription;

  protected modelValue: string | string[];

  @Output() modelChange = new EventEmitter();

  @Input()
  set model(optionValue: string | string[]) {
    // remove validate
    this._validateElement(false);

    this.modelValue = optionValue;
  }

  get model() {
    return this.modelValue;
  }

  isActive: boolean = false;

  constructor(protected _elementRef: ElementRef, protected formValidationService: FormValidationService) {
  }

  ngOnInit() {
    // for form validation
    this._validateSubscription = this.formValidationService
                                     .onSubmitOrCancel(
                                       this.formKey,
                                       () => this._validateElement(true),
                                       () => this._validateElement(false)
                                     );
  }

  ngOnDestroy(): void {
    if (typeof this._validateSubscription !== 'undefined') {
      this._validateSubscription.unsubscribe();
    }
  }

  protected _validateElement(needValid): boolean {
    if (!needValid || !this.validation) {
      this._validProperty = {
        isValid: true,
        mess: ''
      };
      return true;
    } else {
      this._validProperty = <any>this.formValidationService.validate(this.validation, this.model);
      return this._validProperty.isValid;
    }
  }

  selectOption(option: Option) {
    if (!option.hasOwnProperty('disabled') || option.disabled !== true || !option.hasOwnProperty('outOfStock') || option.outOfStock !== true) {
      if (this.elementData.hasOwnProperty('isMultiSelect') && this.elementData.isMultiSelect === true) {
        if (typeof this.model === 'undefined' || !this.model || !_.isArray(this.model)) {
          this.model = [];
        }
        //noinspection TypeScriptUnresolvedFunction
        let isSelected = _.findIndex(this.model, (o) => o == option.value);
        if (isSelected === -1) {
          if (typeof this.model === 'undefined' || !_.isArray(this.model)) {
            this.model = [];
          }

          (this.model as string[]).push(option.value);
        } else {
          (this.model as string[]).splice(isSelected, 1);
        }
      } else {
        this.model = option.value;
      }
      this.modelChange.emit(this.modelValue);
    }
  }

  isSelect(option: Option) {
    if (!this.isActive) {
      return false;
    }

    if (!this.model || !option) {
      return false;
    }

    if (this.elementData.hasOwnProperty('isMultiSelect') && this.elementData.isMultiSelect === true) {
      return !!_.find(this.model, (o) => o === option.value);
    } else {
      return option.value === this.model;
    }
  }

  selectedLabel(): string {
    if (this.elementData.hasOwnProperty('isMultiSelect') && this.elementData.isMultiSelect === true) {
      let label  = '';
      let _first = true;
      // trường hợp chỉ chọn 1 option
      if (typeof this.model === 'string') {
        let _option = _.find(this.elementData.data, (option: Option) => option.value === this.model);
        if (_option) {
          label = _option.label;
        }
      } else {
        _.forEach(this.model, (optionValue: string) => {
          let _option = _.find(this.elementData.data, (option: Option) => option.value === optionValue);
          if (_first) {
            if (_option) {
              label += _option.label;
              _first = !_first;
            }
          } else {
            if (_option) {
              label += ", " + _option.label;
            }
          }
        });
      };
      return label ? label : this.defaultText;
    } else {
      const _option = _.find(this.elementData.data, (option: Option) => option.value === this.model);
      return _option ? _option.label : this.defaultText;
    }
  }

  selectedColor() {
    if (this.elementData.hasOwnProperty('isMultiSelect') && this.elementData.isMultiSelect === true) {} else {
      let _option = _.find(this.elementData.data, (option: Option) => option.value === this.model);
      return _option ? _option.outOfStock : null;
    }
  }

  toggleSelect(event) {
    if (this.disabled === true) {
      return;
    }

    if (this.elementData.hasOwnProperty('isMultiSelect') && this.elementData.isMultiSelect === true) {
      if (event.target.className.indexOf('select-option') === -1) {
        this.isActive = !this.isActive;
      }
    } else {
      this.isActive = !this.isActive;
    }
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement) {
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.isActive = false;
    }
  }

  protected trackOption(index: number, option: Object) {
    return option['value'];
  }
}

interface ElementData {
  label: string;
  isMultiSelect: boolean;
  data: Option[];
}

interface Option {
  label: string;
  value: any;
  disabled: boolean;
  outOfStock: boolean;
}
