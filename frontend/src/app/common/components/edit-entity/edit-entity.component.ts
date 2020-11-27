import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  Attribute,
  Entity,
  EntityService,
  isTableAttribute,
  TableAttribute,
} from '../../../services/entity.service';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

/*
TODO:
 - Disable State column when File column has a value for divisions
 - When the settings are reset, the reset value doesn't propagate through to the edit component
 */

export type DialogResult = 'save' | 'delete' | 'close';

@Component({
  selector: 'app-edit-entity',
  templateUrl: './edit-entity.component.html',
  styleUrls: ['./edit-entity.component.scss'],
})
export class EditEntityComponent implements OnInit {
  @Input() entity: Entity;
  @Input() entityService: EntityService<any>;
  @Input() isModal = true;
  @Output() action = new EventEmitter<[DialogResult, any]>();

  attributes: Attribute[];

  formGroup: FormGroup;
  formArrays: { [name: string]: FormArray };
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    @Optional() private dialogRef?: MatDialogRef<EditEntityComponent>,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    private data?: { entity: Entity; entityService: EntityService<any> }
  ) {}

  ngOnInit() {
    this.entity = this.entity ?? this.data?.entity ?? {};
    this.entityService = this.entityService ?? this.data.entityService;
    this.attributes = this.entityService.config.attributes;

    this.formArrays = Object.assign(
      {},
      ...this.attributes.filter(isTableAttribute).map(attr => ({
        [attr.name]: new FormArray(
          (this.entity[attr.name] ?? []).map(
            obj => new FormGroup(this.createFormControls(attr.columns, obj))
          )
        ),
      }))
    );
    this.formGroup = new FormGroup(
      Object.assign(
        {},
        this.createFormControls(this.attributes, this.entity),
        this.formArrays
      )
    );
  }

  get title() {
    return (
      this.entityService.getName(this.entity) ??
      `New ${this.entityService.config.entityName}`
    );
  }

  createFormControls(attributes: Attribute[], entity: Entity | object) {
    return Object.assign(
      {},
      ...attributes.map(attribute => ({
        [attribute.name]: new FormControl(
          attribute.type === 'password'
            ? ''
            : attribute.transform?.(entity) ?? entity[attribute.name],
          [
            ...(attribute.optional ? [] : [Validators.required]),
            ...(attribute.type === 'email' ? [Validators.email] : []),
          ]
        ),
      }))
    );
  }

  addRow(attribute: TableAttribute, entity: Entity = {}) {
    this.formArrays[attribute.name].push(
      new FormGroup(this.createFormControls(attribute.columns, entity))
    );
  }

  deleteRow(attribute: Attribute, index: number) {
    this.formArrays[attribute.name].removeAt(index);
  }

  controls(attribute: Attribute) {
    return this.formArrays[attribute.name].controls;
  }

  onButtonClick(action: DialogResult) {
    if (action === 'save' && this.formGroup.invalid) {
      this.hasError = true;
    } else if (this.dialogRef) {
      this.dialogRef.close([action, this.formGroup.value]);
    } else {
      this.action.emit([action, this.formGroup.value]);
      this.hasError = false;
    }
  }
}
