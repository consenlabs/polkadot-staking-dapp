import React from 'react'
import t from 'kusama/locales'

export default ({ info }) => {
  if (!info || !info.identity) return null

  return (
    <div className="bio">
      <p className="title">{t('bio')}</p>

      <div className="row">
        <span>{t('email')}</span>
        {info.identity.email ? (
          <a href={`mailto:${info.identity.email}`}>{info.identity.email}</a>
        ) : (
            <i>{t('not_set_yet')}</i>
          )}
      </div>
      <div className="row">
        <span>{t('web')}</span>
        {!!info.identity.web ? (
          <a href={info.identity.web}>{info.identity.web}</a>
        ) : (
            <i>{t('not_set_yet')}</i>
          )}
      </div>
    </div>
  )
}