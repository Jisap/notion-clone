"use client"

import { useScrollTop } from '@/hooks/use-scroll-top'
import { cn } from '@/lib/utils';
import React from 'react'
import Logo from './logo';
import { ModeToggle } from '@/components/mode-toggle';

const Navbar = () => {

   const scrolled = useScrollTop();

   return (
      <div className={cn(
         "z-50 bg-background fixed top-0 items-center w-full p-6",
         scrolled && "border-b shadow-sm"
      )}>
         <Logo />
         {/* ml-auto: este elemento se desplazará hacia la derecha tanto como sea posible dentro de su contenedor sin superponerse a otros  */}
         <div className='md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2'>
            <ModeToggle />
         </div>
      </div>
   )
}

export default Navbar