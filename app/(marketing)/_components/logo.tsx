import Image from "next/image"
import { cn } from "@/lib/utils"
import { Poppins } from "next/font/google"


const font = Poppins({
   subsets: ["latin"],
   weight: ["400", "600"]
});

const Logo = () => {
   return (
      <div className="hidden md:flex items-center gap-x-2">
         <Image 
            src="/logo.svg"
            height="40"
            width="40"
            alt="Logo"
            className="dark:hidden" // Si el tema es dark esta oculto
         />
         <Image
            src="/logo-dark.svg"
            height="40"
            width="40"
            alt="Logo"
            className="hidden dark:block" // por defecto hidden pero si el theme es dark aparece
         />
         <p className={cn("font-semibold", font.className)}>
            Jotion
         </p>
      </div>
   )
}

export default Logo