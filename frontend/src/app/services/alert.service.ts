import { Injectable } from '@angular/core';
import { RestService } from './rest.service';
import { SingleEntityService } from './entity.service';
import { AlertModel } from '@codelm/common/src/models/alert.model';

@Injectable({
  providedIn: 'root',
})
export class AlertService extends SingleEntityService<AlertModel> {
  private endpoint = 'alerts';

  constructor(private restService: RestService) {
    super({
      entityName: 'alert',
      columns: [{ name: 'message', isEditColumn: true }],
      attributes: [
        { name: '_id', readonly: true, optional: true },
        { name: 'message' },
      ],
      editable: true,
    });
  }

  getAll(): Promise<AlertModel[]> {
    return this.restService.get<AlertModel[]>(this.endpoint);
  }

  addOrUpdate(alert: AlertModel): Promise<AlertModel> {
    return this.restService.put<AlertModel>(this.endpoint, alert);
  }

  delete(alert: AlertModel): Promise<void> {
    return this.restService.delete<void>(`${this.endpoint}/${alert._id}`);
  }

  getName(entity: Partial<AlertModel>) {
    return entity.message;
  }
}
