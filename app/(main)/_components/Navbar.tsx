'use client'

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";
import { useParams } from "next/navigation";

interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}

const Navbar = ({ isCollapsed, onResetWidth }:NavbarProps) => {

  const params = useParams()

  const document = useQuery(api.documents.getById, {
    documentId: params.documentId as Id<"documents">,
  });

  if(document === undefined){
    return <p>Loading...</p>
  }

  if(document === null){
    return null;
  }

  return (
    <>
      <nav className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full flex items-center justify-between">
        {
          isCollapsed && (
            <MenuIcon 
              role="button"
              onClick={onResetWidth}
              className="h-6 w-6 text-muted-foreground"
            />  
          )
        }
        <div className="flex items-center justify-center w-full">
            Navbar
        </div>
      </nav>
    </>
  )
}

export default Navbar