import {Type} from "@angular/core";

export type Entity = object;

export interface Column {
  name: string;
  value?: any;
  isEditColumn?: boolean;
  display?: 'string' | 'boolean' | 'custom';
  customComponent?: Type<any>;
  link?(entity: Entity): string[];
}

interface EntityServiceConfiguration {
  entityName: string;
  columns: Array<string | Column>;
  editComponent?: Type<any>;
  refresh?: boolean;
}

export abstract class EntityService<T, P> {
  constructor(public config: EntityServiceConfiguration) {}

  getDynamicColumns(parent?: P): Promise<Array<string | Column>> {
    return Promise.resolve([]);
  }

  async getColumns(parent?: P): Promise<Column[]> {
    const dynamicColumns = await this.getDynamicColumns(parent);
    return this.config.columns.concat(dynamicColumns).map(column => typeof column === 'string' ?
      {name: column, display: 'string'} :
      Object.assign({}, column, {display: column.display ?? 'string'})
    );
  }

  getData(column: Column, value: T, parent?: P): any | undefined {
    return undefined;
  }

  addOrUpdate(entity: T): Promise<any> { // TODO: Should this be void?
    return Promise.resolve();
  }

  delete(entity: T): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Represents entities that are not grouped (like admins)
 */
export abstract class SingleEntityService<T> extends EntityService<T, T> {
  abstract getAll(): Promise<T[]>;
}

/**
 * Represents entities that are grouped (like problems, grouped by division)
 */
export abstract class GroupedEntityService<T, P> extends EntityService<T, P> {
  abstract getParents(): Promise<P[]>;
  abstract getChildren(parent: P): Promise<T[]>;
  abstract getGroupLabel(entity: P): string;
}

// TODO: Refactor this system so that everything is a SingleEntityService and two SingleEntityServices can be combined
//  to make a GroupedEntityService
