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