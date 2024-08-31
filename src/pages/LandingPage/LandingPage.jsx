import React from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { isEmpty } from "lodash";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Mousewheel, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useMyCredit } from "../../context/MyCreditContext";
import Logo from "../../components/Logo/Logo";
import Button from "../../components/Button/Button";
import { MoemaButtonStyle01 } from "../../layout/RootHeader/MoemaButton";
import SkeletonAvater from "../../assets/images/avatar/user-astronaut-solid.png";
import BackgroundImage00 from "../../assets/images/landing/background-00.png";
import BackgroundImage01 from "../../assets/images/landing/background-01.png";
import BackgroundImage02 from "../../assets/images/landing/background-02.png";
import BackgroundImage03 from "../../assets/images/landing/background-03.png";
import DeviceImage00 from "../../assets/images/landing/iPhone14Pro-Silver-Portrait.png";
import DeviceImage01 from "../../assets/images/landing/device-01.png";
import DeviceImage02 from "../../assets/images/landing/device-02.png";
import DeviceImage03 from "../../assets/images/landing/device-03.png";
import style from "./LandingPage.module.css";

const SECTION_LIST = [
  {
    background: BackgroundImage01,
    device: DeviceImage01,
    title: "후원하기",
    comment: "좋아하는 아이돌에게\n쉽게 조공해 보세요",
  },
  {
    background: BackgroundImage02,
    device: DeviceImage02,
    title: "이달의 아티스트",
    comment: "내 아티스트에게 1등의\n영예를 선물하세요",
  },
  {
    background: BackgroundImage03,
    device: DeviceImage03,
    title: "나만의 아티스트",
    comment: "좋아하는 아티스트들의\n소식을 모아보세요",
  },
];

const FloatMenu = styled.article`
  position: fixed;
  z-index: 999;
  top: 16px;
  right: 16px;
`;

function LandingPage() {
  const navigate = useNavigate();
  const [myCredit, setMyCredit] = useMyCredit();

  const clearLocalStorage = () => {
    Object.keys(localStorage).forEach((key) => localStorage.removeItem(key));
    setMyCredit(0);
    navigate("/list");
  };

  const checkLocalStorage = () => {
    const myFavoriteList = JSON.parse(localStorage.getItem("myFavoriteList"));
    const isVoted = JSON.parse(localStorage.getItem("isVoted"));

    return !(isEmpty(myCredit) && myCredit === 0 && isEmpty(myFavoriteList) && isEmpty(isVoted));
  };

  return (
    <>
      <Helmet prioritizeSeoTags>
        <title>FANDOM-K</title>
        <meta name="description" content="내가 좋아하는 아이돌을 가장 쉽게 덕질 하는 방법" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content="" />
        <meta property="og:site_name" content="FANDOM-K 랜딩페이지" />
        <meta property="og:title" content="FANDOM-K" />
        <meta property="og:description" content="내가 좋아하는 아이돌을 가장 쉽게 덕질 하는 방법" />
        <meta property="og:image" content="/assets/images/og/og-image-landing.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
      <article className={style["landing-page"]}>
        {checkLocalStorage() && (
          <FloatMenu>
            <MoemaButtonStyle01 to={"/mypage"} draggable="false">
              <img src={SkeletonAvater} alt={"기본 아바타 이미지"} height={40} draggable="false" />
            </MoemaButtonStyle01>
          </FloatMenu>
        )}

        <Swiper direction={"vertical"} parallax={true} slidesPerView={1} spaceBetween={0} effect={"fade"} mousewheel={true} modules={[EffectFade, Mousewheel, Parallax]} className={`mySwiper ${style["mySwiper"]}`}>
          <SwiperSlide>
            <article className={style["main-article"]}>
              <section className={style["main-article__head"]} data-swiper-parallax={-100}>
                <p className={style["main-article__summary"]}>
                  내가 좋아하는 아이돌을
                  <br />
                  가장 <b>쉽게 덕질</b> 하는 방법
                </p>
                <p className={style["main-article__logo"]}>
                  <Link to={"/list"} draggable="false">
                    <Logo size="xl" />
                  </Link>
                </p>
              </section>
              <section className={style["main-article__button"]} data-swiper-parallax={100}>
                <Button size={"wide"} onClick={clearLocalStorage}>
                  지금 시작하기
                </Button>
              </section>
              <article className={style["background"]} data-swiper-parallax={-400}>
                <img src={BackgroundImage00} alt="레드벨벳 앨범 이미지" draggable="false" />
              </article>
            </article>
          </SwiperSlide>

          <SwiperSlide>
            <article className={style["landing-article"]}>
              <section className={style["landing-article__head"]} data-swiper-parallax={-100}>
                <p className={style["landing-article__title"]}>{SECTION_LIST[0].title}</p>
                <p className={style["landing-article__comment"]}>{SECTION_LIST[0].comment}</p>
              </section>
              <section className={style["landing-article__body"]}>
                <img className={style["landing-article__device-cover"]} src={DeviceImage00} alt="아이폰 테두리 이미지" draggable="false" />
                <div className={style["landing-article__device-wrap"]}>
                  <img className={style["landing-article__device-image"]} src={SECTION_LIST[0].device} alt={`${SECTION_LIST[0].title} 이미지`} draggable="false" data-swiper-parallax={-100} />
                </div>
              </section>
              <article className={style["background"]} data-swiper-parallax={-400}>
                <img src={SECTION_LIST[0].background} alt="소녀시대 앨범 이미지" draggable="false" />
              </article>
            </article>
          </SwiperSlide>

          <SwiperSlide>
            <article className={style["landing-article"]}>
              <section className={style["landing-article__head"]} data-swiper-parallax={-100}>
                <p className={style["landing-article__title"]}>{SECTION_LIST[1].title}</p>
                <p className={style["landing-article__comment"]}>{SECTION_LIST[1].comment}</p>
              </section>
              <section className={style["landing-article__body"]}>
                <img className={style["landing-article__device-cover"]} src={DeviceImage00} alt="아이폰 테두리 이미지" draggable="false" />
                <div className={style["landing-article__device-wrap"]}>
                  <img className={style["landing-article__device-image"]} src={SECTION_LIST[1].device} alt={`${SECTION_LIST[1].title} 이미지`} draggable="false" data-swiper-parallax={-100} />
                </div>
              </section>
              <article className={style["background"]} data-swiper-parallax={-400}>
                <img src={SECTION_LIST[1].background} alt="뉴진스 앨범 이미지" draggable="false" />
              </article>
            </article>
          </SwiperSlide>

          <SwiperSlide>
            <article className={style["landing-article"]}>
              <section className={style["landing-article__head"]} data-swiper-parallax={-100}>
                <p className={style["landing-article__title"]}>{SECTION_LIST[2].title}</p>
                <p className={style["landing-article__comment"]}>{SECTION_LIST[2].comment}</p>
              </section>
              <section className={style["landing-article__body"]}>
                <img className={style["landing-article__device-cover"]} src={DeviceImage00} alt="아이폰 테두리 이미지" draggable="false" />
                <div className={style["landing-article__device-wrap"]}>
                  <img className={style["landing-article__device-image"]} src={SECTION_LIST[2].device} alt={`${SECTION_LIST[2].title} 이미지`} draggable="false" data-swiper-parallax={-100} />
                </div>
              </section>
              <article className={style["background"]} data-swiper-parallax={-400}>
                <img src={SECTION_LIST[2].background} alt="NCT Dream 앨범 이미지" draggable="false" />
              </article>
            </article>
          </SwiperSlide>
        </Swiper>
      </article>
    </>
  );
}

export default LandingPage;
