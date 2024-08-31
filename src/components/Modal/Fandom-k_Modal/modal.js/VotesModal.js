import React, { useEffect, useState } from "react";
import useAsync from "../../../../hooks/useAsync";
import { getChartData } from "../../../../api/chartsApi";
import ErrorSection from "../../../ErrorSection/ErrorSection";
import InputRadio from "../../../InputRadio/InputRadio";
import Avatar from "../../../Avatar/Avatar";
import votes from "../module.css/Votes.module.css";

// 투표 모달 콘텐츠 : 프로필, 그룹명, 멤버명, 선택 버튼
function ProfileListItem({ item, onCheck }) {
  const [checked, setChecked] = useState(false);

  const handleChecked = () => {
    setChecked(!checked);
    onCheck(item.id);
  };

  return (
    <>
      <InputRadio className={votes.ProfileContainer} id={`voteModal${item.id}`} name={"voteModal"} value={item.id} onClick={handleChecked}>
        <div className={votes.profileBox}>
          <Avatar src={item.profilePicture} className={votes.profileImg} alt="프로필 사진" checked={item.checked} />
          <div className={votes.lanking}>{item.rank}</div>
          <div className={votes.profileInfo}>
            <span>
              {item.group} {item.name}
            </span>
            <span className={votes.profileVotes}>{Number(item.totalVotes).toLocaleString()}표</span>
          </div>
        </div>
      </InputRadio>
    </>
  );
}

function VotesModal({ gender, setSelectedIdol, errorVote }) {
  const pageSize = 999;
  const [reload, setReload] = useState(0);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [pending, error, execute] = useAsync(getChartData);

  const getData = async ({ pageSize, gender, cursor }) => {
    const params = { pageSize: 999, gender };
    if (cursor) {
      params.pageSize = pageSize;
      params.cursor = cursor;
    }

    const result = await execute(params);
    if (!result) return;
    const { idols, nextCursor } = result;

    setItems((prev) => {
      if (cursor) {
        return [...prev, ...idols];
      } else {
        return idols;
      }
    });
    setCursor(nextCursor);
  };

  const handleReload = () => {
    setReload((prev) => ++prev);
  };

  const handleCheck = (id) => {
    setSelectedIdol(id);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: true } : { ...item, checked: false })));
  };

  useEffect(() => {
    getData({ pageSize, gender });
  }, [reload]);

  return (
    <div className={votes.Contents}>
      <ul className={votes.content}>
        {error || errorVote ? (
          <ErrorSection error={error || errorVote} onReload={handleReload} className={votes.errorContent}></ErrorSection>
        ) : (
          <>
            {items &&
              items.map((item) => {
                return (
                  <li key={item.id}>
                    <ProfileListItem item={item} onCheck={handleCheck} />
                    <div className={votes.areaLine}></div>
                  </li>
                );
              })}
          </>
        )}
      </ul>
    </div>
  );
}
export default VotesModal;
