import { NgModule }     from '@angular/core';
import { RouterModule } from '@angular/router';

import { CreatePollComponent }   from './create-poll/create-poll.component';
import { AboutComponent }   from './about/about.component';
import { PrivacyComponent }   from './privacy/privacy.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'about', component: AboutComponent },    	
      { path: 'privacy', component: PrivacyComponent },    	
      { path: '**', component: CreatePollComponent }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}