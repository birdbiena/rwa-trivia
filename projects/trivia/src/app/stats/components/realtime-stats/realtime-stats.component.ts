import { Component, OnDestroy, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { leaderBoardState } from '../../store';
import * as StatActions from '../../store/actions';
import { SystemStats } from 'shared-library/shared/model';
import { AppState } from '../../../store';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
@Component({
  selector: 'realtime-stats',
  templateUrl: './realtime-stats.component.html',
  styleUrls: ['./realtime-stats.component.scss']
})

@AutoUnsubscribe({ 'arrayName': 'subscription' })
export class RealtimeStatsComponent implements OnDestroy, AfterViewChecked {

  systemStats: SystemStats;
  subscription = [];
  constructor(private store: Store<AppState>, private cd: ChangeDetectorRef) {

    this.store.dispatch(new StatActions.LoadSystemStat());

  }

  ngAfterViewChecked(): void {
    this.subscription.push(this.store.select(leaderBoardState).pipe(select(s => s.systemStat)).subscribe(systemStats => {
      if (systemStats !== null) {
        this.systemStats = systemStats;
      }
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    }));
  }

  ngOnDestroy() {

  }
}
