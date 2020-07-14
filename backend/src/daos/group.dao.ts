import * as mongoose from 'mongoose';
import { GroupModel } from '../../../common/src/models/group.model';

type GroupType = GroupModel & mongoose.Document;

const GroupSchema = new mongoose.Schema({
  name: String,
});

const Group = mongoose.model<GroupType>('Group', GroupSchema);

export class GroupDao {
  static async getGroup(_id: string): Promise<GroupModel> {
    return (await Group.findById(_id).exec()).toObject();
  }

  static async getGroups(): Promise<GroupModel[]> {
    return (await Group.find().exec()).map(group => group.toObject());
  }

  static async addOrUpdateGroup(group: GroupModel): Promise<GroupModel> {
    if (!group._id) {
      return (await Group.create(group)).toObject();
    } else {
      return (
        await Group.findByIdAndUpdate(group._id, group, { new: true }).exec()
      ).toObject();
    }
  }

  static deleteGroup(_id: string): Promise<any> {
    return Group.deleteOne({ _id }).exec();
  }
}
