export interface OrderItem {
  productId: string;
  scentId: string;
  quantity: number;
  price: number;
  audioUrl?: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderForm {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export const initialOrderForm: OrderForm = {
  userId: "",
  items: [],
  shippingAddress: {
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "France",
  },
};

export const emptyOrderItem: OrderItem = {
  productId: "",
  scentId: "",
  quantity: 1,
  price: 0,
  audioUrl: undefined,
};
