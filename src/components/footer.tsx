"use client";

import { Link } from "@/i18n/routing";
import { Montserrat } from "next/font/google";
import { SocialIcon } from "react-social-icons";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
});

const Footer = () => {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  return (
    <footer className="relative bg-background pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap text-left lg:text-left">
          <div className="w-full lg:w-6/12 px-4">
            <h4 className={`${montserrat.className} text-3xl font-medium `}>
              {t("brandName")}
            </h4>
            <h5 className="text-lg mt-0 mb-2 text-secondary-foreground">
              {t("tagline")}
            </h5>
            <div className="mt-6 lg:mb-0 mb-6">
              <button
                className="  font-normal  items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <SocialIcon url="https://www.facebook.com/share/19YoQmV9km/?mibextid=wwXIfr" />
              </button>

              <button
                className="  font-normal  items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <SocialIcon url="https://www.tiktok.com/@unikcandle1?_t=ZN-8vAiWKd4Sv8&_r=1" />
              </button>

              <button
                className="  font-normal  items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                type="button"
              >
                <SocialIcon url="https://www.instagram.com/unikcandle_labougiequiparle?igsh=anRqNDBzdjFhd3Ru&utm_source=qr" />
              </button>
            </div>
          </div>
          <div className="w-full lg:w-6/12 px-4">
            <div className="flex flex-wrap items-top mb-6">
              <div className="w-full lg:w-4/12 px-4 ml-auto">
                <ul className="list-unstyled">
                  <li>
                    <Link
                      className="text-secondary-foreground hover:text-primary font-semibold block pb-2 text-sm"
                      href="/"
                    >
                      {tNav("home")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-secondary-foreground hover:text-primary font-semibold block pb-2 text-sm"
                      href="/products"
                    >
                      {tNav("products")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-secondary-foreground hover:text-primary font-semibold block pb-2 text-sm"
                      href="/contact"
                    >
                      {tNav("contact")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-secondary-foreground hover:text-primary font-semibold block pb-2 text-sm"
                      href="/about"
                    >
                      {tNav("about")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="text-secondary-foreground hover:text-primary font-semibold block pb-2 text-sm"
                      href="/cgu"
                    >
                      {t("terms")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full md:w-4/12 px-4 mx-auto text-center">
            <div className="text-sm text-secondary-foreground font-semibold py-1">
              {t("copyright")}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
