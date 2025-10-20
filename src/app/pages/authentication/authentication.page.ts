import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { LoginComponent } from "./login/login.component";

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
  imports: [IonicModule, LoginComponent],
})
export class AuthenticationPage implements OnInit {

  constructor() { }

  ngOnInit() {}

}
