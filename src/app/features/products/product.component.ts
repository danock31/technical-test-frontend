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
  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}
  
  products: Product[] = [];
  newProduct: Product = { id: 0, name: '', price: 0, isActive: true };
  displayedColumns = ['name', 'price', 'isActive', 'actions'];
  //Loader para la estetica de cagar datos
  isLoading = false;
  //Variable para buscar
      searchTerm: string = '';
  //Funcion para buscar
    get filteredProducts(): Product[] {
      if (!this.searchTerm.trim()) return this.products;
      return this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  // Variables de paginación
  page = 1;
  itemsPerPage = 5;
  //Metodos para la paginacion
    get paginatedProducts(): Product[] {
      const start = (this.page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      //Para que la paginacion se adapte a la busqueda
      return this.filteredProducts.slice(start, end);
    }

  nextPage() {
    if (this.page < Math.ceil(this.products.length / this.itemsPerPage)) {
      this.page++;
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
  }
    get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }
  //Metodos para el manejo de datos
  ngOnInit(): void {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
      this.isLoading = true;
    try {
      this.products = await firstValueFrom(this.productService.getProducts());
      
    } catch (err: any) {
      this.showMessage(err?.error?.message || 'Error cargando productos', true);
    } finally{
      this.isLoading = false;
    }
  }

  async addProduct(): Promise<void> {
    if (!this.newProduct.name || this.newProduct.price <= 0) {
      this.showMessage('Ambos son obligatorios y el precio debe ser positivo', true);
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
  //UPDATE de los productos
  async updateProduct(product: Product): Promise<void> {
    if (!product.name || product.price <= 0) {
      this.showMessage('Ambos son obligatorios y el precio debe ser positivo', true);
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
  //DELETE de los productos
  async deleteProduct(id: number): Promise<void> {
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
  //Para mostrar cual valor trae el producto en los toggle buttons 
  async onToggleActive(product: Product, isActive: boolean) {
    product.isActive = isActive;
  }
  //Para mostrar las validaciones
  private showMessage(message: string, isError: boolean = false) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      panelClass: isError ? ['snack-error'] : ['snack-success']
    });
  }
}
