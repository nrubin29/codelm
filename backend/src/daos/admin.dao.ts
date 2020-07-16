// import * as mongoose from 'mongoose';
// import * as crypto from 'crypto';
import { AdminModel } from '../../../common/src/models/admin.model';
// import { LoginResponse } from '../../../common/src/packets/server.packet';
import { AuthenticationDao } from './dao';

export const AdminDao = new AuthenticationDao<AdminModel>('admins', false);

// type AdminType = AdminModel & mongoose.Document;
//
// const AdminSchema = new mongoose.Schema({
//   username: String,
//   password: String,
//   salt: String,
//   name: String,
//   superUser: { type: Boolean, default: false },
// });
//
// const Admin = mongoose.model<AdminType>('Admin', AdminSchema);
//
// export class OldAdminDao {
//   static getAdmin(id: string): Promise<AdminModel> {
//     return Admin.findById(id).exec();
//   }
//
//   static getAdmins(): Promise<AdminModel[]> {
//     return Admin.find().exec();
//   }
//
//   static async login(username: string, password: string): Promise<AdminModel> {
//     const admin = await Admin.findOne({ username: username });
//
//     if (!admin) {
//       throw LoginResponse.NotFound;
//     }
//
//     const inputHash = crypto
//       .pbkdf2Sync(password, new Buffer(admin.salt), 1000, 64, 'sha512')
//       .toString('hex');
//
//     if (inputHash === admin.password) {
//       return admin;
//     } else {
//       throw LoginResponse.IncorrectPassword;
//     }
//   }
//
//   static addOrUpdateAdmin(admin: any): Promise<AdminModel> {
//     if (admin.password) {
//       const salt = crypto.randomBytes(16).toString('hex');
//       const hash = crypto
//         .pbkdf2Sync(admin.password, new Buffer(salt), 1000, 64, 'sha512')
//         .toString('hex');
//
//       admin.salt = salt;
//       admin.password = hash;
//     } else if (admin.password === '') {
//       admin.password = undefined;
//     }
//
//     if (!admin._id) {
//       return Admin.create(admin as AdminModel);
//     } else {
//       return Admin.findByIdAndUpdate(admin._id, admin, {
//         new: true,
//         omitUndefined: true,
//       }).exec();
//     }
//   }
//
//   static deleteAdmin(id: string): Promise<any> {
//     return Admin.deleteOne({ _id: id }).exec();
//   }
// }
