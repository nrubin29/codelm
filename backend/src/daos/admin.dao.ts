import * as mongoose from 'mongoose';
import * as crypto from 'crypto';
import { AdminModel } from '@codelm/common/src/models/admin.model';
import { LoginResponseType } from '@codelm/common/src/models/auth.model';
import { ModelDocument } from './dao';

type AdminDocument = ModelDocument<AdminModel>;

const AdminSchema = new mongoose.Schema({
  username: String,
  password: String,
  salt: String,
  name: String,
  superUser: { type: Boolean, default: false },
});

const Admin = mongoose.model<AdminDocument>('Admin', AdminSchema);

export class AdminDao {
  static getAdmin(id: string): Promise<AdminModel> {
    return Admin.findById(id).lean().exec();
  }

  static async getAdmins(): Promise<AdminModel[]> {
    return await Admin.find().lean().exec();
  }

  static async login(username: string, password: string): Promise<AdminModel> {
    const admin = await Admin.findOne({ username: username }).lean().exec();

    if (!admin) {
      throw LoginResponseType.NotFound;
    }

    const inputHash = crypto
      .pbkdf2Sync(password, new Buffer(admin.salt), 1000, 64, 'sha512')
      .toString('hex');

    if (inputHash === admin.password) {
      return admin;
    } else {
      throw LoginResponseType.IncorrectPassword;
    }
  }

  static async addOrUpdateAdmin(admin: AdminModel): Promise<AdminModel> {
    if (admin.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(admin.password, new Buffer(salt), 1000, 64, 'sha512')
        .toString('hex');

      admin.salt = salt;
      admin.password = hash;
    } else if (admin.password === '') {
      admin.password = undefined;
    }

    if (!admin._id) {
      return (await Admin.create(admin as AdminModel)).toObject();
    } else {
      return await Admin.findByIdAndUpdate(admin._id, admin, {
        new: true,
        omitUndefined: true,
      })
        .lean()
        .exec();
    }
  }

  static deleteAdmin(id: string): Promise<any> {
    return Admin.deleteOne({ _id: id }).exec();
  }
}
