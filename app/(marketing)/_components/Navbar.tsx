"use client"

import { useScrollTop } from '@/hooks/use-scroll-top'
import { cn } from '@/lib/utils';
import React from 'react'
import Logo from './logo';
import { ModeToggle } from '@/components/mode-toggle';
import { useConvexAuth } from 'convex/react';
import { SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';
import Link from 'next/link';

const Navbar = () => {

   const scrolled = useScrollTop();
   const { isAuthenticated, isLoading } = useConvexAuth();

   return (
      <div className={cn(
         "z-50 bg-background dark:bg-[#1F1F1F] fixed top-0 flex items-center w-full p-6",
         scrolled && "border-b shadow-sm"
      )}>
         <Logo />
         {/* ml-auto: este elemento se desplazará hacia la derecha tanto como sea posible dentro de su contenedor sin superponerse a otros  */}
         <div className='md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2'>
            
            {isLoading && (
               <Spinner />   
            )}
            
            {!isAuthenticated && !isLoading && (
               <>
                  <SignInButton mode="modal">
                     <Button variant="ghost" size="sm">
                        Log in
                     </Button>
                  </SignInButton>
                  <SignInButton mode="modal">
                     <Button size="sm">
                        Get Jotion Free
                     </Button>
                  </SignInButton>
               </>   
            )}

            {isAuthenticated && !isLoading && (
               <>
                  <Button variant="ghost" size="sm" asChild>
                     <Link href="/documents">
                        Enter Jotion
                     </Link>
                  </Button>
                  <UserButton afterSignOutUrl='/'/>
               </>   
            )}

            <ModeToggle />
         </div>
      </div>
   )
}

export default Navbar