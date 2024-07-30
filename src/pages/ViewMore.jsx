import { useSelector } from "react-redux";
import Services from "../components/Services";

const ViewMore = () => {
  const { servicesToShow } = useSelector((state) => state.app);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="container mx-auto px-4 py-4 flex-grow">
        <Services items={servicesToShow} />
      </main>
    </div>
  );
};

export default ViewMore;
