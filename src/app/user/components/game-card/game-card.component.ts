import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { AppState, appState } from '../../../store';
import { User, Game } from '../../../model';
import { userState } from '../../store';

@Component({
  selector: 'game-card',
  templateUrl: './game-card.component.html',
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent implements OnInit, OnChanges {
  @Input() game: Game;
  userObs: Observable<User>;
  correctAnswerCount: number;
  questionIndex: number;
  userProfilePicUrl: string;
  user: User;
  myTurn: boolean;
  location: string;

  constructor(private store: Store<AppState>) {
    this.userProfilePicUrl = '/assets/images/yourimg.png';
    this.userObs = this.store.select(userState).select(s => s.user);

    this.userObs.subscribe(user => {
      if (user !== null) {
        this.user = user;
        console.log("user" + JSON.stringify(this.user.location));
        if (this.user.profilePictureUrl) {
          this.location = this.user.location;
          this.user.profilePictureUrl.subscribe(url => this.userProfilePicUrl = url);
        }
      }
    });
  }

  ngOnInit() {
    this.store.select(appState.coreState).take(1).subscribe(s => {
      this.user = s.user
      this.myTurn = this.game.nextTurnPlayerId === this.user.userId;
    }); //logged in user
  }

  ngOnChanges() {
    this.questionIndex = this.game.playerQnAs.length;
    this.correctAnswerCount = this.game.playerQnAs.filter((p) => p.answerCorrect).length;
  }

}
