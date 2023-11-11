import { Component, OnInit, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent implements OnInit {
  firestore: Firestore = inject(Firestore);
  game = new Game();
  gameId!: string | undefined;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  async newGame() {
    this.router.navigateByUrl('/game/' + this.gameId);
  }

  async addGame() {
    await addDoc(this.getGameRef(), this.game.toJSON())
      .catch((error) => {
        console.error(error);
      })
      .then((docRef) => {
        console.log((this.gameId = docRef?.id));
      });
  }

  getGameRef() {
    return collection(this.firestore, 'game');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
