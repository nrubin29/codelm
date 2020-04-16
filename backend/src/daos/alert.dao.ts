import mongoose = require('mongoose');
import {AlertModel} from '../../../common/src/models/alert.model';

type AlertType = AlertModel & mongoose.Document;

const AlertSchema = new mongoose.Schema({
  message: String,
});

const Alert = mongoose.model<AlertType>('Alert', AlertSchema);

export class AlertDao {
  static async getAlert(_id: string): Promise<AlertModel> {
    return (await Alert.findById(_id).exec()).toObject();
  }

  static async getAlerts(): Promise<AlertModel[]> {
    return (await Alert.find().exec()).map(alert => alert.toObject());
  }

  static async addOrUpdateAlert(alert: AlertModel): Promise<AlertModel> {
    if (!alert._id) {
      return (await Alert.create(alert)).toObject();
    }

    else {
      return (await Alert.findByIdAndUpdate(alert._id, alert, {new: true}).exec()).toObject();
    }
  }

  static deleteAlert(_id: string): Promise<any> {
    return Alert.deleteOne({_id}).exec();
  }
}
