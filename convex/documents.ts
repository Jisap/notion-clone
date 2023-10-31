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

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db
            .query("documents")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) =>
                q.eq(q.field("isArchived"), true), // Se seleccionan los documentos que tienen isArchived en true
            )
            .order("desc")
            .collect();

        return documents;
    }
});


export const restore = mutation({

    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

                                         // doc ppal           
        const recursiveRestore = async (documentId: Id<"documents">) => {  // Se utiliza para restaurar documentos que estan relacionados jerarquicamente con el doc ppal
            
            const children = await ctx.db                                  // documentos que estan relacionados jerarquicamente con el doc ppal (children)
                .query("documents")                                        // Buscamos en la tabla documents         
                .withIndex("by_user_parent", (q) => (                      // usando el índice "by_user_parent"  
                    q                                                      
                        .eq("userId", userId)                              //  aquellos childrens que pertenecen al mismo usuario
                        .eq("parentDocument", documentId)                  // y tienen como doc.padre el id del doc.ppal
                ))
                .collect();

            for (const child of children) {                                // Se iteran los childrens 
                await ctx.db.patch(child._id, {                            // y se actualiza en cada uno la propiedad isArchived=false 
                    isArchived: false,                                     // lo que indica que el documento secundario ya no esta archivado 
                });

                await recursiveRestore(child._id);                         // Luego, se llama de manera recursiva a la función recursiveRestore(child._id)  
            }                                                              // para procesar cualquier documento secundario que pueda tener a su vez otros documentos secundarios. 
        }

        const options: Partial<Doc<"documents">> = { // Establecemos como se actualizará el doc ppal (type Doc con todas las props opcionales)
            isArchived: false,
        };

        if (existingDocument.parentDocument) {                                  // se verifica si el documento principal tiene un "parentDocument" (documento padre)
            const parent = await ctx.db.get(existingDocument.parentDocument);   // Si lo tiene, se intenta obtener el documento padre de la base de datos
            if (parent?.isArchived) {                                           // se verifica si el documento padre existe (parent) y si está archivado 
                options.parentDocument = undefined;                             // Si lo esta se modifica el objeto options eliminando la ref a ese doc padre
            }
        }

        const document = await ctx.db.patch(args.id, options);  // Se actualiza el doc ppal estableciendo isArchived=false y elimina la ref al padre si corresponde

        recursiveRestore(args.id);  // Se inicia el proceso de restauración recursiva de los docs secundarios

        return document;    //  Finalmente se devuelve el documento principal actualizado como resultado de la operación de restauración.
    }
});

export const remove = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.delete(args.id);

        return document;
    }
});
