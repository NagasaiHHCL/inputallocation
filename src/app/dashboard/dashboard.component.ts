import { Component, OnInit } from '@angular/core';
import { FetchdataService } from '../fetchdata.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  viewproduct=false;
  hqdisplay=false;
  singlematerial = false;
  displayTable=false;
  divisionsale=true;
  hqsale=false;
  selectedMonth:any;
  selectvalue:string='';
  financialYears: string[] = [];
  enteredValue: number=0;
  selectedFinancialYear: string = '';
  currentMonthsDropdown: { value: number, label: string }[] = [];
  allMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  form: FormGroup;
  popupForm: FormGroup;
 
  constructor (private service : FetchdataService, private fb:FormBuilder){
// code for form validation
    this.form = fb.group({
      selectedFinancialYear: [null, Validators.required],
    });
    this.popupForm = this.fb.group({
      inputValue: ['', [Validators.required, this.validateInputValue.bind(this)]]
    });
  // code for select year
    this.selectedMonth = 'Select Month';
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      const startYear = currentYear - i;
      const endYear = startYear - 1;
      this.financialYears.push(`${startYear + 1} - ${endYear + 1}`);
    }
    this.selectedFinancialYear = this.financialYears[0];
    this.updateCurrentMonths();
  
  }
  getSecondYear(financialYear: string): string {
    const yearParts = financialYear.split(' - ');
    return yearParts[0];
    
  }

  onFinancialYearChange(selectedYear: string) {
    this.updateCurrentMonths();
  }

  private updateCurrentMonths() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map(year => parseInt(year, 10));

    this.currentMonthsDropdown = this.allMonths.map((month, index) => {
      return {
        value: index + 1, // Month numbers are 1-based
        label: month
      };
    });

    if (selectedEndYear === currentYear) {
      // Filter months up to the current month for the end year if it is the current year
      this.currentMonthsDropdown = this.currentMonthsDropdown.slice(0, currentMonth + 1);
    }
  }

  ngOnInit(): void {
    this.divisionData();
    console.log(this.selectedFinancialYear)
  }

  // api for fetching divison data
  divisions:any=[];
  divisionData(){
    
    const empID = localStorage.getItem("empid");

    if (!empID) {
      // Handle the case where empID is not found in local storage
      console.error('empid is not available in local storage.');
      return;
    }
  
    // Create a form data with the username
    const formData = new FormData();
    formData.append('username', empID); 
    this.service.fetchDivisons(formData).subscribe((res :any)=>{
      console.log(res);

      this.divisions=res.message;
    })
  }
 selectedDivisionName: string = '';
hqdata:any=[];
  fetchheadquarter(){

    if(this.selectvalue == '' && this.selectedMonth =='Select Month'){
    return  alert("select All the fields")
    }
    const selectedDivision = this.divisions.find((data :any) => data.divisioncode == this.selectvalue);

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }
  
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
    .split(' - ')
    .map(year => parseInt(year, 10));
   const userDATA= localStorage.getItem("empid");
  const  userNAME=userDATA?.toString()
    let inputData={
      "username":userNAME,
      "divisioncode":this.selectvalue,
      "year":selectedEndYear,
      "month":this.selectedMonth
    }
    console.log(inputData)
    this.service.fetchHq(inputData).subscribe((res :any)=>{
      this.hqdata=res.message;
      this.filteredDivisions = [...this.hqdata];

      console.log(this.filteredDivisions)
      this.divisionsale=false;
      this.hqsale=true;
      this.hqdisplay=true;
      console.log(this.selectedDivisionName)
    })
  }


  // code for fetching months numbers and display as names
  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  // Function to get month name from numeric month
  getMonthName(numericMonth: number) {
    if (numericMonth >= 1 && numericMonth <= 12) {
      return this.months[numericMonth - 1];
    } else {
      return 'Invalid Month'; // Handle invalid input
    }
  }


  // code for display of popup for HQ's
  selectedDivision:any='';
  searchDivisionQuery: string = '';
  filteredDivisions:any=[];
  selectDivision(division: string){

  }

  getDivisionData(division: string): string {
 
    return `Data related to ${division}`;
  }
  
  filterDivisions(searchText: string): void {
    if (!searchText) {
      this.filteredDivisions = [...this.hqdata];
      return;
    }
  
    searchText = searchText.toLowerCase();
  
    this.filteredDivisions = this.hqdata.filter((data:any) =>
      data.hqname.toLowerCase().includes(searchText)
    );
    if (this.filteredDivisions.length > 0) {
      this.selectedDivision = this.filteredDivisions[0].hqname; // Select the first item
    } else {
      this.selectedDivision = ''; // Clear selection when no matches
    }
  }
  

  scrollPosition: number = 0; 
  scrollRight() {
    // Implement the scrolling logic here
    // For example, you can use JavaScript to scroll the content
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollLeft += 100; // Adjust the scrolling distance as needed
    }
  }
  scrollLeft() {
    // Implement the scrolling logic here
    // For example, you can use JavaScript to scroll the content
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.scrollLeft += 100; // Adjust the scrolling distance as needed
    }
  }

// api code for fetching material data for headquarter
hqmaterialDATA:any[]=[];
  callApiWithHQValue(hqcode: string) {
    const selectedDivision = this.divisions.find((data :any) => data.divisioncode == this.selectvalue);

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }
  
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
    .split(' - ')
    .map(year => parseInt(year, 10));
      
      const userDATA= localStorage.getItem("empid");
let inputData={
  "username":userDATA,
    "divisioncode":this.selectvalue,
    "hqcode":hqcode,
    "year":selectedEndYear,
    "month":this.selectedMonth

}
console.log(inputData)
this.service.fetchHQSaleData(inputData).subscribe((res:any)=>{
  console.log(res);

  this.hqmaterialDATA=res.message;
  this.displayTable=true;
})
  }
  calculateTotalpresentMonthSales() {
    return this.hqmaterialDATA.reduce((total, data) => total + data.lastmonthsales, 0);
  }
  calculateTotalCurrentMonthSales() {
    return this.hqmaterialDATA.reduce((total, data) => total + data.currentmonthsales, 0);
  }
 
  calculateTSE() {
    return this.hqmaterialDATA.reduce((total, data) => total + data.tsecount, 0);
  }
  calculatePHPM() {
    return this.hqmaterialDATA.reduce((total, data) => total + data.phpm, 0);
  }
  onHqNameClick(hqcode: string) {
    console.log(hqcode)
    // Call the API method with the selected hqvalue
    this.callApiWithHQValue(hqcode);
  }


  currentbrandDetails:any=[];
  openpopupforcurrent(hqcode:string,materialcode:string, currentMonth : number){
    const selectedDivision = this.divisions.find((data :any) => data.divisioncode == this.selectvalue);

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }
  
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
    .split(' - ')
    .map(year => parseInt(year, 10));
      
      const userDATA= localStorage.getItem("empid");
    let inputData={
      "username":userDATA,
      "divisioncode":this.selectvalue,
      "hqcode":hqcode,
      "materialcode":materialcode,
      "year":selectedEndYear,
      "month":currentMonth
    }
    console.log(inputData)
    this.service.singlematerialsaledata(inputData).subscribe((res:any)=>{
      console.log(res);
      this.currentbrandDetails=res.message;
    })
  }
 
    previousbrandDetails:any=[];
  openpopupforlastmonth(hqcode:string,materialcode:string, lastmonth : number){
    const selectedDivision = this.divisions.find((data :any) => data.divisioncode == this.selectvalue);

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }
  
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
    .split(' - ')
    .map(year => parseInt(year, 10));
      
      const userDATA= localStorage.getItem("empid");
    let inputData={
      "username":userDATA,
      "divisioncode":this.selectvalue,
      "hqcode":hqcode,
      "materialcode":materialcode,
      "year":selectedEndYear,
      "month":lastmonth
    }
    console.log(inputData)
    this.service.singlematerialsaledata(inputData).subscribe((res:any)=>{
      console.log(res);
      this.previousbrandDetails=res.message;
    })
  }

  hqcodevalue:string=''
  // api for fetching material inputs data
  materialinputs:any=[];
  fetchinputsData(hqcode : string){
    const empID = localStorage.getItem("empid");
    
    if (!empID) {
      // Handle the case where empID is not found in local storage
      console.error('empid is not available in local storage.');
      return;
    }
    const formData = new FormData();
    formData.append('username', empID); 
     formData.append('hqcode',hqcode)
     this.hqcodevalue = hqcode;

    this.service.fetchinputsQuantity(formData).subscribe((res :any)=>{
      console.log(res);
      this.materialinputs=res.message;
      this.singlematerial=true;
      this.hqdisplay=false;
      this.hqsale=false;
      this.viewproduct=true;
      
    })
  }

  isPopupOpen: boolean = false;
  selectedData: any;
  entervalue: number = 0;
  productID:string='';
 
  // togglePopup(data :any) {
  //   this.productID=data.InputId;
  //   data.highlight = !data.highlight;
  //   if (data.highlight) {
  //     // Set the selectedData for the popup
  //     this.selectedData = data;
  //     // Open the popup
     
  //     this.isPopupOpen = true;
  //   } else {
  //     console.log(this.selectedData.highlight)
  //     const updatedValueProducts = this.selectedProducts.filter(
  //       (obj) => obj.headquarter !== this.hqcodevalue && obj.productName != this.selectedData.InputName
  //     );
  //     console.log(updatedValueProducts)
  //        // Reset the enteredValue to 0 after storing the product
  //        this.onEnteredValueChange(0);
  //        this.closePopup();
  //     this.selectedProducts = updatedValueProducts;

  //     // If the checkbox is unchecked, close the popup
  //     this.isPopupOpen = false;
  //   }
    
  // }

  // togglePopup(data: any) {
  //   this.productID = data.InputId;
  //   data.highlight = !data.highlight;
  
  //   if (data.highlight) {
  //     // Set the selectedData for the popup
  //     this.selectedData = data;
  //     // Open the popup
  //     this.isPopupOpen = true;
  //   } else {
  //     const productToRemove = this.selectedProducts.findIndex(
  //       (product) => product.headquarter === this.hqcodevalue && product.productCode === this.selectedData.InputId
  //     );
  
  //     if (productToRemove !== -1) {
  //       this.selectedProducts.splice(productToRemove, 1);
  //     }
  
  //     // Reset the enteredValue to 0 after removing the product
  //     this.onEnteredValueChange(0);
  //     this.closePopup();
  //     // If the checkbox is unchecked, close the popup
  //     this.isPopupOpen = false;
  //   }
  // }
  
//   togglePopup(data: any) {
//     this.productID = data.InputId;
//     data.highlight = !data.highlight;
  
//     if (data.highlight) {
//       // Set the selectedData for the popup
//       this.selectedData = data;
//       // Open the popup
//       this.isPopupOpen = true;
//     } else {
//       const productToRemoveIndex = this.selectedProducts.findIndex(
//         (product) => product.headquarter === this.hqcodevalue && product.productCode === this.selectedData.InputId
//       );
  
//       if (productToRemoveIndex !== -1) {
//         this.selectedProducts.splice(productToRemoveIndex, 1);
//       }

//       console.log('Selected Products:', this.selectedProducts);
// console.log('Selected Data:', data);
  
//       // Reset the enteredValue to 0 after removing the product
//       this.onEnteredValueChange(0);
//       this.closePopup();
//       // If the checkbox is unchecked, close the popup
//       this.isPopupOpen = false;
//     }
//   }

  togglePopup(data: any) {
    this.productID = data.InputId;
    data.highlight = !data.highlight;
  
    if (data.highlight) {
      // Set the selectedData for the popup
      this.selectedData = data;
      // Open the popup
      this.isPopupOpen = true;
  
      // Add the selected product to the selectedProducts array
      this.selectedProducts.push({
        headquarter: this.hqcodevalue,
        productCode: this.productID,
        productName: data.InputName,
        productQuantity: 0, // You can initialize the quantity as needed
      });
    } else {
      // Remove the product from selectedProducts based on productCode
      this.selectedProducts = this.selectedProducts.filter((product) => product.productCode !== this.productID);
  
      // Reset the enteredValue to 0 after removing the product
      this.onEnteredValueChange(0);
      this.closePopup();
      // If the checkbox is unchecked, close the popup
      this.isPopupOpen = false;
    }
  }
  

  closePopup() {
    console.log(this.selectedProducts)
    this.isPopupOpen = false;
  }

  validateInputValue(control :any) {
    if (this.selectedData && control.value > this.selectedData.AblQty) {
      return { valueGreaterThanMax: true };
    }
    return null;
  }

  switchHeadquarter(newHeadquarter :any) {
    // Subtract the entered value from the available quantity
    this.selectedData.AblQty -= this.enteredValue;
    // Update the selectedData with the new headquarter data
    this.selectedData = newHeadquarter;
    // Initialize the enteredValue with 0
    this.enteredValue = 0;
  }
  EmpDivision=localStorage.getItem('empdivision');
  empdivcode=localStorage.getItem('empdivisioncode')

  onHqclick(){   
      const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map(year => parseInt(year, 10));
     const userDATA= localStorage.getItem("empid");
    const  userNAME=userDATA?.toString()
      let inputData={
        "username":userNAME,
        "divisioncode":this.selectvalue,
        "year":selectedEndYear,
        "month":this.selectedMonth
      }
      console.log(inputData)
      this.service.fetchHq(inputData).subscribe((res :any)=>{
        this.hqdata=res.message;
        this.filteredDivisions = [...this.hqdata];
  
        console.log(this.filteredDivisions)
        // this.divisionsale=false;
        // this.hqsale=true;
        // this.hqdisplay=true;
        console.log(this.selectedDivisionName)
      })
  }
  selectedProducts: any[] = [];

  onEnteredValueChange(value: number) {
    this.enteredValue = value;
  }
  // storeSelectedProduct() { 
  //  // console.log(this.selectedData.highlight)
  //   if (this.selectedData.highlight) {
  //     this.selectedProducts.push({
  //       headquarter: this.hqcodevalue,
  //       productCode : this.productID,
  //       productName: this.selectedData.InputName,
  //       productQuantity: this.enteredValue,
  //     });

  //     // Reset the enteredValue to 0 after storing the product
  //     this.onEnteredValueChange(0);
  //     this.closePopup();
  //   } else {
  //     console.log(this.selectedData.highlight)
  //     const updatedValueProducts = this.selectedProducts.filter(
  //       (obj) => obj.headquarter !== this.hqcodevalue && obj.productCode !== this.selectedData.InputId
  //     );
  //     console.log(updatedValueProducts)
  //        // Reset the enteredValue to 0 after storing the product
  //        this.onEnteredValueChange(0);
  //        this.closePopup();
  //     this.selectedProducts = updatedValueProducts;
  //   }

  //  // console.log(this.selectedData.highlight);
  // }
  
  storeSelectedProduct() {
    if (this.selectedData.highlight) {
      const existingProduct = this.selectedProducts.find(
        (product) => product.headquarter === this.hqcodevalue && product.productCode === this.selectedData.InputId
      );
  
      if (existingProduct) {
        // Update the existing product
        existingProduct.productQuantity = this.enteredValue;
      } else {
        // Add the new product
        this.selectedProducts.push({
          headquarter: this.hqcodevalue,
          productCode: this.productID,
          productName: this.selectedData.InputName,
          productQuantity: this.enteredValue,
        });
      }
    } else {
     // const updatedValueProducts = this.selectedProducts.filter(
        //       (obj) => obj.headquarter !== this.hqcodevalue && obj.productCode !== this.selectedData.InputId
        //     );
      const productToRemove = this.selectedProducts.filter(
        (product) => product.headquarter === this.hqcodevalue && product.productCode === this.selectedData.InputId
      );
  
      // if (productToRemove !== -1) {
      //   this.selectedProducts.splice(productToRemove, 1);
      // }
    }
  
    // Reset the enteredValue to 0 after adding/removing the product
    this.onEnteredValueChange(0);
    this.closePopup();
  }
  filteredMaterialInputs:any=[];

  // code for filtering the material inputs data
  searchText: string = '';
  onSearchInputChange() {
    if (this.searchText) {
      const filteredMaterials = this.materialinputs.filter((material :any) => {
        return material.name && material.name.toLowerCase().includes(this.searchText.toLowerCase());
      });
      // Update your material list with filteredMaterials.
    } else {
      // Handle the case when searchText is empty
      // You might want to reset the material list or do something else here.
    }
    // Update your material list with filteredMaterials.
  }

    
    
    
  
}
