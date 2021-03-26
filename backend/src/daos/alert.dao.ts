import * as mongoose from 'mongoose';
import { AlertModel } from '@codelm/common/src/models/alert.model';
import { ModelDocument } from './dao';

type AlertDocument = ModelDocument<AlertModel>;

const AlertSchema = new mongoose.Schema({
  message: String,
});

const Alert = mongoose.model<AlertDocument>('Alert', AlertSchema);

export class AlertDao {
  static getAlerts(): Promise<AlertModel[]> {
    return Alert.find().lean().exec();
  }

  static async addOrUpdateAlert(alert: AlertModel): Promise<AlertModel> {
    if (!alert._id) {
      return (await Alert.create(alert)).toObject();
    } else {
      return await Alert.findByIdAndUpdate(alert._id, alert, { new: true })
        .lean()
        .exec();
    }
  }

  static deleteAlert(_id: string): Promise<any> {
    return Alert.deleteOne({ _id }).exec();
  }
}
