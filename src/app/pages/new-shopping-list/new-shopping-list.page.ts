/**
 * NewShoppingListPage
 * --------------------------------------------------------------------------
 * Page for creating new shopping lists with form validation and error handling
 * --------------------------------------------------------------------------
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShoppingListService } from '../../services/shopping-list.service';
import { ProductService } from '../../services/product.service';
import { CreateShoppingListInput } from '../../models/shopping-list.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-new-shopping-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-shopping-list.page.html',
  styleUrls: ['./new-shopping-list.page.scss'],
})
export class NewShoppingListPage implements OnInit {
  shoppingListForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);
  products = signal<Product[]>([]);
  isLoadingProducts = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private shoppingListService: ShoppingListService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
  }

  /**
   * Initialize the shopping list form with validation
   */
  initializeForm(): void {
    this.shoppingListForm = this.fb.group({
      userId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(2)]],
      comment: ['', [Validators.maxLength(500)]],
      items: this.fb.array([]),
    });
  }

  /**
   * Get items FormArray
   */
  get items(): FormArray {
    return this.shoppingListForm.get('items') as FormArray;
  }

  /**
   * Load products for the dropdown
   */
  loadProducts(): void {
    this.isLoadingProducts.set(true);
    this.productService.listProducts({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.products.set(response.data.products);
        this.isLoadingProducts.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoadingProducts.set(false);
      },
    });
  }

  /**
   * Add a new item to the form
   */
  addItem(): void {
    const itemGroup = this.fb.group({
      productId: ['', [Validators.required]],
      productName: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      quantityUnit: [''],
      comment: [''],
    });

    this.items.push(itemGroup);
  }

  /**
   * Remove an item from the form
   */
  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  /**
   * Handle product selection and auto-fill product name
   */
  onProductSelect(index: number, event: any): void {
    const productId = event.detail.value;
    const product = this.products().find((p) => p.productId === productId);

    if (product) {
      const itemGroup = this.items.at(index) as FormGroup;
      itemGroup.patchValue({
        productName: product.productName,
        quantityUnit: product.quantityUnit || '',
      });
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.shoppingListForm.invalid) {
      this.markFormGroupTouched(this.shoppingListForm);
      this.error.set('Please fill in all required fields correctly.');
      return;
    }

    if (this.items.length === 0) {
      this.error.set('Please add at least one item to the shopping list.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.shoppingListForm.value;

    // Build input object
    const input: CreateShoppingListInput = {
      userId: formValue.userId.trim(),
      title: formValue.title.trim(),
    };

    // Add optional comment
    if (formValue.comment?.trim()) {
      input.comment = formValue.comment.trim();
    }

    // Add items
    if (formValue.items && formValue.items.length > 0) {
      input.items = formValue.items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName || undefined,
        quantity: item.quantity,
        quantityUnit: item.quantityUnit || undefined,
        comment: item.comment || undefined,
      }));
    }

    this.shoppingListService.createShoppingList(input).subscribe({
      next: (list) => {
        this.success.set(true);
        this.isSubmitting.set(false);

        // Show success message briefly, then navigate
        setTimeout(() => {
          this.router.navigate(['/shopping-list']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);

        // Handle specific error cases
        if (err.status === 401) {
          this.error.set('You must be logged in to create shopping lists.');
        } else if (err.status === 403) {
          this.error.set(
            'You do not have permission to create shopping lists.'
          );
        } else if (err.status === 400) {
          const errorMsg =
            err.error?.message || 'Invalid input. Please check your form.';
          this.error.set(errorMsg);
          console.error('Validation error:', err.error);
        } else {
          this.error.set('Failed to create shopping list. Please try again.');
        }

        console.error('Error creating shopping list:', err);
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/shopping-list']);
  }

  /**
   * Clear form and reset
   */
  onReset(): void {
    this.shoppingListForm.reset();
    this.items.clear();
    this.error.set(null);
    this.success.set(false);
  }

  /**
   * Check if a field has an error and has been touched
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.shoppingListForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Check if an item field has an error
   */
  hasItemError(index: number, fieldName: string): boolean {
    const field = this.items.at(index).get(fieldName);
    if (!field) return false;
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.shoppingListForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must be at least ${minLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must not exceed ${maxLength} characters`;
    }
    if (field.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be 1 or greater`;
    }

    return 'Invalid value';
  }

  /**
   * Get error message for an item field
   */
  getItemErrorMessage(index: number, fieldName: string): string {
    const field = this.items.at(index).get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${this.getItemFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('min')) {
      return `${this.getItemFieldLabel(fieldName)} must be 1 or greater`;
    }

    return 'Invalid value';
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      userId: 'User ID',
      title: 'Title',
      comment: 'Comment',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Get human-readable item field label
   */
  private getItemFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productId: 'Product',
      productName: 'Product Name',
      quantity: 'Quantity',
      quantityUnit: 'Unit',
      comment: 'Comment',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }
}
