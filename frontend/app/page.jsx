import Header from "./components/Header";
import Cards from "./components/Cards";

export default function HomePage() {
  return (
    <>
      <Header />
      <div class="container m-auto grid grid-cols-3 gap-4">
        <Cards />
        <Cards />
        <Cards />
        <Cards />
        <Cards />
        <Cards />
      </div>
    </>
  );
}
