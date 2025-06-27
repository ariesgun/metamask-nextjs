import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col mx-auto justify-between w-full min-h-screen px-3">
      <NavBar />
      <div className="p-24 mx-auto">
        <p>Hello World!</p>
        <p>Hello World!</p>
      </div>
      <Footer />
    </main>
  );
}
