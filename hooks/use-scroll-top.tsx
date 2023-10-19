import { useEffect, useState } from "react";



export const useScrollTop = (threshold = 10) => {

   const [scrolled, setScrolled] = useState(false);

   useEffect(() => {

      const handleScroll = () => {
         if(window.scrollY > threshold){ // Si el scroll > de un determinado tamaño
            setScrolled(true);           // scrolled = true      
         }else{
            setScrolled(false);          // sino scrolled = false 
         }
      }

      window.addEventListener("scroll", handleScroll);                  // listener para el evento scroll, activa handleScroll
      return () => window.removeEventListener("scroll", handleScroll)   // limpieza del listener
   }, [threshold])

   return scrolled;
}