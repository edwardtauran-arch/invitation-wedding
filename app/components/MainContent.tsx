"use client";

import { useState, useEffect, useRef } from "react";
import { IoIosArrowUp } from "react-icons/io";
import { FaInstagram, FaChevronLeft, FaChevronRight, FaCopy, FaCompactDisc } from "react-icons/fa";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import CountdownTimer from "./Countdown";
import Form from "./Form";
import WishesList from "./WishesList";
import { config as defaultConfig } from "@/lib/config";

const DEFAULT_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80"
];

type WeddingScreenProps = {
  name?: string;
  config?: any;
};

const WeddingScreen = ({ name, config: dynamicConfig }: WeddingScreenProps) => {
  const config = dynamicConfig || defaultConfig;

  const galleryImages = config.galleryImages || DEFAULT_GALLERY_IMAGES;

  const validSlides = [
    config.slideImages?.slide1,
    config.slideImages?.slide2,
    config.slideImages?.slide3,
    config.slideImages?.slide4,
    config.slideImages?.slide5,
    config.slideImages?.slide6,
    config.slideImages?.slide7,
    config.slideImages?.slide8,
    config.slideImages?.slide9,
    config.slideImages?.slide10,
  ].filter(src => src && typeof src === 'string' && !src.startsWith("/slide_") && !src.startsWith("/foto_"));

  const slideshowImages = validSlides.length > 0 
    ? validSlides 
    : (galleryImages.length > 0 && galleryImages[0] !== DEFAULT_GALLERY_IMAGES[0]) 
      ? [galleryImages[0]] 
      : ["/foto_2.jpg"];

  const leftBgImage = (config.slideImages?.sideImage && config.slideImages.sideImage !== "/foto_1_samping.jpg") 
    ? config.slideImages.sideImage 
    : slideshowImages[0];

  const bankAccounts = config.weddingGift?.bankAccounts || [
    { bankName: "BRI", accountNumber: "0000 0000 000", accountHolderName: "Edward Ridley Tauran" },
    { bankName: "BCA", accountNumber: "0000 0000 000", accountHolderName: "Mardianti Ekaputri P" }
  ];

  const col1: any[] = [];
  const col2: any[] = [];

  galleryImages.forEach((url: string, idx: number) => {
    const aspect = idx % 3 === 0 ? "aspect-[3/4]" : (idx % 3 === 1 ? "aspect-[4/3]" : "aspect-[3/4]");
    const item = { url, origIdx: idx, aspect };
    if (idx % 2 === 0) {
      col1.push(item);
    } else {
      col2.push(item);
    }
  });

  const formatNameWithTitle = (titleFront?: string, name?: string, titleBack?: string) => {
    let result = name || "";
    if (titleFront && titleFront.trim()) {
      result = `${titleFront.trim()} ${result}`;
    }
    if (titleBack && titleBack.trim()) {
      result = `${result}, ${titleBack.trim()}`;
    }
    return result;
  };

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(" ").map(w => {
      if (w === "&" || w === "dan" || w === "and") return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  };

  const [fadeClass, setFadeClass] = useState("opacity-0");
  const [isOpen, setIsOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isQrisEnlarged, setIsQrisEnlarged] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => {
        let nextIndex = prev;
        while (nextIndex === prev) {
          nextIndex = Math.floor(Math.random() * slideshowImages.length);
        }
        return nextIndex;
      });
    }, 4000); // ganti foto tiap 4 detik
    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  useEffect(() => {
    if (audioRef.current) {
      (audioRef.current as HTMLAudioElement).volume = volume;
    }
  }, [volume]);

  const handleCopyText = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handlePrevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryImages.length]);

  // Untuk fade-in pertama kali
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeClass("opacity-100");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && audioRef.current) {
      // Play music when "Open" is clicked
      (audioRef.current as HTMLAudioElement).play();
      setIsPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        (audioRef.current as HTMLAudioElement).pause();
      } else {
        (audioRef.current as HTMLAudioElement).play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const { ref: mainRef, inView: isMainInView } = useInView({
    threshold: 0.5,
  });

  const { ref: main2Ref, inView: isMain2InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide1Ref, inView: isSlide1InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide2Ref, inView: isSlide2InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide3Ref, inView: isSlide3InView } = useInView({
    threshold: 0.5,
  });

  const { ref: slide4Ref, inView: isSlide4InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide5Ref, inView: isSlide5InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide6Ref, inView: isSlide6InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide7Ref, inView: isSlide7InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide8Ref, inView: isSlide8InView } = useInView({
    threshold: 0.5,
  });
  const { ref: galleryRef, inView: isGalleryInView } = useInView({
    threshold: 0.2,
  });
  const { ref: giftRef, inView: isGiftInView } = useInView({
    threshold: 0.3,
  });
  const { ref: slide9Ref, inView: isSlide9InView } = useInView({
    threshold: 0.5,
  });
  const { ref: slide10Ref, inView: isSlide10InView } = useInView({
    threshold: 0.5,
  });
  const { ref: endRef, inView: isEndInView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    const video = document.querySelector("iframe");
    if (video) {
      if (isSlide8InView) {
        video.src += "&autoplay=1"; // Mulai video
      } else {
        video.src = video.src.replace("&autoplay=1", ""); // Hentikan video
      }
    }
  }, [isSlide8InView]);

  return (
    <div
      className={`h-screen w-screen flex flex-col md:flex-row ${fadeClass} transition-opacity duration-1000`}
    >
      {/* Gambar sisi kiri Wide Untuk Komputer */}
      <div
        className="md:flex justify-center hidden items-end pb-12 w-2/3 h-1/2 md:h-full"
        style={{
          backgroundImage: `url(${leftBgImage})`, // fallback to slide1 or gallery
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className={`bottom-10 left-20 font-ovo text-lg text-white tracking-[5px]`}
        >
          {config.coupleNames.toUpperCase()}
        </div>
      </div>

      {/* Konten teks sisi kanan bisa scroll untuk pc */}
      <div className=" md:w-1/3 h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        <div
          id="backgroundWedding"
          className=" snap-start relative w-full h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background Images Slideshow */}
          {slideshowImages.map((src, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: index === currentSlideIndex ? 1 : 0,
                transition: "opacity 1.5s ease-in-out",
                zIndex: 0
              }}
            />
          ))}
          
          <div className="relative z-10 text-center p-5 flex flex-col h-full justify-between py-20 w-full">
            <div className="gap-y-2 md:gap-y-4 flex flex-col bg-black/10 backdrop-blur-[2px] rounded-xl p-4 md:p-6 border border-white/10 w-fit h-fit mx-auto">
              <h5
                className={`text-sm font-legan text-white uppercase tracking-wide fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                The Wedding Of
              </h5>
              <h1
                className={`text-2xl md:text-3xl font-ovo t text-white fadeMain ${isMainInView ? "active" : ""
                  } `}
                ref={mainRef}
              >
                {config.coupleNames.toUpperCase()}
              </h1>
              <h5
                className={`text-sm  font-legan text-white uppercase tracking-wide  fadeMain2 ${isMain2InView ? "active" : ""
                  } `}
                ref={main2Ref}
              >
                {new Date(config.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h5>
            </div>
            <div>
              <p className="mt-5 text-lg uppercase font-xs tracking-widest text-white" translate="no">
                {name ? `Dear ${name},` : "Welcome"}
              </p>
              {!isOpen ? (
                <button
                  className="animate-bounce  mt-5 px-5 py-1 uppercase text-xs border border-white hover:text-white hover:bg-transparent rounded-full bg-white text-black transition"
                  onClick={handleOpen}
                  translate="no"
                >
                  Open Invitation
                </button>
              ) : (
                <IoIosArrowUp
                  stroke="4"
                  className="mx-auto mt-20 animate-upDown text-white"
                />
              )}
            </div>
          </div>
        </div>
        {isOpen && (
          <>
            {/* Slide 1 */}
            <div
              className={`text-white h-screen flex pt-12 p-5 px-12 snap-start `}
              style={{
                backgroundImage: `url(${config.slideImages?.slide1 || "/slide_1.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide1Ref}
                className={` ${isSlide1InView ? "active" : ""}  fadeInMove bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 w-fit h-fit`}
              >
                <h1 className="text-xl md:text-2xl font-ovo tracking-wide text-white uppercase">
                  {config.bibleVerse}
                </h1>
                <p className="text-sm mt-5 font-legan">
                  {config.bibleVerseContent}
                </p>
                <p className="text-6xl mt-5 font-wonder">{toTitleCase(config.coupleNames)}</p>
              </div>
            </div>
            {/* Slide 2 */}
            <div
              className={`text-white h-screen flex items-end pb-16 px-12 snap-start `}
              style={{
                backgroundImage: `url(${config.slideImages?.slide2 || "/slide_2.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Display the content when the button is clicked */}
              <div
                ref={slide2Ref}
                className={`fadeInMove ${isSlide2InView ? "active" : ""} bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 w-fit h-fit`}
              >
                <p className="font-legan text-base md:text-lg my-2">The Groom</p>
                <h1 className="text-3xl md:text-5xl text-white font-ovo mt-1 mb-2">
                  {formatNameWithTitle(config.groomTitleFront, config.groom, config.groomTitleBack)}
                </h1>
                <h3 className="font-thesignature text-3xl md:text-4xl">About {config.groomNickName},</h3>
                <p className="text-base md:text-lg mt-5 font-legan text-[#CCCCCC] leading-relaxed max-w-lg">
                  {config.groomBio}
                </p>
                <Link
                  href={`https://www.instagram.com/${config.groomInstagram}`}
                  target="_blank"
                  className="cursor-pointer hover:bg-black text-base md:text-lg rounded-full flex items-center gap-x-2 text-center font-legan mt-6 bg-[#4E4E4E] w-fit px-5 py-2.5 text-[#CCCCCC]"
                >
                  <FaInstagram className="w-5 h-5" /> {config.groomInstagram}
                </Link>
              </div>
            </div>
            {/* Slide 3 */}
            <div
              className="snap-start  text-white h-screen flex items-end pb-16 px-12 "
              style={{
                backgroundImage: `url(${config.slideImages?.slide3 || "/slide_3.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide3Ref}
                className={`fadeInMove ${isSlide3InView ? "active" : ""} bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 w-fit h-fit`}
              >
                <p className="font-legan text-base md:text-lg my-2">The Bride</p>
                <h1 className="text-3xl md:text-5xl text-white font-ovo mt-1 mb-2">
                  {formatNameWithTitle(config.brideTitleFront, config.bride, config.brideTitleBack)}
                </h1>
                <h3 className="font-thesignature text-3xl md:text-4xl">About {config.brideNickName},</h3>
                <p className="text-base md:text-lg mt-5 font-legan text-[#CCCCCC] leading-relaxed max-w-lg">
                  {config.brideBio}
                </p>
                <Link
                  href={`https://www.instagram.com/${config.brideInstagram}`}
                  target="_blank"
                  className="cursor-pointer hover:bg-black text-base md:text-lg rounded-full flex items-center gap-x-2 text-center font-legan mt-6 bg-[#4E4E4E] w-fit px-5 py-2.5 text-[#CCCCCC]"
                >
                  <FaInstagram className="w-5 h-5" /> {config.brideInstagram}
                </Link>
              </div>
            </div>
            {/* Slide 4 */}
            <div
              className="snap-start  text-white h-screen pt-8 flex px-12 "
              style={{
                backgroundImage: `url(${config.slideImages?.slide4 || "/slide_4.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 w-fit h-fit max-w-2xl">
                <h1
                  ref={slide4Ref}
                  className={`text-xl md:text-5xl  text-white font-ovo fadeInMove ${isSlide4InView ? " active" : ""
                    }`}
                >
                  A journey in love
                </h1>
                {Array.from({ length: config.timelineCount || 3 }).map((_, idx) => {
                  const num = idx + 1;
                  const title = config[`timeline_${num}`];
                  const content = config[`timeline_${num}_content`];

                  if (!title && !content) return null;

                  return (
                    <div key={num}>
                      <h3
                        ref={slide4Ref}
                        className={`uppercase font-legan text-xl mt-5 mb-2 fadeInMoveSlow ${isSlide4InView ? " active" : ""
                          }`}
                      >
                        {title}
                      </h3>
                      <p
                        ref={slide4Ref}
                        className={`text-xs font-legan text-white fadeInLeftSlow ${isSlide4InView ? " active" : ""
                          }`}
                      >
                        {content}
                      </p>
                    </div>
                  );
                })}
                <div
                  ref={slide4Ref}
                  className={`relative flex items-center mt-5 fadeInLeft ${isSlide4InView ? " active" : ""
                    }`}
                >
                  <hr className="w-[120px] mx-2 border-t border-gray-300" />
                  <span className="px-2 font-thesignature text-3xl">
                    {toTitleCase(config.coupleNames)}
                  </span>
                </div>
              </div>
            </div>
            {/* Slide 5 & 6 Merged (Save Our Date & Countdown) */}
            <div
              className="snap-start text-white h-screen flex flex-col items-center justify-center px-4 md:px-12 py-16 overflow-y-auto"
              style={{
                backgroundImage: `url(${config.slideImages?.slide5 || "/slide_5.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={slide5Ref}
                className={` ${isSlide5InView ? "active" : ""} fadeInMove flex items-center flex-col w-fit h-fit max-w-3xl bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10`}
              >
                <h3 className="uppercase font-legan text-xs tracking-wide mb-2 md:mb-4 mt-6 md:mt-0">
                  save our date
                </h3>
                <h1 className="text-xl md:text-3xl w-[250px] md:w-[400px] text-center text-white font-ovo uppercase leading-relaxed">
                  {new Date(config.eventDate).toLocaleDateString("en-US", {
                    weekday: "long",
                  })} <br />  {new Date(config.eventDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 mt-6 md:mt-8 w-full justify-center">
                  {config.holyMatrimony.enabled && (
                    <div className="flex flex-col items-center flex-1">
                      <h3 className="uppercase font-ovo text-sm md:text-base text-center mb-2">
                        Holy Matrimony <br /> {config.holyMatrimony.time}
                      </h3>
                      <p className="text-[10px] md:text-sm text-center font-legan text-white/90">
                        {config.holyMatrimony.place} <br /> {config.holyMatrimony.place_details}
                      </p>
                      <Link
                        href={config.holyMatrimony.googleMapsLink}
                        target="_blank"
                        className="cursor-pointer hover:bg-white/20 text-[10px] md:text-xs rounded-full flex items-center justify-center font-legan mt-3 bg-[#808080]/80 backdrop-blur-sm px-4 py-2 text-white transition"
                      >
                        Google Maps
                      </Link>
                    </div>
                  )}

                  {config.weddingReception.enabled && (
                    <div className="flex flex-col items-center flex-1 mt-2 sm:mt-0">
                      <h3 className="uppercase font-ovo text-sm md:text-base text-center mb-2">
                        Wedding Reception <br /> {config.weddingReception.time}
                      </h3>
                      <p className="text-[10px] md:text-sm text-center font-legan text-white/90">
                        {config.weddingReception.place} <br /> {config.weddingReception.place_details}
                      </p>
                      <Link
                        href={config.weddingReception.googleMapsLink}
                        target="_blank"
                        className="cursor-pointer hover:bg-white/20 text-[10px] md:text-xs rounded-full flex items-center justify-center font-legan mt-3 bg-[#808080]/80 backdrop-blur-sm px-4 py-2 text-white transition"
                      >
                        Google Maps
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Countdown Timer from Slide 6 */}
              <div
                ref={slide6Ref}
                className={` ${isSlide6InView ? "active" : ""} fadeInMove flex items-center flex-col w-fit h-fit bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 mt-10 md:mt-16`}
              >
                <h1 className="text-sm md:text-xl text-center text-white/90 font-ovo uppercase mb-2 md:mb-4">
                  ALMOST TIME FOR OUR CELEBRATION
                </h1>
                <div className="scale-75 md:scale-100">
                  <CountdownTimer eventDate={config.eventDate} />
                </div>
              </div>
            </div>
            {/* Slide 7 */}
            {config.livestreaming.enabled && (
              <div
                className="snap-start  text-white h-screen flex flex-col justify-between pt-16 pb-32 px-12 "
                style={{
                  backgroundImage: `url(${config.slideImages?.slide6 || "/slide_6.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <h1
                  ref={slide7Ref}
                  className={`text-2xl text-white  font-ovo fadeInMoveSlow ${isSlide7InView ? "active" : ""} bg-black/10 backdrop-blur-[2px] rounded-xl p-4 md:p-6 border border-white/10 w-fit h-fit`}
                >
                  JOIN OUR EXCLUSIVE LIVE STREAMING EVENT
                </h1>

                <div
                  className={`mt-5 mx-auto flex flex-col fadeInMove ${isSlide7InView ? "active" : ""} bg-black/10 backdrop-blur-[2px] rounded-xl p-6 border border-white/10 w-fit h-fit items-center text-center`}
                  ref={slide7Ref}
                >
                  <h3 className="uppercase font-ovo text-sm mt-5 mb-2">
                    {new Date(config.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <br /> {config.livestreaming.time}
                  </h3>
                  <p className="text-sm font-legan text-white">
                    {config.livestreaming.detail}
                  </p>
                  <Link
                    href={config.livestreaming.link}
                    target="_blank"
                    className="cursor-pointer hover:text-white/20 text-sm rounded-full flex items-center gap-x-2 text-center font-legan mt-5 bg-[#3B3B3B] w-fit px-6 py-2 text-white"
                  >
                    Join Live Streaming
                  </Link>
                </div>
              </div>)}
            {/* SLIDE 8 */}
            {config.prewedding.enabled && (
              <div
                className="snap-start text-white h-screen flex flex-col justify-center pt-16 pb-16 px-8 "
                style={{
                  backgroundImage: `url(${config.slideImages?.slide7 || "/slide_7.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={slide8Ref}
                  className={`${isSlide8InView ? "active" : ""} fadeInMove `}
                >
                  <h1 className="text-3xl text-white  font-ovo text-center uppercase">
                    Unveiling Our Prewedding Story
                  </h1>
                  <div
                    className="mt-10 mx-auto w-full max-w-2xl relative"
                    style={{ paddingBottom: "56.25%", height: 0 }}
                  >
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${config.prewedding.link}?autoplay=1&mute=1&loop=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  </div>

                  <div className="-mt-12 w-72 transform skew-x-6 drop-shadow">
                    <p className="text-3xl font-thesignature text-white/80 ">
                      {config.prewedding.detail}
                    </p>
                  </div>
                </div>
              </div>)}

            {/* GALERI FOTO SLIDE */}
            <div
              ref={galleryRef}
              className="snap-start bg-[#FAF6F0] h-screen flex flex-col justify-center pt-8 pb-4 px-4 md:px-6 overflow-hidden"
            >
              {/* Header Banner */}
              <div className="text-center mb-4 py-2 bg-[#F2EAE1] rounded-xl shadow-sm border border-[#E6DCD0] shrink-0 max-w-sm mx-auto w-full">
                <h2 className="font-thesignature text-4xl md:text-5xl text-[#4A3B32] leading-none">
                  Galeri Foto
                </h2>
              </div>

              {/* Grid Collage */}
              <div className="grid grid-cols-3 grid-rows-3 gap-2 h-full max-h-[75vh] w-full max-w-4xl mx-auto">
                {galleryImages.slice(0, 9).map((url: string, idx: number) => (
                  <div
                    key={`gal-${idx}`}
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative overflow-hidden rounded-xl cursor-pointer shadow-md group gallery-card transform ${isGalleryInView
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-12 scale-95"
                      }`}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    <img
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[#4A3B32]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[10px] md:text-xs bg-[#4A3B32]/70 px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-sm border border-white/10 tracking-wider text-center leading-tight">
                        Lihat
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLIDE HADIAH / WEDDING GIFT */}
            {(config.weddingGift?.enabled ?? true) && (
              <div
                className="snap-start text-neutral-800 bg-[#FAF6F0] h-screen flex flex-col justify-start md:justify-center pt-12 md:pt-8 pb-4 px-4 overflow-hidden"
                style={{
                  backgroundImage: `url(${config.slideImages?.slide8 || "/slide_8.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={giftRef}
                  className={`w-full max-w-4xl mx-auto space-y-3 md:space-y-4 fadeInMove flex flex-col h-full justify-start md:justify-center ${isGiftInView ? "active" : ""
                    }`}
                >
                  {/* Title Header */}
                  <div className="text-center shrink-0 bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 mx-auto w-fit max-w-[90%] md:max-w-2xl mb-4">
                    <h2 className="font-thesignature text-4xl md:text-6xl text-white leading-none mb-3">
                      Wedding Gift
                    </h2>
                    <p className="text-xs md:text-sm font-legan text-white/90 max-w-[280px] md:max-w-md mx-auto leading-relaxed italic">
                      &ldquo;Doa Restu Anda merupakan karunia yang sangat berarti bagi kami. Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.&rdquo;
                    </p>
                  </div>

                  {/* Amplop Online */}
                  <div className="flex flex-col gap-3 md:gap-6 justify-start items-center w-full max-w-4xl mx-auto pb-4">
                    
                    {/* Bank Cards List - Stacked on Mobile, Horizontal on Desktop */}
                    <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-2.5 md:gap-3 w-full px-2">
                      {bankAccounts.map((acc: { bankName: string; accountNumber: string; accountHolderName: string }, idx: number) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-[#2c231a] via-[#17120d] to-[#2c231a] border border-[#524536]/20 shadow-xl rounded-xl p-3 md:p-4 text-white w-[260px] md:w-[280px] shrink-0 relative overflow-hidden snap-center"
                        >
                          {/* Logo & Chip */}
                          <div className="flex justify-between items-center mb-3 md:mb-4">
                            {/* Card Chip */}
                            <div className="w-8 h-5 md:w-9 md:h-6 bg-gradient-to-br from-[#ebd094] to-[#a67e3a] rounded border border-white/10 shadow-sm relative overflow-hidden">
                              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-20">
                                {[...Array(9)].map((_, i) => (
                                  <div key={i} className="border border-neutral-950"></div>
                                ))}
                              </div>
                            </div>

                            {/* Bank Logo */}
                            <div className="text-right">
                              {acc.bankName === "BCA" && (
                                <span className="font-sans font-black italic tracking-wide text-white text-sm md:text-base flex items-center">
                                  <span className="bg-blue-600 text-white rounded px-1 text-[6px] md:text-[7px] mr-1 not-italic font-bold">GRUP</span>BCA
                                </span>
                              )}
                              {acc.bankName === "BRI" && (
                                <span className="font-sans font-black italic tracking-wide text-white text-sm md:text-base flex items-center">
                                  <span className="bg-blue-700 text-white rounded px-1 text-[6px] md:text-[7px] mr-1 not-italic font-bold">K</span>BRI
                                </span>
                              )}
                              {acc.bankName !== "BCA" && acc.bankName !== "BRI" && (
                                <span className="font-sans font-extrabold tracking-wide text-white text-xs md:text-sm uppercase">
                                  {acc.bankName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Account Number */}
                          <div className="mb-2 md:mb-3">
                            <p className="text-base md:text-lg font-mono tracking-widest text-center text-neutral-100">
                              {acc.accountNumber}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-center mb-2">
                            <button
                              onClick={() => handleCopyText(acc.accountNumber, "Nomor rekening berhasil disalin!")}
                              className="flex items-center gap-1.5 bg-white text-neutral-800 hover:bg-neutral-100 transition duration-300 rounded-md px-3 py-1 text-[9px] md:text-xs font-semibold shadow-sm focus:outline-none"
                            >
                              <FaCopy className="w-2.5 h-2.5 text-neutral-600" />
                              <span>Salin No. Rekening</span>
                            </button>
                          </div>

                          {/* Card Holder */}
                          <div className="mt-2 md:mt-3 border-t border-white/5 pt-1.5 md:pt-2">
                            <p className="text-[8px] md:text-[9px] text-neutral-400 uppercase tracking-widest text-center">
                              Nama Pemilik Rekening
                            </p>
                            <p className="text-[9px] md:text-[11px] font-semibold text-neutral-200 uppercase tracking-wider text-center mt-0.5">
                              A/n {acc.accountHolderName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* QRIS / Physical Gift Replacement */}
                    <div className="w-full max-w-[340px] md:max-w-[400px]">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center shadow-2xl border border-white/20">
                        {config.weddingGift?.qrisImage ? (
                          <div 
                            className="w-full max-w-[220px] md:max-w-[300px] relative flex items-center justify-center bg-white p-3 md:p-4 rounded-xl overflow-hidden shadow-xl aspect-square mb-3 md:mb-5 mx-auto cursor-pointer group"
                            onClick={() => setIsQrisEnlarged(true)}
                          >
                            <img
                              src={config.weddingGift.qrisImage}
                              alt="QRIS Code"
                              className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                               <span className="text-white text-[10px] md:text-xs bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">Perbesar QRIS</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-[220px] md:max-w-[300px] relative flex flex-col items-center justify-center bg-white p-4 md:p-6 rounded-xl overflow-hidden shadow-xl aspect-square mb-3 md:mb-5 mx-auto text-center">
                            <span className="text-4xl md:text-5xl mb-2">📱</span>
                            <span className="text-[12px] md:text-[14px] text-neutral-600 font-bold font-legan uppercase tracking-wider">Scan QRIS</span>
                            <span className="text-[10px] md:text-[12px] text-neutral-400 mt-1">QRIS belum diunggah</span>
                          </div>
                        )}

                        <p className="text-[10px] md:text-[12px] text-white/90 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center mb-1">
                          Atas Nama
                        </p>
                        <p className="text-sm md:text-lg font-bold tracking-widest text-center uppercase text-white">
                          {config.weddingGift?.qrisOwnerName || config.coupleNames}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 9 & 10 Merged (RSVP and Wishes) */}
            {config.rsvp.enabled && (
              <div
                className="snap-start text-white h-screen flex flex-col justify-center pt-24 pb-16 px-4 md:px-8"
                style={{
                  backgroundImage: `url(${config.slideImages?.slide9 || "/slide_9.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  ref={slide9Ref}
                  className={`${isSlide9InView ? "active" : ""} fadeInMove w-full max-w-md md:max-w-2xl mx-auto flex flex-col bg-black/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl`}
                >
                  <div className="shrink-0 mb-2 md:mb-4">
                    <h1 className="text-xl md:text-3xl text-white font-ovo text-center uppercase tracking-wider">
                      UCAPAN & DOA RESTU
                    </h1>
                    <p className="text-[10px] md:text-sm font-legan text-white/80 text-center mt-1 px-4">
                      {config.rsvp.detail}
                    </p>
                  </div>

                  <div className="flex flex-col w-full relative">
                    <div className="w-full shrink-0">
                      <Form guestName={name} />
                    </div>
                    
                    <div className="w-full mt-4 shrink-0 border-t border-white/20 pt-4">
                      <div ref={slide10Ref} className="w-full">
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                           <WishesList />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE AKHIR */}
            <div
              className="snap-start text-white h-screen flex flex-col justify-end pt-16 pb-16 px-12 "
              style={{
                backgroundImage: `url(${config.slideImages?.slide10 || "/slide_10.jpg"})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                ref={endRef}
                className={` ${isEndInView ? "active" : ""} fadeInMove bg-black/10 backdrop-blur-[2px] rounded-xl p-6 md:p-8 border border-white/10 w-fit h-fit mx-auto`}
              >
                <h1 className="text-3xl text-white  font-ovo text-center uppercase">
                  {config.thankyou}
                </h1>

                <div className="mt-5 mx-auto flex flex-col ">
                  <p className="text-sm font-legan text-white text-center">
                    {config.thankyouDetail}
                  </p>
                  <p className="text-sm rounded-full text-center font-ovo mt-5 px-6 py-2 text-white">
                    {config.coupleNames.toUpperCase()}
                  </p>
                </div>
              </div>

              <footer className="flex flex-col items-center mt-8">
                <p className="text-xs text-neutral-500 tracking-wider">
                  Crafted with Love
                </p>
              </footer>
            </div>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white hover:text-neutral-400 text-5xl font-light focus:outline-none transition-colors duration-200 z-50"
            onClick={() => setLightboxIndex(null)}
          >
            &times;
          </button>

          {/* Main Content Area */}
          <div
            className="relative flex items-center justify-center max-w-[92%] max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Arrow */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 md:left-[-70px] text-white bg-black/40 md:bg-white/10 hover:bg-white/20 transition-all rounded-full p-3 backdrop-blur-sm focus:outline-none z-50 shadow-md border border-white/5"
            >
              <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Main Image */}
            <img
              src={galleryImages[lightboxIndex]}
              alt={`Enlarged photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10 animate-zoomIn"
            />

            {/* Next Arrow */}
            <button
              onClick={handleNextImage}
              className="absolute right-2 md:right-[-70px] text-white bg-black/40 md:bg-white/10 hover:bg-white/20 transition-all rounded-full p-3 backdrop-blur-sm focus:outline-none z-50 shadow-md border border-white/5"
            >
              <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Thumbnail Carousel below the photo */}
          <div
            className="mt-6 flex gap-2 overflow-x-auto max-w-[90%] px-4 py-2 justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.map((img: string, idx: number) => (
              <div
                key={`thumb-${idx}`}
                onClick={() => setLightboxIndex(idx)}
                className={`w-14 h-10 md:w-16 md:h-12 overflow-hidden rounded-md cursor-pointer transition border-2 ${idx === lightboxIndex
                    ? "border-white scale-110 shadow-lg opacity-100"
                    : "border-transparent opacity-40 hover:opacity-100"
                  }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QRIS Lightbox Modal */}
      {isQrisEnlarged && config.weddingGift?.qrisImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn p-4"
          onClick={() => setIsQrisEnlarged(false)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-neutral-400 text-5xl font-light focus:outline-none transition-colors duration-200 z-50"
            onClick={() => setIsQrisEnlarged(false)}
          >
            &times;
          </button>
          <div
            className="relative flex flex-col items-center justify-center max-w-[95%] max-h-[90vh] bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl animate-zoomIn"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={config.weddingGift.qrisImage}
              alt="QRIS Enlarged"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <p className="mt-4 md:mt-6 text-neutral-800 font-bold tracking-widest text-center uppercase text-sm md:text-lg">
              {config.weddingGift.qrisOwnerName || config.coupleNames}
            </p>
          </div>
        </div>
      )}

      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white border border-neutral-800 px-6 py-2.5 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Music Control */}
      {isOpen && (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-center gap-2">
      {/* Volume Control Popover */}
      {showVolume && (
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-2xl flex flex-col items-center gap-2 animate-fadeIn">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-24 w-1.5 appearance-none bg-white/30 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
        </div>
      )}

      {/* Up Arrow to toggle volume */}
      <button
        onClick={() => setShowVolume(!showVolume)}
        className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-2xl transition-all duration-300 text-white"
        title="Volume Control"
      >
        <IoIosArrowUp className={`w-4 h-4 transition-transform duration-300 ${showVolume ? 'rotate-180' : ''}`} />
      </button>

      {/* Music Play/Pause Button */}
      <button
        onClick={toggleMusic}
        className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/20 shadow-2xl transition-all duration-300 flex items-center justify-center"
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        <FaCompactDisc className={`w-6 h-6 md:w-7 md:h-7 text-white ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
      </button>
    </div>
      )}

      {/* Audio Element */}
      <audio ref={audioRef} src={config.musicPath || "/music/wedding_song.mp3"} preload="auto" loop={true} />
    </div>
  );
};

export default WeddingScreen;
