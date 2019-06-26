import { Component } from '@angular/core';
import Shake from 'shake.js'
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent  {
  public shakeEvent = new Shake({threshold: 25, timeout: 100});
  public finish = false;
  public timingOver = 0;
  public finalTime = 0;
  public shakes = 0;
  private imageShaking = 'https://cdn.jsdelivr.net/gh/Mteixeira88/cow-shake@master/cow_shake.gif';
  private imageEnd = ''

  public isMobile(): boolean {
		if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			return true;
		}
		return false;
	}

    public shakeEventDidOccur() {
      
    }

    ngOnInit() {
      if (this.isMobile()) {
        this.shakeEvent.start();
        window.addEventListener('shake', () => {
          clearTimeout(this.timingOver);
          let time = 0;
          this.shakes += 1
          if (this.shakes % 5 === 0) {
            this.finalTime += 1;
          }
          this.timingOver = setTimeout(() => {
              this.finalTime += 1;
              clearTimeout(this.timingOver);
              this.shakeEvent.stop();
              this.finish = true;
          }, 500)
        }, false);
      }
    }
}
