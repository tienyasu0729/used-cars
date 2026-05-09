declare module '@goongmaps/goong-js' {
  export let accessToken: string

  export class LngLatBounds {
    extend(lngLat: [number, number]): this
  }

  export class Popup {
    constructor(options?: { offset?: number; closeOnClick?: boolean })
    setHTML(html: string): this
  }

  export class Marker {
    constructor(options?: { element?: HTMLElement; color?: string })
    setLngLat(lngLat: [number, number]): this
    setPopup(popup: Popup): this
    addTo(map: Map): this
  }

  export class Map {
    constructor(options: {
      container: HTMLElement
      style: string
      center: [number, number]
      zoom: number
    })
    on(event: string, callback: () => void): void
    resize(): void
    fitBounds(bounds: LngLatBounds, options?: { padding?: number; maxZoom?: number }): void
    remove(): void
  }

  const goongjs: {
    accessToken: string
    Map: typeof Map
    Marker: typeof Marker
    Popup: typeof Popup
    LngLatBounds: typeof LngLatBounds
  }
  export default goongjs
}
