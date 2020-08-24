import React from 'react'
import './index.scss'
import icons from 'kusama/lib/icons'

export default ({ links, style = {} }) => {

  if (!links || !links.length) return null

  return (
    <div className="link-group">
      {links.map(a => {
        return [<a href={a.href} key={a.href}>
          <span>{a.text}</span>
          <img src={icons.linkArrowSvg} alt="" />
        </a>, <div className="separator" key={'~' + a.href}></div>]
      })}
    </div>
  )
}
