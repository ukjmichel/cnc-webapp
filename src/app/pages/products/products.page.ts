/**
 * ProductsPage - Example Component
 * --------------------------------------------------------------------------
 * Demonstrates how to use the ProductService in an Ionic/Angular component
 * --------------------------------------------------------------------------
 */

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { Product, ProductListParams } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {
  // Signals for component state
  products = signal<Product[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);

  // Search and filter state
  searchQuery = signal<string>('');
  sortBy = signal<
    'createdAt' | 'updatedAt' | 'productName' | 'productCode' | 'brands'
  >('updatedAt');
  sortDirection = signal<'ASC' | 'DESC'>('DESC');

  // Computed values
  hasProducts = computed(() => this.products().length > 0);

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Load products with current parameters
   */
  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: ProductListParams = {
      page: this.currentPage(),
      pageSize: 20,
      orderBy: this.sortBy(),
      orderDir: this.sortDirection(),
    };

    if (this.searchQuery()) {
      params.q = this.searchQuery();
    }

    this.productService.listProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.totalPages.set(response.meta.pages);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading products:', err);
      },
    });
  }

  /**
   * Search products
   */
  onSearch(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  /**
   * Clear search and reload
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadProducts();
  }

  /**
   * Change sort order
   */
  onSortChange(): void {
    this.currentPage.set(1);
    this.loadProducts();
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadProducts();
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadProducts();
    }
  }

  /**
   * Navigate to product details
   */
  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Navigate to create new product
   */
  createNewProduct(): void {
    this.router.navigate(['/products/create']);
  }

  /**
   * Navigate to edit product
   */
  editProduct(productId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products', productId, 'edit']);
  }

  /**
   * Delete a product
   */
  deleteProduct(productId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Failed to delete product. You may not have permission.');
        },
      });
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format quantity display
   */
  formatQuantity(product: Product): string {
    if (!product.quantity) return 'N/A';
    return product.quantityUnit
      ? `${product.quantity} ${product.quantityUnit}`
      : String(product.quantity);
  }
}
