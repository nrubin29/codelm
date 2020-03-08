import {Component, Inject, Input, OnInit} from '@angular/core';
import {Column, Entity, EntityService} from "../../../services/entity.service";
import {DialogResult} from "../../../dialog-result";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss']
})
export class EntityListComponent implements OnInit {
  private entityService: EntityService;
  @Input() parent: Entity;
  entities: Entity[];

  constructor(private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.entityService = this.route.snapshot.data.entityService;
    this.refreshData();
  }

  refreshData() {
    if (this.entityService.type === 'single') {
      this.entityService.getAll().then(entities => {
        this.entities = entities;
      });
    }

    else {
      this.entityService.getChildren(this.parent).then(entities => {
        this.entities = entities;
      });
    }
  }

  get type() {
    return this.entityService.type;
  }

  get title() {
    return this.entityService.title;
  }

  get columns(): Column[] {
    return this.entityService.columns.map(column => typeof column === 'string' ? {name: column, display: 'string'} : Object.assign({}, column, {display: column.display ?? 'string'}));
  }

  get columnNames() {
    return this.entityService.columns.map(column => typeof column === 'string' ? column : column.name);
  }

  getData(column: string, value: Entity) {
    if (this.entityService.getData) {
      return this.entityService.getData(column, value, this.parent) ?? value[column];
    }

    return value[column];
  }

  openEditComponent(entity: Entity | null) {
    const ref = this.dialog.open(this.entityService.editComponent, {
      data: {entity},
      disableClose: true
    });

    ref.afterClosed().subscribe((r?: [DialogResult, any]) => {
      if (r) {
        const result: DialogResult = r[0];
        const data: Entity = r[1];

        if (result === 'save') {
          this.entityService.addOrUpdate(data).then(response => {
            // TODO: If this is an error, display it.
            console.log(response);
            this.refreshData();
          }).catch(alert);
        }

        else if (result === 'delete') {
          if (confirm('Are you sure you want to delete this?')) {
            this.entityService.delete(data).then(() => {
              this.refreshData();
            }).catch(alert);
          }
        }
      }
    });
  }
}
