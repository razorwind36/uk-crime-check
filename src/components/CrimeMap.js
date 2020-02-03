import 'mapbox-gl/dist/mapbox-gl.css'
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import MapGL, {  Marker, Popup } from 'react-map-gl'
import React, { Component } from 'react'
import Geocoder from 'react-map-gl-geocoder'
import axios from 'axios'
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN
class CrimeMap extends Component {
  state = {
    crimeCategories: [],
    crimes: [],
    name: [],
    viewport: {
      latitude: 51.4558,
      longitude: 0.0255,
      zoom: 7
    },
    selectedCategory: 'all-crime',
    showInfo: false
  }

  async componentDidMount() {
    try {
      const res = await axios.get('https://data.police.uk/api/crime-categories')
      console.log(res.data)
      this.setState({ crimeCategories: res.data })

    } catch (error) {
      console.log(error)
    }
  }

  handleChange = (e) => {
    const selectedCategory = e.target.value
    this.setState( { selectedCategory } )
    console.log(this.state.selectedCategory)
  }

  handleSubmit = async e => {
    e.preventDefault()
    this.apiCall()
  }

  mapRef = React.createRef()
  handleViewportChange = (viewport) => {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    })
  }
  handleGeocoderViewportChange = (viewport) => {
    console.log(viewport)
    const geocoderDefaultOverrides = { transitionDuration: 3000 }
    this.setState({ viewport: { latitude: viewport.latitude, longitude: viewport.longitude, zoom: viewport.zoom } })
    this.apiCall()
    console.log(this.state.viewport)
    return this.handleViewportChange({
      ...viewport,
      ...geocoderDefaultOverrides
    })
  }
  onClickPin = x => {
    this.setState({ crimeInfo: x })
  }
  apiCall = async ()=> {
    try {
      const response =  await axios.get(`https://data.police.uk/api/crimes-street/${this.state.selectedCategory}?lat=${this.state.viewport.latitude}&lng=${this.state.viewport.longitude}`)
      const data = response.data

      if (data.length > 300) {
        this.setState( { crimes: data, showInfo: false })
      } else {
        this.setState({ crimes: data, showInfo: true })
      }
    } catch (err) {
      console.log(err)
    }
  }
  render() {
    if (!this.state.crimes) return null
    return (
      <>
      <div className="columns">
        <div className="column">
          <p className="title is-1 notification is-info has-text-centered is-spaced">UK Crime Checker: What's happened in your area?</p>
          <p className="subtitle is-3 has-text-centered">Use our crime tool to discover what's happened</p>
          <div className="columns is-mobile">
            <div className="column">
              <p className="is-size-4 notification is-info has-text-left">Please type in a location in the search bar located on the map. Optionally, you can filter crimes based on category in the section below.</p>
              <div className="has-text-centered">
                <div className="ıs-centered is-size-3 ">Category</div>
                <form onSubmit={this.handleSubmit}>
                  <select onChange={this.handleChange} className="is-size-5">
                    {this.state.crimeCategories.map((category, index) => (
                      <option key={index.toString()}  value={category.url}>{category.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="is-size-5">Filter Crime</button>
                </form>
                <hr />
                <div>
                  <p className="is-size-4  ">{this.state.crimes.length} Crimes Found</p>
                </div>
                <p>NOTE: If search results are larger than 300, descriptions will not be shown.</p>
              </div>
            </div>
            <div className="column">
              <MapGL
                mapboxApiAccessToken={mapboxToken}
                ref={this.mapRef}
                {...this.state.viewport}
                height={'70vh'}
                width={'90vh'}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                onViewportChange={this.handleViewportChange}>
                <Geocoder
                  mapRef={this.mapRef}
                  onViewportChange={this.handleGeocoderViewportChange}
                  mapboxApiAccessToken={mapboxToken}
                />
                {this.state.crimes.map((crime, index) => {
                  return <Marker
                    key={index.toString()}
                    latitude={parseFloat(crime.location.latitude)}
                    longitude={parseFloat(crime.location.longitude)}
                  >
                    <div className="marker"/>
                  </Marker>
                } )}
                {this.state.crimes.map((crime,index)  => {
                  if (this.state.showInfo) {
                    return (
                      <Popup 
                        key={index.toString()}
                        tipSize={5}
                        anchor="bottom-right"
                        closeButton={false}
                        closeOnClick={true}
                        onClose={ ()=> this.setState({ showInfo: false }) }
                        longitude={parseFloat(crime.location.longitude)}
                        latitude={parseFloat(crime.location.latitude)}>
                        <p>{crime.category}</p>
                      </Popup> 
                    )
                  }
                } )}
              </MapGL>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }
}
export default CrimeMap