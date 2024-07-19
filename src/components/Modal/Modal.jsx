import React from "react";
import Button from "../Button/Button";
import Xbutton from "../Button/Xbutton";
import votesCss from "../../components/Modal/Fandom-k_Modal/module.css/Votes.module.css";
import "./Modal.css";

function Modal({ show, icon, buttonAction, disabled, buttonName, onClose, children, title, votes, modalOpen, donation }) {
  if (!show) {
    document.body.style.removeProperty("overflow");
    return null;
  } else {
    document.body.style.setProperty("overflow", "hidden");
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <p className="modal-title">{title}</p>
          <Xbutton className="modal-close" onClick={onClose}></Xbutton>
        </div>
        <div className={donation ? "donation-modal-body" : "modal-body"}>{children}</div>
        {modalOpen && (
          <div className="modal-foot">
            <Button icon={icon} size={"wide"} onClick={buttonAction} disabled={disabled}>
              {buttonName}
            </Button>
          </div>
        )}
        {votes && (
          <div className={votesCss.notification}>
            투표에는 <span className={votesCss.credit}>1000 크레딧</span>이 소모됩니다.
          </div>
        )}
      </div>
    </div>
  );
}
export default Modal;
