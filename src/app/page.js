import MainLayout from "@/components/MainLayout";
import InicioSection from "@/components/sections/InicioSection";

export const metadata = {
  title: "SPP labs | Soluciones tecnológicas para empresas",
  description: "Creamos páginas web premium integradas con CRM, automatizaciones con IA y soluciones digitales para empresas.",
};

export default function Home() {
  return (
    <MainLayout activePage="inicio">
      <InicioSection />
    </MainLayout>
  );
}
