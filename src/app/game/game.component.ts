import { Component, OnInit, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
} from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  game!: Game;
  currentCard: string = '';

  firestore: Firestore = inject(Firestore);

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      console.log(params['id']);
    });
    console.log(this.game);
  }

  async updateGameInFirestore() {
    try {
      await updateDoc(this.getSingleDocRef('game', this.game.id), this.game.updateGame());
    } catch (error) {
      console.error('Error updating document:', error);
    }
  }

  newGame() {
    this.game! = new Game();
  }

  async addGame(game: {}) {
    await addDoc(this.getGameRef(), game)
      .catch((error) => {
        console.error(error);
      })
      .then((docRef) => {
        console.log('document written ID:', docRef?.id);
      });
  }

  getGameRef() {
    return collection(this.firestore, 'game');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  takeCard() {
    const poppedCard = this.game.stack.pop();
    if (!this.pickCardAnimation) {
      if (poppedCard !== undefined) {
        this.currentCard = poppedCard;
        console.log(this.currentCard);
        this.pickCardAnimation = true;

        this.game.currentPlayer++;
        this.game.currentPlayer =
          this.game.currentPlayer % this.game.players.length;

        setTimeout(() => {
          this.game.playedCards.push(this.currentCard);
          this.pickCardAnimation = false;
        }, 1000);
      } else {
        console.error('The stack is empty'); 
      }
    }
  }

  async openDialog(): Promise<void> {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name.length > 0) {
        this.game.players.push(name);
        this.game.currentPlayer = this.game.players.length - 1; // Assuming 0-based index

        this.updateGameInFirestore();
      }
    });
  }
}
