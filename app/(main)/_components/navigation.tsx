"use client"

import { cn } from "@/lib/utils";
import { ChevronsLeft, MenuIcon } from "lucide-react"
import { usePathname } from "next/navigation";
import { ElementRef, useEffect, useRef, useState } from "react"
import { useMediaQuery } from "usehooks-ts";
import UserItem from "./user-item";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";



const Navigation = () => {

   const pathname = usePathname();

   const isMobile = useMediaQuery("(max-width: 768px)");

   const documents = useQuery(api.documents.get);

   const isResizingRef = useRef(false);
   const sidebarRef = useRef<ElementRef<"aside">>(null);
   const navbarRef = useRef<ElementRef<"div">>(null);

   const[isResetting, setIsResetting] = useState(false);
   const [isCollapsed, setIsCollapsed] = useState(isMobile);


   useEffect(() => {
      if (isMobile) {
         collapse();
      } else {
         resetWidth();
      }
   }, [isMobile]);

   useEffect(() => {
      if (isMobile) {
         collapse();
      }
   }, [pathname, isMobile]);

   const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      event.stopPropagation();

      isResizingRef.current = true;
      document.addEventListener("mousemove", handleMouseMove) // Cambia el ancho del sidebar y el navbar
      document.addEventListener("mouseup", handleMouseUp)     // Se deja de escuchar los cambios de ancho 
   };

   const handleMouseMove = (event:MouseEvent) => { // Se mueve el ratón
      if(!isResizingRef.current) return;
      let newWidth = event.clientX;                // obtenemos la nueva posición del raton en x

      if(newWidth < 240 ) newWidth = 240;          // Límite nueva posición para x < 240 
      if(newWidth > 480 ) newWidth = 480;          // Límite para nueva posición para x > 480

      if(sidebarRef.current && navbarRef.current){                      // Si estas refs tienen un ancho
         sidebarRef.current.style.width = `${newWidth}px`;              // sidebarRef tendrá el ancho que defina el ratón
         navbarRef.current.style.setProperty("left", `${newWidth}px`);  // navbarRef tendrá el margen izdo en la nueva posición de x
         navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`)
      }
   };

   const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
   };

   const resetWidth = () => { // Se llama en pantallas de !isMobile, click separador, y icon de isMobile

      if( sidebarRef.current && navbarRef.current){
         setIsCollapsed(false);
         setIsResetting(true);

         sidebarRef.current.style.width = isMobile ? "100%" : "240px"
         navbarRef.current.style.setProperty(
            "width",
            isMobile ? "0" : "calc(100% -240px)"   // Si estamos mobile navbar tendrá width=0 -> se oculta, sino 100% - 240px
         );
         navbarRef.current.style.setProperty(      
            "left",
            isMobile ? "100%" : "240px"            // Si estamos en mobile el margen izquierdo se pone al 100% -> se oculta 
         );
         setTimeout(() => setIsResetting(false), 300);
      }
   }

   const collapse = () => {
      if (sidebarRef.current && navbarRef.current) {
         setIsCollapsed(true);
         setIsResetting(true);

         sidebarRef.current.style.width = "0";
         navbarRef.current.style.setProperty("width", "100%");
         navbarRef.current.style.setProperty("left", "0");
         setTimeout(() => setIsResetting(false), 300);
      }
   }

   return (
      <>
         <aside
            ref={sidebarRef}
            className={cn(
               "group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[9999]",
               isResetting && "transition-all ease-in-out duration-300",
               isMobile && "w-0"   
            )}
         >
            <div
               role="button"
               onClick={collapse}
               className={cn("h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
               isMobile && "opacity-100"
               )}
            >
               <ChevronsLeft className="h-6 w-6" />
            </div>
            <div>
               <UserItem />
            </div>
            <div className="mt-4">
               { documents?.map((document) =>(
                  <p key={document._id}>{document.title}</p>   
               ))}
            </div>

            {/* Barra de separación entre sidebarRef y navbarRef */}
            <div 
               onMouseDown={handleMouseDown}
               onClick={resetWidth}
               className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize
               absolute h-full w-1 bg-primary/10 right-0 top-0"
            />     
         </aside>

         <div
            ref={navbarRef}
            className={cn(
               "absolute top-0 z-[999999] left-60 w-[calc(100%-240px)]",
               isResetting && "transition-all ease-in-out duration-300",
               isMobile && "left-0 w-full"
            )}
         >
            <nav className="bg-transparent px-3 py-2 w-full">
               {isCollapsed && <MenuIcon className="h-6 w-6 text-muted-foreground" onClick={resetWidth}/>}
            </nav>
         </div>
      </>
   )
}

export default Navigation