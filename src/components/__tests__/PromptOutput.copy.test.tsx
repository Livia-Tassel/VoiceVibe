import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PromptOutput } from '../PromptOutput'

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('PromptOutput copy button', () => {
  it('shows pending and success copy states', async () => {
    const deferred = createDeferred<boolean>()
    const onCopy = vi.fn(() => deferred.promise)

    render(
      <PromptOutput
        content="Refined prompt content"
        isLoading={false}
        error={null}
        onContentChange={vi.fn()}
        onCopy={onCopy}
        onRefine={vi.fn()}
        onClear={vi.fn()}
        hasInput={true}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '复制' }))

    expect(onCopy).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Copying…' })).toBeDisabled()

    deferred.resolve(true)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
    })
  })
})
