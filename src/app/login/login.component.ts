import { Component , ElementRef,Renderer2} from '@angular/core';
import {FormControl,FormGroup,Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { FetchdataService } from 'src/app/fetchdata.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading: boolean = false;
  loginForm:any;
  logname:any='';
  logpassword:any='';
  hide=true;
  isAuthenticated = false; 
 
  formSubmitted = false;
  constructor( private router:Router,private renderer: Renderer2, private elementRef: ElementRef, private service :FetchdataService) {

   
  }

  showPassword: boolean = false;
  showicon :boolean =true;
  togglePasswordVisibility() {
   
    this.showPassword = !this.showPassword;
    const imgElement = document.getElementById('eyeimage'); // Assuming you have an element with id "imageId"
  this.renderer.setAttribute(imgElement, 'src', '../../assets/images/eye-off 1.svg');
  }
  ngOnInit() {
   // this.disableSelector();
   this.service.loaderState.subscribe((state) => {
    this.loading = state;
  });

    this.loginForm=new FormGroup({
      "username":new FormControl('',[Validators.required,Validators.pattern(/[0-9]{5}/)]),
     
       "password":new FormControl('',Validators.required,)
      //  "location":new FormControl('',Validators.required,),
     });
 }


 get username() {
  return this.loginForm.get('username');
}

get password() {
  return this.loginForm.get('password');
}
 
logindata:any={};
  adminlogin(){
    let inputData={
      "username":this.logname,
      "password":this.logpassword
    }
    console.log(inputData)
    this.service.adminlogin(inputData).subscribe((res :any)=>{
      console.log(res);
      this.logindata=res.message;

      if(res.flag === true && res.status === 1){
        const sessionToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBfaWQiOiIxMjA1MSIsImlhdCI6MTY5MTk5MzIwM30.iOfoLlj95CCc358TKXFcLuoHKgHf2aoVgsJLu27g0LI';
      
         console.log('Logged in with session token:', sessionToken);

      localStorage.setItem("Loginauthenticator",sessionToken)
          this.isAuthenticated = true;
          this.router.navigate(['dashboard']);

         localStorage.setItem('empname',this.logindata?.EmpName)
         localStorage.setItem('empcode',this.logindata?.EmployeeCode)
         localStorage.setItem('empdivision',this.logindata?.DivisionName)
         localStorage.setItem('empdivisioncode',this.logindata?.DivisionCode)


         //console.log(localStorage.setItem('empcode',this.logindata?.profiledata?.EmployeeCode))

        
      }
      else{
        Swal.fire('Oops...', 'Username and Password are Incorrect !')
      }
    })
  }
 
}