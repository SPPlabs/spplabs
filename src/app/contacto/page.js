import MainLayout from "@/components/MainLayout";
import ContactoSection from "@/components/sections/ContactoSection";

export const metadata = {
  title: "Contacto | SPP Labs",
  description: "Agende una cita de consultoría técnica o envíenos un mensaje directamente a SPP Labs.",
};

export default function ContactoPage() {
  return (
    <MainLayout activePage="contacto">
      <ContactoSection />
    </MainLayout>
  );
}
