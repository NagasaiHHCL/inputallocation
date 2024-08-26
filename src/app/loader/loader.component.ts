import { Component } from '@angular/core';
import { FetchdataService } from '../fetchdata.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  constructor(private loaderService: FetchdataService) { }
  loading: boolean = false;
  ngOnInit() {
    this.loaderService.loaderState.subscribe((state) => {
      this.loading = state;
    });
  }
}
