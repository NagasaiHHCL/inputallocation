import {
  Component,
  Renderer2,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FetchdataService } from '../fetchdata.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectproductsService } from '../selectproducts.service';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
declare var $: any;
import { NgxSpinnerService } from 'ngx-spinner';

import 'slick-carousel';
@Component({
  selector: 'app-divisionsale',
  templateUrl: './divisionsale.component.html',
  styleUrls: ['./divisionsale.component.css'],
})
export class DivisionsaleComponent {
  @ViewChild('myModal') modalElement!: ElementRef;
  @ViewChild('myModal2') myModal2!: ElementRef;
  noDataAvailable: boolean = false;
  hqlist1: any = [];
  alertmsg: boolean = false; // for display to select all fields
  hasData: boolean = false;
  //visibletext=false;
  dispalytop = true;
  viewproduct = false;
  hqdisplay = false;
  hqdisplay1 = false;
  managehq = false;
  singlematerial = false;
  displayTable = false;
  divisionsale = true;
  hqsale = false;
  selectedMonth: any;
  selectvalue: string = '';
  financialYears: string[] = [];
  enteredValue: number = 0;
  selectedFinancialYear: string = '';
  currentMonthsDropdown: { value: number; label: string }[] = [];
  allMonths: string[] = [
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
    'December',
  ];
  form: FormGroup;
  popupForm: FormGroup;

  constructor(
    public service: FetchdataService,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private product: SelectproductsService,
    private spinner: NgxSpinnerService
  ) {
    this.initializeAvailableQuantities(this.hqdata);
    // code for form validation
    this.form = fb.group({
      selectedFinancialYear: [null, Validators.required],
    });
    this.popupForm = this.fb.group({
      inputValue: [
        '',
        [Validators.required, this.validateInputValue.bind(this)],
      ],
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
      .map((year) => parseInt(year, 10));

    this.currentMonthsDropdown = this.allMonths.map((month, index) => {
      return {
        value: index + 1, // Month numbers are 1-based
        label: month,
      };
    });

    if (selectedEndYear === currentYear) {
      // Filter months up to the current month for the end year if it is the current year
      this.currentMonthsDropdown = this.currentMonthsDropdown.slice(
        0,
        currentMonth + 1
      );
    }
  }

  EmpDivision = localStorage.getItem('empdivision');
  empdivcode = localStorage.getItem('empdivisioncode');
  empcode = localStorage.getItem('empcode');
  // code for fetching year and month dynamically

  // code for fetching HQ DAATA
  hqdata: any = [];
  filteredDivisions: any = [];

  ngOnInit(): void {
    this.divisionData();
    console.log(this.selectedFinancialYear);
  }

  // api for fetching divison data
  divisions: any = [];
  divisionData() {
    const empID = localStorage.getItem('empcode');

    if (!empID) {
      // Handle the case where empID is not found in local storage
      console.error('empid is not available in local storage.');
      return;
    }

    // Create a form data with the username
    const formData = new FormData();
    formData.append('username', empID);

    this.service.fetchDivisons(formData).subscribe((res: any) => {
      console.log(res);

      this.divisions = res.message;
    });
  }
  selectedDivisionName: string = '';
  selectDiv = localStorage.getItem('empdivision');
  fetchheadquarter() {
    this.spinner.show();
    if (this.selectvalue == '' && this.selectedMonth == 'Select Month') {
      this.alertmsg = true;
    }
    const selectedDivision = this.divisions.find(
      (data: any) => data.divisioncode == this.selectvalue
    );

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }

    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));
    const userDATA = localStorage.getItem('empcode');
    const divcode = localStorage.getItem('empdivisioncode');
    const userNAME = userDATA?.toString();
    let inputData = {
      username: userNAME,
      divisioncode: divcode,
      year: selectedEndYear,
      month: this.selectedMonth,
    };
    console.log(inputData);
    this.service.fetchHq(inputData).subscribe((res: any) => {
      this.hqdata = res.message;
      console.log(this.hqdata);
      this.filteredDivisions = [...this.hqdata];
      this.selectedHQ = this.filteredDivisions[0].hqcode;

      this.callApiWithHQValue(this.filteredDivisions[0].hqcode);
      console.log(this.filteredDivisions);
      this.divisionsale = false;
      this.dispalytop = false;
      this.hqsale = true;
      this.hqdisplay = true;
      //this.visibletext=true;
      console.log(this.selectedDivisionName);
    });
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
    'December',
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
  selectedDivision: any = '';
  searchDivisionQuery: string = '';

  selectDivision(division: string) {}

  getDivisionData(division: string): string {
    return `Data related to ${division}`;
  }

  filterDivisions(searchText: string): void {
    if (!searchText) {
      this.filteredDivisions = [...this.hqdata];
      return;
    }

    searchText = searchText.toLowerCase();

    this.filteredDivisions = this.hqdata.filter((data: any) =>
      data.hqname.toLowerCase().includes(searchText)
    );
    if (this.filteredDivisions.length > 0) {
      this.selectedDivision = this.filteredDivisions[0].hqname; // Select the first item
    } else {
      this.selectedDivision = ''; // Clear selection when no matches
    }

    this.noDataAvailable = this.filteredDivisions.length === 0;
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
  hqmaterialDATA: any[] = [];
  callApiWithHQValue(hqcode: string) {
    const selectedDivision = this.divisions.find(
      (data: any) => data.divisioncode == this.selectvalue
    );

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }

    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));

    const userDATA = localStorage.getItem('empcode');
    const divcode = localStorage.getItem('empdivisioncode');
    let inputData = {
      username: userDATA,
      divisioncode: divcode,
      hqcode: hqcode,
      year: selectedEndYear,
      month: this.selectedMonth,
    };
    console.log(inputData);
    this.service.fetchHQSaleData(inputData).subscribe((res: any) => {
      console.log(res);

      this.hqmaterialDATA = res.message;
      this.displayTable = true;
    });
  }
  calculateTotalpresentMonthSales() {
    return this.hqmaterialDATA.reduce(
      (total, data) => total + data.lastmonthsales,
      0
    );
  }
  calculateTotalCurrentMonthSales() {
    return this.hqmaterialDATA.reduce(
      (total, data) => total + data.previousmonthsales,
      0
    );
  }

  calculateTSE() {
    return this.hqmaterialDATA.reduce(
      (total, data) => total + data.tsecount,
      0
    );
  }
  calculatePHPM() {
    return this.hqmaterialDATA.reduce((total, data) => total + data.phpm, 0);
  }

  getHqName(code: string): string {
    const hq = this.hqdata.find((item: any) => item.hqcode === code);
    return hq ? hq.hqname : '';
  }
  selectedHQname: any = '';
  selectedHQ: any = null;
  onHqNameClick(hqcode: string) {
    this.selectedHQ = hqcode;
    this.selectedHQname = this.getHqName(hqcode);
    console.log(hqcode, this.selectedHQname);
    // Call the API method with the selected hqvalue
    this.callApiWithHQValue(hqcode);
    //this.visibletext=false;
    this.onRadioChange(hqcode);
    $(this.modalElement.nativeElement).modal('hide');
  }

  currentbrandDetails: any = [];
  openpopupforcurrent(
    hqcode: string,
    materialcode: string,
    currentMonth: number
  ) {
    const selectedDivision = this.divisions.find(
      (data: any) => data.divisioncode == this.selectvalue
    );

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }

    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));
    const userDATA = localStorage.getItem('empcode');
    const divcode = localStorage.getItem('empdivisioncode');

    let inputData = {
      username: userDATA,
      divisioncode: divcode,
      hqcode: hqcode,
      materialcode: materialcode,
      year: selectedEndYear,
      month: currentMonth,
    };
    console.log(inputData);
    this.service.singlematerialsaledata(inputData).subscribe((res: any) => {
      console.log(res);
      this.currentbrandDetails = res.message;
    });
  }

  previousbrandDetails: any = [];
  openpopupforlastmonth(
    hqcode: string,
    materialcode: string,
    lastmonth: number
  ) {
    const selectedDivision = this.divisions.find(
      (data: any) => data.divisioncode == this.selectvalue
    );

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }

    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));

    const userDATA = localStorage.getItem('empcode');
    const divcode = localStorage.getItem('empdivisioncode');
    let inputData = {
      username: userDATA,
      divisioncode: divcode,
      hqcode: hqcode,
      materialcode: materialcode,
      year: selectedEndYear,
      month: lastmonth,
    };
    console.log(inputData);
    this.service.singlematerialsaledata(inputData).subscribe((res: any) => {
      console.log(res);
      this.previousbrandDetails = res.message;
    });
  }

  modalSelectedDivision: string = '';

  onModalOpen() {
    this.modalSelectedDivision = this.selectedDivision;
  }

  onModalRadioChange(HQ: string) {
    this.modalSelectedDivision = HQ;
  }

  submitModal() {
    this.selectedDivision = this.modalSelectedDivision;
  }
  onRadioChange(hqcode: string) {
    this.selectedDivision = hqcode;
  }
  closeMyModal() {
    // Use the Bootstrap modal method to hide the modal
    $(this.myModal2.nativeElement).modal('hide');
  }

  hqcodevalue: string = '';
  // api for fetching material inputs data
  materialinputs: any = [];
  originalMaterialInputs: any = [];
  fetchinputsData(hqcode: string) {
    this.selectedHQ = hqcode;
    this.selectedHQname = this.getHqName(hqcode);
    console.log(hqcode, this.selectedHQname);

    const empID = localStorage.getItem('empcode');
    this.selectedHQ = hqcode;
    if (!empID) {
      // Handle the case where empID is not found in local storage
      console.error('empid is not available in local storage.');
      return;
    }
    // const formData = new FormData();
    // formData.append('username', empID);
    //  formData.append('hqcode',hqcode)
    this.hqcodevalue = hqcode;
    const userDATA = localStorage.getItem('empcode');
    const divcode = localStorage.getItem('empdivisioncode');
    let inputData = {
      username: userDATA,
      hqcode: hqcode,
    };

    this.service.fetchinputsQuantity(inputData).subscribe((res: any) => {
      console.log(res);
      this.originalMaterialInputs = res.message;
      this.materialinputs = [...this.originalMaterialInputs];
      this.materialinputs = res.message;
      res.message.map((obj: any) => {
        this.selectedProductsByHQ.forEach((prod: any) => {
          const proditem = prod.inputlist.find(
            (item: any) => item.inputcode === obj.InputId
          );
          if (proditem) {
            obj.AblQty -= proditem.inputqty;
          }
        });
        return obj;
      });

      console.log(this.materialinputs);
      this.singlematerial = true;
      this.hqdisplay = false;
      this.hqsale = false;
      this.viewproduct = true;
      this.updateAvailableQuantities(this.selectedHQ, this.selectedProducts);
    });
    this.closeMyModal();
  }

  isPopupOpen: boolean = false;
  selectedData: any;
  entervalue: number = 0;
  productID: string = '';

  closePopup() {
    // console.log(this.selectedProducts)
    this.isPopupOpen = false;
  }

  validateInputValue(control: any) {
    if (this.selectedData && control.value > this.selectedData.AblQty) {
      return { valueGreaterThanMax: true };
    }
    return null;
  }

  onHqclick() {
    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));
    const userDATA = localStorage.getItem('empcode');
    const userdivcode = localStorage.getItem('empdivisioncode');
    const userNAME = userDATA?.toString();
    let inputData = {
      username: userNAME,
      divisioncode: userdivcode,
      year: selectedEndYear,
      month: this.selectedMonth,
    };
    console.log(inputData);
    this.service.fetchHq(inputData).subscribe((res: any) => {
      this.hqdata = res.message;
      this.filteredDivisions = [...this.hqdata];

      this.selectedHQ = this.filteredDivisions[0].hqcode;

      this.fetchinputsData(this.filteredDivisions[0].hqcode);
      console.log(this.filteredDivisions);
      // this.divisionsale=false;
      // this.hqsale=true;
      this.displayTable = false;
      this.hqdisplay = false;
      this.hqdisplay1 = true;
      //   this.visibletext=true;
      console.log(this.selectedDivisionName);
    });
  }
  selectedProducts: any[] = [];

  onEnteredValueChange(value: number) {
    this.enteredValue = value;
  }

  // Define an array to store selected product IDs for each HQ
  selectedProductIdsByHQ: { [hqCode: string]: string[] } = {};

  filteredMaterialInputs: any = [];

  // code for filtering the material inputs data
  searchText: string = '';
  onSearchInputChange() {
    if (this.searchText) {
      const searchTextLower = this.searchText.toLowerCase();
      this.materialinputs = this.materialinputs.filter((data: any) => {
        return data.InputName.toLowerCase().includes(searchTextLower);
      });
    } else {
      // If the search text is empty, reset the material inputs to the original data
      this.materialinputs = this.originalMaterialInputs;
    }
  }

  selectedProductsByHQ: any = [];

  isProductSelected(product: any): boolean {
    return this.selectedProductsByHQ.some((hq: any) =>
      hq.inputlist.some(
        (input: any) =>
          input.inputcode === product.InputId && input.inputqty > 0
      )
    );
  }

  availableQuantities: { [hqCode: string]: { [productCode: string]: number } } =
    {};

  // Function to initialize available quantities when loading HQ data
  initializeAvailableQuantities(hqData: any[]) {
    hqData.forEach((hq) => {
      const hqCode = hq.hqcode;
      this.availableQuantities[hqCode] = {};
    });
  }

  // Function to update available quantities when switching between headquarters
  updateAvailableQuantities(selectedHQ: string, selectedProducts: any[]) {
    const selectedHQCode = selectedHQ;
    const selectedHQAvailableQuantities =
      this.availableQuantities[selectedHQCode];

    // Update available quantities for the selected products
    selectedProducts.forEach((product) => {
      const productCode = product.productCode;
      const productQuantity = product.productQuantity;

      // Subtract the selected quantity from the available quantity
      if (selectedHQAvailableQuantities[productCode] !== undefined) {
        selectedHQAvailableQuantities[productCode] -= productQuantity;
      }
    });
  }

  togglePopup(data: any) {
    this.productID = data.InputId;
    data.highlight = !data.highlight;

    if (data.highlight) {
      // Set the selectedData for the popup
      this.selectedData = data;

      // Retrieve the previously entered value for the current product and HQ
      const productForCurrentHQ = this.selectedProductsByHQ.find(
        (hq: any) => hq.hqcode === this.hqcodevalue
      );

      if (productForCurrentHQ) {
        const productEntry = productForCurrentHQ.inputlist.find(
          (input: any) => input.inputcode === this.productID
        );

        // Set the enteredValue to the previously entered value (if it exists)
        this.onEnteredValueChange(productEntry ? productEntry.inputqty : 0);
      } else {
        // No entry for the current HQ, set enteredValue to 0
        this.onEnteredValueChange(0);
      }

      // Open the popup
      this.isPopupOpen = true;
    } else {
      // Checkbox is unchecked, remove the product from the array
      const productToRemoveIndex = this.selectedProductsByHQ.findIndex(
        (hq: any) => hq.hqcode === this.hqcodevalue
      );

      if (productToRemoveIndex !== -1) {
        const productToRemove = this.selectedProductsByHQ[productToRemoveIndex];
        const productIndex = productToRemove.inputlist.findIndex(
          (input: any) => input.inputcode === this.productID
        );

        if (productIndex !== -1) {
          productToRemove.inputlist.splice(productIndex, 1);

          // Remove HQ if it doesn't have any products
          if (productToRemove.inputlist.length === 0) {
            this.selectedProductsByHQ.splice(productToRemoveIndex, 1);
          }
        }
      }

      // Reset the enteredValue to 0 after removing the product
      this.onEnteredValueChange(0);
      // If the checkbox is unchecked, close the popup
      this.isPopupOpen = false;
    }
  }

  switchHeadquarter(newHQCode: string) {
    // Set the current headquarters code
    this.hqcodevalue = newHQCode;

    // Check if the product is in the array for the new HQ
    const productForNewHQ = this.selectedProductsByHQ.find(
      (hq: any) => hq.hqcode === newHQCode
    );

    // If the product is in the array, check the checkbox
    this.selectedData.highlight = productForNewHQ
      ? productForNewHQ.inputlist.some(
          (input: any) => input.inputcode === this.productID
        )
      : false;

    // If the product is in the array, retrieve and set the entered value
    if (productForNewHQ) {
      const productEntry = productForNewHQ.inputlist.find(
        (input: any) => input.inputcode === this.productID
      );

      this.onEnteredValueChange(productEntry ? productEntry.inputqty : 0);
    } else {
      // If the product is not in the array, set the entered value to 0
      this.onEnteredValueChange(0);
    }
  }

  storeSelectedProduct() {
    const enteredNumber = Number(this.enteredValue);

    if (this.selectedData.highlight && this.enteredValue > 0) {
      const existingHQIndex = this.selectedProductsByHQ.findIndex(
        (hq: any) => hq.hqcode === this.hqcodevalue
      );

      if (existingHQIndex !== -1) {
        // HQ exists, find the product in its inputlist and update the quantity
        const existingProductIndex = this.selectedProductsByHQ[
          existingHQIndex
        ].inputlist.findIndex(
          (product: any) => product.inputcode === this.selectedData.InputId
        );

        if (existingProductIndex !== -1) {
          // Product exists, update the quantity
          this.selectedProductsByHQ[existingHQIndex].inputlist[
            existingProductIndex
          ].inputqty = enteredNumber;
        } else {
          // Product doesn't exist, add a new entry
          this.selectedProductsByHQ[existingHQIndex].inputlist.push({
            inputname: this.selectedData.InputName,
            inputqty: enteredNumber,
            inputcode: this.selectedData.InputId,
          });
        }
      } else {
        // HQ doesn't exist, create a new entry
        const newHQ = {
          hqcode: this.hqcodevalue,
          // hqname: this.selectedDivisionName, // Adjust this if needed
          inputlist: [
            {
              inputname: this.selectedData.InputName,
              inputqty: enteredNumber,
              inputcode: this.selectedData.InputId,
            },
          ],
        };
        this.selectedProductsByHQ.push(newHQ);
      }
    } else {
      // Remove the product from the array
      this.selectedProductsByHQ.forEach((hq: any) => {
        const index = hq.inputlist.findIndex(
          (input: any) => input.inputcode === this.productID
        );
        if (index !== -1) {
          hq.inputlist.splice(index, 1);
        }
      });

      // Remove HQ if it doesn't have any products
      this.selectedProductsByHQ = this.selectedProductsByHQ.filter(
        (hq: any) => hq.inputlist.length > 0
      );
    }

    console.log(this.selectedProductsByHQ);

    // Reset the enteredValue to 0 after adding/removing the product
    this.onEnteredValueChange(0);
    this.closePopup();
  }

  getEnteredValue(product: any): number {
    const selectedHQ = this.selectedProductsByHQ.find(
      (hq: any) => hq.hqcode === this.hqcodevalue
    );

    if (selectedHQ) {
      const selectedInput = selectedHQ.inputlist.find(
        (input: any) => input.inputcode === product.InputId
      );

      if (selectedInput) {
        return selectedInput.inputqty;
      }
    }

    return 0; // Return 0 if not found
  }

  //allocating inputs
  productName: any = [];
  allocateInp: any = [];
  allocate: any = [];
  uniqueInputCodes: any = [];
  hqlist: any = [];
  allocateInputs() {
    const empcode = localStorage.getItem('empcode');
    let inputData = {
      username: empcode,
      hqlist: this.selectedProductsByHQ.map((hq: any) => hq.hqcode),
      data: this.selectedProductsByHQ,
    };
    console.log(inputData);
    this.service.allocatinginputs(inputData).subscribe((res: any) => {
      console.log(res);
      this.allocate = res.message;
      this.hasData = res.message && res.message.length > 0;
      this.allocateInp = this.allocate.map((data: any) => ({
        ...data,
        showDropdown: false,
      }));
      res.message.forEach((obj: any) => {
        obj.tseData.forEach((emp: any) => {
          emp.inputs.forEach((pro: any) => {
            this.productName.push(pro.inputname);
          });
        });
      });

      this.hqlist = this.allocate.map((item: any) => {
        console.log(this.allocate);
        return {
          hqcode: item.hqcode,
          selist: item.tseData.map((employee: any) => {
            return {
              empcode: employee.empCode,
              inputlist: employee.inputs.map((input: any) => {
                return {
                  inputid: input.inputcode,
                  // inputqty: input.inputqty,
                  allocatedinputqty: parseInt(input.allocatedinputqty, 10),
                  // remainqty: input.remainqty,
                  // inputname: input.inputname
                };
              }),
            };
          }),
        };
      });

      console.log(this.productName);
      this.viewproduct = false;
      this.managehq = true;
      this.uniqueInputCodes = Array.from(new Set(this.productName));
    });
  }
  hqproductName: any = [];
  hqproductName1: any = [];
  modalOpen: boolean = false;
  modalOpen1: boolean = false;

  gethqproductdata(hqcode: string) {
    this.modalOpen = !this.modalOpen;
    this.hqproductName = [];
    this.allocate.forEach((obj: any) => {
      if (obj.hqcode === hqcode) {
        obj.tseData[0].inputs.forEach((tab: any) => {
          this.hqproductName.push(tab.inputname);
        });
      }
    });

    console.log(this.hqproductName);
    // If you want unique product names for a specific headquarters, use Set
    //this.hqproductName1 = Array.from(new Set(this.hqproductName));
    // console.log(this.hqproductName1);
  }

  toggleDropdown(data: any): void {
    // Toggle the 'showDropdown' property in the data object
    data.showDropdown = !data.showDropdown;
  }

  getQtyForInputCode(employee: any, inputCode: string, hqcode: string): number {
    const input = employee.inputs.find(
      (input: any) => input.inputcode === inputCode && input.hqcode === hqcode
    );
    return input ? input.inputqty : 0;
  }

  searchTerm: any;
  applySearchFilter(): void {
    // Reset the filter if the search term is empty
    if (!this.searchTerm) {
      this.allocateInp = this.allocate;
      return;
    }

    // Apply the filter based on any property in the data
    this.allocateInp = this.allocate.filter((item: any) => {
      const dataString = JSON.stringify(item).toLowerCase();
      const searchTermLowerCase = this.searchTerm.toLowerCase();

      // Check if the dataString includes the search term (case-insensitive)
      return (
        dataString.includes(searchTermLowerCase) ||
        this.isNumberInData(item, searchTermLowerCase)
      );
    });
  }

  isNumberInData(item: any, searchTerm: string): boolean {
    // Custom logic to check if the search term is a number and if it matches any numeric property
    for (const key in item) {
      if (item.hasOwnProperty(key) && typeof item[key] === 'number') {
        const numericValue = item[key].toString();
        if (numericValue.includes(searchTerm)) {
          return true;
        }
      }
    }
    return false;
  }

  fileName = 'combined_tables.xlsx';
  base64String: string = '';

  exportexcel() {
    const response = this.allocate;
    const combinedData: any[] = [];
    response.forEach((current: any) => {
      current.tseData.forEach((employee: any) => {
        employee.inputs.forEach((input: any) => {
          combinedData.push({
            hqcode: current.hqname,
            inputCode: input.inputcode,
            empCode: employee.empCode,
            empName: employee.empName,

            inputName: input.inputname,
            allocatedInputQty: parseInt(input.allocatedinputqty, 10),
            inputQty: input.inputqty,
            remainQty: input.remainqty,
          });
        });
      });
    });
    console.log(combinedData);

    // Flatten the inputs array to a single array of input objects
    const flatInputs = combinedData.flatMap((data) => data.inputs || []);

    // Create a worksheet for the combinedData
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(combinedData);

    // Create a worksheet for the flattened inputs
    const wsInputs: XLSX.WorkSheet = XLSX.utils.json_to_sheet(flatInputs);

    // Create a workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Append both worksheets to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.utils.book_append_sheet(wb, wsInputs, 'Inputs');

    this.base64String = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

    // If you want to download the file, you can use the following code
    const fileName = 'combinedData.xlsx';
    XLSX.writeFile(wb, fileName);

    console.log(this.allocate);

    this.hqlist1 = this.allocate.map((item: any) => {
      return {
        hqcode: item.hqcode,
        selist: item.tseData.map((employee: any) => {
          return {
            empcode: employee.empCode,
            inputlist: employee.inputs.map((input: any) => {
              return {
                inputid: input.inputcode,
                // inputqty: input.inputqty,
                allocatedinputqty: parseInt(input.allocatedinputqty, 10),
                // remainqty: input.remainqty,
                // inputname: input.inputname
              };
            }),
          };
        }),
      };
    });
    this.updatingallocateInputs();
    this.updateInputsData();
    this.sendemail();
  }

  empID = localStorage.getItem('empcode');
  // code for updating alloocated inputs
  divcode = localStorage.getItem('empdivisioncode');
  updatingallocateInputs() {
    if (this.selectvalue == '' && this.selectedMonth == 'Select Month') {
      return alert('select All the fields');
    }
    const selectedDivision = this.divisions.find(
      (data: any) => data.divisioncode == this.selectvalue
    );

    if (selectedDivision) {
      this.selectedDivisionName = selectedDivision.divisionname;
    } else {
      this.selectedDivisionName = ''; // Reset the name if the division is not found
    }

    const [selectedStartYear, selectedEndYear] = this.selectedFinancialYear
      .split(' - ')
      .map((year) => parseInt(year, 10));
    let divcode = localStorage.getItem('empdivisioncode');

    // Use the hqlist1 if available, otherwise, use hqlist
    const hqlistToUse = this.hqlist1 || this.hqlist;
    let inputData = {
      username: this.empID,
      divisioncode: this.divcode ? parseInt(this.divcode, 10) : null,
      year: selectedEndYear,
      month: this.selectedMonth,
      hqlist: hqlistToUse,
    };
    console.log(this.hqlist1);
    this.service.updatingallocatedInputs(inputData).subscribe((res: any) => {
      console.log(res);
      alert('i ma updating inputs');
    });
  }

  updateInputsData() {
    const data = this.hqlist1;
    const transformedData: { inputid: string; allocatedinputqty: number }[] =
      [];

    data.forEach((hq: any) => {
      hq.selist.forEach((emp: any) => {
        emp.inputlist.forEach((input: any) => {
          const existingItem = transformedData.find(
            (resultItem) => resultItem.inputid === input.inputid
          );
          const allocatedQty = parseInt(input.allocatedinputqty);

          if (!isNaN(allocatedQty)) {
            if (existingItem) {
              existingItem.allocatedinputqty += allocatedQty;
            } else {
              transformedData.push({
                inputid: input.inputid,
                allocatedinputqty: allocatedQty,
              });
            }
          }
        });
      });
    });

    console.log(transformedData);

    let inputData = {
      username: this.empID,
      inputslist: transformedData,
    };

    console.log(inputData);

    this.service.updateInputsData(inputData).subscribe((res: any) => {
      console.log(res);
    });
  }

  // updateInputsData(){
  //   const data =this.hqlist1;
  //   console.log(this.hqlist1);
  //   // const transformedData: { inputid: string; inputqty: number }[] = [];

  //   // data.forEach((item:any) => {
  //   //   item.inputlist.forEach((inputItem:any) => {
  //   //     const existingItem = transformedData.find((resultItem) => resultItem.inputid === inputItem.inputcode);

  //   //     if (existingItem) {
  //   //       // If the inputcode already exists, add the inputqty
  //   //       existingItem.inputqty += inputItem.inputqty;
  //   //     } else {
  //   //       // If the inputcode doesn't exist, add a new object
  //   //       transformedData.push({ inputid: inputItem.inputcode, inputqty: inputItem.inputqty });
  //   //     }
  //   //   });
  //   // });

  //   const transformedData: { inputid: string; allocatedinputqty: number }[] = [];

  //   data.forEach((hq: any) => {
  //     hq.selist.map((emp: any) => {
  //       emp.inputs.map((input :any)=>{
  //         const existingItem = transformedData.find((resultItem) => resultItem.inputid === input.inputcode);
  //         if (existingItem) {
  //           // Check if inputItem.allocatedinputqty is a valid number before adding
  //           if (!isNaN(input.allocatedinputqty)) {
  //             existingItem.allocatedinputqty += input.allocatedinputqty;
  //           }
  //         } else {
  //           // Check if inputItem.allocatedinputqty is a valid number before adding
  //           if (!isNaN(input.allocatedinputqty)) {
  //             transformedData.push({ inputid: input.inputcode, allocatedinputqty: input.allocatedinputqty });
  //           }
  //         }
  //       })

  //     });
  //   });
  //   console.log(transformedData);
  //   let inputData={
  //     "username":this.empID,
  //     "inputslist":transformedData
  //   }
  //   console.log(inputData)
  //   this.service.updateInputsData(inputData).subscribe((res:any)=>{
  //     console.log(res);
  //   })
  // }

  sendemail() {
    alert('this is email sender');

    let inputData = {
      username: this.empID,
      name: this.fileName, // Use the fileName property here
      file: this.base64String,
    };

    this.service.sendingemail(inputData).subscribe((res: any) => {
      console.log(res);

      Swal.fire({
        title: 'Success!',
        text: 'Inputs are allocated succesfully!',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    });
  }

  filteredData: any[] = [];
  selectedEmployee: any = {};

  @Input() preFillValue: number = 0;

  openModalWithData(hqcode: string, empId: string, inputC: string) {
    const filteredData = this.allocateInp
      .filter((data: any) => data.hqcode === hqcode)
      .map((data: any) => {
        const selectedEmployee = data.tseData.find(
          (employee: any) => employee.empCode === empId
        );
        if (selectedEmployee) {
          return {
            hqcode: data.hqcode,
            empName: selectedEmployee.empName,
            inputDetails: selectedEmployee.inputs.filter(
              (input: any) => input.inputcode === inputC
            ),
          };
        }
        return null;
      });

    this.filteredData = filteredData.filter((data: any) => data !== null);
    this.selectedEmployee = this.filteredData[0];
    this.preFillValue =
      this.selectedEmployee.inputDetails[0]?.allocatedinputqty || 0;
    this.modalOpen = true;
    this.modalOpen1 = true;
  }

  savedatainpopup(
    hqcode: string,
    empId: string,
    inputC: string,
    preFillValue: number
  ): boolean {
    // Update preFillValue in your component
    this.preFillValue = preFillValue;

    let maxqty: number = 0;
    let totalinputsum: number = 0;
    let reamainderqty: number = 0;
    // Find the maximum input quantity for the specified inputCode
    this.allocateInp.forEach((hqname: any) => {
      if (hqname.hqcode === hqcode) {
        hqname.tseData[0]?.inputs.forEach((tab: any) => {
          if (tab.inputcode === inputC) {
            maxqty = tab.inputqty;
          }
        });
      }
    });

    // Calculate the total input sum for the specified empId and inputCode
    this.allocateInp.forEach((hqname: any) => {
      if (hqname.hqcode === hqcode) {
        hqname.tseData.forEach((emp: any) => {
          emp.inputs.forEach((tab: any) => {
            if (emp.empName === empId && tab.inputcode === inputC) {
              totalinputsum += parseInt(this.preFillValue.toString()) || 0;
            } else if (tab.inputcode === inputC) {
              totalinputsum += parseInt(tab.allocatedinputqty) || 0;
            }
          });
        });
      }
    });

    console.log(maxqty, totalinputsum);

    // Validate if the total input sum exceeds the maximum quantity
    if (totalinputsum > maxqty) {
      //  alert("Total input sum should not exceed the maximum quantity");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Total input sum should not exceed the maximum quantity',
      });
      // this.modalOpen1=false;
      return false;
    } else {
      for (const data of this.allocateInp) {
        if (data.hqcode === hqcode) {
          for (const employee of data.tseData) {
            for (const tab of employee.inputs) {
              if (tab.inputcode === inputC) {
                console.log('other employee tablet', inputC);
                tab.remainqty = maxqty - totalinputsum;
              }
              if (employee.empName === empId && tab.inputcode === inputC) {
                tab.allocatedinputqty = preFillValue;
                tab.remainqty = maxqty - totalinputsum;
                this.modalOpen1 = false;
                $('#myModalc').modal('hide');
                // Return true to indicate that the adjustment was successful
              }
            }
          }
        }
      }
    }

    // Return false if the data for the specified hqcode, empId, and inputC is not found
    return false;
  }

  updateMyModalContent() {
    const myModalElement = document.getElementById('myModal') as HTMLElement;
    if (myModalElement) {
      const contentElement = myModalElement.querySelector(
        '.modalmine'
      ) as HTMLElement;
      if (contentElement) {
        contentElement.innerText = `Updated Content: ${this.updatedAllocatedInputQty}`;
      }
    }
  }

  updatedAllocatedInputQty: number = 0;
}
