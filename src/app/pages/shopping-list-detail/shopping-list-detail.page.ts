import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ShoppingListService } from '../../services/shopping-list.service';
import {
  ShoppingList,
  ShoppingListItem,
} from '../../models/shopping-list.model';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-shopping-list-detail',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './shopping-list-detail.page.html',
  styleUrls: ['./shopping-list-detail.page.scss'],
})
export class ShoppingListDetailPage implements OnInit {
  // Signals
  shoppingList = signal<ShoppingList | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  listId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shoppingListService: ShoppingListService
  ) {}

  ngOnInit(): void {
    this.listId = this.route.snapshot.paramMap.get('id') || '';
    if (this.listId) {
      this.loadShoppingList();
    } else {
      this.error.set('Invalid shopping list ID');
    }
  }

  /**
   * Load the shopping list details
   */
  loadShoppingList(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.shoppingListService.getById(this.listId).subscribe({
      next: (list) => {
        this.shoppingList.set(list);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load shopping list. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading shopping list:', err);
      },
    });
  }

  /**
   * Toggle item status between pending and in_cart
   */
  toggleItemStatus(item: ShoppingListItem, event: Event): void {
    event.stopPropagation();

    const newStatus = item.status === 'pending' ? 'in_cart' : 'pending';

    this.shoppingListService
      .updateItemStatus(this.listId, item._id, newStatus)
      .subscribe({
        next: (updatedList) => {
          this.shoppingList.set(updatedList);
        },
        error: (err) => {
          console.error('Error updating item status:', err);
          alert('Failed to update item status');
        },
      });
  }

  /**
   * Remove an item from the list
   */
  removeItem(itemId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this item?')) {
      this.shoppingListService.removeItem(this.listId, itemId).subscribe({
        next: (updatedList) => {
          this.shoppingList.set(updatedList);
        },
        error: (err) => {
          console.error('Error removing item:', err);
          alert('Failed to remove item');
        },
      });
    }
  }

  /**
   * Mark the list as completed
   */
  markAsCompleted(): void {
    this.shoppingListService.markAsCompleted(this.listId).subscribe({
      next: (updatedList) => {
        this.shoppingList.set(updatedList);
      },
      error: (err) => {
        console.error('Error marking list as completed:', err);
        alert('Failed to mark list as completed');
      },
    });
  }

  /**
   * Mark the list as archived
   */
  markAsArchived(): void {
    this.shoppingListService.markAsArchived(this.listId).subscribe({
      next: (updatedList) => {
        this.shoppingList.set(updatedList);
      },
      error: (err) => {
        console.error('Error marking list as archived:', err);
        alert('Failed to mark list as archived');
      },
    });
  }

  /**
   * Mark the list as active
   */
  markAsActive(): void {
    this.shoppingListService.markAsActive(this.listId).subscribe({
      next: (updatedList) => {
        this.shoppingList.set(updatedList);
      },
      error: (err) => {
        console.error('Error marking list as active:', err);
        alert('Failed to mark list as active');
      },
    });
  }

  /**
   * Navigate back to the shopping list overview
   */
  goBack(): void {
    this.router.navigate(['/tabs/shopping-list']);
  }

  /**
   * Get status badge color class
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'archived':
        return 'status-archived';
      default:
        return '';
    }
  }

  /**
   * Get item status badge color class
   */
  getItemStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'item-status-pending';
      case 'in_cart':
        return 'item-status-in-cart';
      default:
        return '';
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    const list = this.shoppingList();
    if (!list || list.items.length === 0) return 0;

    const completedItems = list.items.filter(
      (item) => item.status === 'in_cart'
    ).length;
    return Math.round((completedItems / list.items.length) * 100);
  }

  /**
   * Get count of items by status
   */
  getItemCountByStatus(status: 'pending' | 'in_cart'): number {
    const list = this.shoppingList();
    if (!list) return 0;
    return list.items.filter((item) => item.status === status).length;
  }
}
