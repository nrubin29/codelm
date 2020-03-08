import {Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Entity, EntityService, GroupedEntityService} from "../../../services/entity.service";
import {ActivatedRoute} from "@angular/router";
import {EntityListComponent} from "../entity-list/entity-list.component";

@Component({
  selector: 'app-entity-grouping',
  templateUrl: './entity-grouping.component.html',
  styleUrls: ['./entity-grouping.component.scss']
})
export class EntityGroupingComponent implements OnInit {
  entityService: GroupedEntityService;
  parents: Entity[];

  @ViewChildren(EntityListComponent) entityLists: QueryList<EntityListComponent>;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.entityService = this.route.snapshot.data.entityService;

    this.entityService.getParents().then(entities => {
      this.parents = entities;
    });
  }

  get type() {
    return this.entityService.type;
  }

  get title() {
    return this.entityService.title;
  }

  label(entity: any) {
    return this.entityService.getGroupLabel(entity);
  }

  openEditComponent() {
    this.entityLists.first.openEditComponent(null);
  }
}
