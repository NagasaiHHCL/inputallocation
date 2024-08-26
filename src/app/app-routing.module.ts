import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DivisionsaleComponent } from './divisionsale/divisionsale.component';
import { ManagehqComponent } from './managehq/managehq.component';

import { AuthGuard } from './auth.guard'; 
import { LoaderComponent } from './loader/loader.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'login',component:LoginComponent },
  {path:'loader',component:LoaderComponent },

  {path:'dashboard',component:DivisionsaleComponent ,canActivate: [AuthGuard]},
  {path:'hqmanage',component:ManagehqComponent ,canActivate: [AuthGuard]},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
