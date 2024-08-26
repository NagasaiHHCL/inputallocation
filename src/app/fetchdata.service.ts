import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable({
  providedIn: 'root',
})
export class FetchdataService {
  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private cookieService: CookieService,
    private spinner: NgxSpinnerService
  ) {}

  private loaderSubject = new Subject<boolean>();
  loaderState = this.loaderSubject.asObservable();

  show() {
    this.loaderSubject.next(true);
  }

  hide() {
    this.loaderSubject.next(false);
  }

  private sessionTokenKey = localStorage.getItem('Loginauthenticator');

  clearSession() {
    // Clear the session cookie
    this.cookieService.delete('Loginauthenticator');
  }

  // localURL='http://192.168.212.11:1029';
  // localURL = 'http://192.168.212.54:1029';
  //  localURL = 'http://192.168.30.223:8000/InputAllocation';

  localURL = 'http://192.168.214.151:1029';
  adminlogin(data: any) {
    return this.http.post(this.localURL + '/login/userlogin', data);
  }

  fetchDivisons(data: any) {
    return this.http.post(this.localURL + '/allocate/divisions', data);
  }

  fetchHq(data: any) {
    return this.http.post(this.localURL + '/allocate/hqs', data);
  }

  fetchHQSaleData(data: any) {
    return this.http.post(this.localURL + '/allocate/saleperhq', data);
  }

  // api for fetching single material sale data
  singlematerialsaledata(data: any) {
    return this.http.post(this.localURL + '/allocate/materialsaledata', data);
  }

  fetchinputsQuantity(data: any) {
    return this.http.post(this.localURL + '/allocate/fetchinputsdata', data);
  }
  updatingAllocatedInputs(data: any) {
    return this.http.post(
      this.localURL + '/allocate/updateallocatedinputs',
      data
    );
  }

  // allocating inputs for headquarter
  allocatinginputs(data: any) {
    return this.http.post(this.localURL + '/allocate/allocateinputs', data);
  }

  // api for updating allocated inputs
  updatingallocatedInputs(data: any) {
    return this.http.post(
      this.localURL + '/allocate/updateallocatedinputs',
      data
    );
  }

  updateInputsData(data: any) {
    return this.http.post(this.localURL + '/allocate/updateinputsdata', data);
  }

  // api for sending mail
  sendingemail(data: any) {
    return this.http.post(this.localURL + '/allocate/sendmail', data);
  }
}
