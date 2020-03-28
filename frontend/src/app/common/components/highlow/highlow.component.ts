import {Component, OnInit} from '@angular/core';
import {GameComponent} from '../../views/game/game.component';

@Component({
  selector: 'app-highlow',
  templateUrl: './highlow.component.html',
  styleUrls: ['./highlow.component.scss']
})
export class HighlowComponent implements OnInit {
  constructor(private gameComponent: GameComponent) { }

  ngOnInit() {
    this.gameComponent.getResultDisplay = result => result === '1' ? 'Too high' : result === '-1' ? 'Too low': result === '0' ? 'Correct' : result;
  }
}
