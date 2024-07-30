import { useState, useEffect, useRef, useCallback } from "react";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import sliderImage1 from "./../assets/slider_img_1.jpg";
import sliderImage2 from "./../assets/slider_img_2.jpg";

const Offers = () => {
  const offers = [sliderImage1, sliderImage2];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef();

  const prevSlide = useCallback(() => {
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? offers.length - 1 : prevIndex - 1
    );
  }, [offers.length]);

  const nextSlide = useCallback(() => {
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === offers.length - 1 ? 0 : prevIndex + 1
    );
  }, [offers.length]);

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 3000);

    return () => clearInterval(intervalRef.current);
  }, [nextSlide]);

  useEffect(() => {
    const handleAnimationEnd = () => setIsAnimating(false);
    if (isAnimating) {
      const timer = setTimeout(handleAnimationEnd, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleManualSlide = (direction) => {
    clearInterval(intervalRef.current);
    direction === "next" ? nextSlide() : prevSlide();
    intervalRef.current = setInterval(nextSlide, 3000);
  };

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-4 z-10">
        <button
          className="absolute left-8"
          onClick={() => handleManualSlide("prev")}
        >
          <MdArrowBackIos size={24} />
        </button>
        <button
          className="absolute right-8"
          onClick={() => handleManualSlide("next")}
        >
          <MdArrowForwardIos size={24} />
        </button>
      </div>
      <div className="flex justify-center items-center relative h-full">
        {offers.map((offer, index) => (
          <div
            key={index}
            className={`absolute transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              height: "60vh",
              width: "90%",
            }}
          >
            <img
              src={offer}
              alt={`Offer ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
