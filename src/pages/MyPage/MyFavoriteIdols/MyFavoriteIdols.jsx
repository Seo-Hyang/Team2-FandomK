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

//기종별 불러올 아이돌 데이터 크기(갯수)
const PAGE_SIZES = {
	top: 3,
	mobile: 6,
	tablet: 8,
	desktop: 16,
};

//기종별 프로필 이미지 크기
const PROFILE_SIZES = {
	mobile: 98,
	others: 128,
};

function MyFavoriteIdols() {
	const mode = useMediaQuery();

	const pageSize = PAGE_SIZES["top"];

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
		<article className="mypage myidol">
			<section className="mypage__title">
				<BlockTitle>내가 관심있는 아이돌</BlockTitle>
			</section>
			<section className="mypage-myidol__container">
				{!isEmpty(items) &&
					items.map(({ id, profilePicture, group, name }) => (
						<div className="mypage-myidol__items" key={`idol-id-$(id)`}>
							<Avatar
								src={profilePicture}
								size={"otherMyIdol"}
								alt={`${name} 프로필 이미지`}
								checked
								onCanceled={() => {
									console.log("canceled", id);
								}}
							/>
							<p className="mypage__items-name">{name}</p>
							<p className="mypage__items-group">{group}</p>
						</div>
					))}
			</section>
			{/* TODO: LIST COMPONENT */}
		</article>
	);
}

export default MyFavoriteIdols;
