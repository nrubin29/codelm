import { Type } from '@angular/core';

export interface Entity {
  _id?: string;
}

export interface Option {
  name: string;
  value: string;
}

export interface Attribute {
  name: string;

  /**
   * The type of the attribute. This determines what control is used in the edit form. By default, we treat the input
   * like a string and display a basic <input>.
   */
  type?:
    | 'wysiwyg'
    | 'multiline'
    | 'password'
    | 'email'
    | 'file'
    | 'boolean'
    | 'select'
    | 'multiselect'
    | 'table';

  optional?: boolean;
  readonly?: boolean;

  /**
   * Useful when you get an object but only want its _id for the form.
   * @param value The value to transform. Could be the entity itself or could be a sub-entity in the case of type=table.
   */
  transform?: <T>(value?: Partial<T>) => any;

  /**
   * When type=select, these are the options that are presented in the <select>.
   */
  options?: any[] | (() => Promise<Option[]>);

  /**
   * When type=table, these are the columns of the table.
   */
  columns?: Attribute[];
}

export interface Column {
  name: string;

  /**
   * If true, all cells in this column will become links that will open the edit modal.
   */
  isEditColumn?: boolean;

  /**
   * The type of the column. This determines how it is displayed in the table. By default, we treat the value like a
   * string.
   */
  display?: 'boolean' | 'button' | 'custom';

  /**
   * If display=button, this is the icon used as the button.
   */
  icon?: string; // For display=button

  /**
   * If display=button, this function is called when a button is clicked.
   * @param entity The entity whose button you clicked.
   */
  action?(entity: Entity): void;

  /**
   * If display=custom, this value will be passed to instantiated custom cell components. This value should represent
   * the entire column (like a problem column in the standings table).
   */
  value?: any;

  /**
   * If display=custom, this is the type of the component that should be instantiated for each cell.
   */
  customComponent?: Type<any>;

  /**
   * If this function is provided, all cells will become links that will lead to the path returned from this function.
   * @param entity The entity you clicked.
   */
  link?(entity: Entity): string[];
}

interface EntityServiceConfiguration {
  /**
   * The name of a singular entity (like 'admin').
   */
  entityName: string;

  /**
   * The attributes that are visible in the edit form.
   */
  attributes?: Attribute[];
}

export abstract class EntityService<T> {
  constructor(public config: EntityServiceConfiguration) {}

  abstract getName(entity: Partial<T>);

  addOrUpdate(entity: T): Promise<any> {
    // TODO: Should this be void?
    return Promise.resolve();
  }

  delete(entity: T): Promise<void> {
    return Promise.resolve();
  }
}

export interface ListEntityServiceConfiguration
  extends EntityServiceConfiguration {
  /**
   * The columns that should be displayed in the table of entities.
   */
  columns?: Column[];

  /**
   * Determines if you can create a new entity or edit an existing entity.
   */
  editable?: boolean;

  /**
   * Determines if the list should automatically refresh itself every so often.
   */
  refresh?: boolean;
}

/**
 * Represents a service that handles lists of entities
 */
export abstract class ListEntityService<T, P> extends EntityService<T> {
  constructor(public config: ListEntityServiceConfiguration) {
    super(config);
  }

  getDynamicColumns(parent?: P): Promise<Column[]> {
    return Promise.resolve([]);
  }

  async getColumns(parent?: P): Promise<Column[]> {
    return this.config.columns.concat(await this.getDynamicColumns(parent));
  }

  getData(column: Column, value: T, parent?: P): any | undefined {
    return undefined;
  }
}

/**
 * Represents entities that are not grouped (like admins)
 */
export abstract class SingleEntityService<T> extends ListEntityService<
  T,
  never
> {
  abstract getAll(): Promise<T[]>;
}

/**
 * Represents entities that are grouped (like problems, grouped by division)
 */
export abstract class GroupedEntityService<T, P> extends ListEntityService<
  T,
  P
> {
  abstract getParents(): Promise<P[]>;
  abstract getChildren(parent: P): Promise<T[]>;
  abstract getGroupLabel(parent: P): string;
}
