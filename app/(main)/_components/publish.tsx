"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Check, Copy, Globe } from "lucide-react";

import { Doc } from "@/convex/_generated/dataModel";
import {
    PopoverTrigger,
    Popover,
    PopoverContent
} from "@/components/ui/popover"
//import { useOrigin } from "@/hooks/use-origin";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/hooks/use-origin";

interface PublishProps {
    initialData: Doc<"documents">
};

const Publish = ({ initialData }: PublishProps) => {

  const origin = useOrigin();
  const update = useMutation(api.documents.update);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const url = `${origin}/preview/${initialData._id}`;

  return (
    <div>Publish</div>
  )
}

export default Publish