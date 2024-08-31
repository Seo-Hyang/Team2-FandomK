import React, { useState, useEffect } from "react";
import useAsync from "../../../../hooks/useAsync";
import { donateCredit } from "../../../../api/donationsApi";
import { useMyCredit } from "../../../../context/MyCreditContext";
import PopupModal from "./PopupModal";
import Button from "./../../../Button/Button";
import ErrorSection from "../../../ErrorSection/ErrorSection";
import done from "../module.css/Donation.module.css";
import confetti from "canvas-confetti";
import SlotCounter from "react-slot-counter";

function DonationModal({ onClose, icon, setIdols, currentIdol, creditValueState, setDonationButtonDisabled, disabled, buttonName }) {
  const [myCredit, setMyCredit] = useMyCredit();
  const [creditValue, setCreditValue] = creditValueState;
  const [message, setMessage] = useState(false);
  const [notEnough, setNotEnough] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value < 1000 || value > myCredit) {
      setDonationButtonDisabled(true);
      setIsValid(false);
    } else {
      setDonationButtonDisabled(false);
      setIsValid(true);
    }
    setMessage(value > myCredit);
    setCreditValue(value);
  };

  const [pending, error, execute] = useAsync(donateCredit);

  const donate = async (id, { amount }) => {
    const params = { amount };
    if (amount > myCredit) return setNotEnough(true);
    const result = await execute(id, params);
    if (!result) return;
    setMyCredit((prev) => prev - Number(creditValue));
    setIdols((prev) => prev.map((item) => (item.id === result.id ? { ...item, receivedDonations: result.receivedDonations } : item)));
    handleClose();
  };

  const handleCredit = (e) => {
    e.preventDefault();
    donate(currentIdol?.id, { amount: creditValue });
    confetti({ particleCount: 130, spread: 160 }); // 빵빠레 (조각 개수, 뿌리는 각도)
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 500); // fadeOut 애니메이션 시간과 일치시킴
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      {error ? (
        <ErrorSection error={error} onReload={handleClose}></ErrorSection>
      ) : (
        <div className={`${done.modalBackground} ${!isVisible ? done.hidden : ""}`}>
          {notEnough ? (
            <PopupModal onClose={handleClose} />
          ) : (
            <div className={done.donationContainer}>
              <img src={currentIdol?.idol.profilePicture} className={done.donationImg} alt={`${currentIdol?.name} 프로필 사진`} />
              <div className={done.adTitle}>
                <span className={done.adWhere}>{currentIdol?.subtitle}</span>
                <span>{currentIdol?.title}</span>
              </div>
              <form>
                <span className={done.remaningCredit}>
                  잔여 크레딧 : <SlotCounter value={myCredit} useMonospaceWidth />
                </span>
                <input className={`${done.creditInput} ${!isValid ? done.creditError : ""}`} type="number" name="chargeCredit" placeholder="크레딧 입력" step={100} value={creditValue} onChange={handleChange} />
                {message && <p className={done.notification}>갖고 있는 크레딧 보다 더 많이 후원할 수 없어요!</p>}
                {buttonName && (
                  <Button icon={icon} size={"wide"} onClick={handleCredit} disabled={pending || disabled} className={done.donationButton}>
                    {buttonName}
                  </Button>
                )}
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default DonationModal;
