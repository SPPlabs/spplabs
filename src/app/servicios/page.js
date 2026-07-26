import MainLayout from "@/components/MainLayout";
import ServiciosSection from "@/components/sections/ServiciosSection";

export const metadata = {
  title: "Servicios | SPP Labs",
  description: "Diseñamos aplicaciones web, arquitecturas analíticas y sistemas de soporte inteligente que aceleran y aseguran la operación digital de su negocio.",
};

export default function ServiciosPage() {
  return (
    <MainLayout activePage="servicios">
      <ServiciosSection />
    </MainLayout>
  );
}
