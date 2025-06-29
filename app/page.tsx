import EIP7702Section from "@/components/EIP7702Section";
import Footer from "@/components/Footer";
import MainSection from "@/components/MainSection";
import NavBar from "@/components/NavBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  return (
    <main className="flex flex-col mx-auto w-full min-h-screen px-3">
      <NavBar />
      <div className="flex-1 p-12">
        <Tabs defaultValue="circlewallet">
          <TabsList>
            <TabsTrigger className="text-md" value="circlewallet">Standard</TabsTrigger>
            <TabsTrigger className="text-md" value="eip7702">EIP-7702 Smart Account</TabsTrigger>
          </TabsList>
          <TabsContent value="circlewallet">
            <MainSection />
          </TabsContent>
          <TabsContent value="eip7702">
            <EIP7702Section />
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </main>
  );
}
