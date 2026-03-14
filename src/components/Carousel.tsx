import type { ReactNode } from "react";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import Slider, { type Settings } from "react-slick";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

interface CarouselProps {
  children: ReactNode;
  slidesToShow?: number;
  slidesToScroll?: number;
  dots?: boolean;
  infinite?: boolean;
  speed?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  responsive?: Settings["responsive"];
  className?: string;
  [key: string]: any;
}

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className='absolute top-1/2 -right-10 z-10 cursor-pointer transform -translate-y-1/2 text-white bg-[var(--accent-primary)] p-2 rounded-full hover:bg-[var(--accent-hover)]'
    onClick={onClick}
  >
    <MdOutlineArrowForwardIos />
  </div>
);

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <div
    className='absolute top-1/2 -left-10 z-10 cursor-pointer transform -translate-y-1/2 text-white bg-[var(--accent-primary)] p-2 rounded-full hover:bg-[var(--accent-hover)]'
    onClick={onClick}
  >
    <MdOutlineArrowBackIos />
  </div>
);

const Carousel = ({
  children,
  slidesToShow = 4,
  slidesToScroll = 1,
  dots = true,
  arrows = true,
  infinite = true,
  speed = 500,
  autoplay = false,
  autoplaySpeed = 3000,
  responsive,
  className = "",
  ...rest
}: CarouselProps) => {
  const defaultResponsive = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: slidesToShow > 2 ? slidesToShow - 1 : slidesToShow,
        slidesToScroll: slidesToScroll,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: Math.max(slidesToShow - 2, 1),
        slidesToScroll: slidesToScroll,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: slidesToScroll,
      },
    },
  ];

  const settings: Settings = {
    dots,
    infinite,
    speed,
    slidesToShow,
    slidesToScroll,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay,
    autoplaySpeed,
    draggable: true,
    swipe: true,
    swipeToSlide: true,
    touchMove: true,
    touchThreshold: 10,
    responsive: responsive || defaultResponsive,
    ...rest,
  };

  return (
    <div
      className={`carousel-wrapper w-full ${arrows ? "px-12" : ""} ${dots ? "pb-8 overflow-visible" : "overflow-hidden"} ${className}`}
    >
      <Slider {...settings}>{children}</Slider>
    </div>
  );
};

export default Carousel;
