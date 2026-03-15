import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { fetchFeaturedProducts, fetchLatestProducts } from "../../api/product";
import BestSelling from "../../components/BestSelling";
import Carousel from "../../components/Carousel";
import Button from "../../components/common/Button";
import Newsletter from "../../components/Newsletter";
import ProductCard from "../../components/ProductCard";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import type { IProduct } from "../../types";

const HomePage = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { currentLang } = useLanguage();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"featured" | "latest">("featured");
  const [loading, setLoading] = useState(false);
  const [FeaturedProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [LatestProducts, setLatestProducts] = useState<IProduct[]>();

  useEffect(() => {
    const fetchLatestAndFeatured = async () => {
      try {
        setLoading(true);
        const latestProducts = await fetchLatestProducts();
        const featuredProducts = await fetchFeaturedProducts();
        setLatestProducts(latestProducts);
        setFeaturedProducts(featuredProducts);
      } catch (error) {
        console.error("Error fetching latest or featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAndFeatured();
  }, []);

  const productsToDisplay =
    activeTab === "featured" ? FeaturedProducts : LatestProducts;

  return (
    <>
      <div className='hero-section pt-32 bg-[var(--bg-secondary)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row items-center'>
            {/* Left column */}
            <div
              className={`mb-8 lg:mb-0 lg:w-1/2 ${
                currentLang === "ar"
                  ? "text-center lg:text-right"
                  : "text-center lg:text-left"
              }`}
            >
              <h1 className='text-4xl lg:text-5xl font-bold mb-4 text-[var(--text-secondary)]'>
                {t("Fresh Arrivals Online")}
              </h1>
              <p className='mb-5 text-lg text-[var(--text-muted)]'>
                {t("Discover Our Newest Collection Today.")}
              </p>
              <Button
                rightIcon={
                  currentLang === "ar" ? <BsArrowLeft /> : <BsArrowRight />
                }
                variant='secondary'
                onClick={() => navigate("/products")}
                size='lg'
                className='mt-10 hero-btn'
              >
                {t("View Collection")}
              </Button>
            </div>

            {/* Right column */}
            <div className='lg:w-1/2 flex justify-center lg:justify-end relative'>
              <img
                src='./Ellipse.png'
                alt='Ellipse'
                className={`w-75 h-75 lg:w-100 lg:h-100 absolute bottom-0 ${
                  currentLang === "ar" ? "left-0" : "right-0"
                }`}
              />
              <img
                src='./Burst-pucker.png'
                alt='Burst-pucker'
                className={`w-10 h-10 absolute top-10 ${
                  currentLang === "ar" ? "right-50" : "left-50"
                }`}
              />
              <img
                src='./Hero-Img.png'
                alt='E-commerce'
                className='w-65 lg:w-72 h-auto relative'
              />
            </div>
          </div>
        </div>
      </div>
      <div className='features py-24 bg-[var(--bg-primary)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-wrap -mx-4'>
            <div className='w-full md:w-1/2 lg:w-1/3 px-4 mb-8 flex flex-col items-center lg:items-start'>
              <div className='feature-icon mb-4 bg-[var(--bg-secondary)] dark:bg-[var(--disabled-input)] rounded-full p-2'>
                <img
                  src='./Free-Shipping.png'
                  alt='Free Shipping'
                  className='mx-auto lg:mx-0'
                />
              </div>
              <h2 className='text-xl font-semibold mb-2 text-[var(--text-secondary)]'>
                {t("Free Shipping")}
              </h2>
              <p
                className={`${
                  currentLang === "ar" ? "pl-0 lg:pl-5" : "pr-0 lg:pr-5"
                } text-[var(--text-muted)]`}
              >
                {t(
                  "Upgrade your style today and get FREE shipping on all orders! Don't miss out.",
                )}
              </p>
            </div>

            <div className='w-full md:w-1/2 lg:w-1/3 px-4 mb-8 flex flex-col items-center lg:items-start'>
              <div className='feature-icon mb-4 bg-[var(--bg-secondary)] dark:bg-[var(--disabled-input)] rounded-full p-2'>
                <img
                  src='./Star-Badge.png'
                  alt='Satisfaction Guarantee'
                  className='mx-auto lg:mx-0'
                />
              </div>
              <h2 className='text-xl font-semibold mb-2 text-[var(--text-secondary)]'>
                {t("Satisfaction Guarantee")}
              </h2>
              <p
                className={`${
                  currentLang === "ar" ? "pl-0 lg:pl-5" : "pr-0 lg:pr-5"
                } text-[var(--text-muted)]`}
              >
                {t(
                  "Shop confidently with our Satisfaction Guarantee: Love it or get a refund.",
                )}
              </p>
            </div>

            <div className='w-full md:w-1/2 lg:w-1/3 px-4 mb-8 flex flex-col items-center lg:items-start'>
              <div className='feature-icon mb-4 bg-[var(--bg-secondary)] dark:bg-[var(--disabled-input)] rounded-full p-2'>
                <img
                  src='./Secure-Payment.png'
                  alt='Secure Payment'
                  className='mx-auto lg:mx-0'
                />
              </div>
              <h2 className='text-xl font-semibold mb-2 text-[var(--text-secondary)]'>
                {t("Secure Payment")}
              </h2>
              <p
                className={`${
                  currentLang === "ar" ? "pl-0 lg:pl-5" : "pr-0 lg:pr-5"
                } text-[var(--text-muted)]`}
              >
                {t(
                  "Your security is our priority. Your payments are secure with us.",
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BestSelling />

      {/* Browse Our Fashion Paradise Section */}
      <div
        className={`fashion-paradise ${
          currentLang === "ar" ? "bg-gradient-to-l" : "bg-gradient-to-r"
        } from-[var(--bg-secondary)] ${
          currentTheme === "dark" || currentTheme === "system"
            ? "to-[#202124]"
            : "to-white"
        } border border-[var(--bg-secondary)]`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
            <div className={`py-12 text-center lg:text-start`}>
              <h4 className='text-2xl lg:text-3xl font-bold mb-4 text-[var(--text-secondary)]'>
                {t("Browse Our Fashion Paradise")}
              </h4>
              <p className='mb-8 text-md text-[var(--text-muted)]'>
                {t(
                  "Step into a world of style and explore our diverse collection of clothing categories.",
                )}
              </p>
              <Button
                rightIcon={
                  currentLang === "ar" ? <BsArrowLeft /> : <BsArrowRight />
                }
                variant='secondary'
                onClick={() => console.log("Start Browsing Clicked!")}
                size='lg'
                className='mt-6'
              >
                {t("Start Browsing")}
              </Button>
            </div>

            <div className='hidden lg:flex justify-end'>
              <img
                src='./Fashion-Item.png'
                alt='Fashion Paradise'
                className='w-full max-w-sm lg:max-w-md h-[275px]'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured & Latest Products Section */}
      <div className='featured-products py-16 bg-[var(--bg-primary)]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='flex items-center justify-center gap-8 mb-12'>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-3 py-1 transition-all rounded-2xl border cursor-pointer ${
                activeTab === "featured"
                  ? "text-[var(--text-secondary)] border-[var(--border-color)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
              }`}
            >
              {t("Featured")}
            </button>
            <button
              onClick={() => setActiveTab("latest")}
              className={`px-3 py-1 transition-all rounded-2xl border cursor-pointer ${
                activeTab === "latest"
                  ? "text-[var(--text-secondary)] border-[var(--border-color)]"
                  : "text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]"
              }`}
            >
              {t("Latest")}
            </button>
          </div>

          <Carousel
            arrows={true}
            dots={false}
            infinite={true}
            speed={1000}
            autoplay={true}
            autoplaySpeed={5000}
          >
            {(loading ? Array(4).fill(0) : productsToDisplay)?.map(
              (product, i) => (
                <ProductCard
                  key={product?.id || i}
                  Product={product}
                  Loading={loading}
                  showAddToCart
                />
              ),
            )}
          </Carousel>
        </div>
      </div>

      <Newsletter />
    </>
  );
};

export default HomePage;
