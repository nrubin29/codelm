import * as mongoose from 'mongoose';
import { GroupModel } from '@codelm/common/src/models/group.model';
import { ModelDocument } from './dao';

type GroupDocument = ModelDocument<GroupModel>;

const GroupSchema = new mongoose.Schema({
  name: String,
  special: { type: Boolean, default: false },
});

const Group = mongoose.model<GroupDocument>('Group', GroupSchema);

export class GroupDao {
  static getGroups(): Promise<GroupModel[]> {
    return Group.find().lean().exec();
  }

  static getNonSpecialGroups(): Promise<GroupModel[]> {
    return Group.find({ special: false }).lean().exec();
  }

  static async addOrUpdateGroup(group: GroupModel): Promise<GroupModel> {
    if (!group._id) {
      return (await Group.create(group)).toObject();
    } else {
      return await Group.findByIdAndUpdate(group._id, group, { new: true })
        .lean()
        .exec();
    }
  }

  static deleteGroup(_id: string): Promise<any> {
    return Group.deleteOne({ _id }).exec();
  }
}
