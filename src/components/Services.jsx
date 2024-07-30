/* eslint-disable react/prop-types */
import { useState } from "react";
import "../styles/Services.css";

const Services = ({ items = [] }) => {
  // State to manage the selected item for displaying popup details
  const [selectedItem, setSelectedItem] = useState(null);

  // Handle item click to show the popup with item details
  const handleItemClick = (item, e) => {
    e.preventDefault();
    setSelectedItem(item);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  // Handle closing the popup
  const handleClose = () => {
    setSelectedItem(null);
    document.body.style.overflow = "auto"; // Restore background scrolling
  };

  return (
    <section className="services-cards-container">
      <div className="services-cards">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`services-card services-card--${index + 1}`}
            onClick={(e) => handleItemClick(item, e)}
          >
            <div className="services-card__info-hover">
              <div className="services-card__clock-info">
                <span className="services-card__time">{item.duration}</span>
              </div>
            </div>
            <div className="services-card__img"></div>
            <a href="#" className="services-card_link">
              <div
                className="services-card__img--hover rounded"
                style={{ backgroundImage: `url(${item.image})` }}
              ></div>
            </a>

            <div className="services-card__info">
              <span className="services-card__category">${item.price}</span>
              <h3 className="services-card__title">{item.name}</h3>
            </div>
          </article>
        ))}
      </div>

      {selectedItem && (
        <div className="services-popup" onClick={handleClose}>
          <div
            className="services-popup-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing popup when clicking inside content
          >
            <h2 className="services-popup-title">{selectedItem.name}</h2>
            <span className="services-popup-duration">
              {selectedItem.duration}
            </span>
            <br />
            <span className="services-popup-price">${selectedItem.price}</span>
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="services-popup-img"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
