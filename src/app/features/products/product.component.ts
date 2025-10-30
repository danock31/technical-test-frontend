import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatCardModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  products: Product[] = [];
  newProduct: Product = { id: 0, name: '', price: 0, isActive: true };
  displayedColumns = ['name', 'price', 'isActive', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts() {
  try {
    this.products = await firstValueFrom(this.productService.getProducts());
  } catch (err: any) {
    this.showMessage(err?.error?.message || 'Error cargando productos', true);
  }
  }

  async addProduct() {
    if (!this.newProduct.name || this.newProduct.price <= 0) {
      this.showMessage('Nombre y precio son obligatorios', true);
      return;
    }

    try {
      const product = await firstValueFrom(this.productService.addProduct(this.newProduct));
      this.products.push(product);
      this.showMessage('Producto creado correctamente');
      this.newProduct = { id: 0, name: '', price: 0, isActive: true };
      this.loadProducts();
    } catch (err: any) {
      this.showMessage(err?.error?.message || 'Error al crear producto', true);
    }
  }

  async updateProduct(product: Product) {
    if (!product.name || product.price <= 0) {
      this.showMessage('Nombre y precio son obligatorios', true);
      return;
    }

    try {
      await firstValueFrom(this.productService.updateProduct(product.id, product));
      this.showMessage('Producto actualizado correctamente');
      this.loadProducts();
    } catch (err: any) {
      this.showMessage(err?.error?.message || 'Error al actualizar producto', true);
    }
  }

  async deleteProduct(id: number) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const res = await firstValueFrom(this.productService.deleteProduct(id));
      this.products = this.products.filter(p => p.id !== id);
      const msg = res?.message || 'Producto eliminado correctamente';
      this.showMessage(msg);
      this.loadProducts();
    } catch (err: any) {
      this.showMessage(err?.error?.message || 'Error al eliminar producto', true);
    }
  }

  async onToggleActive(product: Product, isActive: boolean) {
    product.isActive = isActive;
    await this.updateProduct(product);
  }

  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}
