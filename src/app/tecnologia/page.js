import MainLayout from "@/components/MainLayout";
import TecnologiaSection from "@/components/sections/TecnologiaSection";

export const metadata = {
  title: "Tecnología | SPP Labs",
  description: "Bases de datos ultra-rápidas, aceleración por hardware y orquestación de inteligencia artificial ejecutadas en nuestros servidores de SPP labs.",
};

export default function TecnologiaPage() {
  return (
    <MainLayout activePage="tecnologia">
      <TecnologiaSection />
    </MainLayout>
  );
}
