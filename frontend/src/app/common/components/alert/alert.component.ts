import { Component, OnInit } from '@angular/core';
import {AlertService} from '../../../services/alert.service';
import {AlertModel} from '../../../../../../common/src/models/alert.model';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  alerts: AlertModel[];

  constructor(private alertService: AlertService) { }

  async ngOnInit() {
    this.alerts = await this.alertService.getAll();
  }
}
