'use client'

import EmojiPicker, { Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface IconPickerProps {
  onChange: (icon: string) => void; // Una función que se llamará cuando el usuario seleccione un icono.
  children: React.ReactNode;        // Los hijos del componente.
  asChild?: boolean;                // Un valor booleano que indica si el componente debe renderizarse como un hijo de su padre.
};

const IconPicker = ({ onChange, children, asChild }: IconPickerProps) => {
  
  const { resolvedTheme } = useTheme();                                     // resolvedTheme es un objeto que contiene el theme activado en el sistema
  const currentTheme = (resolvedTheme || "light") as keyof typeof themeMap  // El tema activo se se convierte a un tipo definido en themeMap
  const themeMap = {                                                        // themeMap es un tipado que define los temas disponibles.
    "dark": Theme.DARK,
    "light": Theme.LIGHT
  };
  const theme = themeMap[currentTheme];                                     // devuelve el tema actual, según el tipado y el theme activado en el sistema.

  return (
    
    <Popover>
      <PopoverTrigger asChild={asChild}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-full border-none shadow-none">
        <EmojiPicker
          height={350}
          theme={theme}
          onEmojiClick={(data) => onChange(data.emoji)}
        />
      </PopoverContent>
    </Popover>  
    
  )
}

export default IconPicker