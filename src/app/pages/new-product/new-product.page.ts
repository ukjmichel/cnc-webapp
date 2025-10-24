/**
 * NewProductPage
 * --------------------------------------------------------------------------
 * Page for creating new products with form validation and error handling
 * --------------------------------------------------------------------------
 */

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ProductService } from '../../services/product.service';
import { CreateProductInput } from '../../models/product.model';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-product.page.html',
  styleUrls: ['./new-product.page.scss'],
})
export class NewProductPage implements OnInit {
  productForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the product form with validation
   */
  initializeForm(): void {
    this.productForm = this.fb.group({
      productId: ['', [Validators.required, Validators.minLength(3)]],
      productCode: [''],
      productName: ['', [Validators.required, Validators.minLength(2)]],
      brands: [''],
      quantity: [null, [Validators.min(0)]],
      quantityUnit: [''],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.error.set('Please fill in all required fields correctly.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.productForm.value;

    // Build input object - start with only required fields
    const input: CreateProductInput = {
      productId: formValue.productId.trim(),
      productName: formValue.productName.trim(),
    };

    // Add optional fields ONLY if they have values
    // This prevents sending null to the backend

    if (formValue.productCode?.trim()) {
      input.productCode = formValue.productCode.trim();
    }

    if (formValue.brands?.trim()) {
      input.brands = formValue.brands.trim();
    }

    // Handle quantity separately (it's a number, not a string)
    if (
      formValue.quantity !== null &&
      formValue.quantity !== undefined &&
      formValue.quantity !== ''
    ) {
      input.quantity = formValue.quantity;
    }

    if (formValue.quantityUnit?.trim()) {
      input.quantityUnit = formValue.quantityUnit.trim();
    }

    if (formValue.description?.trim()) {
      input.description = formValue.description.trim();
    }

    this.productService.createProduct(input).subscribe({
      next: (product) => {
        this.success.set(true);
        this.isSubmitting.set(false);

        // Show success message briefly, then navigate
        setTimeout(() => {
          this.router.navigate(['/tabs/products']);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);

        // Handle specific error cases
        if (err.status === 409) {
          this.error.set('A product with this ID or code already exists.');
        } else if (err.status === 401) {
          this.error.set('You must be logged in to create products.');
        } else if (err.status === 403) {
          this.error.set('You do not have permission to create products.');
        } else if (err.status === 400) {
          // Handle validation errors
          const errorMsg =
            err.error?.message || 'Invalid input. Please check your form.';
          this.error.set(errorMsg);
          console.error('Validation error:', err.error);
        } else {
          this.error.set('Failed to create product. Please try again.');
        }

        console.error('Error creating product:', err);
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/tabs/products']);
  }

  /**
   * Clear form and reset
   */
  onReset(): void {
    this.productForm.reset();
    this.error.set(null);
    this.success.set(false);
  }

  /**
   * Check if a field has an error and has been touched
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.productForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Get error message for a field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
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
      return `${this.getFieldLabel(fieldName)} must be 0 or greater`;
    }

    return 'Invalid value';
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productId: 'Product ID',
      productCode: 'Product Code',
      productName: 'Product Name',
      brands: 'Brand',
      quantity: 'Quantity',
      quantityUnit: 'Unit',
      description: 'Description',
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
    });
  }
}
