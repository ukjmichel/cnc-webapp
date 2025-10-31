/**
 * ShoppingListService
 * --------------------------------------------------------------------------
 * Service responsible for communicating with the backend API for shopping
 * list operations such as creating, retrieving, updating, and managing
 * shopping lists and their items.
 *
 * It handles the backend's response format, including a fallback for a known
 * typo where the field `data` may be incorrectly returned as `date`.
 *
 * This service uses Angular Signals to store global shopping list state for
 * easy reactive consumption in components.
 * --------------------------------------------------------------------------
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  ShoppingList,
  ShoppingListStats,
  ShoppingListFilters,
  CreateShoppingListInput,
  UpdateShoppingListInput,
  AddItemInput,
  UpdateItemInput,
  DuplicateShoppingListInput,
  PaginatedResponse,
} from '../models/shopping-list.model';
import { ApiEnvelope } from '../models/api.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  /** Base URL for shopping list endpoints */
  private baseUrl = `${environment.apiUrl}api/shopping-lists/`;

  /** Signal holding the current user's active shopping lists */
  public activeShoppingLists = signal<ShoppingList[]>([]);

  /** Signal holding all shopping lists from the most recent fetch */
  public allShoppingLists = signal<ShoppingList[]>([]);

  /** Signal holding the currently selected/viewed shopping list */
  public currentShoppingList = signal<ShoppingList | null>(null);

  /** Signal holding shopping list statistics */
  public stats = signal<ShoppingListStats | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Unwraps the API envelope to extract the actual data payload.
   * Supports both `{ data }` and `{ date }` formats.
   * @param res API envelope object
   * @returns The extracted payload of type `T`
   */
  private unwrap<T>(res: ApiEnvelope<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res as any).data ?? (res as any).date;
  }

  /**
   * Creates a new shopping list.
   * @param input Shopping list creation data
   * @returns Observable emitting the created shopping list
   */
  createShoppingList(input: CreateShoppingListInput): Observable<ShoppingList> {
    return this.http
      .post<ApiEnvelope<{ list: ShoppingList }>>(this.baseUrl, input, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Retrieves a paginated list of shopping lists with optional filters.
   * Also updates the `allShoppingLists` signal.
   * @param filters Optional filter criteria
   * @returns Observable emitting paginated shopping list results
   */
  getShoppingLists(
    filters?: ShoppingListFilters
  ): Observable<PaginatedResponse<ShoppingList>> {
    let params = new HttpParams();
    if (filters?.userId) params = params.set('userId', filters.userId);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.q) params = params.set('q', filters.q);
    if (filters?.page) params = params.set('page', String(filters.page));
    if (filters?.pageSize)
      params = params.set('pageSize', String(filters.pageSize));
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);
    if (filters?.orderDir) params = params.set('orderDir', filters.orderDir);

    const obs = this.http
      .get<PaginatedResponse<ShoppingList>>(this.baseUrl, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          // Update signal with the lists
          this.allShoppingLists.set(res.data.lists);
          return res;
        })
      );

    return obs;
  }

  /**
   * Retrieves all shopping lists for a specific user.
   * @param userId User ID
   * @param status Optional status filter
   * @returns Observable emitting the user's shopping lists
   */
  getByUserId(
    userId: string,
    status?: 'active' | 'completed' | 'archived'
  ): Observable<ShoppingList[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);

    return this.http
      .get<ApiEnvelope<{ lists: ShoppingList[] }>>(
        `${this.baseUrl}user/${userId}`,
        {
          params,
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ lists: ShoppingList[] }>(res).lists));
  }

  /**
   * Retrieves active shopping lists for a specific user.
   * Also updates the `activeShoppingLists` signal.
   * @param userId User ID
   * @returns Observable emitting active shopping lists
   */
  getActiveByUserId(userId: string): Observable<ShoppingList[]> {
    const obs = this.http
      .get<ApiEnvelope<{ lists: ShoppingList[] }>>(
        `${this.baseUrl}user/${userId}/active`,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ lists: ShoppingList[] }>(res).lists));

    obs.subscribe((lists) => this.activeShoppingLists.set(lists));
    return obs;
  }

  /**
   * Retrieves shopping list statistics for a specific user.
   * Also updates the `stats` signal.
   * @param userId User ID
   * @returns Observable emitting statistics
   */
  getStatsByUserId(userId: string): Observable<ShoppingListStats> {
    const obs = this.http
      .get<ApiEnvelope<{ stats: ShoppingListStats }>>(
        `${this.baseUrl}user/${userId}/stats`,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ stats: ShoppingListStats }>(res).stats));

    obs.subscribe((stats) => this.stats.set(stats));
    return obs;
  }

  /**
   * Retrieves a single shopping list by its ID.
   * Also updates the `currentShoppingList` signal.
   * @param id Shopping list ID
   * @returns Observable emitting the shopping list
   */
  getById(id: string): Observable<ShoppingList> {
    const obs = this.http
      .get<ApiEnvelope<{ list: ShoppingList }>>(`${this.baseUrl}${id}`, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));

    obs.subscribe((list) => this.currentShoppingList.set(list));
    return obs;
  }

  /**
   * Updates a shopping list.
   * @param id Shopping list ID
   * @param input Update data
   * @returns Observable emitting the updated shopping list
   */
  updateShoppingList(
    id: string,
    input: UpdateShoppingListInput
  ): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${id}`,
        input,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Deletes a shopping list.
   * @param id Shopping list ID
   * @returns Observable emitting success status
   */
  deleteShoppingList(id: string): Observable<boolean> {
    return this.http
      .delete<ApiEnvelope<{ success: boolean }>>(`${this.baseUrl}${id}`, {
        withCredentials: true,
      })
      .pipe(map((res) => this.unwrap<{ success: boolean }>(res).success));
  }

  /**
   * Adds an item to a shopping list.
   * @param listId Shopping list ID
   * @param item Item data
   * @returns Observable emitting the updated shopping list
   */
  addItem(listId: string, item: AddItemInput): Observable<ShoppingList> {
    return this.http
      .post<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${listId}/items`,
        item,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Removes an item from a shopping list.
   * @param listId Shopping list ID
   * @param itemId Item ID
   * @returns Observable emitting the updated shopping list
   */
  removeItem(listId: string, itemId: string): Observable<ShoppingList> {
    return this.http
      .delete<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${listId}/items/${itemId}`,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Updates an item in a shopping list.
   * @param listId Shopping list ID
   * @param itemId Item ID
   * @param updates Update data
   * @returns Observable emitting the updated shopping list
   */
  updateItem(
    listId: string,
    itemId: string,
    updates: UpdateItemInput
  ): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${listId}/items/${itemId}`,
        updates,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Updates the status of an item in a shopping list.
   * @param listId Shopping list ID
   * @param itemId Item ID
   * @param status New status ('pending' or 'in_cart')
   * @returns Observable emitting the updated shopping list
   */
  updateItemStatus(
    listId: string,
    itemId: string,
    status: 'pending' | 'in_cart'
  ): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${listId}/items/${itemId}/status`,
        { status },
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Marks a shopping list as completed.
   * @param id Shopping list ID
   * @returns Observable emitting the updated shopping list
   */
  markAsCompleted(id: string): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${id}/complete`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Marks a shopping list as archived.
   * @param id Shopping list ID
   * @returns Observable emitting the updated shopping list
   */
  markAsArchived(id: string): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${id}/archive`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Marks a shopping list as active.
   * @param id Shopping list ID
   * @returns Observable emitting the updated shopping list
   */
  markAsActive(id: string): Observable<ShoppingList> {
    return this.http
      .patch<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${id}/activate`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }

  /**
   * Duplicates an existing shopping list.
   * @param id Original shopping list ID
   * @param input Duplication parameters
   * @returns Observable emitting the new shopping list
   */
  duplicateShoppingList(
    id: string,
    input: DuplicateShoppingListInput
  ): Observable<ShoppingList> {
    return this.http
      .post<ApiEnvelope<{ list: ShoppingList }>>(
        `${this.baseUrl}${id}/duplicate`,
        input,
        {
          withCredentials: true,
        }
      )
      .pipe(map((res) => this.unwrap<{ list: ShoppingList }>(res).list));
  }
}
