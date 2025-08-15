import { create } from 'zustand';

export interface Product {
  productName: string;
  price: number;
  brand: string;
  type: string;
  imageUrl: string;
  buyLink: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  routineGenerated: boolean;
  setProducts: (products: Product[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setRoutineGenerated: (generated: boolean) => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,
  routineGenerated: false,
  setProducts: (products) => set({ products }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setRoutineGenerated: (routineGenerated) => set({ routineGenerated }),
  clearProducts: () => set({ products: [], routineGenerated: false }),
}));
