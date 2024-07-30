/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

const Category = ({ items, onCategorySelect }) => {
  // State to manage the active link (selected category)
  const [activeLink, setActiveLink] = useState(null);

  // Default to "All" category on initial render if no category is selected
  useEffect(() => {
    if (activeLink === null) {
      onCategorySelect("all");
    }
  }, [activeLink, onCategorySelect]);

  // Handle link click to toggle the active category
  const handleLinkClick = (index, categoryId) => {
    if (activeLink === index) {
      setActiveLink(null);
      onCategorySelect(null); // Deselect category
    } else {
      setActiveLink(index);
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="w-full mb-10 mt-2">
      {/* Desktop and larger screen layout */}
      <div className="w-full flex justify-center">
        <div className="w-full bg-white border shadow-lg px-4 py-1 flex flex-wrap justify-around items-center transition-transform duration-500 ease-in-out">
          {/* Button for "All" category */}
          <div className="flex items-center m-2">
            <button
              data-id="all"
              className={`p-2 shadow-lg border rounded transition-transform ${
                activeLink === null ? "bg-gray-400 transform scale-110" : ""
              } hover:text-black hover:bg-gray-300 ${
                activeLink !== null ? "opacity-75" : ""
              }`}
              onClick={() => handleLinkClick(null, "all")}
              onDoubleClick={() => handleLinkClick(null, "all")}
            >
              All
            </button>
          </div>
          {/* Buttons for each category */}
          {items.map((category, index) => (
            <div key={category.id} className="flex items-center m-2">
              <button
                data-id={category.id}
                className={`p-2 shadow-lg border rounded transition-transform ${
                  activeLink === index ? "bg-gray-400 transform scale-110" : ""
                } hover:text-black hover:bg-gray-300 ${
                  activeLink !== null && activeLink !== index
                    ? "opacity-75"
                    : ""
                }`}
                onClick={() => handleLinkClick(index, category.id)}
                onDoubleClick={() => handleLinkClick(index, category.id)}
              >
                {category.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;
