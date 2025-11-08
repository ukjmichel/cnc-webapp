/**
 * NewProductPage
 * --------------------------------------------------------------------------
 * Page for creating new products with form validation and error handling
 * --------------------------------------------------------------------------
 */

import { Component, OnInit, OnDestroy, signal } from '@angular/core';
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
import { BarcodeService } from '../../services/barcode.service';
import { CreateProductInput } from '../../models/product.model';
import { CombinedBarcodeResponse } from '../../models/barcode.model';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-product.page.html',
  styleUrls: ['./new-product.page.scss'],
})
export class NewProductPage implements OnInit, OnDestroy {
  productForm!: FormGroup;
  isSubmitting = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<boolean>(false);

  // Barcode scanning properties
  barcodeInput = signal<string>('');
  isLookingUpBarcode = signal<boolean>(false);
  barcodeError = signal<string | null>(null);
  barcodeSuccess = signal<string | null>(null);

  // Web scanner properties
  showWebScanner = signal<boolean>(false);
  private html5QrCode: any = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private barcodeService: BarcodeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    // Clean up web scanner if it's running
    this.stopWebScanner();
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

  /**
   * Lookup product by barcode and prefill form
   */
  onBarcodeLookup(): void {
    const barcode = this.barcodeInput().trim();

    console.log('[Barcode Lookup] Starting lookup for barcode:', barcode);

    if (!barcode) {
      this.barcodeError.set('Please enter a barcode');
      return;
    }

    this.isLookingUpBarcode.set(true);
    this.barcodeError.set(null);
    this.barcodeSuccess.set(null);

    console.log('[Barcode Lookup] Calling barcodeService.getItemByCode...');

    this.barcodeService.getItemByCode(barcode).subscribe({
      next: (response: CombinedBarcodeResponse) => {
        console.log('[Barcode Lookup] SUCCESS - Response:', response);
        this.isLookingUpBarcode.set(false);
        this.prefillFormFromBarcodeData(response);
        this.barcodeSuccess.set('Product data loaded successfully!');

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.barcodeSuccess.set(null);
        }, 3000);
      },
      error: (err) => {
        console.error('[Barcode Lookup] ERROR - Full error object:', err);
        console.error('[Barcode Lookup] ERROR - Status:', err.status);
        console.error('[Barcode Lookup] ERROR - Status Text:', err.statusText);
        console.error('[Barcode Lookup] ERROR - Error message:', err.error);
        console.error('[Barcode Lookup] ERROR - URL:', err.url);

        this.isLookingUpBarcode.set(false);

        if (err.status === 404) {
          this.barcodeError.set(
            'Product not found in barcode databases. You can still create it manually.'
          );
        } else if (err.status === 401) {
          console.error('[Barcode Lookup] 401 UNAUTHORIZED - Backend requires authentication!');
          this.barcodeError.set('You must be logged in to lookup barcodes.');
        } else if (err.status === 403) {
          console.error('[Barcode Lookup] 403 FORBIDDEN - Insufficient permissions!');
          this.barcodeError.set(
            'You do not have permission to lookup barcodes.'
          );
        } else if (err.status === 0) {
          console.error('[Barcode Lookup] CONNECTION ERROR - Backend not running or CORS issue!');
          this.barcodeError.set('Cannot connect to backend. Make sure the API server is running on http://localhost:3000');
        } else {
          console.error('[Barcode Lookup] UNKNOWN ERROR - Status:', err.status);
          this.barcodeError.set('Failed to lookup barcode. Please try again.');
        }

        console.error('Error looking up barcode:', err);
      },
    });
  }

  /**
   * Prefill form fields from barcode API response
   */
  private prefillFormFromBarcodeData(response: CombinedBarcodeResponse): void {
    const { barcode, foodData, retailData } = response;

    // Set productId with the barcode
    if (barcode) {
      this.productForm.patchValue({
        productId: barcode,
        productCode: barcode,
      });
    }

    // Prioritize food data for product name
    if (foodData?.product_name) {
      this.productForm.patchValue({
        productName: foodData.product_name,
      });
    } else if (retailData?.description) {
      this.productForm.patchValue({
        productName: retailData.description,
      });
    }

    // Set brand
    if (retailData?.brand) {
      this.productForm.patchValue({
        brands: retailData.brand,
      });
    }

    // Set quantity and unit from food data
    if (foodData?.product_quantity) {
      // Try to parse quantity (e.g., "500g" -> quantity: 500, unit: "g")
      const quantityMatch = foodData.product_quantity.match(/^(\d+\.?\d*)\s*(.*)$/);
      if (quantityMatch) {
        const [, quantity, unit] = quantityMatch;
        this.productForm.patchValue({
          quantity: parseFloat(quantity),
          quantityUnit: unit || foodData.product_quantity_unit || '',
        });
      } else {
        // If we can't parse, just set the unit
        this.productForm.patchValue({
          quantityUnit: foodData.product_quantity || '',
        });
      }
    } else if (foodData?.quantity) {
      // Try quantity field as fallback
      const quantityMatch = foodData.quantity.match(/^(\d+\.?\d*)\s*(.*)$/);
      if (quantityMatch) {
        const [, quantity, unit] = quantityMatch;
        this.productForm.patchValue({
          quantity: parseFloat(quantity),
          quantityUnit: unit || '',
        });
      }
    }

    // Set description from keywords if available
    if (foodData?.keywords) {
      this.productForm.patchValue({
        description: `Keywords: ${foodData.keywords}`,
      });
    }
  }

  /**
   * Clear barcode input and messages
   */
  onClearBarcode(): void {
    this.barcodeInput.set('');
    this.barcodeError.set(null);
    this.barcodeSuccess.set(null);
  }

  /**
   * Scan barcode using device camera
   */
  async onScanBarcode(): Promise<void> {
    try {
      // Clear previous messages
      this.barcodeError.set(null);
      this.barcodeSuccess.set(null);

      // Check if we're running in a web browser
      const isWeb = !('Capacitor' in window) || (window as any).Capacitor?.getPlatform() === 'web';

      if (isWeb) {
        // Use HTML5 QR Code scanner for web browsers
        this.startWebScanner();
        return;
      }

      // Native mobile app - use ML Kit scanner
      // Check if the plugin is available
      if (typeof BarcodeScanner === 'undefined') {
        this.barcodeError.set(
          'Camera scanner plugin not available. Please enter the barcode manually.'
        );
        return;
      }

      // Check and request camera permissions
      const { camera } = await BarcodeScanner.checkPermissions();

      if (camera === 'denied') {
        this.barcodeError.set('Camera permission denied. Please enable camera access in your device settings or enter the barcode manually.');
        return;
      }

      if (camera !== 'granted') {
        const result = await BarcodeScanner.requestPermissions();
        if (result.camera !== 'granted') {
          this.barcodeError.set('Camera permission is required to scan barcodes. Please enter the barcode manually.');
          return;
        }
      }

      // Start scanning
      const result = await BarcodeScanner.scan();

      if (result.barcodes && result.barcodes.length > 0) {
        const barcode = result.barcodes[0];

        // Set the barcode value
        if (barcode.rawValue) {
          this.barcodeInput.set(barcode.rawValue);
          this.barcodeSuccess.set(`Barcode detected: ${barcode.rawValue}`);

          // Automatically trigger lookup after a short delay
          setTimeout(() => {
            this.onBarcodeLookup();
          }, 500);
        } else {
          this.barcodeError.set('No barcode value detected. Please try again.');
        }
      } else {
        this.barcodeError.set('No barcode detected. Please try again.');
      }
    } catch (err: any) {
      console.error('Error scanning barcode:', err);

      if (err.message?.includes('cancelled')) {
        // User cancelled scanning, no need to show error
        return;
      }

      this.barcodeError.set('Failed to scan barcode. Please try again or enter manually.');
    }
  }

  /**
   * Start web-based barcode scanner (for browsers)
   */
  async startWebScanner(): Promise<void> {
    try {
      // Check if HTTPS or localhost (required for camera access in browsers)
      if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
        this.barcodeError.set(
          'Camera access requires HTTPS or localhost. Please use: npm run start:camera'
        );
        return;
      }

      // Show the scanner modal
      this.showWebScanner.set(true);

      // Wait for the DOM to render the scanner element
      setTimeout(async () => {
        try {
          // Dynamically import Html5Qrcode to avoid build issues
          const { Html5Qrcode: Html5QrcodeClass } = await import('html5-qrcode');
          this.html5QrCode = new Html5QrcodeClass('web-qr-reader');

          // Start the scanner
          await this.html5QrCode.start(
            { facingMode: 'environment' }, // Use back camera
            {
              fps: 10, // Frames per second
              qrbox: { width: 250, height: 250 }, // Scanning box size
              formatsToSupport: [
                // Barcode formats
                0, // QR_CODE
                5, // EAN_8
                6, // EAN_13
                7, // UPC_A
                8, // UPC_E
                9, // CODE_39
                10, // CODE_93
                11, // CODE_128
                12, // ITF
                13, // CODABAR
              ],
            },
            (decodedText: string, decodedResult: any) => {
              // Success callback - barcode detected
              console.log('Barcode detected:', decodedText);

              // Set the barcode value
              this.barcodeInput.set(decodedText);
              this.barcodeSuccess.set(`Barcode detected: ${decodedText}`);

              // Stop the scanner
              this.stopWebScanner();

              // Automatically trigger lookup after a short delay
              setTimeout(() => {
                this.onBarcodeLookup();
              }, 500);
            },
            (errorMessage: string) => {
              // Error callback - usually just "No barcode found"
              // We can ignore this as it's called continuously when no barcode is found
            }
          );
        } catch (err: any) {
          console.error('Error starting web scanner:', err);
          this.showWebScanner.set(false);

          if (err.message?.includes('NotAllowedError') || err.message?.includes('Permission')) {
            this.barcodeError.set(
              'Camera permission denied. Please allow camera access in your browser settings.'
            );
          } else if (err.message?.includes('NotFoundError')) {
            this.barcodeError.set(
              'No camera found on your device. Please use a device with a camera or enter the barcode manually.'
            );
          } else {
            this.barcodeError.set(
              'Failed to start camera. Please check permissions and try again, or enter the barcode manually.'
            );
          }
        }
      }, 100);
    } catch (err: any) {
      console.error('Error initializing web scanner:', err);
      this.showWebScanner.set(false);
      this.barcodeError.set('Failed to initialize camera scanner. Please enter the barcode manually.');
    }
  }

  /**
   * Stop web-based barcode scanner
   */
  async stopWebScanner(): Promise<void> {
    try {
      if (this.html5QrCode) {
        await this.html5QrCode.stop();
        this.html5QrCode.clear();
        this.html5QrCode = null;
      }
    } catch (err) {
      console.error('Error stopping web scanner:', err);
    } finally {
      this.showWebScanner.set(false);
    }
  }
}
