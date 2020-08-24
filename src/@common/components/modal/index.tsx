/**
 * https://github.com/reactjs/react-modal#examples
 */

import React from 'react'
import Modal from 'react-modal'
import './index.scss'
import modalCloseSvg from '@common/assets/modalClose.svg'

const customStyles = {
  content: {
    top: 'auto',
    left: '0',
    right: '0',
    bottom: '0',
    padding: '0',
    borderRadius: '0',
    border: 'none',
    backgroundColor: 'transparent'
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
}

export default (props: any) => {
  const style = { ...customStyles }
  style.content = { ...style.content, ...props.styles }
  const { children, styles, title, ...restProps } = props
  return <Modal {...restProps} style={style}>
    <div className="modal-inner">
      <div className="modal-header">
        <img src={modalCloseSvg} onClick={props.onRequestClose} alt="" />
        <strong>{title}</strong>
      </div>
      {props.children}
    </div>
  </Modal>
}
