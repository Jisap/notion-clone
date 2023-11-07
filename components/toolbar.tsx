"use client";

import { ElementRef, useRef, useState } from "react";
import { ImageIcon, Smile, X } from "lucide-react";
import { useMutation } from "convex/react";
import TextareaAutosize from "react-textarea-autosize";

//import { useCoverImage } from "@/hooks/use-cover-image";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import IconPicker from "./icon-picker";




interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
};

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {

  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);

  const enableInput = () => {                         // Habilita el campo de texto para editar el título del documento.
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);   // Deshabilita el campo de texto para editar el título del documento.

  const onInput = (value: string) => {              // Actualiza el valor del título del documento a medida que el usuario escribe en el campo de texto.
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Untitled"
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {  // Detecta cuando el usuario presiona la tecla Enter en el campo de texto y, en ese caso, deshabilitar el campo de texto.
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {  // Actualiza el icono del documento cuando el usuario selecciona un nuevo icono en el selector de iconos.
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {  // Elimina el icono del documento
    removeIcon({
      id: initialData._id
    })
  }

  return (
    <div className="pl-[54px] group relative">
      {/* Si hay un icon para el documento y no esta en mode preview -> mostramos iconPicker y el boton de borrar */}
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker
            onChange={onIconSelect}
          >
            <p className="text-6xl hover:opacity-75 trnasition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 trnasition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4"/>
          </Button>
        </div>  
      )}

      {/* si el documento tiene un icon y esta en modo preview -> mostramos el icon del documento*/}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">
          {initialData.icon}
        </p>  
      )}

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
      {/* Si el documento no tiene icon y no esta en modo preview -> mostramos el iconPicker */}
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {/* Si el documento no tiene coverImage y no esta en modo preview -> mostramos el boton del coverImage */}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={() => {}}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add cover
          </Button>  
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize 
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
        />
      ): (
          <div
            onClick={enableInput}
            className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF]"
          >
            {initialData.title}
          </div>
      )}
    </div>
  )
}