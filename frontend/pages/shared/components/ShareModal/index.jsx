import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import Clipboard from 'clipboard';

import PortalModal from 'COMPONENTS/PortalModal';
import IconButton from 'COMPONENTS/IconButton';
// import Switcher from 'COMPONENTS/Switcher';
import Input from 'COMPONENTS/Input';

import { GREEN_COLORS, MD_COLORS } from 'UTILS/colors';
import styles from './share_modal.css';

const DARK_COLORS = MD_COLORS.slice(-2);

class ShareModal extends React.Component {
  componentDidMount() {
    this.renderQrcode();
    new Clipboard('#copyButton', {
      text: () => $("#shareUrl").val()
    });
  }

  renderQrcode() {
    const { options } = this.props;
    const colorDark = options.openShare ? GREEN_COLORS[1] : DARK_COLORS[1];
    $('#qrcode').empty();
    const qrcode = new QRCode(document.getElementById("qrcode"), {
      text: options.link,
      width: 120,
      height: 120,
      colorDark,
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  }

  componentDidUpdate(preProps) {
    const { options } = this.props;
    const preOptions = preProps.options;
    if ((!options.openShare && preOptions.openShare) || (options.openShare && !preOptions.openShare)) {
      this.renderQrcode();
    }
  }

  copyUrl() {
    document.querySelector("#shareUrl").select();
  }

  render() {
    const { openModal, onClose, options } = this.props;
    const { link, openShare, text } = options;
    const modalClass = cx(
      styles["share_modal_container"],
      !openShare && styles["disabled"]
    );
    const statusText = openShare ? '已开启分享' : '已关闭分享';
    const statusClass = cx(
      styles["share_status"],
      !openShare && styles["not_open"]
    );

    return (
      <PortalModal
        showModal={openModal}
        onClose={onClose}>
        <div className={modalClass}>
          <div className={styles["share_qrcode"]}>
            <div id="qrcode"></div>
          </div>
          <div className={styles["share_info"]}>
            <div className={styles["share_controller"]}>
              {/* <Switcher
                id="switch"
                onChange={toggleShare}
                checked={openShare}
              /> */}
              <div className={statusClass}>{statusText}</div>
            </div>
            <blockquote>扫描二维码/复制链接<br/>{text}</blockquote>
            <div className={styles["share_container"]}>
              <Input
                id="shareUrl"
                style="flat"
                value={link}
              />
              <IconButton
                icon="clipboard"
                id="copyButton"
                onClick={this.copyUrl.bind(this)}
              />
            </div>
          </div>
        </div>
      </PortalModal>
    )
  }
}

ShareModal.propTypes = {
  openModal: PropTypes.bool,
  options: PropTypes.object,
  toggleShare: PropTypes.func,
  onClose: PropTypes.func,
};

ShareModal.defaultProps = {
  openModal: false,
  options: {
    openShare: true,
    link: '',
    text: ''
  },
  toggleShare: () => {},
  onClose: () => {},
}

export default ShareModal;
