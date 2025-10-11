'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SelectTest() {
  const [selectedValue, setSelectedValue] = useState('')

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Select Component Test</h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Test Select:</label>
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
        
        <p className="text-sm text-gray-600">
          Selected: {selectedValue || 'None'}
        </p>
      </div>
    </div>
  )
}

