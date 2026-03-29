"use client";

import { useEffect, useState } from "react";

export default function TopBarSpacer() {
  // h-10 (40px) banner + h-16 (64px) header = 104px
  const [height, setHeight] = useState(104);

  useEffect(() => {
    const handler = () => setHeight(64);
    document.addEventListener("banner:dismiss", handler);
    return () => document.removeEventListener("banner:dismiss", handler);
  }, []);

  return <div style={{ height }} />;
}
