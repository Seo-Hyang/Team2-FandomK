import React, { useEffect, useMemo, useState } from "react";
import BlockTitle from "../../../components/BlockTitle/BlockTitle";
import useMediaQuery from "../../../hooks/useMediaQuery";
import useAsync from "../../../hooks/useAsync";
import { getIdolList } from "../../../api/idolsApi";
import { isEmpty } from "lodash";
import LodingImage from "../../../components/LodingImage/LodingImage";
import Button from "../../../components/Button/Button";
import Avatar from "../../../components/Avatar/Avatar";
import style from "../AddFavoriteIdols/avatarStyle.css";
import ButtonLeft from "../../../assets/images/caret/caret-btn-large-left.svg";
import ButtonRight from "../../../assets/images/caret/caret-btn-large-right.svg";

//기종별 불러올 아이돌 데이터 크기(갯수)
const PAGE_SIZES = {
	mobile: 6,
	tablet: 8,
	desktop: 16,
};

//기종별 프로필 이미지 크기
const PROFILE_SIZES = {
	mobile: 98,
	others: 128,
};

function AddFavoriteIdols() {
	const mode = useMediaQuery();

	const [selectedIdolIds, setselectedIdolIds] = useState([]);

	const pageSize = useMemo(() => {
		if (mode === "mobile") return PAGE_SIZES["mobile"];
		if (mode === "tablet") return PAGE_SIZES["tablet"];
		else return PAGE_SIZES["desktop"];
	}, [mode]);

	const profilSize = useMemo(() => {
		if (mode === "mobile") return PROFILE_SIZES["mobile"];
		else return PROFILE_SIZES["others"];
	}, [mode]);

	// async controller
	const [runFunction, responseData, isLoading, errorMessage] = useAsync(getIdolList);

	useEffect(() => {
		runFunction({ pageSize });
	}, [pageSize]);

	const items = responseData?.list || [];

	return (
		<article className="mypage addidol">
			<section className="mypage__title">
				<BlockTitle>관심 있는 아이돌을 추가해보세요.</BlockTitle>
			</section>
			<section className="mypage-addidol__container">
				<div className="mypage-addidol__container-inner">
					{!isEmpty(items) &&
						items.map(({ id, profilePicture, group, name }) => {
							const checked = selectedIdolIds.includes(id);
							return (
								<div className="mypage-addidol__items" key={`idol-id-$(id)`}>
									<Avatar
										src={profilePicture}
										size={"otherAddIdol"}
										alt={`${name} 프로필 이미지`}
										checked={checked}
										onClick={() => {
											setselectedIdolIds((prev) => {
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
								</div>
							);
						})}
				</div>
			</section>
			<section className="mypage-addidol_add">
				<Button className="mypage-addidol_add-button" icon={"plus"} size={"large"} round disabled={selectedIdolIds.length === 0}>
					추가하기
				</Button>
			</section>
		</article>
	);
}

export default AddFavoriteIdols;
