import {
  Component,
  OnInit,
  Renderer2,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import GEDCOM from '../../parser.json';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  readonly BASE_URL: string = 'http://localhost:3000';
  uploadedFiles: Array<File> = [];
  button: any;
  uploadStatus: any = 0;
  GEDCOMData: any = GEDCOM;
  inputValue: any;
  constructor(private http: HttpClient, private renderer: Renderer2) {}

  ngOnInit() {
    this.uploadStatus = 0;
  }

  fileChange(element: any) {
    this.uploadedFiles = element.target.files;
  }

  upload() {
    let formData = new FormData();
    for (const element of this.uploadedFiles) {
      formData.append('uploads[]', element, element.name);
    }
    if (this.uploadedFiles.length === 0) {
      this.uploadStatus = 1000;
    } else {
      this.http
        .post('/api/upload', formData, { observe: 'response' })
        .subscribe(
          (response) => {
            console.log(response.status);
            console.log('response received is ', response);
            this.uploadStatus = response.status;
          },
          (error) => {
            console.log(error.status);
            console.log('response received is ', error.status);
            this.uploadStatus = error.status;
          }
        );
    }
    this.nextStep();
  }
  nextStep() {
    console.log(this.GEDCOMData.length);

    console.log('checker12z');
    let fs = require('fs');
    let files = fs.readdir();
    console.log(files);
  }

  all_button() {
    this.inputValue = this.GEDCOMData.length;
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }
  fetchdemoData() {
    this.http.get(this.BASE_URL + '/datapoint001').subscribe((data: any) => {
      console.log(data);
    });
  }
  
}
