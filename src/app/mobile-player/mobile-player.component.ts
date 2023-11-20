import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-mobile-player',
  templateUrl: './mobile-player.component.html',
  styleUrls: ['./mobile-player.component.scss']
})
export class MobilePlayerComponent implements OnInit {
  @Input() name: any;
  @Input() image = '1.png;'
  @Input() playerAktiv: boolean =false;


  ngOnInit(): void {}

}
