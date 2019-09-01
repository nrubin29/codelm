import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './common/views/login/login.component';
import { DisconnectedComponent } from './common/views/disconnected/disconnected.component';
import { RegisterComponent } from './common/views/register/register.component';
import { SharedModule } from './shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EndComponent } from './common/views/end/end.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DisconnectedComponent,
    RegisterComponent,
    EndComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
