import React from 'react'

const Card = ({ children, className = '', hover = false }) => {
  const baseClasses = 'bg-white rounded-xl shadow-lg p-6'
  const hoverClass = hover ? 'transform hover:scale-105 hover:shadow-xl transition-all duration-300' : ''
  
  return (
    <div className={`${baseClasses} ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}

export default Card
