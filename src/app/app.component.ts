import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  uploadedFiles: Array<File> = [];
  button: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  fileChange(element: any) {
    console.log('clicker');
    this.uploadedFiles = element.target.files;
  }

  upload() {
    console.log('upload');
    let formData = new FormData();
    for (const element of this.uploadedFiles) {
      formData.append('uploads[]', element, element.name);
    }
    this.http.post('/api/upload', formData).subscribe((response) => {
      console.log('response received is ', response);
    });
  }
}
