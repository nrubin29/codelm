import { Component, OnInit } from '@angular/core';
import { DivisionModel } from '../../../../../../common/src/models/division.model';
import { DivisionService } from '../../../services/division.service';
import { DialogResult } from '../../../dialog-result';
import { MatDialog } from '@angular/material';
import { EditDivisionComponent } from '../../components/edit-division/edit-division.component';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-divisions',
  templateUrl: './divisions.component.html',
  styleUrls: ['./divisions.component.scss']
})
export class DivisionsComponent implements OnInit {
  divisions: DivisionModel[] = [];

  constructor(private divisionService: DivisionService, private activatedRoute: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit() {
    this.activatedRoute.data.subscribe(data => {
      this.divisions = data['divisions'];
    });
  }

  edit(division: DivisionModel) {
    const ref = this.dialog.open(EditDivisionComponent, {
      data: {
        division: division
      },
      disableClose: true
    });

    ref.afterClosed().subscribe((r?: [DialogResult, any]) => {
      if (r) {
        const result = r[0];
        const data = r[1];

        if (result === 'save') {
          this.divisionService.addOrUpdateDivision(data).then(response => {
            // TODO: If this is an error, display it.
            console.log(JSON.stringify(response));
          }).catch(alert);
        }

        else if (result === 'delete') {
          if (confirm('Are you sure you want to delete this division?')) {
            this.divisionService.deleteDivision(data._id).then(() => {
              // TODO: Something?
            }).catch(alert);
          }
        }
      }
    });
  }
}
