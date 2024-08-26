import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectproductsService {


  productsData:any=[];
  constructor() { }
  private selectedProducts: any[] = [];

  addProduct(product: any, quantity: number) {
    this.selectedProducts.push({ product, quantity });
  }

  removeProduct(product: any) {
    const index = this.selectedProducts.findIndex(
      (item) => item.product === product
    );
    if (index !== -1) {
      this.selectedProducts.splice(index, 1);
    }
  }

  getSelectedProducts(): any[] {
    return this.selectedProducts;
  }
  getSelectedProductsForHQ(hq: string): any[] {
    return this.selectedProducts.filter(product => product.headquarter === hq);
  }

  private user: any; // Store user data here

  setUser(user: any) {
    this.user = user;
  }

  getUser() {
    return this.user;
  }

  clearUser() {
    this.user = null;
  }

}
