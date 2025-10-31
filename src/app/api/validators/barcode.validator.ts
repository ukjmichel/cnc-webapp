// src/validators/barcode.validator.ts

/**
 * =============================================================================
 * Barcode Validators
 * =============================================================================
 * Validation middleware for barcode-related routes
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/index.ts';

/**
 * Validate barcode code parameter
 */
export const vGetItemByCode = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { code } = req.params;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return next(new BadRequestError('Valid barcode code is required'));
  }

  // Basic barcode validation - typically 8-14 digits
  const trimmedCode = code.trim();
  if (!/^\d{8,14}$/.test(trimmedCode)) {
    return next(
      new BadRequestError(
        'Barcode must be a numeric string between 8 and 14 digits'
      )
    );
  }

  next();
};

/**
 * Validate batch items request
 */
export const vGetBatchItems = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { codes } = req.body;

  if (!codes) {
    return next(new BadRequestError('codes array is required'));
  }

  if (!Array.isArray(codes)) {
    return next(new BadRequestError('codes must be an array'));
  }

  if (codes.length === 0) {
    return next(new BadRequestError('codes array must not be empty'));
  }

  if (codes.length > 100) {
    return next(
      new BadRequestError('codes array must not contain more than 100 items')
    );
  }

  // Validate each code
  for (const code of codes) {
    if (typeof code !== 'string' || code.trim().length === 0) {
      return next(
        new BadRequestError('All codes must be non-empty strings')
      );
    }

    const trimmedCode = code.trim();
    if (!/^\d{8,14}$/.test(trimmedCode)) {
      return next(
        new BadRequestError(
          `Invalid barcode format: ${code}. Barcode must be a numeric string between 8 and 14 digits`
        )
      );
    }
  }

  next();
};

/**
 * Validate food data request
 */
export const vGetFoodData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { code } = req.params;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return next(new BadRequestError('Valid barcode code is required'));
  }

  const trimmedCode = code.trim();
  if (!/^\d{8,14}$/.test(trimmedCode)) {
    return next(
      new BadRequestError(
        'Barcode must be a numeric string between 8 and 14 digits'
      )
    );
  }

  next();
};

/**
 * Validate retail data request
 */
export const vGetRetailData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { code } = req.params;

  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return next(new BadRequestError('Valid barcode code is required'));
  }

  const trimmedCode = code.trim();
  if (!/^\d{8,14}$/.test(trimmedCode)) {
    return next(
      new BadRequestError(
        'Barcode must be a numeric string between 8 and 14 digits'
      )
    );
  }

  next();
};
