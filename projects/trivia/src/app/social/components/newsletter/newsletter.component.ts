import { PLATFORM_ID, APP_ID, Component, OnInit, Inject, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { User, Subscription } from 'shared-library/shared/model';
import { AppState, appState } from '../../../store';
import * as socialActions from '../../../social/store/actions';
import { socialState } from '../../store';
import { isPlatformBrowser } from '@angular/common';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
// tslint:disable-next-line:max-line-length
const EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

@Component({
  selector: 'newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss']
})

@AutoUnsubscribe({ 'arrayName': 'subscription' })
export class NewsletterComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptionForm: FormGroup;
  user: User;
  isSubscribed: Boolean = false;
  totalCount: Number = 0;
  message = '';
  subscription = [];

  constructor(private fb: FormBuilder, private store: Store<AppState>,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string) {
    this.subscriptionForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])]
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(new socialActions.GetTotalSubscriber());
    }
  }

  ngAfterViewInit(): void {
    this.subscription.push(this.store.select(appState.coreState).pipe(select(s => s.user)).subscribe(user => {
      this.user = user;
      if (user) {
        this.user = user;
        this.subscriptionForm = this.fb.group({
          email: [this.user.email]
        });
        if (!this.user.isSubscribed) {
          this.message = '';
          this.isSubscribed = false;
        }
      }
    }));
    this.subscription.push(this.store.select(socialState).pipe(select(s => s.checkEmailSubscriptionStatus)).subscribe(status => {
      if (status === true) {
        this.isSubscribed = true;
        this.message = 'This EmailId is already Subscribed!!';
      } else if (status === false) {
        this.isSubscribed = true;
        this.store.dispatch(new socialActions.GetTotalSubscriber());
        this.message = 'Your EmailId is Successfully Subscribed!!';
      }
    }));
    this.subscription.push(this.store.select(socialState).pipe(select(s => s.getTotalSubscriptionStatus)).subscribe(subscribers => {
      this.totalCount = subscribers['count'];
      if (!this.cd['destroyed']) {
        this.cd.detectChanges();
      }
    }));
  }

  onSubscribe() {
    if (!this.subscriptionForm.valid) {
      return;
    } else {
      const subscription = new Subscription();
      subscription.email = this.subscriptionForm.get('email').value;
      if (this.user) {
        subscription.userId = this.user.userId;
      }
      this.store.dispatch(new socialActions.AddSubscriber({ subscription }));
    }
  }

  ngOnDestroy(): void {

  }
}
