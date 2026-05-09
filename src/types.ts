export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderResponse {
  success: boolean;
  orderId: string;
  estimatedTime: string;
  message: string;
}

export interface ActiveOrder {
  id: string;
  items: CartItem[];
  timestamp: string;
  status: 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Received';
  estimatedArrival: string;
  isDelivered?: boolean;
  isConfirmed?: boolean;
  deliveredAt?: number;
  seatNumber?: string;
}
