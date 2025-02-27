// Stationery Product Interface
export interface TProduct {
  brand: string;
  model: string;
  year: number;
  price: number;
  category: "Sedan" | "SUV" | "Truck" | "Coupe" | "Convertible";
  description: string;
  quantity: number;
  stock?: boolean;
  inStock: number;
  photo: string;
}
