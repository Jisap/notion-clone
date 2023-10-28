'use client'

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getSidebar } from '../../../convex/documents';
import { api } from "@/convex/_generated/api";
import Item from "./item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[];
};

const DocumentList = ({ parentDocumentId, level=0 }: DocumentListProps) => {

  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {    // Se llama cuando el usuario hace click en un documento para expandirlo
    setExpanded(prevExpanded => ({              // setExpanded    
      ...prevExpanded,                          // spread del estado anterior
      [documentId]: !prevExpanded[documentId]   // se actualiza el documento que se pulsa al contrario de su boolean
    }))
  }

  const documents = useQuery(api.documents.getSidebar, { // documentos por usuario y documento padre
    parentDocument: parentDocumentId
  });

  const onRedirect = (documentId: string) => {  // redirección al documento que queremos abrir
    router.push(`/documents/${documentId}`);
  };

  if(documents === undefined){
    return(
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>  
    )
  }

  return (
    <>
      <p 
        style={{
          paddingLeft: level ? `${(level * 12) + 25}px` : undefined
        }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block",
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>

      {documents.map((document) => (
        <div key={document._id}>
            <Item
              id={document._id}
              onClick={() => onRedirect(document._id)}
              label={document.title}
              icon={FileIcon}
              documentIcon={document.icon}
              active={params.documentId === document._id}
              level={level}
              onExpand={() => onExpand(document._id)}
              expanded={expanded[document._id]}
            />
            {expanded[document._id] && (
              <DocumentList                             // Componente recursivo
                parentDocumentId={document._id}
                level={level + 1}
              />  
            )}
        </div>  
      ))}
    </>
  )
}

export default DocumentList