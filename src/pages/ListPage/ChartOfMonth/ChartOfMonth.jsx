import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Parallax } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import useAsync from "../../../hooks/useAsync";
import { useMyCredit } from "../../../context/MyCreditContext";
import { getChartData } from "../../../api/chartsApi";
import { voteIdol } from "../../../api/voteApi";
import TitleSection from "../../../components/TitleSection/TitleSection";
import ErrorSection from "../../../components/ErrorSection/ErrorSection";
import Avatar from "../../../components/Avatar/Avatar";
import Button from "../../../components/Button/Button";
import Modal from "../../../components/Modal/Modal";
import style from "./ChartOfMonth.module.css";
import VotesModal from "../../../components/Modal/Fandom-k_Modal/modal.js/VotesModal";
import PopupModal from "../../../components/Modal/Fandom-k_Modal/modal.js/PopupModal";

/**
 * @JuhyeokC
 * mode 별 페이지사이즈 매직넘버
 */
const PAGE_SIZES = {
  desktop: 10,
  tablet: 5,
  mobile: 5,
};

const IS_VOTED = "isVoted";

const Container = styled.div`
  ${({ $mode }) => $mode !== "desktop" && `display: flex;`}
  background-color : var(--background-color-basic);
`;

function ChartOfMonth({ mode }) {
  let swiperRef = useRef(null);

  const [isVoted, setIsVoted] = useState(() => (localStorage?.getItem(IS_VOTED) === null ? false : Boolean(localStorage.getItem(IS_VOTED))));

  const pageSize = PAGE_SIZES[mode];
  const [myCredit, setMyCredit] = useMyCredit();
  const [reload, setReload] = useState(0);

  const [gender, setGender] = useState("female");
  const [femaleIdols, setFemaleIdols] = useState([]);
  const [femaleCursor, setFemaleCursor] = useState(null);
  const [maleIdols, setMaleIdols] = useState([]);
  const [maleCursor, setMaleCursor] = useState(null);
  const [disableButton, setDisableButton] = useState({ female: femaleCursor, male: maleCursor });

  const [votes, setVotes] = useState(false);
  const [selectedIdol, setSelectedIdol] = useState(null);
  const [creditNotEnough, setCreditNotEnough] = useState(false);

  const [pending, error, execute] = useAsync(getChartData);
  const [pendingVote, errorVote, executeVote] = useAsync(voteIdol);

  const getData = async ({ pageSize, gender, cursor }) => {
    const params = { pageSize, gender };
    if (cursor) params.cursor = cursor;

    const result = await execute(params);
    if (!result) return;
    const { idols, nextCursor } = result;

    if (gender === "female") {
      setFemaleIdols((prev) => {
        if (cursor) {
          return [...prev, ...idols];
        } else {
          return idols;
        }
      });
      setFemaleCursor(nextCursor);
    } else {
      setMaleIdols((prev) => {
        if (cursor) {
          return [...prev, ...idols];
        } else {
          return idols;
        }
      });
      setMaleCursor(nextCursor);
    }
    setDisableButton((prev) => {
      return { ...prev, [gender]: !nextCursor };
    });
  };

  const moreData = async () => {
    await getData({ pageSize, gender, cursor: gender === "female" ? femaleCursor : maleCursor });
  };

  const initializeData = () => {
    setFemaleIdols([]);
    setFemaleCursor(null);
    setMaleIdols([]);
    setMaleCursor(null);
  };

  const handleReload = () => {
    initializeData();
    setReload((prev) => ++prev);
  };

  const handleGender = (gender) => {
    setGender(gender);
    gender === "female" ? swiperRef.current.swiper.slideTo(0) : swiperRef.current.swiper.slideTo(1);
  };

  const votesOpen = () => setVotes(true);

  const votesClose = () => {
    setVotes(false);
    setCreditNotEnough(false);
  };

  const voteIdolChart = async ({ idolId }) => {
    const params = { idolId };

    const result = await executeVote(params);
    if (!result) return;

    handleReload();
    setMyCredit((prev) => (prev -= 1000));
    setIsVoted(true);
    votesClose();
  };

  const votingIdolChart = (e) => {
    if (myCredit < 1000) return setCreditNotEnough(true);
    voteIdolChart({ idolId: selectedIdol });
  };

  useEffect(() => {
    getData({ pageSize, gender: "female" });
    getData({ pageSize, gender: "male" });
  }, [pageSize, reload]);

  useEffect(() => {
    localStorage.setItem(IS_VOTED, JSON.stringify(isVoted));
  }, [isVoted]);

  return (
    <>
      <TitleSection
        title={"이달의 차트"}
        action={
          <Button icon={"chart"} size={"small"} onClick={votesOpen}>
            차트 투표하기
          </Button>
        }
      >
        {error ? (
          <ErrorSection error={error} onReload={handleReload}></ErrorSection>
        ) : (
          <>
            <section className={style["chartbar__gender"]}>
              <button onClick={() => handleGender("female")} className={`${style["chartbar__gender-button"]} ${gender === "female" && style["selected"]}`}>
                이달의 여자 아이돌
              </button>
              <button onClick={() => handleGender("male")} className={`${style["chartbar__gender-button"]} ${gender === "male" && style["selected"]}`}>
                이달의 남자 아이돌
              </button>
            </section>
            <Swiper
              ref={swiperRef}
              onSwiper={(swiperElm) => {
                swiperRef = swiperElm;
              }}
              parallax={true}
              effect={"fade"}
              slidesPerView={1}
              spaceBetween={0}
              autoHeight={true}
              allowTouchMove={false}
              modules={[EffectFade, Parallax]}
              className={`mySwiper ${style["mySwiper"]}`}
            >
              <SwiperSlide>
                <Container className={style["container"]} $mode={mode}>
                  {femaleIdols &&
                    femaleIdols.map((item) => (
                      <article key={item.id} className={style["chart__ranking"]}>
                        <section className={style["chart__profile"]}>
                          <Avatar src={item.profilePicture} size={"basic"} alt={`${item.name} 프로필 이미지`} />
                          <span className={style["chart__rank"]}>{item.rank}</span>
                          <div className={style["chart__group"]}>{`${item.group} ${item.name}`}</div>
                        </section>
                        <div className={style["chart__vote"]}>{item.totalVotes}표</div>
                      </article>
                    ))}
                  {pending && (
                    <>
                      {Array.from({ length: pageSize }, (v, i) => i).map((_, i) => (
                        <article key={`skeleton-chart-${i}`} className={style["chart__ranking"]}>
                          <section className={style["chart__profile"]}>
                            <div className={style["chart__circle"] + " skeleton"}></div>
                            <span className={style["chart__rank"]}></span>
                            <div className={style["chart__group"] + " skeleton"} style={{ minWidth: "100px", minHeight: "16px" }}>
                              &nbsp;
                            </div>
                          </section>
                          <div className={style["chart__vote"]}>
                            <div className="skeleton" style={{ minWidth: "24px" }}>
                              &nbsp;
                            </div>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </Container>
              </SwiperSlide>
              <SwiperSlide>
                <Container className={style["container"]} $mode={mode}>
                  {maleIdols &&
                    maleIdols.map((item) => (
                      <article key={item.id} className={style["chart__ranking"]}>
                        <section className={style["chart__profile"]}>
                          <Avatar src={item.profilePicture} size={"basic"} alt={`${item.name} 프로필 이미지`} />
                          <span className={style["chart__rank"]}>{item.rank}</span>
                          <div className={style["chart__group"]}>{`${item.group} ${item.name}`}</div>
                        </section>
                        <div className={style["chart__vote"]}>{item.totalVotes}표</div>
                      </article>
                    ))}
                  {pending && (
                    <>
                      {Array.from({ length: pageSize }, (v, i) => i).map((_, i) => (
                        <article key={`skeleton-chart-${i}`} className={style["chart__ranking"]}>
                          <section className={style["chart__profile"]}>
                            <div className={style["chart__circle"] + " skeleton"}></div>
                            <span className={style["chart__rank"]}></span>
                            <div className={style["chart__group"] + " skeleton"} style={{ minWidth: "100px", minHeight: "16px" }}>
                              &nbsp;
                            </div>
                          </section>
                          <div className={style["chart__vote"]}>
                            <div className="skeleton" style={{ minWidth: "24px" }}>
                              &nbsp;
                            </div>
                          </div>
                        </article>
                      ))}
                    </>
                  )}
                </Container>
              </SwiperSlide>
            </Swiper>
          </>
        )}
        <Modal show={votes} modalOpen onClose={votesClose} title={"투표하기"} buttonName={isVoted ? "이미 차트에 투표했어요" : "투표하기"} buttonAction={votingIdolChart} votes disabled={isVoted}>
          {creditNotEnough ? <PopupModal onClose={votesClose} /> : <VotesModal gender={gender} setSelectedIdol={setSelectedIdol} errorVote={errorVote} />}
        </Modal>

        {!error && (
          <button className={style["viewMore"]} onClick={moreData} disabled={pending || disableButton[gender]}>
            더보기
          </button>
        )}
      </TitleSection>
    </>
  );
}

export default ChartOfMonth;
