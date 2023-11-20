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
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  game!: Game;  
  gameOver=false;
  firestore: Firestore = inject(Firestore);

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe(async (params) => {
      const gameId = params['id'];
      await this.loadGameFromDatabase(gameId);
      this.game.id = gameId;
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
    if (this.game.id) {
      let docRef = this.getSingleDocRef('game', this.game.id);
      await updateDoc(docRef, this.getCleanJSON(this.game)).catch((err) => {
        console.log(err);
      });
    }
  }

  getCleanJSON(game: Game): {} {
    return {
      player_images : this.game.player_images,
      players: this.game.players,
      stack: this.game.stack,
      playedCards: this.game.playedCards,
      currentPlayer: this.game.currentPlayer,
      currentCard: this.game.currentCard,
      pickCardAnimation:this.game.pickCardAnimation,
    };
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
    if(this.game.stack.length == 0){
      this.gameOver=true;
    } else if (!this.game.pickCardAnimation) {
      if (poppedCard !== undefined) {
        this.game.currentCard = poppedCard;
        console.log(this.game.currentCard);
        this.game.pickCardAnimation = true;
        this.updateGame();
        this.game.currentPlayer++;
        this.game.currentPlayer =
          this.game.currentPlayer % this.game.players.length;
        setTimeout(() => {
          this.game.playedCards.push(this.game.currentCard);
          this.updateGame();
          this.game.pickCardAnimation = false;
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
        this.game.player_images.push('1.jpeg') 
        this.updateGame();
      }
    });
  }

  editPlayer(playerId:number){
    console.log('yessiiirrrr',playerId)
    const dialogRef= this.dialog.open(EditPlayerComponent);
    dialogRef.afterClosed().subscribe((change: string) => {
      console.log('recived change', change)
      if(change){
        if(change == 'DELETE'){
          this.game.player_images.splice(playerId, 1);
          this.game.players.splice(playerId, 1);

        }else{
          this.game.player_images[playerId] = change;
        }
        this.updateGame();

    }
    });
  }
}
