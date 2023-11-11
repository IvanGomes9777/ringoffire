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
import { v4 as uuidv4 } from 'uuid';

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
    this.route.params.subscribe(async (params) => {
      const gameId = params['id'];
      await this.loadGameFromDatabase(gameId);
    });
  }

  async loadGameFromDatabase(gameId: string) {
    const gameRef = this.getSingleDocRef('game', gameId);
    try {
      const gameDoc = await getDoc(gameRef);
      if (gameDoc.exists()) {
        this.game = gameDoc.data() as Game;
        console.log('Loaded game from database:', this.game);
      } else {
        console.error('Game not found in the database');
      }
    } catch (error) {
      console.error('Error loading game from the database:', error);
    }
  }

  newGame() {
    this.game = new Game();
  }

  async updateGame() {
    const gameRef = this.getSingleDocRef('game', this.game.id);
    const updatedGameData = this.game.updateGame();
    try {
      console.log('Updating local game state...');
      await updateDoc(gameRef, updatedGameData);
      console.log('Game updated successfully in Firestore');
    } catch (error) {
      console.error('Error updating game:', error);
    }
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

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);
    dialogRef.afterClosed().subscribe((name: string) => {
      if (name.length > 0) {
        this.game.players.push(name);
      }
    });
  }
}
