import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { isDate, isEmpty } from "lodash";
import useAsync from "../../../hooks/useAsync";
import { getIdolList } from "../../../api/idolsApi";
import animateFunction from "../../../func/animateFunction.js";
import TitleSection from "../../../components/TitleSection/TitleSection.jsx";
import ErrorSection from "../../../components/ErrorSection/ErrorSection.jsx";
import Avatar from "../../../components/Avatar/Avatar";
import Button from "../../../components/Button/Button";
import CaretButton from "../../../components/CaretButton/CaretButton.jsx";
import SortIcon from "../../../assets/images/icon/icon-sort-arrow.svg";
import "../../MyPage/myPageStyle.css";

//기종별 불러올 아이돌 데이터 크기(갯수)
const PAGE_SIZES = {
  mobile: 8,
  tablet: 10,
  desktop: 16,
};

const Container = styled.article`
  position: relative;
`;

const Carousel = styled.article`
  position: relative;
  overflow-x: auto;
  width: 100%;
  height: auto;
  &::-webkit-scrollbar {
    height: 10px;
    background-color: var(--color-black-800);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-brand-orange);
    border-radius: 10px;
  }
`;

const CarouselInner = styled.section`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  ${({ $size }) => {
    if ($size) {
      return `
        flex-direction: column;
        align-items: flex-start;
      `;
    } else {
      return `
        flex-direction: row;
        align-items: center;
      `;
    }
  }}

  width: 100%;
  ${({ $rows }) => {
    switch ($rows) {
      case 2:
        return `
        height: 400px;
      `;
      default:
        return `
          height: 200px;
      `;
    }
  }}
`;

const CarouselItem = styled.article`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 50%;
`;

// 정렬
const sortDataList = (list, { sortGroup = "asc", sortName = "asc" }) => {
  /**
   * asc 오름차순
   * dsc 내림차순
   */

  const compareFunction = (a, b, type, by) => {
    const typeA = a[type];
    const typeB = b[type];

    switch (by) {
      case "asc":
        if (typeA < typeB) return -1;
        if (typeA > typeB) return 1;
        break;
      default:
        if (typeB < typeA) return -1;
        if (typeB > typeA) return 1;
        break;
    }

    // 이름이 같을 경우
    return 0;
  };

  return [...list.sort((a, b) => compareFunction(a, b, "group", sortGroup) || compareFunction(a, b, "name", sortName))];
};

function AddFavoriteIdols({ mode, myFavoriteIdolsState }) {
  const pageSize = PAGE_SIZES[mode];
  const profilSize = useMemo(() => {
    if (mode === "mobile") return "mobileAddIdol";
    else return "otherAddIdol";
  }, [mode]);
  const [myFavoriteIdols, setMyFavoriteIdols] = myFavoriteIdolsState;
  const [reload, setReload] = useState(0);
  const [idols, setIdols] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [selectedIdolIds, setSelectedIdolIds] = useState([]);
  const [sortGroup, setSortGroup] = useState("asc");
  const [sortName, setSortName] = useState("asc");

  // const [searchKeyword, setSearchKeyword] = useState("");
  // const [filteredIdol, setFilteredIdol] = useState([]);

  const carouselRef = useRef(null);
  const [carouselButtonDisabled, setCarouselButtonDisabled] = useState(false);
  const [carouselScrollPosition, setCarouselScrollPosition] = useState("first");
  const carouselRows = pageSize / 2 < idols.length ? 2 : 1;
  const checkCarousel = ({ currentTarget }) => {
    if (currentTarget !== carouselRef.current) carouselRef.current = currentTarget;
  };

  /**
   * @JuhyeokC
   * useAsync 커스텀훅 사용
   */
  const [pending, error, execute] = useAsync(getIdolList);

  const getData = async ({ pageSize, cursor }) => {
    const params = { pageSize: 999 };
    if (cursor) {
      params.pageSize = pageSize;
      params.cursor = cursor;
    }

    const result = await execute(params);
    if (!result) return;
    const { list, nextCursor } = result;

    const sortedList = sortDataList(list, { sortGroup, sortName });

    setIdols((prev) => {
      if (cursor) {
        return [...prev, ...sortedList];
      } else {
        return sortedList;
      }
    });
    setCursor(nextCursor);
  };

  const getMoreData = async () => {
    if (cursor) await getData({ pageSize, cursor });
  };

  const handleReload = () => {
    setIdols([]);
    setReload((prev) => ++prev);
  };

  // 슬라이드 처음으로
  const carouselFirst = () => {
    setCarouselButtonDisabled(true);
    const carousel = carouselRef.current;
    animateFunction(carousel, "scrollLeft", 0, 1000, () => setCarouselButtonDisabled(false));
  };

  // 슬라이드 마지막
  const carouselLast = () => {
    setCarouselButtonDisabled(true);
    const carousel = carouselRef.current;
    const carouselItemWidth = carousel.children[0].children[0].clientWidth;
    const dataLength = Math.round(idols.length / 2);
    animateFunction(carousel, "scrollLeft", carouselItemWidth * dataLength, 1000, () => setCarouselButtonDisabled(false));
  };

  // 슬라이드 이전으로
  const carouselPrev = () => {
    setCarouselButtonDisabled(true);
    const carousel = carouselRef.current;
    const to = carousel.scrollLeft - carousel.clientWidth;
    animateFunction(carousel, "scrollLeft", to, 1000, () => setCarouselButtonDisabled(false));
  };

  // 슬라이드 다음으로
  const carouselNext = () => {
    setCarouselButtonDisabled(true);
    const carousel = carouselRef.current;
    const to = carousel.scrollLeft + carousel.clientWidth;
    animateFunction(carousel, "scrollLeft", to, 1000, () => setCarouselButtonDisabled(false));
    getMoreData();
  };

  const handleScroll = ({ currentTarget }) => {
    const carousel = currentTarget;
    const carouselInner = carousel.children[0];
    setCarouselScrollPosition(() => {
      if (carousel.scrollLeft === 0) {
        return "first";
      } else if (carousel.scrollLeft >= carouselInner.scrollWidth - carousel.clientWidth) {
        return "last";
      } else {
        return false;
      }
    });
  };

  //const filteredIdol = idols.filter((item) => item.name.includes(searchKeyword));

  // const onChange = (e) => {
  //   setSearchKeyword(e.target.value);
  //   console.log(searchKeyword);
  // };
  // useEffect(() => {
  //   fetch("https://jsonplaceholder.typicode.com/users")
  //     .then((res) => res.json())
  //     .then((data) => setSearchIdol(data));
  // }, []);

  useEffect(() => {
    getData({ pageSize });
  }, [reload]);

  useEffect(() => {
    setIdols((prev) => sortDataList(prev, { sortGroup, sortName }));
  }, [sortGroup, sortName]);

  return (
    <>
      <TitleSection
        title={"관심 있는 아이돌을 추가해보세요."}
        carousel
        action={
          <>
            <Button icon={"sort"} size={"small"} onClick={() => setSortName((prev) => (prev === "asc" ? "dsc" : "asc"))}>
              이름
            </Button>
            <Button icon={"sort"} size={"small"} onClick={() => setSortGroup((prev) => (prev === "asc" ? "dsc" : "asc"))}>
              그룹
            </Button>
          </>
        }
      >
        {error ? (
          <ErrorSection error={error} onReload={handleReload}></ErrorSection>
        ) : (
          <>
            {/* 검색 <input className="search" placeholder="검색하기" onChange={onChange} value={searchKeyword} /> */}
            <Container>
              <Carousel className="mypage-addidol_carousel" ref={carouselRef} onLoad={checkCarousel} onScroll={handleScroll}>
                <CarouselInner $rows={isEmpty(idols) ? 2 : carouselRows} $size={pageSize < idols.length}>
                  {!pending && isEmpty(idols) ? (
                    <p>등록된 아이돌이 없습니다...</p>
                  ) : (
                    idols.map(({ id, profilePicture, group, name }) => {
                      if (myFavoriteIdols.some((idol) => idol.id === id)) return false;
                      // 검색
                      //  if (filteredIdol !== 0) {
                      //   if (filteredIdol.some((idol) => idol.id !== id)) return false;
                      // }
                      return (
                        <CarouselItem key={`idol-id-${id}`} $pageSize={pageSize / 2}>
                          <article className="mypage-addidol__items">
                            <Avatar
                              src={profilePicture}
                              size={profilSize}
                              alt={`${name} 프로필 이미지`}
                              checked={selectedIdolIds.includes(id)}
                              onClick={() => {
                                setSelectedIdolIds((prev) => {
                                  const hasId = prev.includes(id);
                                  if (hasId) {
                                    return prev.filter((item) => item !== id);
                                  }
                                  return [...new Set([...prev, id])];
                                });
                              }}
                            />
                            <p className="mypage__items-name">{name}</p>
                            <p className="mypage__items-group">{group}</p>
                          </article>
                        </CarouselItem>
                      );
                    })
                  )}
                  {pending && idols.length === 0 && (
                    <>
                      {Array.from({ length: pageSize }, (v, i) => i).map((_, i) => {
                        return (
                          <CarouselItem key={`idol-id-${i}`} $pageSize={pageSize / 2}>
                            <article className="mypage-addidol__items">
                              <Avatar src={""} size={profilSize} alt={`프로필 이미지`} className="skeleton" />
                              <p className="mypage__items-name skeleton" style={{ minWidth: "40px" }}>
                                &nbsp;
                              </p>
                              <p className="mypage__items-group skeleton" style={{ minWidth: "64px" }}>
                                &nbsp;
                              </p>
                            </article>
                          </CarouselItem>
                        );
                      })}
                    </>
                  )}
                </CarouselInner>
              </Carousel>
              {mode !== "mobile" && (
                <>
                  <CaretButton direction="left" size="large" onClick={carouselPrev} disabled={carouselScrollPosition === "first" || carouselButtonDisabled} />
                  <CaretButton direction="right" size="large" onClick={carouselNext} disabled={carouselScrollPosition === "last" || carouselButtonDisabled} />
                </>
              )}
            </Container>

            <section className="mypage-addidol_add">
              {/* <Button onClick={carouselFirst} disabled={carouselScrollPosition === "first" || carouselButtonDisabled}>
								FIRST
							</Button> */}
              <Button
                icon={"plus"}
                size={"large"}
                round
                onClick={() => {
                  setMyFavoriteIdols((prev) => {
                    const selected = idols.filter((item) => selectedIdolIds.includes(item.id) && prev.every((p) => p.id !== item.id));
                    setSelectedIdolIds([]);
                    return [...prev, ...selected];
                  });
                }}
                disabled={selectedIdolIds.length === 0}
              >
                추가하기
              </Button>
              {/* <Button onClick={carouselLast} disabled={carouselScrollPosition === "last" || carouselButtonDisabled}>
								LAST
							</Button> */}
            </section>
          </>
        )}
      </TitleSection>
    </>
  );
}

export default AddFavoriteIdols;
