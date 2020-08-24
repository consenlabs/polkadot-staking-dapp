import React from 'react'
import Modal from 'react-modal'
import './index.scss'

const customStyles = {
  content: {
    top: 'auto',
    left: '0',
    right: '0',
    bottom: '-8px',
    borderRadius: '8px',
    padding: '0',
    border: '0',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  }
}

export default (props: any) => {
  const style = { ...customStyles }
  style.content = { ...style.content, ...props.styles }
  return <Modal {...props} style={style} />
}