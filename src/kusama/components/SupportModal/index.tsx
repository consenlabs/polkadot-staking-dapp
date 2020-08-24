import React from 'react'
import { isiPhoneX, compareSemver } from 'kusama/lib/utils'
import Modal from '../Modal'
import t, { getLocale } from 'kusama/locales'
import './index.scss'
import icons from 'kusama/lib/icons'

interface Props {

}

interface State {
  modalVisible: boolean
  title: string
  desc: string
  icon: any
}

class SupportModal extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      title: '',
      desc: '',
      icon: ''
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.checkSupport()
    }, 1000)
  }

  checkSupport = () => {
    // not open in imToken
    if (!window['imToken']['callAPI']) return

    // imToken version too low
    const version = (window['imTokenAgent'] || '').split(':')[1]
    if (!(version && compareSemver(version, '2.6.0') >= 0)) {
      this.setState({
        modalVisible: true,
        title: t('update_app_title'),
        desc: t('update_app_desc'),
        icon: icons.updateAppIcon,
      });
    }
  }

  render() {
    const { title, desc, icon, modalVisible } = this.state

    if (!modalVisible) return null

    return (
      <Modal
        isOpen={true}
        contentLabel="imToken version Modal"
        onRequestClose={() => { }}
        styles={{ margin: '15px', bottom: isiPhoneX() ? '15px' : '0', borderRadius: '8px' }}
        appElement={document.body}
      >
        <div className="modal-inner support-modal-inner">
          <img src={icon} alt={title} />
          <span>{title}</span>
          <div className="desc">{desc}</div>
          <div className="buttons">
            <div className="button confirm-button" onClick={this.onUnderstood}>{t('join_test')}</div>
          </div>
        </div>
      </Modal>
    )
  }

  onUnderstood = () => {
    const locale = getLocale()

    if (/claims/.test(window.location.href)) {
      window.location.href = locale === 'zh' ? 'https://support.token.im/hc/zh-cn/articles/900001520763-%E5%A6%82%E4%BD%95%E8%AE%A4%E9%A2%86-DOT-' : 'https://support.token.im/hc/en-us/articles/900001520763'
    } else {
      // if (window['imToken']['callAPI']) {
      //   window['imToken'].callAPI('navigator.closeDapp')
      // }
      window.location.href = locale === 'zh' ? 'https://support.token.im/hc/zh-cn/articles/900001590123-%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%E8%B4%A8%E6%8A%BC%E6%8C%96%E7%9F%BF-' : 'https://support.token.im/hc/en-us/articles/900001590123-How-to-Staking-'
    }
  }
}

export default SupportModal