import {Type} from "@angular/core";

export type Entity = object;

export interface Column {
  name: string;
  isEditColumn?: boolean;
  display?: 'string' | 'boolean';
  link?(entity: Entity): string[];
}

interface GenericEntityService {
  title: string;
  columns: Array<string | Column>;
  editComponent?: Type<any>;
  getData?(column: string, value: Entity, parent?: Entity): any | undefined;

  addOrUpdate?(entity: Entity): Promise<any>; // TODO: Should this be void?
  delete?(entity: Entity): Promise<void>;
}

/**
 * Represents entities that are not grouped (like admins)
 */
export interface SingleEntityService extends GenericEntityService {
  type: 'single';
  getAll(): Promise<Entity[]>;
}

/**
 * Represents entities that are grouped (like problems, grouped by division)
 */
export interface GroupedEntityService extends GenericEntityService {
  type: 'grouped';
  getParents(): Promise<Entity[]>;
  getChildren(parent: Entity): Promise<Entity[]>;
  getGroupLabel(entity: any): string;
}

export type EntityService = SingleEntityService | GroupedEntityService;

// TODO: Refactor this system so that everything is a SingleEntityService and two SingleEntityServices can be combined
//  to make a GroupedEntityService
