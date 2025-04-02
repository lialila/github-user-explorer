'use client'

import { ThemeProvider } from 'next-themes'

import * as React from 'react'

export function ColorModeProvider(props) {
  return (
    <ThemeProvider attribute='class' disableTransitionOnChange {...props} />
  )
}
