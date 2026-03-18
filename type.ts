export type Id = string;
export type ISODateString = string;

export enum Role {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN",
    STAFF = "STAFF",
}

export enum Category {
    PIZZA = "PIZZA",
    DRINK = "DRINK",
    CHICKEN = "CHICKEN",
    APPETIZER = "APPETIZER",
    COMBO = "COMBO",
}

export enum OrderStatus {
    PENDING = "PENDING",
    PREPARING = "PREPARING",
    DELIVERING = "DELIVERING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
    CASH = "CASH",
    ONLINE = "ONLINE",
}

export interface User {
    id: Id;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    hashedPassword?: string | null;
    role: Role;
    orders?: Order[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface Product {
    id: Id;
    category: Category;
    name: string;
    slug: string;
    desc: string;
    img: string;
    price: number;
    isAvailable: boolean;
    isNew: boolean;
    isBestSeller: boolean;
    pizzaDetails?: PizzaDetails | null;
    drinkDetails?: DrinkDetails | null;
    comboDetails?: ComboDetails | null;
    tags: ProductTag[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface ProductTag {
    name: string;
    code: string;
    color: string;
}

export interface PizzaTag {
    id: Id;
    name: string;
    code: string;
    color: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface PizzaDetails {
    sizes: string[];
    crusts: string[];
    variants: PizzaVariant[];
}

export interface PizzaSize {
    id: Id;
    name: string;
    code: string;
}

export interface PizzaCrust {
    id: Id;
    name: string;
    code: string;
    availableSizes: string[];
    isAvailable: boolean;
}

export interface PizzaVariant {
    size: string;
    crust: string;
    price: number;
    sku: string;
    isAvailable: boolean;
}

export interface DrinkDetails {
    volume: string;
    brand?: string | null;
}

export interface ComboDetails {
    slots: ComboSlot[];
}

export interface ComboSlot {
    name: string;
    quantity: number;
    options: ComboOption[];
}

export interface ComboOption {
    productId: Id;
    productName: string;
    sizeRequirement?: string | null;
}

export interface Order {
    id: Id;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    userId?: Id | null;
    user?: User | null;
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    isPaid: boolean;
    orderItems: OrderItem[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

export interface OrderItem {
    productId: Id;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    selectedOptions: SelectedOption[];
}

export interface SelectedOption {
    k: string;
    v: string;
    productId?: Id | null;
    sku: string;
    subOptions: SubOption[];
}

export interface SubOption {
    name: string;
    value: string;
    price: number;
}