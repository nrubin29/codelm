import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { GroupModel } from '@codelm/common/src/models/group.model';
import { GroupService } from '../services/group.service';

@Injectable({
  providedIn: 'root',
})
export class GroupsResolve implements Resolve<GroupModel[]> {
  constructor(private groupService: GroupService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<GroupModel[]> {
    return this.groupService.getAll();
  }
}
