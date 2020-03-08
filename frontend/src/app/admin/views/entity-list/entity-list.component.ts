import {Component, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {
  Column,
  Entity,
  EntityService,
  GroupedEntityService,
  SingleEntityService
} from "../../../services/entity.service";
import {DialogResult} from "../../../dialog-result";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute} from "@angular/router";

// TODO: Add searching

@Component({
  selector: 'app-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss']
})
export class EntityListComponent implements OnInit, OnDestroy {
  private entityService: EntityService<Entity, Entity>;
  columns: Column[];

  @Input() parent: Entity;
  entities: Entity[];

  intervalHandle: number;

  constructor(private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.entityService = this.route.snapshot.data.entityService;
    this.entityService.getColumns(this.parent).then(columns => {
      this.columns = columns;
      this.refreshData();

      if (this.entityService.config.refresh) {
        this.intervalHandle = setInterval(this.refreshData.bind(this), 30 * 1000);
      }
    });
  }

  ngOnDestroy() {
    if (this.entityService.config.refresh) {
      clearInterval(this.intervalHandle);
    }
  }

  refreshData() {
    if (this.entityService instanceof SingleEntityService) {
      this.entityService.getAll().then(entities => {
        this.entities = entities;
      });
    }

    else if (this.entityService instanceof GroupedEntityService) {
      this.entityService.getChildren(this.parent).then(entities => {
        this.entities = entities;
      });
    }
  }

  get type() {
    return this.entityService instanceof SingleEntityService ? 'single' : 'grouped';
  }

  get entityName() {
    return this.entityService.config.entityName;
  }

  get columnNames() {
    return this.columns.map(column => column.name);
  }

  get editable() {
    return this.entityService.config.editComponent !== undefined;
  }

  getData(column: Column, value: Entity) {
    return this.entityService.getData(column, value, this.parent) ?? value[column.name];
  }

  openEditComponent(entity: Entity | null) {
    const ref = this.dialog.open(this.entityService.config.editComponent, {
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
