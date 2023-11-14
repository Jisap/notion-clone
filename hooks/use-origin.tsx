import { useEffect, useState } from "react";

export const useOrigin = () => {

  const [mounted, setMounted] = useState(false);
  const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return "";
  }

  return origin;
};

// Si window está definido y tiene la propiedad location.origin, entonces origin toma el valor de window.location.origin;
// de lo contrario, se establece en una cadena vacía.
// Este hook se utiliza para obtener el origen de la ventana (window.location.origin) 