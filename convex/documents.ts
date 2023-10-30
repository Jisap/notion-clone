import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from  "./_generated/dataModel";
import { normalize } from "path";



export const create = mutation({
    args:{
        title: v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async( ctx, args ) => {

        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });

        return document; // Solo devuelve el id
    }
})

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))           // Documento padre 
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db                               // Buscamos en la base de datos
            .query("documents")                                      // dentro de la tabla documents       
            .withIndex("by_user_parent", (q) =>                      // con el índice que ordena los documentos por usuario y documento padre.
                q                                                    // aquellos documentos
                    .eq("userId", userId)                            // con un usuario_id
                    .eq("parentDocument", args.parentDocument)       // que pertenezcan a un documento padre   
            )
            .filter((q) =>
                q.eq(q.field("isArchived"), false)                   // filtrando aquellos documents que esten archivados
            )
            .order("desc")                                           // y ordenados de forma descendente
            .collect()
        
        return documents;

    },
});

export const archive = mutation({ // Con esta función queremos modificar la prop isArchive a true en la bd de un determinado documento
    
    args: { 
        id: v.id("documents")       
    },
    handler: async ( ctx, args ) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);         // Se comprueba que el documento existia en la db
    
        if(!existingDocument){
            throw new Error("Not found");
        }

        if(existingDocument.userId !== userId){                     // Se comprueba que el documento pertenece a su creador
            throw new Error("Unauthorized");
        }

        const recursiveArchive = async( documentId: Id<"documents"> ) => { // se recibe el id del documento padre
            const children = await ctx.db
                .query("documents")                                        // petición a la tabla de "documents"
                .withIndex("by_user_parent", (q) => (                      // usando el índice de orden por usuario y documento padre 
                    q                                                      // para obtener los documentos 
                        .eq("userId", userId)                              // correspondiente al usuario creador 
                        .eq("parentDocument", documentId)                  // y al id del documento padre 
                ))
                .collect();
            for (const child of children){                                 // Esos documentos se pasarán por un loop
                await ctx.db.patch(child._id, {                            // y se les actualizará 
                    isArchived: true                                       // la prop isArchive 
                });

                await recursiveArchive(child._id);
            }
        }

        const document = await ctx.db.patch(args.id, {    // Se actualiza en el documento la prop isArchived como true
            isArchived: true,
        });

        recursiveArchive(args.id); // También se actualizan en todos los documentos hijos la prop isArchive

        return document;
    }
})