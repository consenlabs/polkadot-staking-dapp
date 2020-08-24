import React, { useState, useEffect } from 'react'
import t from 'kusama/locales'
import './index.scss'
import BottomButton from 'kusama/components/BottomButtonClaims'
import WalletSelector from 'kusama/components/WalletSelector'
import LinkGroup from 'kusama/components/LinkGroup'
import ClaimsStatus from 'kusama/components/ClaimsStatus'
import Loading from 'kusama/components/loading'
import toast from 'kusama/lib/toast'
import Modal from '@common/components/modal'
import { getEthereumAccounts, configNavigator } from '@common/lib/sdk'
import * as api from 'kusama/lib/claims'
import { StatementKind } from '@polkadot/types/interfaces'
import { getAccount, initClient } from 'kusama/lib/claims'
import { pubsub } from 'kusama/lib/event'
import { formatBalance } from '@polkadot/util'
import { setTitle } from '@common/lib/sdk'
import { getLocale } from 'kusama/locales'
import { getUnit } from 'kusama/lib/helper'
import { isPolkadot } from 'kusama/lib/is'
import icons from 'kusama/lib/icons'

const _ga = (eventLabel, eventValueObject) => {
  window.ga && window.ga('send', 'event', 'claim', 'click', eventLabel, JSON.stringify(eventValueObject))
}

const SYSTEM_CHAIN = 'Polkadot CC1'

const Claims = ({ }) => {

  const [ethAddress, setEthAddress] = useState('')
  const [dotAddress, setDotAddress] = useState('')
  const [apiReady, setApiReady] = useState(false)
  const [dotAccounts, setDotAccounts] = useState([])
  const [dotAmount, setDotAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [step1ModalOpen, setStep1ModalOpen] = useState(false)
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [inProgress, setInProgress] = useState(false)
  const [inProgressLoading, setInProgressLoading] = useState(false)

  const PRECLAIMS_LOADING = 'PRECLAIMS_LOADING'
  const [preclaimEthereumAddress, setPreclaimEthereumAddress] = useState(PRECLAIMS_LOADING)
  const isPreclaimed = !!preclaimEthereumAddress && preclaimEthereumAddress !== PRECLAIMS_LOADING
  const isCheckedNotPreclaimed = preclaimEthereumAddress === null
  const canClaims = (isCheckedNotPreclaimed && ethAddress && dotAddress && apiReady && dotAmount) || (isPreclaimed && preclaimEthereumAddress && dotAddress && apiReady && dotAmount)
  const unit = getUnit()



  console.log('ethAddress :', ethAddress)


  useEffect(() => {

    configNavigator('#191C1E')

    const podApi = initClient()
    pubsub.on('api-ready', () => {

      podApi.isReady.then(async () => {
        setApiReady(true)
        formatBalance.setDefaults({
          decimals: isPolkadot() ? 10 : 12,
          unit: unit,
        })

        const accounts = await getAccount()
        if (accounts.length) {
          setDotAccounts(accounts || [])
        } else {
          return toast.warn(t('no_$chain_wallet', isPolkadot() ? 'Polkadot' : 'Kusama'))
        }
      })
    })

  }, [])

  useEffect(() => {
    document.title = `${unit} Claim`
    setTimeout(() => {
      setTitle(`${unit} Claim`)
    }, 1000)
    !isPreclaimed && getEthereumAccounts().then(accounts => {
      setEthAddress(accounts[0])
    })
  }, [])



  const statementKind = {
    isRegular: true,
    isSaft: false,
  } as StatementKind

  const statementSentence = api.getStatement(SYSTEM_CHAIN, statementKind)?.sentence || ''

  // 检查 amount
  useEffect(() => {
    if (ethAddress) {
      const podApi = initClient()
      console.log('ethAddressChanged: ', ethAddress)

      podApi.isReady.then(async () => {
        setApiReady(true)
        const hideLoading = toast.loading(t('balance_checking', unit), { hideAfter: 0 })

        api.getClaimsBalance(ethAddress).then(balance => {
          console.log('balance', balance)
          if (balance) {
            setDotAmount(formatBalance(balance, { withSi: false }))
            hideLoading()
          } else {
            hideLoading()
            setTimeout(() => {
              toast.warn(t('no_dots_can_claim', unit), { hideAfter: 3 })
            }, 500)
          }
        })
      })
    }
  }, [ethAddress])

  // 检查 preClaims
  useEffect(() => {
    if (dotAddress) {
      console.log('dotAddressChanged: ', dotAddress)
      const podApi = initClient()
      podApi.isReady.then(async () => {
        api.getPreclaimAddress(dotAddress).then(ethereumAddress => {
          console.log(ethereumAddress)
          if (ethereumAddress) {
            setEthAddress(ethereumAddress)
          }
          setPreclaimEthereumAddress(ethereumAddress)
        })
      })
    }
  }, [dotAddress])

  const locale = getLocale()
  const links = locale === 'zh' ? [{
    href: 'https://statement.polkadot.network/regular.html',
    text: `${unit} 分配条款说明`,
  }, {
    href: 'https://support.token.im/hc/zh-cn/articles/900001520763-%E5%A6%82%E4%BD%95%E8%AE%A4%E9%A2%86-DOT-',
    text: `如何认领 ${unit}？`,
  }] : [{
    href: 'https://statement.polkadot.network/regular.html',
    text: `Description of ${unit} distribution terms`,
  }, {
    href: 'https://support.token.im/hc/en-us/articles/900001520763',
    text: `How to claim ${unit}？`,
  }]


  if (!apiReady) {
    return <div className="claims-page">
      <div>
        <Loading />
        <div className="page-loading-text">{t('page_initing')}</div>
      </div>
    </div>
  }

  return (
    <div className="claims-page">
      <span className="title">{t('Ethereum_wallet_participating_in_ico')}</span>
      <WalletSelector
        chainType="Ethereum"
        address={ethAddress}
        onSelect={(addr) => {
          console.log(addr)
          setEthAddress(addr)
        }} />

      <span className="title">{t('select_dot_wallet_to_claims', unit)}</span>
      <WalletSelector
        chainType={isPolkadot() ? 'Polkadot' : 'Kusama'}
        address={dotAddress}
        onSelect={setDotAddress} />

      <LinkGroup
        links={links}
      />

      <BottomButton
        fixed
        title={t('claims_dot', unit)}
        disabled={!canClaims || inProgress}
        loading={inProgressLoading}
        style={{ backgroundColor: '#E2318F' }}
        onClick={() => {
          setStep1ModalOpen(true)
          _ga('formSubmit', { address: ethAddress })
        }}
      />

      <Modal
        title={t('claims_confirm')}
        isOpen={step1ModalOpen}
        onRequestClose={() => {
          setStep1ModalOpen(false)
        }}
      >
        <div className="claims-modal-content">
          <div className="claims-preview">
            <div>
              <img src={icons.ethLogoSvg} alt="" />
              <img className="connect-gif" src={icons.connectGif} alt="" />
              <img src={icons.dotLogoSvg} alt="" />
            </div>
            <span>{t('claims_dot_to_$chain', unit, SYSTEM_CHAIN)}</span>
          </div>
        </div>
        <BottomButton
          title={t('next')}
          style={{ backgroundColor: '#E2318F' }}
          rowStyle={{ paddingLeft: 0, paddingRight: 0 }}
          onClick={async () => {
            try {
              if (canClaims) {
                const dotAccount = dotAccounts.find(a => a.address = dotAddress)
                setStep1ModalOpen(false)

                if (isPreclaimed) {
                  setInProgress(true)
                  setInProgressLoading(true)
                  _ga('attestOnly', { address: ethAddress })
                  await api.attestOnly(statementSentence, dotAccount)
                  setTxModalOpen(true)
                } else {

                  _ga('personalSign', { address: ethAddress })
                  const message = api.getClaimsToSigndMessage(dotAddress, statementSentence)
                  const ethereumSignature = await window['ethereum'].send('personal_sign', [ethAddress, message])
                  setInProgress(true)
                  setInProgressLoading(true)

                  console.log(ethereumSignature)


                  const claimsTx = api.constructTx(
                    SYSTEM_CHAIN,
                    dotAddress,
                    ethereumSignature,
                    statementKind,
                    api.getIsOldClaimProcess())

                  console.log(claimsTx)

                  _ga('claimAttest', { address: ethAddress })
                  await api.claims(claimsTx, dotAccount)
                  setTxModalOpen(true)
                }

                console.log(txHash)
              }
            } catch (e) {
              console.warn(e)
              setInProgress(false)
              setInProgressLoading(false)
              setTxModalOpen(false)
              toast.warn(e.message)
              if (e.code !== 1001) {
                _ga('claimFailed', { address: ethAddress, message: e.message })
              }
            }
          }}
        />
      </Modal>

      <Modal
        title={t('tx_detail')}
        isOpen={txModalOpen}
        onRequestClose={() => {
          setTxModalOpen(false)
        }}
      >
        <ClaimsStatus
          txHash={txHash}
          address={dotAddress}
          amount={dotAmount}
          unit={unit}
          onSuccess={() => {
            setInProgress(false)
            _ga('claimSuccess', { address: ethAddress })
          }}
          onFailed={(e) => {
            setInProgress(false)
            setInProgressLoading(false)
            toast.warn(t('claims_failed') + ' ' + e.message)
            _ga('claimFailed', { address: ethAddress, message: e.message })
          }}
        />
      </Modal>

    </div>
  )
}


export default Claims