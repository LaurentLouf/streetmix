/* eslint-env jest */
import React from 'react'
import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { render } from '../../../../test/helpers/render'
import MenuBar from '../MenuBar'
import { showDialog } from '../../store/slices/dialogs'

jest.mock('../../store/slices/dialogs', () => ({
  showDialog: jest.fn((id) => ({ type: 'MOCK_ACTION' }))
}))

describe('MenuBar', () => {
  it('renders', () => {
    const { asFragment } = render(<MenuBar onMenuDropdownClick={jest.fn()} />, {
      initialState: {
        flags: {
          LOCALES_LEVEL_1: { value: true },
          LOCALES_LEVEL_2: { value: true },
          LOCALES_LEVEL_3: { value: true }
        }
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders minimal menu in offline mode', () => {
    const { asFragment } = render(<MenuBar onMenuDropdownClick={jest.fn()} />, {
      initialState: {
        system: {
          offline: true
        }
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders logged in user', () => {
    const { asFragment } = render(<MenuBar onMenuDropdownClick={jest.fn()} />, {
      initialState: {
        user: {
          signInData: {
            details: {
              id: 'foo',
              roles: ['USER']
            }
          }
        }
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  // Skipping because the dialog is disabled for now
  it.skip('renders upgrade funnel and handles click', async () => {
    const { asFragment } = render(<MenuBar onMenuDropdownClick={jest.fn()} />)
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByText('Get Streetmix+', { exact: false }))

    expect(showDialog).toBeCalledTimes(1)
    expect(showDialog).toBeCalledWith('UPGRADE')
  })

  it('handles a menu item click', async () => {
    const handler = jest.fn()
    render(<MenuBar onMenuDropdownClick={handler} />)

    await userEvent.click(screen.getByText('Share'))

    expect(handler).toBeCalledTimes(1)
  })

  it.todo('handles window resize')
})
