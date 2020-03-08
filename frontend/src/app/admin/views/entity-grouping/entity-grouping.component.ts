import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Entity, GroupedEntityService} from "../../../services/entity.service";
import {ActivatedRoute} from "@angular/router";
import {EntityListComponent} from "../entity-list/entity-list.component";

@Component({
  selector: 'app-entity-grouping',
  templateUrl: './entity-grouping.component.html',
  styleUrls: ['./entity-grouping.component.scss']
})
export class EntityGroupingComponent implements OnInit {
  entityService: GroupedEntityService<any, any>;
  parents: Entity[];

  @ViewChildren(EntityListComponent) entityLists: QueryList<EntityListComponent>;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.entityService = this.route.snapshot.data.entityService;

    this.entityService.getParents().then(entities => {
      this.parents = entities;
    });
  }

  get entityName() {
    return this.entityService.config.entityName;
  }

  label(entity: any) {
    return this.entityService.getGroupLabel(entity);
  }

  get editable() {
    return this.entityService.config.editComponent !== undefined;
  }

  openEditComponent() {
    this.entityLists.first.openEditComponent(null);
  }
}
