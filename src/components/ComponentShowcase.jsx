import React, { useState } from 'react'
import Button from './Button'
import Card from './Card'
import Badge from './Badge'

const ComponentShowcase = () => {
  const [counter, setCounter] = useState(0)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          React + Tailwind CSS Component Showcase
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Button Showcase */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Buttons</h2>
            <div className="space-y-3">
              <Button variant="primary" size="sm">Primary Small</Button>
              <Button variant="secondary" size="md">Secondary Medium</Button>
              <Button variant="success" size="lg">Success Large</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Card>
          
          {/* Badge Showcase */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
            </div>
          </Card>
          
          {/* Interactive Counter */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Interactive Counter</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-4">{counter}</div>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setCounter(counter - 1)} variant="danger" size="sm">-</Button>
                <Button onClick={() => setCounter(0)} variant="secondary" size="sm">Reset</Button>
                <Button onClick={() => setCounter(counter + 1)} variant="success" size="sm">+</Button>
              </div>
            </div>
          </Card>
          
          {/* Card Variations */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Card Styles</h2>
            <p className="text-gray-600 mb-3">This card has hover effects with scaling and shadow transitions.</p>
            <div className="flex gap-2">
              <Badge variant="primary">Interactive</Badge>
              <Badge variant="success">Animated</Badge>
            </div>
          </Card>
          
          {/* Color Palette */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Color Palette</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-indigo-500 rounded"></div>
              <div className="h-12 bg-purple-500 rounded"></div>
              <div className="h-12 bg-pink-500 rounded"></div>
              <div className="h-12 bg-green-500 rounded"></div>
              <div className="h-12 bg-yellow-500 rounded"></div>
              <div className="h-12 bg-red-500 rounded"></div>
            </div>
          </Card>
          
          {/* Typography */}
          <Card hover>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Small text</p>
              <p className="text-base text-gray-700">Base text</p>
              <p className="text-lg text-gray-800">Large text</p>
              <p className="text-xl font-bold text-gray-900">Extra large bold</p>
            </div>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Built with <span className="text-indigo-600 font-semibold">React</span> and{' '}
            <span className="text-indigo-600 font-semibold">Tailwind CSS</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ComponentShowcase
