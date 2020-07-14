import { Component, OnInit } from '@angular/core';
import { SettingsModel } from '../../../../../../common/src/models/settings.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
})
export class EndComponent implements OnInit {
  settings: SettingsModel;
  year: number;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.year = new Date().getFullYear();

    this.activatedRoute.data.subscribe(data => {
      this.settings = data['settings'];
    });
  }

  adminLogIn() {
    this.router.navigate(['/login'], { state: { force: true } });
  }
}
