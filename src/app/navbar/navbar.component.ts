import { Component, OnInit } from '@angular/core';
import { FetchdataService } from '../fetchdata.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private service: FetchdataService, private router : Router) {

 
  }
  username:any='';
  userno:any='';
  ngOnInit() {
this.username=localStorage.getItem('empname')
this.userno=localStorage.getItem('empcode')

  }



  logout(){
    this.service.clearSession();

    localStorage.removeItem("Loginauthenticator")
    this.router.navigate(['/login']); 
  }
}
