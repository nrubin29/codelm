import { Component, OnInit } from '@angular/core';
import {
  getUnixTime,
  intervalToDuration,
  isFuture,
  isPast,
  parseJSON,
} from 'date-fns';
import { SettingsService } from '../../../services/settings.service';
import { SocketService } from '../../../services/socket.service';
import { SettingsModel } from '../../../../../../common/src/models/settings.model';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit {
  private settings: SettingsModel;
  private interval: number;

  end: Date;
  countdown: string;

  constructor(
    private socketService: SocketService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.socketService.on('updateSettings', () => {
      this.settingsService.getSettings().then(settings => {
        this.settings = settings;
        this.setup();
      });
    });

    this.settingsService.getSettings().then(settings => {
      this.settings = settings;
      this.setup();
    });
  }

  private setup() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }

    const schedule = this.settings.schedule
      .map(schedule => parseJSON(schedule.when))
      .filter(when => isFuture(when))
      .sort(when => getUnixTime(when));

    const tick = () => {
      if (!this.end) {
        return;
      }

      if (isPast(this.end)) {
        clearInterval(this.interval);
        this.countdown = '00:00:00';
      } else {
        // TODO: Only display days if > 1 day remains.
        const duration = intervalToDuration({
          start: new Date(),
          end: this.end,
        });
        this.countdown = [duration.hours, duration.minutes, duration.seconds]
          .map(x => this.pad(x))
          .join(':');
      }
    };

    if (schedule.length > 0) {
      this.end = schedule[0];

      tick();
      this.interval = setInterval(tick, 500);
    }
  }

  private pad(x: number, size: number = 2) {
    let s = x.toString();

    while (s.length < size) {
      s = '0' + s;
    }

    return s;
  }
}
