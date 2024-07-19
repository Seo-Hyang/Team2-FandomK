import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import { isEmpty } from "lodash";
import useAsync from "../../../hooks/useAsync";
import { getDonationList } from "../../../api/donationsApi";
import { useMyCredit } from "../../../context/MyCreditContext.jsx";
import TitleSection from "../../../components/TitleSection/TitleSection";
import ErrorSection from "../../../components/ErrorSection/ErrorSection.jsx";
import Button from "../../../components/Button/Button.jsx";
import Card from "./DonationList/DonationCard.jsx";
import CaretButton from "../../../components/CaretButton/CaretButton.jsx";
import DonationModal from "../../../components/Modal/Fandom-k_Modal/modal.js/DonationModal.js";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "../../../components/Modal/Modal.jsx";

const PAGE_SIZES = 999;
const MY_FAVORITE_NAME = "myFavoriteList";

function DonationWaitList({ mode }) {
  const sliderRef = useRef(null);
  const [reload, setReload] = useState(0);
  const [idols, setIdols] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [disableButton, setDisableButton] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleModal, setVisibleModal] = useState(false);
  const [currentIdol, setCurrentIdol] = useState({});
  const [creditValue, setCreditValue] = useState("");
  const [donationButtonDisabled, setDonationButtonDisabled] = useState(true);

  const [pending, error, execute] = useAsync(getDonationList);

  const [myFavoriteIdols, setMyFavoriteIdols] = useState(() => {
    if (isEmpty(localStorage?.getItem(MY_FAVORITE_NAME))) {
      return [];
    } else {
      return JSON.parse(localStorage.getItem(MY_FAVORITE_NAME));
    }
  });

  const myFavoriteIdolsIds = myFavoriteIdols.map((p) => p.id);

  const sortDataList = (list) => {
    const firstIdols = list.filter((item) => myFavoriteIdolsIds.includes(item.idolId));
    const otherIdols = list.filter((item) => !myFavoriteIdolsIds.includes(item.idolId));
    return [...firstIdols, ...otherIdols];
  };

  const getData = async (cursor) => {
    const params = { pageSize: PAGE_SIZES * 2 };
    if (cursor) params.cursor = cursor;

    const result = await execute(params);
    if (!result) return;
    const { list, nextCursor } = result;

    // 종료된 카드들은 맨 뒤로 이동
    const idolsByReceived = [...list].sort((a, b) => {
      return b.receivedDonations - a.receivedDonations;
    });

    const firstList = sortDataList(idolsByReceived);

    const sortedList = [...firstList].sort((a, b) => {
      const aIsEnded = new Date(a.deadline) < new Date();
      const bIsEnded = new Date(b.deadline) < new Date();
      if (aIsEnded && !bIsEnded) return 1;
      if (!aIsEnded && bIsEnded) return -1;
    });

    setIdols((prev) => (cursor ? [...prev, ...sortedList] : sortedList));
    setCursor(nextCursor);
    setDisableButton(false);
  };

  const moreIdols = async (cursor) => {
    if (cursor) await getData(cursor);
  };

  const handleReload = () => {
    setIdols([]);
    setReload((prev) => ++prev);
  };

  const slickFirst = () => sliderRef.current.slickGoTo(0);
  const slickPrev = () => sliderRef.current.slickPrev();
  const slickNext = async () => sliderRef.current.slickNext();

  useEffect(() => {
    getData();
  }, [reload, myFavoriteIdols]);

  const settings = {
    rows: 1,
    dots: false,
    arrows: false,
    speed: 500,
    slidesToScroll: 2,
    centerPadding: "0px",
    infinite: false,
    variableWidth: true,
    beforeChange: (oldIndex, newIndex) => {
      setDisableButton(true);
      if (newIndex > idols.length - 3) moreIdols(cursor);
      setCurrentSlide(newIndex);
    },
    afterChange: (index) => {
      setDisableButton(false);
    },
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          arrows: false,
          draggable: true,
          slidesToScroll: 1,
          dots: true,
          infinite: false,
        },
      },
    ],
  };

  return (
    <>
      <TitleSection
        title={"후원을 기다리는 조공"}
        carousel
        size={"normal"}
        action={
          !error && (
            <Button size={"small"} onClick={slickFirst} disabled={currentSlide === 0}>
              처음으로
            </Button>
          )
        } //에러인 경우엔 작동 X
      >
        {error ? (
          <>
            <ErrorSection error={error} onReload={handleReload}></ErrorSection>
          </>
        ) : (
          <>
            {pending && idols.length === 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {Array.from({ length: 4 }, (v, i) => i).map((_, i) => {
                  return <Card key={`skeleton-card-${i}`} item={"skeleton"} size={mode === "mobile" ? "small" : "medium"} style={{ margin: 0 }} />;
                })}
              </div>
            )}
            {!pending && idols.length === 0 ? (
              <p>진행중인 후원이 없습니다.</p>
            ) : (
              <div style={{ padding: "0 -100px" }}>
                <Slider ref={sliderRef} {...settings}>
                  {idols.map((item) => (
                    <div key={item.id}>
                      <Card
                        key={item.id}
                        item={item}
                        size={mode === "mobile" ? "small" : "medium"}
                        onClick={() => {
                          setCreditValue("");
                          setCurrentIdol(item);
                          setVisibleModal(true);
                        }}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )}
            {mode === "desktop" && (
              <>
                {currentSlide !== 0 && <CaretButton direction="left" onClick={slickPrev} disabled={disableButton} />}
                {currentSlide < idols.length - 4 && <CaretButton direction="right" onClick={slickNext} disabled={disableButton} />}
              </>
            )}
          </>
        )}
      </TitleSection>
      <Modal show={visibleModal} onClose={() => setVisibleModal(false)} title={"후원하기"} buttonName={"후원하기"} modalOpen={false} donation>
        <DonationModal onClose={() => setVisibleModal(false)} icon={"credit"} setIdols={setIdols} currentIdol={currentIdol} creditValueState={[creditValue, setCreditValue]} setDonationButtonDisabled={setDonationButtonDisabled} disabled={donationButtonDisabled} buttonName={"후원하기"} />
      </Modal>
    </>
  );
}
export default DonationWaitList;
