import { create } from "zustand";

type CoverImageStore = {
    url?: string;
    isOpen: boolean;    // Indicará si esta o no abierto el modal
    onOpen: () => void;
    onClose: () => void;
    onReplace: (url: string) => void;
};

export const useCoverImage = create<CoverImageStore>((set) => ({ // Estado para edgeStore
    url: undefined,
    isOpen: false,
    onOpen: () => set({ isOpen: true, url: undefined }),
    onClose: () => set({ isOpen: false, url: undefined }),
    onReplace: (url: string) => set({ isOpen: true, url }) // Establece {isOpen:true, url con la imagen que estaba} -> abre el coverImageModal para cambiarla
}));