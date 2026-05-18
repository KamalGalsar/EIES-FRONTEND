// Frontend/src/pages/users/Contact.tsx

// Update soon
import { useEffect } from "react";
import EmptyPage from "./EmptyPage";

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <EmptyPage title="Contact" />;
}