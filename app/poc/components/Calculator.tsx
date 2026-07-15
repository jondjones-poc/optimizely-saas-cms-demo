'use client'

import { useState } from 'react'

export default function Calculator() {
  const [firstNumber, setFirstNumber] = useState('')
  const [secondNumber, setSecondNumber] = useState('')
  const [operation, setOperation] = useState('+')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    const first = Number(firstNumber)
    const second = Number(secondNumber)

    if (firstNumber === '' || secondNumber === '') {
      setError('Enter both numbers.')
      setResult(null)
      return
    }

    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      setError('Enter valid numbers.')
      setResult(null)
      return
    }

    if (operation === '/' && second === 0) {
      setError('Division by zero is not allowed.')
      setResult(null)
      return
    }

    const calculations: Record<string, number> = {
      '+': first + second,
      '-': first - second,
      '*': first * second,
      '/': first / second,
    }

    setError('')
    setResult(calculations[operation])
  }

  function reset() {
    setFirstNumber('')
    setSecondNumber('')
    setOperation('+')
    setResult(null)
    setError('')
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <section className="rounded-lg border border-emerald-200 bg-white p-6 text-gray-800 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            React component
          </p>
          <h1 className="mt-1 text-3xl font-bold text-emerald-950">
            Simple Calculator
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            A single-file calculator that can be rendered inside an Optimizely CMS block.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">First number</span>
            <input
              type="number"
              value={firstNumber}
              onChange={(event) => setFirstNumber(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="10"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Operation</span>
            <select
              value={operation}
              onChange={(event) => setOperation(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="+">+</option>
              <option value="-">−</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Second number</span>
            <input
              type="number"
              value={secondNumber}
              onChange={(event) => setSecondNumber(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="5"
            />
          </label>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={calculate}
            className="rounded-md bg-emerald-800 px-4 py-2 font-medium text-white hover:bg-emerald-900"
          >
            Calculate
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {result !== null && !error && (
          <div className="mt-5 rounded-md bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">Result</p>
            <p className="mt-1 text-3xl font-bold text-emerald-950">{result}</p>
          </div>
        )}
      </section>
    </main>
  )
}
