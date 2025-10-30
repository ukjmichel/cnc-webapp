import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ShoppingListService } from '../../services/shopping-list.service';
import {
  ShoppingList,
  ShoppingListFilters,
} from '../../models/shopping-list.model';
import { IonicModule } from "@ionic/angular";
import { IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-shopping-list-page',
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './shopping-list.page.html',
  styleUrls: ['./shopping-list.page.scss'],
})
export class ShoppingListPage implements OnInit {
  // Signals
  shoppingLists = signal<ShoppingList[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  totalItems = signal<number>(0);

  // Filter state
  filterStatus = signal<'active' | 'completed' | 'archived' | ''>('');
  filterUserId = signal<string>('');
  searchQuery = signal<string>('');

  // Computed values
  hasLists = computed(() => this.shoppingLists().length > 0);
  activeCount = computed(
    () => this.shoppingLists().filter((list) => list.status === 'active').length
  );
  completedCount = computed(
    () =>
      this.shoppingLists().filter((list) => list.status === 'completed').length
  );
  archivedCount = computed(
    () =>
      this.shoppingLists().filter((list) => list.status === 'archived').length
  );

  constructor(
    private shoppingListService: ShoppingListService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadShoppingLists();
  }

  /**
   * Load shopping lists with current filters
   */
  loadShoppingLists(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters: ShoppingListFilters = {
      page: this.currentPage(),
      pageSize: 20,
      orderBy: 'updatedAt',
      orderDir: 'DESC',
    };

    if (this.filterStatus()) {
      filters.status = this.filterStatus() as
        | 'active'
        | 'completed'
        | 'archived';
    }

    if (this.filterUserId()) {
      filters.userId = this.filterUserId();
    }

    if (this.searchQuery()) {
      filters.q = this.searchQuery();
    }

    this.shoppingListService.getShoppingLists(filters).subscribe({
      next: (response) => {
        this.shoppingLists.set(response.data.lists);
        this.totalPages.set(response.meta.pages);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load shopping lists. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading shopping lists:', err);
      },
    });
  }

  /**
   * Apply filters and reload
   */
  applyFilters(): void {
    this.currentPage.set(1);
    this.loadShoppingLists();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterStatus.set('');
    this.filterUserId.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadShoppingLists();
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadShoppingLists();
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadShoppingLists();
    }
  }

  /**
   * Navigate to view list details
   */
  viewList(listId: string): void {
    this.router.navigate(['/shopping-lists', listId]);
  }

  /**
   * Mark a list as completed
   */
  markAsCompleted(listId: string, event: Event): void {
    event.stopPropagation();
    this.shoppingListService.markAsCompleted(listId).subscribe({
      next: () => {
        this.loadShoppingLists();
      },
      error: (err) => {
        console.error('Error marking list as completed:', err);
        alert('Failed to update list status');
      },
    });
  }

  /**
   * Mark a list as archived
   */
  markAsArchived(listId: string, event: Event): void {
    event.stopPropagation();
    this.shoppingListService.markAsArchived(listId).subscribe({
      next: () => {
        this.loadShoppingLists();
      },
      error: (err) => {
        console.error('Error marking list as archived:', err);
        alert('Failed to update list status');
      },
    });
  }

  /**
   * Mark a list as active
   */
  markAsActive(listId: string, event: Event): void {
    event.stopPropagation();
    this.shoppingListService.markAsActive(listId).subscribe({
      next: () => {
        this.loadShoppingLists();
      },
      error: (err) => {
        console.error('Error marking list as active:', err);
        alert('Failed to update list status');
      },
    });
  }

  /**
   * Delete a shopping list
   */
  deleteList(listId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this shopping list?')) {
      this.shoppingListService.deleteShoppingList(listId).subscribe({
        next: () => {
          this.loadShoppingLists();
        },
        error: (err) => {
          console.error('Error deleting list:', err);
          alert('Failed to delete list');
        },
      });
    }
  }

  /**
   * Duplicate a shopping list
   */
  duplicateList(list: ShoppingList, event: Event): void {
    event.stopPropagation();
    this.shoppingListService
      .duplicateShoppingList(list._id, {
        userId: list.userId,
        title: `${list.title} (Copy)`,
      })
      .subscribe({
        next: () => {
          this.loadShoppingLists();
        },
        error: (err) => {
          console.error('Error duplicating list:', err);
          alert('Failed to duplicate list');
        },
      });
  }

  /**
   * Navigate to create new shopping list
   */
  createNewList(): void {
    this.router.navigate(['/new-shopping-list']);
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
   * Format date for display
   */
  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
