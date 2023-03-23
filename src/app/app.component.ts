import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import GEDCOM from '../../parser.json';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  uploadedFiles: Array<File> = [];
  button: any;
  uploadStatus: any = 0;
  GEDCOMData: any = GEDCOM;
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.uploadStatus = 0;
    /* TODO document why this method 'ngOnInit' is empty */
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
            this.uploadStatus = error.status;
          }
        );
    }
    this.nextStep();
  }
  nextStep() {
    console.log(this.GEDCOMData.length);

    // for (let line of GEDCOMData) {
    //   console.log(line);
    // }
    console.log('checker12z');
    let fs = require('fs');
    let files = fs.readdir();
    console.log(files);
  }
}
