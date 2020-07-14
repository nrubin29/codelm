import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() header: string; // The attribute `title` is used for alt tags.
  @Input() pad = true;
  @Input() display: 'normal' | 'info' | 'error' = 'normal';
  @Input() small = false;

  constructor() {}

  ngOnInit() {}
}
