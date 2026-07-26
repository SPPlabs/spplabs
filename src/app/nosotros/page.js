import MainLayout from "@/components/MainLayout";
import NosotrosSection from "@/components/sections/NosotrosSection";

export const metadata = {
  title: "Nosotros | SPP Labs",
  description: "En SPP Labs ayudamos a empresas a crecer mediante soluciones digitales que combinan diseño web premium, inteligencia artificial y automatización.",
};

export default function NosotrosPage() {
  return (
    <MainLayout activePage="nosotros">
      <NosotrosSection />
    </MainLayout>
  );
}
