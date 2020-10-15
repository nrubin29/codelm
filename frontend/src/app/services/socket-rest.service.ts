import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { SocketConnection } from '@codelm/common/src/models/sockets.model';
import { Column, GroupedEntityService } from './entity.service';

// TODO: Refresh when action button is clicked.

@Injectable({
  providedIn: 'root',
})
export class SocketRestService extends GroupedEntityService<
  SocketConnection,
  string
> {
  private endpoint = 'sockets';

  constructor(private restService: RestService) {
    super({
      entityName: 'socket',
      columns: [
        { name: '_id' },
        {
          name: 'kick',
          display: 'button',
          icon: 'close',
          action: (connection: SocketConnection) => {
            this.delete(connection);
          },
        } as Column,
      ],
      refresh: true,
    });
  }

  delete(entity: SocketConnection): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${entity._id}`);
  }

  getParents(): Promise<string[]> {
    return Promise.resolve(['teams', 'admins']);
  }

  getChildren(parent: string): Promise<SocketConnection[]> {
    return this.restService.get<SocketConnection[]>(
      `${this.endpoint}/${parent}`
    );
  }

  getGroupLabel(parent: string): string {
    return parent[0].toUpperCase() + parent.substring(1);
  }

  getName(entity: Partial<SocketConnection>) {
    return entity?._id;
  }
}
