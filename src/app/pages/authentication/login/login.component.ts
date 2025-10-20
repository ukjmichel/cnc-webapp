import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthFacade } from 'src/app/store/auth/auth.facade';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, RouterLink],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authFacade = inject(AuthFacade);

  loginForm!: FormGroup;
  showPassword = false;

  ngOnInit(): void {
    this.initializeForm();
    this.authFacade.clearError();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      console.log('[Login Component] Submitting:', { email });
      console.log('[Login Component] Auth facade loaded:', !!this.authFacade);

      this.authFacade.login(email, password);
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  onInputFocus(event: any) {
    const item = event.target.closest('ion-item');
    if (item) {
      item.classList.add('item-has-focus');
    }
  }

  onInputBlur(event: any) {
    const item = event.target.closest('ion-item');
    if (item && !event.target.value) {
      item.classList.remove('item-has-focus');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}
