import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-all-code',
  templateUrl: './all-code.component.html',
  styleUrls: ['./all-code.component.scss'],
})
export class AllCodeComponent implements OnInit {
  problemIds: string[];
  code: { [problemId: string]: { mode: string; code: string }[] };

  constructor() {}

  ngOnInit() {
    this.code = {};

    for (let problem of Object.keys(localStorage).filter(key =>
      key.match(/^[\dabcdef]{24}$/g)
    )) {
      const data = JSON.parse(localStorage.getItem(problem));

      for (let mode of Object.keys(data)) {
        const code = data[mode];

        if (code) {
          if (!(problem in this.code)) {
            this.code[problem] = [];
          }

          this.code[problem].push({ mode, code });
        }
      }
    }

    this.problemIds = Object.keys(this.code);
  }
}
