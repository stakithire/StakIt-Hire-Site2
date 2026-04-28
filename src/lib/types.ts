

import type { FieldValue, Timestamp } from 'firebase/firestore';

export type PricingBundle = {
  id: string;
  name: string;
  description: string;
  contents: string[];
  price: number;
  followOnPrice: number;
};

export type QuoteRequest = {
  projectDescription?: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    type?: 'hire' | 'purchase';
    followOnPrice?: number;
    sizes?: string[];
  }[];
  rentalStartDate: string;
  rentalEndDate: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Completed' | 'Paid' | 'Delivered';
  submittedDate: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  dropOffAddress?: string;
  collectionAddress?: string;
  stakitShield?: boolean;
  deliveryConfirmationTimestamp?: string;
  damagedCrates?: number;
};

export type QuoteRequestWithId = QuoteRequest & { id: string };

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  submittedDate: string;
  status: 'New' | 'Read' | 'Archived';
};

export type ContactMessageWithId = ContactMessage & { id: string };


export type Service = {
  id: string;
  name: string;
  description: string;
  price?: number;
  priceString?: string; // For special cases like '3 for $10'
  hirePrice?: number;
  followOnPrice?: number;
  hirePriceString?: string;
  purchasePrice?: number;
  purchasePriceString?: string;
  unit?: string;
  isFrom?: boolean; // To indicate 'from $X'
  boxCount?: number;
  trackInventory?: boolean; // Flag for items to be tracked individually
  group?: string; // To group items with different sizes/options
  sizeOptions?: string[];
};

export type ProtectionBundle = {
  id: string;
  name: string;
  included: string;
  hirePrice: string;
  purchasePrice: string;
};

export type CarouselItem = {
  id: string;
  name:string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type InventoryItem = {
  id: string; // The document ID (e.g. 'crates' or a service ID)
  name: string;
  quantity: number;
  type: 'crate_pool' | 'item';
};

export type OrderEvidence = {
  url: string;
  fileName: string;
  mimeType: string;
  category: 'drop-off' | 'collection' | 'damage' | 'report';
  uploadedAt: string | Timestamp | FieldValue;
  uploadedBy: string; // Admin UID
};

export type OrderEvidenceWithId = OrderEvidence & { id: string };

export type InventoryActivity = {
  date: string | Timestamp | FieldValue;
  type: 'add' | 'retire' | 'initial_stock';
  itemId: string; // e.g., 'crates'
  quantity: number;
  notes?: string;
  adminId: string;
};

export type InventoryActivityWithId = InventoryActivity & { id: string };
