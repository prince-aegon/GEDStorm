import {
  Component,
  OnInit,
  Renderer2,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {

  individualForm: FormGroup;    
  readonly BASE_URL: string = 'http://localhost:3000';
  selectedOption: string = 'option1';
  uploadedFiles: Array<File> = [];
  button: any;
  uploadStatus: any = 0;
  GEDCOMData: any = {};
  IndividualData: any;
  inputValue: any;
  constructor(private http: HttpClient, private renderer: Renderer2, private formBuilder: FormBuilder) {
    // Define form controls and validators
    this.individualForm = this.formBuilder.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
    });
  }

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
    setTimeout(() => {
      this.fetchData();
    }, 500);
    this.nextStep();
  }
  nextStep() {
    console.log(this.GEDCOMData.length);

    console.log('checker12z');
    let fs = require('fs');
    let files = fs.readdir();
    console.log(files);
  }

  // all_button() {
  //   this.inputValue = this.GEDCOMData.length;
  //   setTimeout(() => {
  //     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  //   }, 100);
  // }
  findIndividual(){
    this.http.post(this.BASE_URL + '/find', this.individualForm.value, {observe: 'response'})
    .subscribe(
      (response) => {
        console.log(response.status);
        console.log('response received is ', response.headers);
        this.uploadStatus = response.status;
      },
      (error) => {
        console.log(error.status);
        console.log('response received is ', error.status);
        this.uploadStatus = error.status;
      }
    );
    setTimeout(() => {
      this.fetchIndividualData();
    }, 500);

  }
  fetchData() {
    const maxRetries = 50; // Maximum number of retries
    let retryCount = 0;
  
    const fetchInternal = () => {
      this.http.get(this.BASE_URL + '/data').subscribe(
        (data: any) => {
          console.log('recieved data in angular')
          console.log(data);
          this.GEDCOMData = data;
        },
        (error) => {
          console.error(error);
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying (Attempt ${retryCount})...`);
            // Retry after a delay (you can adjust the delay time as needed)
            setTimeout(fetchInternal, 100); // Retry after 1 second
          } else {
            console.error('Max retries exceeded. Unable to fetch data.');
          }
        }
      );
    };
  
    fetchInternal(); // Start the initial fetch
  }

  fetchIndividualData() {
    this.http.get(this.BASE_URL + '/data/individual').subscribe(
        (data: any) => {
            console.log('received individual data in angular');
            this.IndividualData = data;
            // console.log(this.IndividualData[0]['Name']);
        },
        (error: any) => {
            console.log(error);
        }
    );
}

}
