import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-player',
  templateUrl: './edit-player.component.html',
  styleUrls: ['./edit-player.component.scss']
})
export class EditPlayerComponent {
allProfilPicture=['1.jpeg', '2.png', '3.jpg'];

constructor(public dialogRef : MatDialogRef < EditPlayerComponent> ){}
}
