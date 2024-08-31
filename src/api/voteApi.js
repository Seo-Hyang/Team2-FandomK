import httpClient from "./httpClient";

const API_URL = "https://fandom-k-api.vercel.app/7-2";
const ERROR_MESSAGES = {
  response: "투표 데이터를 가져오는데 실패했습니다.",
  id: "아이돌 id를 입력해주세요.",
};

/**
 * 선택된 투표를 업데이트합니다.
 *
 * @function updateSelectedVote
 * @param {number} idolId - (필수) 투표 아이돌의 ID
 * @returns {Promise<Object>} The response data parsed as JSON.
 * @example
 * // 선택된 투표 업데이트
 * const result = await updateSelectedVote(teamId);
 */
export const voteIdol = async ({ idolId }) => {
  if (!idolId) throw new Error(ERROR_MESSAGES.id);
  return await httpClient.post(`${API_URL}/votes`, { idolId }).catch((e) => {
    throw new Error(ERROR_MESSAGES.response, e);
  });
};
