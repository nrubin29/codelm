import { Component, OnInit } from '@angular/core';
import {SettingsModel} from "../../../../../../common/src/models/settings.model";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss']
})
export class EndComponent implements OnInit {
  settings: SettingsModel;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.settings = data['settings'];
    });
  }

}
