import { Collection, Db, ObjectId } from 'mongodb';
import { UserModel } from '../../../common/src/models/user.model';
import { LoginResponse } from '../../../common/src/packets/server.packet';
import * as crypto from 'crypto';
import { DEBUG } from '../server';

import './alert.dao';
import './problem.dao';
import './settings.dao';
import './submission.dao';

/**
 * If T is an array, return its type. Otherwise, return T.
 * FlattenArray<string> => string, FlattenArray<string[]> => string
 */
type FlattenArray<T> = T extends Array<infer AT> ? AT : T;

/**
 * If T is a database object or array of database objects, return string.
 * Otherwise, return T. This allows functions to ask for a value but accept an
 * ObjectId where appropriate.
 */
type OrObjectId<T> = T extends { _id?: string }
  ? string
  : T extends { _id?: string }[]
  ? string
  : T;

/**
 * Represents a dehydrated object (where all fields that refer to database
 * objects have type string).
 */
type Dehydrated<T> = {
  [K in keyof T]: OrObjectId<T[K]>;
};

export class Dao<T extends { _id?: string }> {
  static db: Db;

  _collection: Collection<T>;
  // private populations: [string, Dao<any>][] = [];
  private virtuals: { key: string; fn: (model: T) => Promise<any> }[] = [];

  constructor(private collectionName: string) {}

  get collection() {
    if (this._collection) {
      return this._collection;
    }

    return (this._collection = Dao.db.collection(this.collectionName));
  }

  /**
   * Registers a path that is populated in all models. This is just sugar for
   * virtual() because populations really are just virtuals.
   */
  populate<K extends keyof T & string>(key: K, dao: Dao<FlattenArray<T[K]>>) {
    // this.populations.push([key, dao]);
    this.virtuals.push({ key, fn: model => dao.getById(model._id) });
    return this;
  }

  /**
   * Registers a virtual that is added to all models.
   */
  virtual<K extends keyof T & string>(key: K, fn: (model: T) => Promise<T[K]>) {
    this.virtuals.push({ key, fn });
    return this;
  }

  /**
   * Sets all virtuals for the model.
   */
  protected async hydrate(model: T) {
    // for (const population of this.populations) {
    //   if (Array.isArray(model[population[0]])) {
    //     model[population[0]] = await Promise.all(
    //       model[population[0]].map(_id => population[1].getById(_id))
    //     );
    //   } else {
    //     model[population[0]] = await population[1].getById(
    //       model[population[0]]
    //     );
    //   }
    // }

    for (const virtual of this.virtuals) {
      if (Array.isArray(model[virtual.key])) {
        model[virtual.key] = await Promise.all(
          model[virtual.key].map(subModel => virtual.fn(subModel))
        );
      } else {
        model[virtual.key] = await virtual.fn(model);
      }
    }

    return model;
  }

  /**
   * Removes _id and all virtuals from the model.
   */
  private dehydrate(model: T) {
    const shallowCopy = { ...model };
    delete shallowCopy._id;

    for (const virtual of this.virtuals) {
      if (Array.isArray(model[virtual.key])) {
        const array = model[virtual.key] as any[];

        // This is an array of populated objects.
        if (array.length > 0 && array[0].hasOwnProperty('_id')) {
          model[virtual.key] = model[virtual.key].map(subModel => subModel._id);
        }

        // This array is just a regular virtual and can be `delete`d.
        else {
          delete model[virtual.key];
        }
      } else {
        // This is a populated object.
        if (model[virtual.key]?.hasOwnProperty('_id')) {
          model[virtual.key] = model[virtual.key]._id;
        }

        // This is just a regular virtual and can be `delete`d.
        else {
          delete model[virtual.key];
        }
      }
    }

    return shallowCopy;
  }

  getById(_id: string) {
    return this.collection
      .findOne({ _id: new ObjectId(_id) })
      .then(model => this.hydrate(model));
  }

  getByField<K extends keyof T>(key: K, value: OrObjectId<T[K]>) {
    return this.collection
      .findOne({ [key]: value })
      .then(model => this.hydrate(model));
  }

  getAll() {
    return this.collection
      .find()
      .toArray()
      .then(results => Promise.all(results.map(model => this.hydrate(model))));
  }

  getAllByField<K extends keyof T>(key: K, value: OrObjectId<T[K]>) {
    return this.collection
      .find({ [key]: value })
      .toArray()
      .then(results => Promise.all(results.map(model => this.hydrate(model))));
  }

  async addOrUpdate(model: T) {
    const oldModel = await this.getById(model._id);

    const result = await this.collection.findOneAndReplace(
      { _id: new ObjectId(model._id) },
      { ...oldModel, ...this.dehydrate(model) },
      {
        upsert: true,
      }
    );

    return this.hydrate(result.value);
  }

  addMany(models: T[]): Promise<T[]> {
    return this.collection.insertMany(models).then(result => result.ops);
  }

  deleteById(_id: string) {
    return this.collection
      .deleteOne({ _id: new ObjectId(_id) })
      .then(result => result.result.ok === 1);
  }

  /**
   * Deletes all entities E for which E[key] is in value.
   */
  deleteAllByField<K extends keyof T, A extends readonly T[K][]>(
    key: K,
    value: A
  ) {
    return this.collection
      .deleteMany({ [key]: { $in: value } })
      .then(result => result.result.ok === 1);
  }
}

// TODO: Make a non-exported BaseDao class that Dao and SingletonDao extend.
export class SingletonDao<T extends { _id?: string }> extends Dao<T> {
  get() {
    return this.collection.findOne({});
  }

  delete() {
    return this.collection.deleteOne({});
  }
}

export class AuthenticationDao<T extends UserModel> extends Dao<T> {
  constructor(
    collectionName: string,
    private allowPasswordBypassInDebugMode: boolean
  ) {
    super(collectionName);
  }

  async login(username: string, password: string): Promise<T> {
    if (!username || !password) {
      throw LoginResponse.NotFound;
    }

    // For some reason, TypeScript won't accept that T['username'] is of type
    // string, so the `as any` cast is necessary.
    const model = await this.getByField('username', username as any);

    if (!model) {
      throw LoginResponse.NotFound;
    }

    const inputHash = crypto
      .pbkdf2Sync(password, new Buffer(model.salt), 1000, 64, 'sha512')
      .toString('hex');

    if (
      (this.allowPasswordBypassInDebugMode && DEBUG) ||
      inputHash === model.password
    ) {
      return this.hydrate(model);
    } else {
      throw LoginResponse.IncorrectPassword;
    }
  }

  async register(model: Omit<Dehydrated<T>, 'salt'>): Promise<T> {
    if (!model.username || !model.password) {
      throw LoginResponse.NotFound;
    }

    try {
      // The `as any` cast is required because the `Omit` changes `model` to not
      // have type `T`.
      return await this.hydrate(await this.addOrUpdate(model as any));
    } catch (err) {
      if (err.code !== undefined && err.code === 11000) {
        // It's a MongoError for not-unique username.
        throw LoginResponse.AlreadyExists;
      } else {
        throw err;
      }
    }
  }

  addOrUpdate(model: T): Promise<T> {
    console.log(model.password);

    if (model.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(model.password, new Buffer(salt), 1000, 64, 'sha512')
        .toString('hex');

      model.salt = salt;
      model.password = hash;
    } else if (model.password === '') {
      delete model.password;
    }

    return super.addOrUpdate(model);
  }
}
