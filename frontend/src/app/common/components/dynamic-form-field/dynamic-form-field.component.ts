import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  Attribute,
  isSelectAttribute,
  Option,
} from '../../../services/entity.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form-field',
  templateUrl: './dynamic-form-field.component.html',
  styleUrls: ['./dynamic-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicFormFieldComponent),
      multi: true,
    },
  ],
})
export class DynamicFormFieldComponent implements OnInit, ControlValueAccessor {
  @Input() attribute: Attribute;
  @Input('value') val: any;
  @Input() hideLabel = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  options: Promise<Option[]>; // For type=select

  get value() {
    return this.val;
  }

  set value(val: any) {
    this.val = val;
    this.onChange(val);
    this.onTouched();
  }

  constructor() {}

  ngOnInit() {
    if (isSelectAttribute(this.attribute)) {
      if (Array.isArray(this.attribute.options)) {
        this.options = Promise.resolve(
          this.attribute.options.map(option => ({
            name: option,
            value: option,
          }))
        );
      } else {
        this.options = this.attribute.options();
      }
    }
  }

  handleFile(files: FileList) {
    this.value = files[0];
  }

  registerOnChange(fn: (_: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  writeValue(value: any) {
    if (value) {
      this.value = value;
    }
  }
}
