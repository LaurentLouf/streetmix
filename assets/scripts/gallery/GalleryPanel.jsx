import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import GalleryLoading from './GalleryLoading'
import GallerySignInPromo from './GallerySignInPromo'
import GalleryStreetItem from './GalleryStreetItem'
import GalleryError from './GalleryError'
import Scrollable from '../ui/Scrollable'
import Avatar from '../users/Avatar'
import { switchGalleryStreet, repeatReceiveGalleryData, hideGallery } from './view'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { showError, ERRORS } from '../app/errors'
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/constants'
import { setGalleryMode, deleteGalleryStreet } from '../store/actions/gallery'
import { showDialog } from '../store/actions/dialogs'

class GalleryPanel extends React.Component {
  static propTypes = {
    setGalleryMode: PropTypes.func,
    deleteGalleryStreet: PropTypes.func,
    showDialog: PropTypes.func,
    userId: PropTypes.string,
    mode: PropTypes.string,
    streets: PropTypes.array.isRequired,
    isOwnedByCurrentUser: PropTypes.bool,
    currentStreetId: PropTypes.string
  }

  static defaultProps = {
    streets: []
  }

  constructor (props) {
    super(props)

    this.state = {
      selected: null,
      preventHide: false
    }
  }

  componentDidMount () {
    this.scrollSelectedStreetIntoView()

    registerKeypress('esc', hideGallery)
  }

  componentDidUpdate () {
    this.scrollSelectedStreetIntoView()
  }

  componentWillUnmount () {
    deregisterKeypress('esc', hideGallery)
  }

  componentDidCatch () {
    this.props.setGalleryMode('ERROR')
  }

  selectStreet = (streetId) => {
    this.setState({
      selected: streetId,
      preventHide: false
    })
    switchGalleryStreet(streetId)
  }

  deleteStreet = (streetId) => {
    let preventHide = false
    if (streetId === this.props.currentStreetId) {
      preventHide = true
      showError(ERRORS.NO_STREET, false)
    }

    sendDeleteStreetToServer(streetId)

    // Optimistic delete: don't re-fetch, just remove street from memory
    // and let the change in data store trigger a re-render
    this.setState({ selected: null, preventHide })
    this.props.deleteGalleryStreet(streetId)
  }

  scrollSelectedStreetIntoView = () => {
    if (this.state.selected) {
      // selectedEl.scrollIntoView()
      // galleryEl.scrollTop = 0
    }
  }

  render () {
    let childElements

    switch (this.props.mode) {
      // This is currently deprecated; the gallery is only accessible only for
      // a defined user or as a global gallery.
      case 'SIGN_IN_PROMO':
        childElements = (
          <GallerySignInPromo
            hideGallery={hideGallery}
            showDialog={this.props.showDialog}
          />
        )
        break
      case 'LOADING':
        childElements = <GalleryLoading />
        break
      case 'ERROR':
        childElements = <GalleryError retry={repeatReceiveGalleryData} />
        break
      case 'GALLERY':
      default:
        let label

        // Displays user avatar and twitter link if showing a user's streets,
        // otherwise it shows the label "all streets"
        if (this.props.userId) {
          label = (
            <div className="gallery-label">
              <Avatar userId={this.props.userId} />
              <div className="gallery-user-id">
                {this.props.userId}
              </div>
            </div>
          )
        } else {
          label = (
            <div className="gallery-label">
              <FormattedMessage id="gallery.all" defaultMessage="All streets" />
            </div>
          )
        }

        // Applies a class to the containing element if no user ID is provided
        // (which displays all streets) or if the user ID provided is different
        // from a currently signed-in user
        let galleryClassName = 'gallery-streets-container'
        if (!this.props.userId || !this.props.isOwnedByCurrentUser) {
          galleryClassName += ' gallery-streets-container-full'
        }

        // Display these buttons for a user viewing their own gallery
        let buttons
        if (this.props.isOwnedByCurrentUser) {
          buttons = (
            <div className="gallery-user-buttons">
              <a className="button-like gallery-new-street" href={`/${URL_NEW_STREET}`} target="_blank">
                <FormattedMessage id="btn.create" defaultMessage="Create new street" />
              </a>
              <a className="button-like gallery-copy-last-street" href={`/${URL_NEW_STREET_COPY_LAST}`} target="_blank">
                <FormattedMessage id="btn.copy" defaultMessage="Make a copy" />
              </a>
            </div>
          )
        }

        const items = this.props.streets.map((item) => {
          const isSelected = this.state.selected === item.id
          return (
            <GalleryStreetItem
              key={item.id}
              street={item}
              selected={isSelected}
              handleSelect={this.selectStreet}
              handleDelete={this.deleteStreet}
              showStreetOwner={this.props.userId !== item.creatorId}
              allowDelete={this.props.isOwnedByCurrentUser}
            />
          )
        })
        const streetCount = (this.props.userId) ? (
          <div className="gallery-street-count">
            <FormattedMessage
              id="gallery.street-count"
              defaultMessage="{count, plural, =0 {No streets yet} one {# street} other {# streets}}"
              values={{ count: this.props.streets.length }}
            />
          </div>
        ) : null

        childElements = (
          <React.Fragment>
            {label}
            {streetCount}
            <div className={galleryClassName}>
              {buttons}
              <Scrollable className="streets" allowKeyboardScroll>
                {items}
              </Scrollable>
            </div>
          </React.Fragment>
        )
        break
    }

    return (
      <div className="gallery-panel">
        {childElements}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  visible: state.gallery.visible,
  userId: state.gallery.userId,
  mode: state.gallery.mode,
  streets: state.gallery.streets,
  currentStreetId: state.street.id,
  isOwnedByCurrentUser: state.user.signedIn && (state.gallery.userId === state.user.signInData.userId)
})

const mapDispatchToProps = {
  setGalleryMode,
  deleteGalleryStreet,
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryPanel)
